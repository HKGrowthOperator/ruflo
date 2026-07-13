# Prüfungscoach online stellen — Schritt für Schritt

Der Prüfungscoach ist eine **Web-App (PWA)**: Du stellst sie einmal online, gibst
den Link weiter, und jeder kann sie im Browser nutzen **und wie eine App aufs
Handy installieren** („Zum Startbildschirm hinzufügen“). Ein App-Store ist nicht
nötig.

## Was brauchen die Nutzer?

1. Link öffnen (z. B. `https://pruefungscoach.onrender.com`)
2. Registrieren (E-Mail + Passwort)
3. Optional am Handy: Browser-Menü → **„Zum Startbildschirm hinzufügen“**
   → die App liegt mit Icon auf dem Homescreen und öffnet im Vollbild.

## Variante A: Render.com (empfohlen, ~7 €/Monat, kein Server-Wissen nötig)

Die Datei `render.yaml` im Repo-Root ist ein fertiger Bauplan.

1. Konto auf [render.com](https://render.com) anlegen und GitHub verbinden.
2. **New → Blueprint** → dieses Repository (`HKGrowthOperator/ruflo`) auswählen.
   Render liest `render.yaml` und legt den Dienst „pruefungscoach“ inkl.
   1-GB-Datenspeicher an.
3. Beim ersten Deploy zwei Werte eintragen (werden abgefragt):
   - `ADMIN_EMAIL` — deine E-Mail (wird das Admin-Konto)
   - `ADMIN_PASSWORD` — ein sicheres Passwort
   - optional `ANTHROPIC_API_KEY` — aktiviert die KI-Bewertung freier Antworten
     (ohne Key bewertet der eingebaute deterministische Matcher)
4. Deploy abwarten (~5 min). Fertig — die URL kannst du weitergeben.

Hinweis: Der günstigste Plan mit **persistenter Disk** ist nötig, damit die
Lernstände Neustarts überleben. Kostenlose Pläne ohne Disk verlieren die Daten.

## Variante B: Eigener Server / NAS (Docker)

```bash
cd apps/pruefungscoach
ADMIN_EMAIL=du@example.de ADMIN_PASSWORD=geheim docker compose up -d --build
# App läuft auf http://<server>:3100 — davor einen HTTPS-Proxy (Caddy/Traefik) setzen
```

Für die Installierbarkeit als App (PWA) ist **HTTPS Pflicht** (außer localhost).
Mit [Caddy](https://caddyserver.com) reicht ein Zweizeiler:

```
coach.deine-domain.de {
    reverse_proxy localhost:3100
}
```

## Variante C: Railway / Fly.io

Beide funktionieren analog zu Render (Node 22, Volume für `DATABASE_PATH`,
Start: `npm run migrate && npm run seed && npm run start`). Das `Dockerfile`
in diesem Ordner wird von beiden automatisch erkannt.

## Wichtige Umgebungsvariablen in Produktion

| Variable | Pflicht | Wirkung |
|---|---|---|
| `DATABASE_PATH` | ja | Pfad auf dem persistenten Volume |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ja | dein Admin-Konto; verhindert die Demo-Accounts |
| `SESSION_SECRET` | ja | Zufallswert für Cookie-Sicherheit |
| `ANTHROPIC_API_KEY` | nein | KI-Bewertung freier Antworten (empfohlen) |
| `ANTHROPIC_MODEL` | nein | Standard `claude-sonnet-5` |

## Braucht es eine „echte“ App (App Store)?

Für euren Anwendungsfall: **nein**. Die PWA kann alles, was der Coach braucht
(Vollbild, Homescreen-Icon, mobil optimiert). Eine native App (App Store /
Play Store) lohnt erst, wenn ihr Push-Benachrichtigungen auf iOS, Offline-Lernen
oder Bezahlung über die Stores wollt — das wäre ein separates Projekt
(z. B. Capacitor-Wrapper um genau diese Web-App).

## Später: viele Nutzer / Verkauf als Produkt

Die App ist bereits mehrbenutzerfähig (Registrierung, getrennte Lernstände).
Für einen öffentlichen Betrieb mit vielen fremden Nutzern wären die nächsten
Ausbaustufen: PostgreSQL statt SQLite (Service-Schicht ist vorbereitet),
E-Mail-Bestätigung/Passwort-Reset, Rate-Limiting und ein Impressum/Datenschutz
(DSGVO) auf einer Landingpage.
