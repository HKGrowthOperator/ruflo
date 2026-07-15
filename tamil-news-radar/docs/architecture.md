# Architektur – Tamil News Radar V1

## Datenfluss

```
        alle 30 Min (Cron) / Button / CLI
                     │
             ┌───────▼────────┐
             │  runRadar()    │  packages/ingestion
             └───────┬────────┘
   1. fetchSource()  │  packages/source-adapters (RSS / Google News)
   2. Dedupe         │  guid + url gegen Bestand
   3. Clustering     │  Titel-Jaccard gegen Stories im 72h-Fenster
   4. Entwurf        │  ab 2 (sensibel: 3) unabhängigen Quellen
                     ▼
             ┌────────────────┐     ┌─────────────────────────┐
             │  Store         │◄────┤ Admin-Dashboard /admin  │
             │  (Dev/Supabase)│     │ Prüfen → Freigeben →    │
             └───────┬────────┘     │ Veröffentlichen         │
                     │              └───────────┬─────────────┘
                     ▼                          │ optional
             öffentliche Website          WordPress REST API
```

## Statusmaschine

`detected → (researching) → drafted → in_review → changes_requested ⇄ in_review
→ approved → published → updated → archived`

- `publish` ist nur aus `approved` möglich; `approved` nur aus `in_review`.
  Es gibt **keinen** Codepfad, der ohne Admin veröffentlicht (Frage 24).
- „Aktualisieren" einer veröffentlichten Story erzeugt einen neuen Entwurf
  und setzt `updated` → muss erneut durch `in_review`/`approve`.

## Entscheidungen (Kurzfassung)

| Thema | Entscheidung |
|-------|--------------|
| Persistenz | Store-Interface; Dev = JSON-Datei, Prod = Supabase (Service-Role, RLS an) |
| Clustering | Token-Jaccard auf Titeln, Schwellwert 0.42, Fenster 72 h. V2: pgvector/Embeddings |
| KI | Provider-Interface; Anthropic wenn Key, sonst Mock. Prompt = Redaktionsregeln (sachlich, Tamil, Attribution, uncertainNotes) |
| Faktensicherheit | Entwurf erst ab 2 unabhängigen Quellen (sensibel 3); Warnungen an der Story; unsichere Aussagen als Liste am Entwurf |
| Auth | Basic Auth via Middleware auf `/admin` (V1, ein Admin) |
| WordPress | Publisher in packages/editorial; erstellt/aktualisiert Beiträge via REST + Application Password |
| Kein Turbo/Build-Step | Packages werden als TS-Quelle via `transpilePackages` konsumiert; CLI läuft über tsx |

## Bewusst V2

Embedding-Clustering, Bilder/Mediathek, Social-Quellen (YouTube/X),
Push-Nachrichten, Rollen für mehrere Redakteure, Auto-Update-Vorschläge
für veröffentlichte Artikel, Plagiat-Score, Kosten-Tracking pro KI-Aufruf.
