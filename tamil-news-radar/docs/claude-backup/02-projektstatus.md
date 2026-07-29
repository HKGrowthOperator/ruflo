# Projektstatus (Stand 2026-07-29)

## Wo der Code liegt

- Repo: `HKGrowthOperator/ruflo`, Ordner `tamil-news-radar/` (eigenständiges pnpm-Monorepo)
- Branch: `claude/tamil-news-radar-requirements-gf5i5q`
- PR: **#4** (Draft, offen, mergebar, CI grün), head-Commit `c3d23f3`
- CI: `.github/workflows/tamil-news-radar-ci.yml` (Build + Unit + E2E + WordPress-Test)

## Was fertig gebaut ist und funktioniert

- **Radar-Pipeline** (`packages/ingestion/src/radar.ts`): Abruf → Dedupe →
  Relevanz-Score (Verwurf < 40) → Ereignis-Clustering → Risikoklasse → Auto-Entwurf
  (nur grün/gelb, ab 2 unabhängigen Quellen, sensible Kategorien 3)
- **23 Seed-Quellen** (RSS/Google News; tamilisch, englisch, 3 deutsche
  Google-News-Suchen), Abruf per Cron alle 30 Min (Vercel) oder Dashboard-Button
- **Ereignis-Clustering** Tamil-Unicode-sicher (Jaccard + Overlap, 72h-Fenster,
  Schwelle 0.42)
- **Relevanz 0–100** (Tamil 30 / DACH 20 / Aktualität 15 / Community 15 /
  öffentl. Interesse 10 / Quellenqualität 10); tamilischsprachige Quelle ⇒ min. 25 Tamil-Punkte
- **Risiko grün/gelb/rot**; rot = kein Auto-Entwurf, gelb = Pflicht-Warnhinweis
- **KI-Redakteur** (`packages/ai/`): deutscher Tamil.de-Systemprompt, 5 Stilmodi,
  JSON-Ausgabe (Kicker, Schlagzeilen-Varianten, SEO, Social, Tamil-/DACH-Bezug,
  unsichere Aussagen markiert). Anthropic-Provider bei gesetztem Key, sonst Mock
- **Redaktions-Workflow** (`packages/editorial/`): Statusmaschine
  detected→drafted→in_review→changes_requested→approved→published→updated→archived;
  publish nur aus approved
- **WordPress-Publishing**: REST API + Application Password; Beitrag anlegen/
  aktualisieren, Bild-Upload als Beitragsbild, echter Verbindungstest
  (users/me + Kategorien), Auto-Push optional
- **Admin-Dashboard** (`/admin`, Basic Auth): Redaktionsübersicht mit Prioritäten,
  Agentenaktivität, Fehler & Blocker, filterbare Storyliste; `/admin/system`
  (Laufhistorie, Token-Kosten), `/admin/wordpress` (Live-Verbindungstest),
  Quellenverwaltung, Story-Detail mit Freigabe-Aktionen
- **Öffentliche Website**: deutsche Startseite + Artikelseiten mit Quellenbox
- **Persistenz**: Store-Abstraktion — DevStore (JSON `.data/db.json`, mtime-Reload)
  / SupabaseStore (Migrationen `supabase/migrations/0001–0005`)
- **Tests**: `pnpm test` = 12 Unit-Tests + 2 E2E (Pipeline, WordPress inkl.
  Bild-Upload) — alle grün. `pnpm build` grün.

## Was NICHT echt läuft (ehrlich gekennzeichnet, wartet auf Nutzer)

| Bereich | Zustand | Grund |
|---|---|---|
| KI-Texte | **Mock-Provider** (im UI als Mock gekennzeichnet) | `ANTHROPIC_API_KEY` fehlt |
| Produktions-DB | nur DevStore JSON | Supabase-Org „HK" am 2-Projekte-Free-Limit; Entscheidung offen |
| WordPress-Push | Code fertig + getestet gegen Test-Setup | echte Tamil.de-Zugangsdaten fehlen |
| Echte Feed-Abrufe | in Sandbox blockiert (Proxy 403) | funktioniert erst in echter Umgebung (Vercel) |
| KI-Bildretusche | nicht gebaut | Variantenwahl offen (siehe 06) |

## Arbeitsmodus mit dem Nutzer

Immer liefern → Nutzer schaut an und probiert aus → Nutzer gibt Anweisung →
weiter ausbauen und verbessern. Kein großes Vorab-Planen ohne sichtbares Ergebnis.
