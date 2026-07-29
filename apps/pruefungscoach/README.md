# Prüfungscoach Trockenbau

Adaptiver Lern- und Prüfungscoach für die schriftliche IHK-Abschlussprüfung
**Trockenbaumonteur / Ausbaufacharbeiter (Schwerpunkt Trockenbau)**.

Kein Chatbot: Die App führt durch einen berechneten Lernkreislauf —
**Onboarding → Eingangsdiagnose → Tagesplan → adaptive Lernsession →
Wiederholungen → Prüfungssimulation → Auswertung → neuer Plan.**

## Kernprinzipien (aus dem Masterbrief)

- **Deterministische Softwarelogik**: Punkte, Mastery, Statuswechsel, Prioritäten,
  Wiederholungstermine, Prüfungszusammenstellung und Prognosen berechnet Code —
  nie die KI (`src/lib/domain/`, vollständig unit-getestet).
- **KI nur für Sprache**: Der Bewertungsagent ordnet freie Antworten den Kriterien
  des Erwartungshorizonts zu und erkennt Fehlvorstellungen (strukturiertes JSON,
  Zod-validiert). Die Punkte summiert der Code. Ohne `ANTHROPIC_API_KEY` läuft
  ein deterministischer Kriterien-Matcher — die App ist voll offline nutzbar.
- **Keine erfundenen Systemwerte**: Alle Inhalte stammen aus den freigegebenen
  Quellen (`seed/sources/`), jede Frage trägt Quellen-Referenz + Hierarchiestufe
  (1 = Originalprüfung … 6 = ungeprüfte KI-Ergänzung).
- **Fehler als Ursachen**: 16 Fehlercodes (F1–F16), Confidence-Abfrage,
  „falsch + sehr sicher“ wird als kritisches Fehlkonzept priorisiert repariert.
- **Hilfe reduziert Beherrschungswert**: Hilfestufen 0–5 wirken auf den
  Mastery-Zuwachs und die Wiederholungsleiter, nicht auf die Punkte.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript strict** + Tailwind CSS
- **SQLite** (better-sqlite3) mit SQL-Migrationen und reproduzierbarem Seed;
  Datenzugriff über eine Service-Schicht (`src/lib/services/`), sodass ein
  späterer Wechsel auf PostgreSQL/Supabase lokal begrenzt bleibt
- **Zod** an allen Systemgrenzen (API-Bodies, Seed-Dateien, KI-Ausgaben)
- **Vitest** für die gesamte Kernlogik

## Setup

```bash
cd apps/pruefungscoach
npm install
cp .env.example .env        # optional: ANTHROPIC_API_KEY eintragen
npm run migrate             # legt data/pruefungscoach.db an
npm run seed                # Quellen, Kompetenzen, Fragen, Demo-Accounts
npm run dev                 # http://localhost:3100
```

