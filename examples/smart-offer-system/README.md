# Smart Offer System

Angebotsautomation für **HK Growth Operator**: verkürzt die Zeit zwischen Anfrage und Angebot.

```
Leadformular → AI-Extraktion → Angebotsentwurf → Mensch prüft → PDF → Follow-up → Dashboard
```

## Start

```bash
cd examples/smart-offer-system
npm start          # läuft auf http://localhost:3100
npm test           # Tests (node:test)
```

Keine Dependencies, nur Node 20+. Daten liegen als JSON in `data/` (gitignored).

## AI-Extraktion

Aus Freitext (Telefonnotizen, WhatsApp, E-Mails, Formulare) werden automatisch erkannt:
**Leistung, Preis, Zahlungsmodell, Lieferzeit** plus eine Zusammenfassung.

- Mit `ANTHROPIC_API_KEY` gesetzt: Claude API (Modell via `CLAUDE_MODEL`, Standard `claude-opus-4-8`), strukturierte JSON-Ausgabe
- Ohne Key: deutscher Heuristik-Parser (Regex), läuft komplett offline

```bash
ANTHROPIC_API_KEY=sk-ant-... npm start
```

## Ablauf

1. **Neue Anfrage** (`/lead.html`): Firma + Notizen eintragen → Angebotsentwurf mit Nummer (`AN-2026-0001`), Positionen und Standardtexten wird erzeugt
2. **Prüfen** (`/angebot.html?id=…`): erkannte Felder korrigieren, Positionen/Texte anpassen → „Prüfung abschließen"
3. **PDF öffnen**: fertiges Angebots-PDF (eigener Generator, kein npm-Paket)
4. **Als versendet markieren**: startet die Follow-up-Uhr
5. **Follow-ups** (automatisch, stündlich geprüft):
   - nach **3 Tagen** ohne Entscheidung → Erinnerungs-E-Mail-Entwurf in der Outbox
   - nach **7 Tagen** → Aufgabe für den Vertrieb
6. **Gewonnen / Verloren** setzen → fließt in die Abschlussquote

## Dashboard

Offene / gewonnene / verlorene Angebote, Abschlussquote, offenes und gewonnenes Volumen, fällige Follow-ups, Vertriebsaufgaben und Outbox-Entwürfe.

## API

| Methode | Route | Zweck |
|---|---|---|
| `POST` | `/api/leads` | Lead anlegen → Extraktion → Angebotsentwurf |
| `GET` | `/api/offers` / `/api/offers/:id` | Angebote lesen |
| `PUT` | `/api/offers/:id` | Angebot bearbeiten (Prüfung) |
| `POST` | `/api/offers/:id/status` | `geprueft` / `versendet` / `gewonnen` / `verloren` |
| `GET` | `/api/offers/:id/pdf` | Angebots-PDF |
| `POST` | `/api/followups/run` | Follow-ups sofort prüfen |
| `GET` | `/api/dashboard` / `/api/outbox` / `/api/tasks` | Auswertung |

## In deine eigene App einbauen

Den kompletten Ordner (oder nur `src/`) in deine App kopieren — keine Dependencies nötig.
Der gesamte Kern ist über eine Factory nutzbar:

```js
import { createOfferSystem } from './smart-offer-system/src/index.mjs';

const sos = createOfferSystem({
  dataDir: './data/angebote',                 // wohin die JSON-Daten sollen
  settings: { firma: 'HK Growth Operator' }   // optionale Overrides
});
sos.startFollowUpTimer();                     // Follow-ups stündlich prüfen
```

**Variante A — als API in Express einhängen:**

```js
app.use('/angebote/api', (req, res) => sos.handleRequest(req, res));
```

Der Handler ist Präfix-unabhängig (`/offers`, `/leads`, … funktionieren unter jedem Mount-Pfad).
Die HTML-Seiten aus `public/` kannst du mitkopieren und per
`<script>window.SOS_API_BASE = '/angebote/api'</script>` (vor dem Seiten-Script) auf deine API zeigen lassen.

**Variante B — direkt programmatisch, ohne HTTP:**

```js
const angebot = await sos.createLead({
  firma: 'Old Rocket',
  email: 'kontakt@oldrocket.de',
  beschreibung: 'Website Relaunch, ca. 4.900 €, 50/50, 3 Wochen'
});

sos.changeStatus(angebot.id, 'geprueft');
sos.changeStatus(angebot.id, 'versendet');

const pdfBuffer = sos.renderPdf(angebot.id);  // direkt speichern/versenden
const { stats } = sos.stats();                // fürs eigene Dashboard
sos.processFollowUps();                       // fällige Erinnerungen/Aufgaben
```

**Variante C — nur einzelne Bausteine:** `index.mjs` exportiert auch `extract`,
`renderOfferPdf`, `runFollowUps` usw. einzeln, falls du z. B. nur die
PDF-Erzeugung oder nur die AI-Extraktion brauchst.

## Anpassen

- **Textbausteine, Leistungs-Keywords, Status**: `src/templates.mjs`
- **Firmendaten & Follow-up-Fristen**: `data/settings.json` (wird beim ersten Start erzeugt)
- **E-Mail-Versand / CRM**: Die Outbox enthält fertige Entwürfe — hier lässt sich SMTP oder ein CRM-Webhook anbinden (`src/followup.mjs`)
