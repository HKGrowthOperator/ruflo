#!/usr/bin/env node
/**
 * onepage-pages.mjs — Standalone-Anbindung an die onepage.io-API zum
 * Verwalten von Projekten / Landingpages ("Seiten verwalten").
 *
 * KEIN externer Dependency — nutzt das in Node 18+ eingebaute global `fetch`.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * SICHERHEIT
 *   Der API-Key wird AUSSCHLIESSLICH aus der Umgebung gelesen
 *   (ONEPAGE_API_KEY) und niemals geloggt oder im Klartext ausgegeben.
 *   Lege ihn z.B. in eine gitignorete .env oder exportiere ihn:
 *       export ONEPAGE_API_KEY='dein-key'
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NETZWERK-HINWEIS (Remote-Umgebung)
 *   onepage.io-Hosts müssen auf der Egress-Allowlist der Umgebung stehen,
 *   sonst kommt ein 403 mit "Host not in allowlist". Mindestens den in
 *   ONEPAGE_API_BASE genutzten Host freischalten (z.B. app.onepage.io).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * KONFIGURATION (Env-Variablen)
 *   ONEPAGE_API_KEY    (Pflicht)  Dein onepage.io API-Key.
 *   ONEPAGE_API_BASE   (optional) Base-URL der API.
 *                                 Default: https://app.onepage.io/api/v1
 *   ONEPAGE_AUTH_STYLE (optional) bearer | x-api-key | query
 *                                 Default: bearer
 *   ONEPAGE_PROJECTS_PATH (optional) Pfad der Projekt-Collection.
 *                                 Default: /projects
 *
 *   Die exakten Endpunkte/Base-URL sind je nach onepage-Account zu
 *   bestätigen — dafür gibt es den `probe`-Befehl (siehe unten).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BEFEHLE
 *   node scripts/onepage-pages.mjs probe
 *       Testet gängige Base-URLs × Auth-Varianten und meldet, welche
 *       Kombination 2xx liefert — zum Auffinden der echten API-Basis,
 *       sobald der Host auf der Allowlist steht.
 *
 *   node scripts/onepage-pages.mjs list
 *       Listet alle Projekte / Seiten.
 *
 *   node scripts/onepage-pages.mjs get <projectId>
 *       Holt ein einzelnes Projekt.
 *
 *   Globale Flags:  --json  (rohe JSON-Ausgabe)   --verbose
 */

const KEY = process.env.ONEPAGE_API_KEY;
const BASE = (process.env.ONEPAGE_API_BASE || 'https://app.onepage.io/api/v1').replace(/\/+$/, '');
const AUTH_STYLE = (process.env.ONEPAGE_AUTH_STYLE || 'bearer').toLowerCase();
const PROJECTS_PATH = process.env.ONEPAGE_PROJECTS_PATH || '/projects';

const argv = process.argv.slice(2);
const FLAGS = new Set(argv.filter((a) => a.startsWith('--')));
const ARGS = argv.filter((a) => !a.startsWith('--'));
const RAW_JSON = FLAGS.has('--json');
const VERBOSE = FLAGS.has('--verbose');

const TIMEOUT_MS = 15000;

function die(msg, code = 1) {
  console.error(`✖ ${msg}`);
  process.exit(code);
}

function requireKey() {
  if (!KEY) {
    die(
      'ONEPAGE_API_KEY ist nicht gesetzt.\n' +
        "  Setze ihn z.B. mit:  export ONEPAGE_API_KEY='dein-key'\n" +
        '  (Den Key niemals ins Repo committen — .env ist bereits gitignored.)',
    );
  }
}

/** Baut Header + URL je nach Auth-Variante. Der Key wird nie geloggt. */
function buildRequest(url, style = AUTH_STYLE) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  let finalUrl = url;
  switch (style) {
    case 'bearer':
      headers.Authorization = `Bearer ${KEY}`;
      break;
    case 'x-api-key':
      headers['X-API-Key'] = KEY;
      break;
    case 'query': {
      const u = new URL(url);
      u.searchParams.set('api_key', KEY);
      finalUrl = u.toString();
      break;
    }
    default:
      die(`Unbekannter ONEPAGE_AUTH_STYLE: "${style}" (erlaubt: bearer | x-api-key | query)`);
  }
  return { finalUrl, headers };
}

async function apiFetch(path, { method = 'GET', body, style = AUTH_STYLE } = {}) {
  const { finalUrl, headers } = buildRequest(`${BASE}${path}`, style);
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(finalUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ac.signal,
    });
  } catch (err) {
    clearTimeout(t);
    if (err.name === 'AbortError') throw new Error(`Timeout nach ${TIMEOUT_MS}ms: ${method} ${path}`);
    throw new Error(`Netzwerkfehler bei ${method} ${path}: ${err.message}`);
  }
  clearTimeout(t);

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text; // Nicht-JSON-Antwort (z.B. HTML-Fehlerseite)
  }

  // Typischer Egress-Allowlist-Block in Remote-Umgebungen erkennen.
  if (res.status === 403 && typeof data === 'string' && /not in allowlist/i.test(data)) {
    throw new Error(
      `403 — Host nicht auf der Netzwerk-Allowlist.\n` +
        `  Schalte den onepage.io-Host in den Egress-Settings der Umgebung frei.\n` +
        `  Antwort: ${data.slice(0, 160)}`,
    );
  }

  return { ok: res.ok, status: res.status, data };
}

