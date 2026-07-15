# Tamil News Radar

Automatisches News-Radar für tamilische Nachrichten mit redaktionellem
Freigabe-Workflow und öffentlicher Website.

**Kernprinzip: Das System veröffentlicht nie selbst.** Das Radar sammelt,
bündelt und entwirft – veröffentlicht wird ausschließlich nach Freigabe
durch den Admin.

## Was die V1 kann

- **Radar**: ruft 20 vorkonfigurierte Quellen (RSS/Google News, Tamil +
  Englisch, Indien + Sri Lanka) ab – automatisch alle 30 Minuten (Vercel
  Cron bzw. `pnpm radar:loop`) und manuell per Button im Dashboard.
- **Ereignis-Clustering**: Meldungen mehrerer Quellen zum selben Ereignis
  werden zu einer Story gebündelt (Titel-Ähnlichkeit; Embeddings sind der
  V2-Ausbau).
- **Entwürfe**: Sobald genug unabhängige Quellen vorliegen (Standard 2,
  sensible Kategorien 3), erstellt Claude einen tamilischen Artikelentwurf
  mit Schlagzeilen-Varianten, SEO-Feldern, Social-Text, Quellenzuordnung
  und markierten unsicheren Aussagen. Ohne `ANTHROPIC_API_KEY` läuft ein
  kostenfreier Mock-Provider (extraktiv), damit der Workflow testbar ist.
- **Redaktions-Workflow**: erkannt → Entwurf → zur Prüfung → Änderungen
  angefordert / freigegeben → veröffentlicht → aktualisiert → archiviert,
  mit Audit-Log und Warnhinweisen (Einzelquelle, sensible Kategorie).
- **Aktualisieren-Button**: ruft die Quellen neu ab, ordnet neue Meldungen
  der Story zu und schreibt den Entwurf fort. Bereits veröffentlichte
  Artikel gehen dabei erneut durch die Freigabe.
- **Öffentliche Website**: Startseite + Artikelseiten mit öffentlichem
  Quellenblock.
- **WordPress-Publishing (optional)**: freigegebene Artikel per Knopfdruck
  zusätzlich in ein WordPress pushen (REST API + Application Password).

## Schnellstart (ohne jegliche Keys)

```bash
cd tamil-news-radar
pnpm install
pnpm dev          # → http://localhost:3000  (Admin: /admin)
```

Im Admin-Dashboard „Radar jetzt laufen lassen" klicken – Quellen werden
abgerufen, Stories erscheinen. Daten liegen als JSON unter `.data/`.

In einem zweiten Terminal läuft das Radar dauerhaft:

```bash
pnpm radar:loop   # alle 30 Minuten, Strg+C zum Beenden
```

Alternativ alles per Docker: `docker compose up`.

## Produktion

1. **Supabase**: Projekt anlegen, `supabase/migrations/0001_init.sql` und
   `supabase/seed.sql` ausführen, `SUPABASE_URL` +
   `SUPABASE_SERVICE_ROLE_KEY` setzen.
2. **Anthropic**: `ANTHROPIC_API_KEY` setzen (Modell via `ANTHROPIC_MODEL`,
   Standard `claude-sonnet-5`).
3. **Vercel**: `apps/web` als Projekt deployen. `apps/web/vercel.json`
   enthält den Cron (alle 30 Min auf `/api/cron/radar`); `CRON_SECRET`
   setzen.
4. **Admin-Schutz**: `ADMIN_USER` / `ADMIN_PASSWORD` setzen (Basic Auth
   auf `/admin`).
5. **WordPress (optional)**: `WORDPRESS_URL`, `WORDPRESS_USER`,
   `WORDPRESS_APP_PASSWORD` setzen; `WORDPRESS_PUBLISH_STATUS=draft`
   lässt Beiträge als WP-Entwurf ankommen.

Alle Variablen: siehe `.env.example`.

## Struktur

| Pfad | Zweck |
|------|-------|
| `apps/web` | Next.js: öffentliche Site (`/`), Admin (`/admin`), Cron-Endpoint |
| `packages/shared` | Typen, Konfiguration, Quellen-Startliste |
| `packages/database` | Store-Abstraktion: Dev-Store (JSON) / Supabase |
| `packages/source-adapters` | RSS-/Google-News-Adapter (erweiterbar) |
| `packages/ingestion` | Radar-Pipeline: Abruf, Dedupe, Clustering, Entwürfe |
| `packages/ai` | KI-Provider: Anthropic + Mock, Redaktions-Prompt |
| `packages/editorial` | Statusmaschine, WordPress-Publishing |
| `supabase/` | Schema-Migration + Seed |
| `scripts/radar.ts` | Radar-CLI (einmalig oder Loop) |

## Wichtige Hinweise

- Einige Feed-URLs der Startliste sind mit „Feed-URL verifizieren"
  markiert – nach dem ersten Radar-Lauf in **Admin → Quellen** den
  Abrufstatus prüfen und fehlerhafte URLs korrigieren.
- Bilder/Medien, Social-Media-Quellen, Push-Nachrichten und
  Mehrbenutzer-Rollen sind bewusst V2 (siehe Anforderungsklärung).
