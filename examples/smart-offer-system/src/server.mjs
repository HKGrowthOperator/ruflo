// Standalone-Server für das Smart Offer System (Demo / Einzelbetrieb).
//
// Die gesamte Logik steckt in system.mjs — zum Einbetten in deine eigene App
// brauchst du nur createOfferSystem() aus index.mjs, nicht diese Datei.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createOfferSystem } from './system.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DATA_DIR = process.env.SOS_DATA_DIR || path.join(__dirname, '..', 'data');
const PORT = Number(process.env.PORT) || 3100;

const system = createOfferSystem({ dataDir: DATA_DIR });

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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      await system.handleRequest(req, res);
    } else {
      serveStatic(res, url.pathname);
    }
  } catch (err) {
    console.error('[server]', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(JSON.stringify({ fehler: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Smart Offer System läuft auf http://localhost:${PORT}`);
  console.log(`AI-Extraktion: ${process.env.ANTHROPIC_API_KEY ? 'Claude API (' + (process.env.CLAUDE_MODEL || 'claude-opus-4-8') + ')' : 'Heuristik (ANTHROPIC_API_KEY setzen für Claude)'}`);
  system.startFollowUpTimer();
});