function maskKeyInfo() {
  // Nur Länge/Format andeuten — niemals den Key selbst ausgeben.
  return `Key gesetzt (Länge ${KEY.length}), Auth=${AUTH_STYLE}, Base=${BASE}`;
}

// ── Befehl: probe ──────────────────────────────────────────────────────────
async function cmdProbe() {
  requireKey();
  const bases = [
    process.env.ONEPAGE_API_BASE, // falls explizit gesetzt: zuerst testen
    'https://app.onepage.io/api/v1',
    'https://app.onepage.io/api',
    'https://api.onepage.io/v1',
    'https://api.onepage.io',
    'https://onepage.io/api/v1',
  ].filter(Boolean);
  const styles = ['bearer', 'x-api-key', 'query'];
  const paths = [PROJECTS_PATH, '/pages'];

  console.log(`Probing onepage.io-API …  (${maskKeyInfo()})\n`);
  const hits = [];
  for (const base of [...new Set(bases)]) {
    for (const style of styles) {
      for (const path of paths) {
        const { finalUrl, headers } = buildRequest(`${base.replace(/\/+$/, '')}${path}`, style);
        const ac = new AbortController();
        const t = setTimeout(() => ac.abort(), 8000);
        let line;
        try {
          const res = await fetch(finalUrl, { headers, signal: ac.signal });
          const snippet = (await res.text()).replace(/\s+/g, ' ').slice(0, 80);
          line = `http=${res.status}`;
          if (res.ok) hits.push({ base, style, path, status: res.status });
          if (VERBOSE) line += `  ${snippet}`;
        } catch (err) {
          line = `ERR ${err.name === 'AbortError' ? 'timeout' : err.message}`;
        } finally {
          clearTimeout(t);
        }
        console.log(`  [${style.padEnd(9)}] ${base}${path}  ->  ${line}`);
      }
    }
  }
  console.log('');
  if (hits.length) {
    console.log('✔ Funktionierende Kombination(en) gefunden — exportiere passend:');
    for (const h of hits) {
      console.log(
        `    ONEPAGE_API_BASE='${h.base.replace(/\/+$/, '')}' ` +
          `ONEPAGE_AUTH_STYLE='${h.style}' ONEPAGE_PROJECTS_PATH='${h.path}'`,
      );
    }
  } else {
    console.log(
      '✖ Keine 2xx-Antwort. Wahrscheinliche Ursachen:\n' +
        '   • Host nicht auf der Egress-Allowlist der Umgebung (403 "not in allowlist")\n' +
        '   • Falscher Key oder falsche Auth-Variante\n' +
        '   • Andere Base-URL/Endpunkte — bei onepage.io-Support erfragen',
    );
  }
}

// ── Befehl: list ───────────────────────────────────────────────────────────
async function cmdList() {
  requireKey();
  const { ok, status, data } = await apiFetch(PROJECTS_PATH);
  if (!ok) die(`API antwortete mit HTTP ${status}: ${JSON.stringify(data)?.slice(0, 300)}`);
  if (RAW_JSON) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  const items = Array.isArray(data) ? data : data?.data || data?.projects || data?.items || [];
  if (!items.length) {
    console.log('Keine Projekte gefunden (oder unerwartetes Antwortformat — mit --json prüfen).');
    return;
  }
  console.log(`${items.length} Projekt(e):`);
  for (const p of items) {
    const id = p.id ?? p.uuid ?? p._id ?? '?';
    const name = p.name ?? p.title ?? p.slug ?? '(ohne Namen)';
    console.log(`  • ${String(id).padEnd(38)} ${name}`);
  }
}

// ── Befehl: get ────────────────────────────────────────────────────────────
async function cmdGet(id) {
  requireKey();
  if (!id) die('Bitte Projekt-ID angeben:  node scripts/onepage-pages.mjs get <projectId>');
  const { ok, status, data } = await apiFetch(`${PROJECTS_PATH}/${encodeURIComponent(id)}`);
  if (!ok) die(`API antwortete mit HTTP ${status}: ${JSON.stringify(data)?.slice(0, 300)}`);
  console.log(JSON.stringify(data, null, 2));
}

// ── Dispatch ───────────────────────────────────────────────────────────────
const [cmd, ...rest] = ARGS;
const COMMANDS = {
  probe: () => cmdProbe(),
  list: () => cmdList(),
  get: () => cmdGet(rest[0]),
};

if (!cmd || cmd === 'help' || FLAGS.has('--help')) {
  console.log(
    [
      'onepage.io — Seiten/Projekte verwalten (Standalone)',
      '',
      'Befehle:',
      '  probe            Echte API-Basis + Auth-Variante automatisch finden',
      '  list             Alle Projekte/Seiten auflisten',
      '  get <projectId>  Ein einzelnes Projekt holen',
      '',
      'Flags:  --json  --verbose',
      '',
      'Setup:  export ONEPAGE_API_KEY=\'dein-key\'  (niemals committen)',
    ].join('\n'),
  );
  process.exit(0);
}

const run = COMMANDS[cmd];
if (!run) die(`Unbekannter Befehl: "${cmd}". Nutze "help".`);

run().catch((err) => die(err.message));
