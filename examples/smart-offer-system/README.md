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

## Anpassen

- **Textbausteine, Leistungs-Keywords, Status**: `src/templates.mjs`
- **Firmendaten & Follow-up-Fristen**: `data/settings.json` (wird beim ersten Start erzeugt)
- **E-Mail-Versand / CRM**: Die Outbox enthält fertige Entwürfe — hier lässt sich SMTP oder ein CRM-Webhook anbinden (`src/followup.mjs`)
