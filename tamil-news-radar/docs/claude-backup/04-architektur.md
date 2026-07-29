# Architektur & Technik

## Monorepo (`tamil-news-radar/`, pnpm workspaces)

| Paket | Zweck |
|---|---|
| `packages/shared` | Typen (`types.ts`), Konfig, Utils (`slugify`, `titleSimilarity`, `tokenContainment`), Seed-Quellen (23), Relevanz/Risiko (`relevance.ts`) |
| `packages/database` | Store-Abstraktion: `DevStore` (JSON `.data/db.json`, mtime-Reload für Prozessübergreifendes) / `SupabaseStore` (Service-Role-Key) |
| `packages/source-adapters` | RSS/Google-News-Abruf via globalem `fetch` + `AbortSignal.timeout` |
| `packages/ingestion` | `runRadar` (Abruf→Dedupe→Score→Cluster→Risiko→Entwurf), `draftStory`, `refreshStory` |
| `packages/ai` | `EDITORIAL_SYSTEM_PROMPT` (deutscher Tamil.de-Redakteur, 5 Stilmodi, JSON-Schema), Anthropic- + Mock-Provider |
| `packages/editorial` | Statusmaschine, WordPress-Publisher (`wordpress.ts`: Verbindungstest, Post create/update, Media-Upload) |
| `apps/web` | Next.js 14 App Router; öffentlich (Start, Artikel) + `/admin` (Basic-Auth-Middleware); Design-System in `app/globals.css` |

## Datenfluss

Quellen → RawItems (Dedupe per URL/Titel) → Relevanz-Score (Verwurf < 40) →
Ereignis-Cluster (`titleSimilarity` ≥ 0.42, 72h) → Story mit Risikoklasse →
Auto-Entwurf (grün/gelb, ≥2 Quellen) → Review im Admin → approved → publish →
optional WordPress-Push (inkl. Bild als `featured_media`).

## Wichtige Befehle

```bash
cd tamil-news-radar
pnpm install
pnpm dev            # Web-App auf :3000 (ohne Keys lauffähig, Mock-KI)
pnpm build          # Next.js-Produktionsbuild
pnpm test           # 12 Unit-Tests + 2 E2E (node:test via tsx)
pnpm radar:run      # Radar einmalig per CLI
pnpm radar:loop     # Radar-Dauerschleife (lokal statt Vercel-Cron)
```

## Umgebungsvariablen (Namen — Werte NIE committen)

| Variable | Zweck |
|---|---|
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | echter KI-Redakteur (sonst Mock) |
| `ADMIN_USER`, `ADMIN_PASSWORD` | Basic Auth für `/admin` |
| `CRON_SECRET` | schützt den Vercel-Cron-Endpoint |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Produktions-DB (sonst DevStore) |
| `WORDPRESS_URL`, `WORDPRESS_USER`, `WORDPRESS_APP_PASSWORD` | WordPress-REST-Publishing |
| `WORDPRESS_AUTO_PUSH`, `WORDPRESS_PUBLISH_STATUS` | Auto-Push an/aus; `draft` oder `publish` |
| `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_URL` | Branding/Links |
| `TNR_DATA_DIR` | Ablageort DevStore-JSON |

Vorlage: `.env.example` im Projektordner.

## Deployment (Soll-Zustand, siehe `docs/deployment.md`)

- **Vercel**: Web-App + Cron alle 30 Min (`vercel.json`)
- **Supabase**: Migrationen `supabase/migrations/0001–0005` einspielen
- **Docker Compose** als Alternative
- Erst-Go-Live-Checkliste in `docs/deployment.md`

## Bekannte technische Eigenheiten

- Relative Imports in Packages **ohne** `.js`-Endung (Next `transpilePackages`).
- CLI/Test-Skripte als `.mts` bzw. mit async `main()` (kein Top-Level-Await in cjs).
- Sandbox blockt externe News-Domains (Proxy 403) — echte Abrufe erst in Produktion.
- `js-yaml` v5 hat keinen Default-Export — im Repo-Root-Smoke-Skript
  `import { load as yamlLoad }` verwenden (Fix in Commit `d407c25`).
