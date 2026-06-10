// Smart Offer System — HTTP-Server (ohne Dependencies, Node 20+).
//
// Pipeline: Leadformular → AI-Extraktion → Angebotsentwurf → menschliche
// Prüfung → PDF → Versand-Status → automatische Follow-ups → Dashboard.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { JsonStore } from './store.mjs';
import { extract } from './extract.mjs';
import { createOfferFromLead, setStatus, dashboardStats, calcSumme } from './offer.mjs';
import { runFollowUps, dueFollowUps } from './followup.mjs';
import { renderOfferPdf } from './pdf.mjs';
import { DEFAULT_SETTINGS } from './templates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DATA_DIR = process.env.SOS_DATA_DIR || path.join(__dirname, '..', 'data');
const PORT = Number(process.env.PORT) || 3100;

const store = new JsonStore(DATA_DIR);
let offers = store.load('angebote', []);
let outbox = store.load('outbox', []);
let aufgaben = store.load('aufgaben', []);
const settings = { ...DEFAULT_SETTINGS, ...store.load('settings', {}) };
store.save('settings', settings);

function persist() {
  store.save('angebote', offers);
  store.save('outbox', outbox);
  store.save('aufgaben', aufgaben);
}

function processFollowUps() {
  const result = runFollowUps(offers, new Date(), settings);
  if (result.outbox.length || result.aufgaben.length) {
    outbox.push(...result.outbox);
    aufgaben.push(...result.aufgaben);
    persist();
    console.log(`[follow-up] ${result.outbox.length} Erinnerung(en), ${result.aufgaben.length} Aufgabe(n) erzeugt`);
  }
  return result;
}

// ----------------------------------------------------------------- Helpers

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) { req.destroy(); reject(new Error('Body zu groß')); }
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Ungültiges JSON')); }
    });
    req.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function serveStatic(res, urlPath) {
  const rel = urlPath === '/' ? 'index.html' : urlPath.slice(1);
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Nicht gefunden');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
}

function offerSummary(offer) {
  return {
    id: offer.id,
    nummer: offer.nummer,
    status: offer.status,
    kunde: offer.kunde,
    leistung: offer.extraktion.leistung,
    summe: calcSumme(offer.positionen),
    erstelltAm: offer.erstelltAm,
    versendetAm: offer.versendetAm,
    faelligeFollowUps: dueFollowUps(offer, new Date(), settings)
  };
}

// ------------------------------------------------------------------ Routen

async function handleApi(req, res, url) {
  const segments = url.pathname.split('/').filter(Boolean); // ['api', ...]

  // GET /api/dashboard
  if (req.method === 'GET' && url.pathname === '/api/dashboard') {
    return sendJson(res, 200, {
      stats: dashboardStats(offers),
      offeneAufgaben: aufgaben.filter((a) => !a.erledigt).length,
      outboxEntwuerfe: outbox.filter((o) => o.status === 'entwurf').length
    });
  }

  // GET /api/offers
  if (req.method === 'GET' && url.pathname === '/api/offers') {
    const sorted = [...offers].sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
    return sendJson(res, 200, sorted.map(offerSummary));
  }

  // POST /api/leads — Lead anlegen, AI-Extraktion, Angebotsentwurf erzeugen
  if (req.method === 'POST' && url.pathname === '/api/leads') {
    const lead = await readBody(req);
    if (!lead.beschreibung || !String(lead.beschreibung).trim()) {
      return sendJson(res, 400, { fehler: 'Feld "beschreibung" wird benötigt' });
    }
    const extracted = await extract(String(lead.beschreibung));
    const offer = createOfferFromLead(lead, extracted, offers, settings);
    offers.push(offer);
    persist();
    return sendJson(res, 201, offer);
  }

  // Routen mit Angebots-ID: /api/offers/:id[/...]
  if (segments[1] === 'offers' && segments[2]) {
    const offer = offers.find((o) => o.id === segments[2]);
    if (!offer) return sendJson(res, 404, { fehler: 'Angebot nicht gefunden' });

    if (req.method === 'GET' && segments.length === 3) {
      return sendJson(res, 200, offer);
    }

    // PUT /api/offers/:id — Prüfung/Bearbeitung durch den Menschen
    if (req.method === 'PUT' && segments.length === 3) {
      const patch = await readBody(req);
      if (patch.kunde) Object.assign(offer.kunde, patch.kunde);
      if (patch.extraktion) Object.assign(offer.extraktion, patch.extraktion);
      if (Array.isArray(patch.positionen)) offer.positionen = patch.positionen;
      if (patch.texte) Object.assign(offer.texte, patch.texte);
      offer.verlauf.push({ am: new Date().toISOString(), ereignis: 'Angebot bearbeitet' });
      persist();
      return sendJson(res, 200, offer);
    }

    // POST /api/offers/:id/status
    if (req.method === 'POST' && segments[3] === 'status') {
      const { status } = await readBody(req);
      try {
        setStatus(offer, status);
      } catch (err) {
        return sendJson(res, 400, { fehler: err.message });
      }
      persist();
      return sendJson(res, 200, offer);
    }

    // GET /api/offers/:id/pdf
    if (req.method === 'GET' && segments[3] === 'pdf') {
      const pdf = renderOfferPdf(offer, settings);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Angebot-${offer.nummer}.pdf"`
      });
      return res.end(pdf);
    }
  }

  // POST /api/followups/run — manuell anstoßen (läuft sonst stündlich)
  if (req.method === 'POST' && url.pathname === '/api/followups/run') {
    const result = processFollowUps();
    return sendJson(res, 200, {
      neueErinnerungen: result.outbox.length,
      neueAufgaben: result.aufgaben.length
    });
  }

  // GET /api/outbox
  if (req.method === 'GET' && url.pathname === '/api/outbox') {
    return sendJson(res, 200, [...outbox].reverse());
  }

  // GET /api/tasks | POST /api/tasks/:id/done
  if (req.method === 'GET' && url.pathname === '/api/tasks') {
    return sendJson(res, 200, [...aufgaben].reverse());
  }
  if (req.method === 'POST' && segments[1] === 'tasks' && segments[3] === 'done') {
    const aufgabe = aufgaben.find((a) => a.id === segments[2]);
    if (!aufgabe) return sendJson(res, 404, { fehler: 'Aufgabe nicht gefunden' });
    aufgabe.erledigt = true;
    persist();
    return sendJson(res, 200, aufgabe);
  }

  // GET /api/settings
  if (req.method === 'GET' && url.pathname === '/api/settings') {
    return sendJson(res, 200, settings);
  }

  return sendJson(res, 404, { fehler: 'Unbekannte Route' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
    } else {
      serveStatic(res, url.pathname);
    }
  } catch (err) {
    console.error('[server]', err);
    sendJson(res, 500, { fehler: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Smart Offer System läuft auf http://localhost:${PORT}`);
  console.log(`AI-Extraktion: ${process.env.ANTHROPIC_API_KEY ? 'Claude API (' + (process.env.CLAUDE_MODEL || 'claude-opus-4-8') + ')' : 'Heuristik (ANTHROPIC_API_KEY setzen für Claude)'}`);
  processFollowUps();
  setInterval(processFollowUps, 60 * 60 * 1000).unref();
});