Demo-Accounts: `azubi@coach.local` / `azubi1234` und `admin@coach.local` / `admin1234`.

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run dev` / `build` / `start` | Next.js (Port 3100) |
| `npm run migrate [-- --reset]` | Migrationen anwenden (mit `--reset`: DB neu) |
| `npm run seed` | Seed aus `seed/content/*.json` (idempotent, Zod-validiert) |
| `npm run db:reset` | Reset + Seed |
| `npm test` | Vitest (Domänenlogik + Seed-Inhaltsqualität) |
| `npm run typecheck` | `tsc --noEmit` |
| `npx tsx scripts/validate-seed.ts` | Seed-Dateien einzeln prüfen |

## Umgebungsvariablen (`.env`)

| Variable | Bedeutung |
|---|---|
| `DATABASE_PATH` | Pfad zur SQLite-Datei (Standard `./data/pruefungscoach.db`) |
| `ANTHROPIC_API_KEY` | aktiviert die KI-Bewertung freier Antworten (serverseitig) |
| `ANTHROPIC_MODEL` | Bewertungsmodell (Standard `claude-sonnet-5`) |
| `SESSION_SECRET` | Cookie-Sicherheit in Produktion |

## Architektur

```
apps/pruefungscoach/
├── db/migrations/          SQL-Migrationen (Schema §25 des Masterbriefs)
├── seed/
│   ├── sources/            freigegebene Quelltexte (Originalprüfung, Wissensbündelungen, Notizen)
│   └── content/            Kompetenzen + Fragen als Zod-validiertes JSON
├── scripts/                migrate / seed / validate-seed
├── src/
│   ├── lib/domain/         deterministische Kernlogik (rein, getestet):
│   │   ├── mastery.ts      Mastery-Formel §13, Statusableitung §7
│   │   ├── priority.ts     Prioritätsformel §14
│   │   ├── scheduler.ts    Wiederholungsleitern §15 (fehlerabhängig)
│   │   ├── scoring.ts      Bewertung aller Aufgabentypen §10/§12 (Teilpunkte)
│   │   ├── planner.ts      Tagesmix §18, Desirable Difficulty §5
│   │   ├── diagnosis.ts    Eingangstest-Zusammenstellung §17
│   │   ├── simulation.ts   Prüfungszusammenstellung §20
│   │   ├── readiness.ts    Punkteprognose + Prüfungsreife §21
│   │   └── modes.ts        Modi nach Restzeit §16
│   ├── lib/ai/evaluate.ts  Bewertungsagent (Anthropic) + deterministischer Fallback
│   ├── lib/services/       DB-Orchestrierung (attempts, plan, simulations, stats …)
│   └── app/                Next.js-Seiten + API-Routen (Zod-validiert)
└── tests/                  Vitest: 60+ Tests für Kernlogik + Inhaltsqualität
```

### Lernkreislauf im Code

1. **Onboarding** (`/onboarding` → `api/onboarding`): Prüfungstermin, Lernzeit,
   Selbsteinschätzung → Modus (`planModeForDaysLeft`).
2. **Diagnose** (`/diagnose` → `api/diagnose` + `api/attempt`): 24–30 Aufgaben über
   sechs Blöcke; jeder Versuch aktualisiert `learner_competencies`.
3. **Tagesplan** (`getOrCreateTodayPlan`): fällige Wiederholungen zuerst, dann
   Tagesmix (20 % Wiederholung, 25 % Hauptdefizit, 20 % Grundlagen, 20 % Transfer,
   15 % sichere Punkte — modusabhängig verschoben).
4. **Lernsession** (`/session`): eine Aufgabe pro Ansicht, gestufte Hilfen (1–5),
   Confidence-Abfrage; Bewertung + Feedback + Musterlösung.
5. **Wiederholung**: `next_review_at` je Kompetenz aus Intervallleitern §15;
   kritische Fehler (F16, F2/F3, „geraten“) werfen auf Stufe 0 zurück.
6. **Simulation** (`/simulation`): Timer, Aufgabennavigation, Markieren, Autosave,
   keine Hilfen, Bewertung erst bei Abgabe; Verteilung 30/20/15/15/10/10 nach §20,
   TK/SAN ≈ 62,5/37,5 (echte Prüfungsstruktur ohne WiSo).
7. **Auswertung** (`/simulation/[id]/auswertung`): Punkte nach Bereich, Typ und
   Fehlerursache + Reparaturplan; fließt in den nächsten Tagesplan ein.

## Deployment

**Schritt-für-Schritt-Anleitung (Render, Docker, PWA-Installation): [DEPLOYMENT.md](./DEPLOYMENT.md)**
Die App ist eine installierbare PWA — Nutzer öffnen den Link und können sie über
„Zum Startbildschirm hinzufügen“ wie eine App verwenden.

Die App braucht einen Node-Prozess mit beschreibbarem Dateisystem (SQLite):

```bash
npm run build
DATABASE_PATH=/var/data/pruefungscoach.db npm run start
```

Geeignet: eigener Server/VM, Fly.io, Railway, Render (persistente Volume für
`DATABASE_PATH`). Für Vercel/Serverless muss die Datenschicht auf
PostgreSQL/Supabase umgestellt werden — die Service-Schicht kapselt alle
SQL-Zugriffe, das Domänenmodul bleibt unverändert.

## Quellen & Freigaben

| Quelle | Stufe | Inhalt |
|---|---|---|
| `pruefung-44` | 1 | echte IHK-Prüfung (OCR), Original-Punktwerte |
| `pruefungsstruktur-notizen` | 3 | Prüfungsstruktur Sommer 2026, Lehrerhinweise, High-Priority-Themen |
| `wissensbuendelung` | 4 | abgeschriebene Arbeitsblätter |
| `hauptdatei` | 4 | Fachbuch-Wissensbündelung mit Seitenangaben |
| `didaktische-ableitung` | 5 | Varianten/Distraktoren aus den obigen Quellen |

Inhalte tragen Freigabestatus (`entwurf … freigegeben … gesperrt`); nur
`freigegeben` erscheint für Lernende. Pflege über `/admin`.

## Kommerzielle Schicht (verkaufsfertig)

- **Öffentliche Verkaufsseite** (`/`), Preisseite (`/preise`), Konto (`/konto`).
- **Zugangssteuerung**: kostenlos sind Registrierung, Onboarding, Diagnose und
  Risikoprofil; bezahlpflichtig sind Lernsessions und Simulationen. Ohne
  Stripe-Keys läuft alles im **Free-Live-Modus** (alles frei) — mit Keys wird der
  Kauf aktiv (`src/lib/domain/entitlements.ts`, unit-getestet).
- **Bezahlung**: Stripe-Checkout + signaturgeprüfter Webhook (`/api/checkout`,
  `/api/stripe/webhook`), Einmalkauf „Vollzugang bis zur Prüfung".
- **Konten**: Passwort-Reset per E-Mail (Resend) mit Token, Passwort ändern,
  Rate-Limiting auf Auth-Endpunkten, Security-Header.
- **Rechtstexte** als Vorlagen mit Platzhaltern: `/impressum`, `/datenschutz`, `/agb`.
- Die Berechtigung ist bereits **Tier-fähig** (`tier` = lite/premium,
  `exam_track` = zwischen/abschluss) für die geplante Basis-/Premium-Struktur.

Setup & Aktivierung: siehe [DEPLOYMENT.md](./DEPLOYMENT.md).

## Produkt-Roadmap (Basis/Premium × Zwischen-/Abschlussprüfung)

Siehe [`docs/ihk-struktur-recherche.md`](./docs/ihk-struktur-recherche.md) für die
offizielle IHK-Struktur und den Lückenabgleich. Kern der Produktidee:
- **Basis/Lite**: Buchwissen & Grundlagen (Quellenstufe 3–5) — gut für Zwischenprüfung.
- **Premium**: zusätzlich echte Altprüfungen (Quellenstufe 1) + Prüfungsgewichtung.
- Zweite Achse **Zwischen-/Abschlussprüfung** (Zwischenprüfungs-Inhalte + Grundstufe
  fehlen noch — nächster Content-Schritt).
Da jede Frage `source_level` und `exam_relevance` trägt, ist der Tier-Split im Kern
ein Filter auf den Fragenpool.

## Bekannte Grenzen / nächste Schritte

- **Tier-Inhalte**: Basis/Premium und Zwischenprüfung sind im Datenmodell vorbereitet,
  aber der Content-Filter + die Zwischenprüfungs-/Grundstufen-Inhalte fehlen noch.
- Bild-/Plandarstellung: Planaufgaben werden textlich beschrieben (§ Zeichnungsersatz);
  echte Zeichnungen brauchen einen Storage + Bild-Rendering.
- `knowledge_objects` (Mikrolektionen/Lesetexte je Kompetenz) sind im Schema
  angelegt, aber noch nicht aus den Quellen extrahiert — Feedback stützt sich
  auf Musterlösungen und Erwartungshorizonte.
- Der Sieben-Tage-Intensivplan (§19) ist über Modus `bestehensmodus` abgedeckt,
  aber nicht als expliziter Tag-für-Tag-Fahrplan umgesetzt.
- Mehrere Berufe/Rollen: Datenmodell ist vorbereitet (Kompetenz-Präfixe,
  `learner_profiles.beruf`), UI ist auf Trockenbau fokussiert.
- PostgreSQL-Migration für Serverless-Deployment (siehe oben).
