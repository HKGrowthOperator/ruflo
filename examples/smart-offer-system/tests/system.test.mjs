import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createOfferSystem } from '../src/system.mjs';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'sos-'));
}

test('Programmatische API: Lead → Angebot → Status → Stats → PDF', async () => {
  const sos = createOfferSystem({ dataDir: tmpDir(), settings: { firma: 'Test GmbH' } });

  const angebot = await sos.createLead({
    firma: 'Old Rocket',
    email: 'kontakt@oldrocket.de',
    beschreibung: 'Website Relaunch, ca. 4.900 €, Zahlung 50/50, 3 Wochen'
  });
  assert.equal(angebot.nummer.startsWith('AN-'), true);
  assert.equal(angebot.extraktion.preis, 4900);

  sos.changeStatus(angebot.id, 'geprueft');
  sos.changeStatus(angebot.id, 'versendet');
  assert.equal(sos.getOffer(angebot.id).status, 'versendet');

  const pdf = sos.renderPdf(angebot.id);
  assert.ok(pdf.toString('latin1').startsWith('%PDF-1.4'));

  assert.equal(sos.stats().stats.offen, 1);
  assert.throws(() => sos.changeStatus(angebot.id, 'entwurf'), /nicht erlaubt/);
});

test('Persistenz: zweite Instanz auf demselben dataDir sieht die Daten', async () => {
  const dir = tmpDir();
  const a = createOfferSystem({ dataDir: dir });
  await a.createLead({ firma: 'X', beschreibung: 'Logo Design für 800 €' });

  const b = createOfferSystem({ dataDir: dir });
  assert.equal(b.listOffers().length, 1);
  assert.equal(b.listOffers()[0].leistung, 'Logo & Branding');
});

test('handleRequest funktioniert mit und ohne /api-Präfix', async () => {
  const sos = createOfferSystem({ dataDir: tmpDir() });
  const server = http.createServer((req, res) => sos.handleRequest(req, res));
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;

  const mitPraefix = await fetch(`${base}/api/dashboard`);
  assert.equal(mitPraefix.status, 200);

  const ohnePraefix = await fetch(`${base}/dashboard`);
  assert.equal(ohnePraefix.status, 200);

  const lead = await fetch(`${base}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firma: 'Y', beschreibung: 'SEO Paket 1.200 €' })
  });
  assert.equal(lead.status, 201);
  const angebot = await lead.json();
  assert.equal(angebot.extraktion.leistung, 'SEO-Optimierung');

  const fehler = await fetch(`${base}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(fehler.status, 400);

  server.close();
});

test('handleRequest nutzt vorgeparsten Body (Express-kompatibel)', async () => {
  const sos = createOfferSystem({ dataDir: tmpDir() });
  // Express mit express.json() setzt req.body — simulieren:
  const req = {
    method: 'POST',
    url: '/api/leads',
    headers: { host: 'localhost' },
    body: { firma: 'Z', beschreibung: 'Newsletter Setup 500 €' }
  };
  let status, payload;
  const res = {
    writeHead(s) { status = s; },
    end(data) { payload = JSON.parse(data); }
  };
  await sos.handleRequest(req, res);
  assert.equal(status, 201);
  assert.equal(payload.extraktion.leistung, 'Newsletter-Setup');
});
