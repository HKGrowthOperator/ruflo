# Go-Live-Checkliste

Schritt-für-Schritt vom Repo zur laufenden Website. Dauer beim ersten
Mal: ca. 1–2 Stunden.

## 1. Supabase (Datenbank)

1. Projekt auf [supabase.com](https://supabase.com) anlegen (Region z. B. Frankfurt).
2. SQL-Editor öffnen und nacheinander ausführen:
   - `supabase/migrations/0001_init.sql`
   - `supabase/seed.sql` (20 Startquellen)
3. Notieren: **Project URL** und **Service-Role-Key**
   (Settings → API; NICHT der anon-Key).

## 2. Anthropic (KI-Entwürfe)

1. API-Key unter [console.anthropic.com](https://console.anthropic.com) erstellen.
2. Empfehlung: Budget-Limit im Anthropic-Dashboard setzen (z. B. 100 €/Monat).
3. Modell: Standard ist `claude-sonnet-5` (gutes Preis-Leistungs-Verhältnis
   für Nachrichtentexte); via `ANTHROPIC_MODEL` änderbar.

## 3. Vercel (Hosting + Cron)

1. Repo bei Vercel importieren, **Root Directory: `tamil-news-radar/apps/web`**.
2. Build läuft mit den Standardeinstellungen (Next.js wird erkannt,
   pnpm-Workspace funktioniert automatisch).
3. Environment-Variablen setzen (alle aus `.env.example`):

   | Variable | Wert |
   |---|---|
   | `SUPABASE_URL` | aus Schritt 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | aus Schritt 1 |
   | `ANTHROPIC_API_KEY` | aus Schritt 2 |
   | `ADMIN_USER` / `ADMIN_PASSWORD` | frei wählen – Pflicht in Produktion! |
   | `CRON_SECRET` | langes Zufallsgeheimnis (`openssl rand -hex 24`) |
   | `NEXT_PUBLIC_SITE_URL` | öffentliche URL, z. B. `https://deine-domain.de` (für RSS-Feed, Sitemap, OpenGraph) |
   | `NEXT_PUBLIC_SITE_NAME` | Anzeigename der Website (optional, Standard: „தமிழ் News Radar") |

4. Deploy. Der Cron aus `apps/web/vercel.json` (alle 30 Min auf
   `/api/cron/radar`) wird von Vercel automatisch registriert
   (sichtbar unter Project → Settings → Cron Jobs).

## 4. Erste Schritte nach dem Deploy

1. `/admin` öffnen (Basic Auth) → „Radar jetzt laufen lassen".
2. **Admin → Quellen**: Abrufstatus prüfen. Quellen mit ❌ und dem
   Hinweis „Feed-URL verifizieren" korrigieren oder sperren.
3. Erste Story öffnen → Entwurf prüfen → Vorschau → Freigeben →
   Veröffentlichen.

## 5. WordPress anbinden (primärer Veröffentlichungskanal)

1. In WordPress (Tamil.de): Benutzer → Profil → **Anwendungspasswörter**
   → neues Passwort erzeugen.
2. In Vercel setzen: `WORDPRESS_URL`, `WORDPRESS_USER`,
   `WORDPRESS_APP_PASSWORD`, `WORDPRESS_PUBLISH_STATUS`
   (`draft` = kommt als WP-Entwurf an, `publish` = geht sofort live).
3. **Auto-Push**: Sobald WordPress konfiguriert ist, wird jeder im
   Dashboard veröffentlichte Artikel automatisch nach WordPress
   gepusht – inkl. Artikelbild als Beitragsbild (Upload in die
   Mediathek mit Bildunterschrift/Credit). Abschaltbar mit
   `WORDPRESS_AUTO_PUSH=false`; der manuelle Push-Button bleibt.
4. Schlägt der Push fehl, bleibt der Artikel veröffentlicht und die
   Story bekommt eine Warnung + Audit-Eintrag (`wordpress.error`) –
   dann manuell erneut pushen.

## 6. Artikelbilder

- Bild pro Story im Story-Detail setzen: URL, Bildunterschrift,
  Credit, Lizenz. **Rechte vorher klären** (eigene Mediathek,
  Wikimedia Commons, lizenzfreie Datenbanken).
- Beim WordPress-Push wird das Bild einmalig in die Mediathek
  hochgeladen (Media-ID wird gespeichert, kein Doppel-Upload).
- KI-Retusche/Zuschnitt: nächste Ausbaustufe (Schnittstelle vorbereitet).

## Betrieb ohne Vercel (eigener Server)

```bash
docker compose up          # Web (:3000) + Radar-Loop (30 Min)
# oder manuell:
pnpm build && pnpm start   # Web
pnpm radar:loop            # Radar-Dauerbetrieb
```

## Checks

- Alle Tests: `pnpm test` (Unit + Pipeline-E2E + WordPress-Mock)
- Radar-Report: Admin-Dashboard oben bzw. Audit-Log (`radar.run`)
- Token-Verbrauch pro Entwurf: im Story-Detail und im Audit-Log
