# Projektstand (2026-07-28)

## Was das Projekt ist

Adaptiver **Prüfungscoach für Trockenbaumonteure** (IHK-Abschlussprüfung,
Sommer 2026) — kein Chatbot, sondern ein geführter Lernkreislauf:
Onboarding → Eingangsdiagnose → berechneter Tagesplan → adaptive Lernsession →
Spaced-Repetition-Wiederholungen → Prüfungssimulation → Ursachen-Auswertung →
neuer Plan. Gebaut nach dem Masterbrief (`02-MASTERBRIEF.md`), erweitert um eine
verkaufsfertige kommerzielle Schicht.

## Wo alles liegt

- **Repository:** `HKGrowthOperator/ruflo` (GitHub)
- **Branch:** `claude/exam-coach-masterbrief-herx69` — offener Draft-PR #2
- **App-Code:** `apps/pruefungscoach/` (eigenständige Next.js-App im Monorepo)
- **Render-Blueprint:** `render.yaml` im Repo-Root
- **Anleitungen:** `apps/pruefungscoach/SCHNELLSTART.md` (online stellen),
  `DEPLOYMENT.md` (Stripe/E-Mail/Domains), `README.md` (Architektur)

## Stack & Architektur

- Next.js 15 (App Router) + React 19 + TypeScript strict + Tailwind; PWA
  (installierbar am Handy, Manifest + Service Worker)
- SQLite (better-sqlite3), SQL-Migrationen `db/migrations/0001_init.sql` +
  `0002_commerce.sql`; Seed aus Zod-validierten JSON-Dateien (`seed/content/`)
- **Deterministischer Kern** (`src/lib/domain/`, vollständig unit-getestet):
  mastery (§13-Formel), priority (§14), scheduler (§15-Intervallleitern),
  scoring (alle 12 Aufgabentypen inkl. Teilpunkte), planner (Tagesmix §18),
  diagnosis (§17), simulation (§20), readiness (§21), modes (§16),
  entitlements (Zugang/Bezahlung)
- **KI nur für Sprache:** Bewertungsagent (Anthropic API, strukturiertes JSON,
  Zod-validiert) ordnet freie Antworten den Kriterien des Erwartungshorizonts zu;
  Punkte summiert IMMER der Code. Ohne API-Key: deterministischer
  Keyword/Synonym-Matcher — App voll funktionsfähig offline.
- **Services** (`src/lib/services/`): attempts (zentrale Versuchsverarbeitung:
  bewerten → speichern → Mastery/Status → Wiederholungstermin → Fehlergedächtnis),
  plan, diagnosis, simulations, stats, questions, entitlements, passwordReset.

## Inhalte (der eigentliche Wert)

- **129 Mikrokompetenzen**, **295 Fragen** über 8 Hauptbereiche, erzeugt aus den
  echten Quellen (siehe `03-QUELLEN.md`), jede Frage mit: Quellenstufe (1 =
  Originalprüfung … 5 = Ableitung), Prüfungsrelevanz, Operator, Fragenfamilie,
  Schwierigkeit, Distraktor-Fehlercodes (F1–F16), Erwartungshorizont mit
  Teilpunkten (Kriteriensumme == Punktzahl, vom Seed-Validator erzwungen)
- **50+ Original-Prüfungsaufgaben** aus „Prüfung 44" mit Original-Punktwerten
- Prüfungsstruktur real: TK 50 % / Sanieren 30 % / WiSo 20 % (ohne WiSo intern
  62,5/37,5) — von der IHK-Recherche bestätigt (`docs/ihk-struktur-recherche.md`)

## Kommerzielle Schicht (verkaufsfertig)

- Öffentliche Landingpage `/`, Preisseite `/preise`, Konto `/konto`,
  Rechtstext-VORLAGEN `/impressum` `/datenschutz` `/agb` (Platzhalter!)
- **Free-Live-Modus:** ohne Stripe-Env-Variablen ist alles kostenlos; mit
  `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID` wird der Kauf aktiv (Einmalkauf
  „Vollzugang bis zur Prüfung", Webhook signaturgeprüft, idempotent)
- Kostenlos bleibt immer: Registrierung, Onboarding, Diagnose, Risikoprofil.
  Bezahlpflichtig: Lernsessions, Wiederholungen, Simulationen, Hilfen.
- Entitlements sind **tier-fähig vorbereitet**: `tier` (lite/premium) ×
  `exam_track` (zwischen/abschluss) — für die Produktvision in `05-ROADMAP.md`
- Konten: Passwort-Reset per E-Mail (Resend, Fallback Konsole), Passwort ändern,
  Rate-Limiting, Security-Header, scrypt-Passwort-Hashing, DB-Sessions

## Verifikationsstand (zuletzt geprüft 2026-07-28)

- 85 Unit-Tests grün (Domänenlogik, Entitlements, Seed-Inhaltsqualität)
- `tsc --noEmit` und `next build` grün
- End-to-End per Playwright/Curl verifiziert: kompletter Lernkreislauf,
  Free-Live vs. Paywall-Gating (402), Produktions-Seed (ADMIN_EMAIL/PASSWORD,
  keine Demo-Accounts)
- **Sicherheitsreview:** 2 Paywall-Bypässe geschlossen (Hint-API leakte
  Musterlösungen an Gratis-Nutzer; Diagnose-Kontext erlaubte Fragenpool-Grinding
  nach Diagnose-Abschluss), Login-Timing-Angleichung gegen Nutzer-Enumeration

## Bewusste Entscheidungen (nicht versehentlich ändern)

1. SQLite statt Postgres: bewusst für einfaches Deployment mit persistentem
   Volume; Service-Schicht kapselt SQL → Postgres-Migration ist lokal begrenzt.
   Serverless (Vercel) geht deshalb NICHT ohne Umbau.
2. Demo-Accounts (`admin@coach.local`/`azubi@coach.local`) existieren NUR, wenn
   kein `ADMIN_PASSWORD` gesetzt ist (= Entwicklungsmodus).
3. Keine erfundenen Systemwerte: Zahlenwerte in Fragen nur aus den Quellen;
   sonst Prinzip-Fragen. Quellenhierarchie an jeder Frage.
4. Hilfen (Stufe 0–5) reduzieren den Mastery-Zuwachs, NICHT die Punkte.
5. Simulationen: keine Sofortbewertung, Bewertung erst bei Abgabe (§20).

## Bekannte Grenzen / Schulden

- Rechtstexte sind Platzhalter-Vorlagen — vor Verkaufsstart füllen + prüfen lassen
- Keine E-Mail-Verifikation bei Registrierung (bewusst verschoben)
- Rate-Limiting ist in-memory (bei mehreren Prozessen/Instanzen → Redis nötig)
- `knowledge_objects` (Mikrolektionen) im Schema angelegt, nicht befüllt
- Planaufgaben textlich beschrieben (keine echten Zeichnungen/Bilder)
- Grundstufe/Zwischenprüfungs-Inhalte fehlen (siehe Roadmap + IHK-Recherche)
