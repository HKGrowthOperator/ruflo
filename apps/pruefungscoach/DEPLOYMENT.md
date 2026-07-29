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
| `APP_BASE_URL` | ja | öffentliche URL (für Zahlungs-Redirects & Reset-Links) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ja | dein Admin-Konto; verhindert die Demo-Accounts |
| `SESSION_SECRET` | ja | Zufallswert für Cookie-Sicherheit |
| `ANTHROPIC_API_KEY` | nein | KI-Bewertung freier Antworten (empfohlen) |
| `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` | nein | aktivieren die Bezahlung (sonst Free-Live) |
| `STRIPE_WEBHOOK_SECRET` | bei Stripe | Signaturprüfung des Zahlungs-Webhooks |
| `RESEND_API_KEY` / `EMAIL_FROM` | nein | E-Mail-Versand für Passwort-Reset |

## Bezahlung aktivieren (Stripe) — optional

Ohne Stripe-Variablen läuft die App im **Free-Live-Modus**: alle Funktionen sind
kostenlos. So kannst du sie sofort für Testnutzer online stellen. Zum Verkaufen:

1. Konto auf [stripe.com](https://stripe.com) anlegen (EU-fähig, unterstützt SEPA/Karte).
2. Im Stripe-Dashboard ein **Produkt** „Prüfungscoach Vollzugang" mit einem
   **Einmalpreis** anlegen → du erhältst eine `price_...`-ID → als `STRIPE_PRICE_ID`.
3. Den geheimen API-Schlüssel (`sk_live_...`) als `STRIPE_SECRET_KEY` setzen.
4. Einen **Webhook** einrichten: Endpoint `https://DEINE-DOMAIN/api/stripe/webhook`,
   Event `checkout.session.completed`. Das Webhook-Secret (`whsec_...`) als
   `STRIPE_WEBHOOK_SECRET` setzen.
5. `PRICE_DISPLAY_EUR` auf den angezeigten Preis setzen (z. B. `39`).

Danach ist auf allen Seiten der Kauf aktiv; nach erfolgreicher Zahlung schaltet der
Webhook den Vollzugang bis zum Prüfungstermin (+ Puffer) frei. Kostenlos bleiben
Registrierung, Onboarding, Diagnose und Risikoprofil — bezahlpflichtig sind die
Lernsessions und Simulationen.

## E-Mail (Passwort-Reset) — optional

Ohne `RESEND_API_KEY` werden Reset-Links nur in die Server-Logs geschrieben
(für die Testphase in Ordnung). Für echten Versand ein kostenloses Konto bei
[resend.com](https://resend.com) anlegen, Domain verifizieren, `RESEND_API_KEY`
und `EMAIL_FROM` setzen.

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
