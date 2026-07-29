# Schnellstart: In ~15 Minuten online (kostenlos für Testnutzer)

Ziel: Die App unter einer echten URL erreichbar machen, damit du sie Azubis zum
Testen geben kannst. In dieser Variante ist **alles kostenlos** (Free-Live-Modus) —
Bezahlung schalten wir später mit einem Handgriff dazu.

> Realistische Kosten: Damit die Lernstände Neustarts überleben, braucht es einen
> Server mit **dauerhaftem Speicher**. Bei Render ist das der „Starter"-Plan für
> ca. **7 €/Monat**. Kostenlose Pläne ohne Speicher verlieren die Daten bei jedem
> Neustart — für echte Tester ungeeignet.

## Schritt für Schritt (Render)

1. **Konto anlegen:** Geh auf [render.com](https://render.com), registriere dich
   und verbinde dein GitHub-Konto.

2. **Blueprint starten:** Klicke **New → Blueprint** und wähle das Repository
   `HKGrowthOperator/ruflo`. Render findet automatisch die Datei `render.yaml`
   und richtet den Dienst „pruefungscoach" samt 1-GB-Speicher ein.

3. **Drei Werte eintragen** (Render fragt sie beim ersten Deploy ab):
   - `ADMIN_EMAIL` → deine E-Mail (wird dein Admin-Konto)
   - `ADMIN_PASSWORD` → ein sicheres Passwort
   - `APP_BASE_URL` → lass es zunächst leer; nach dem ersten Deploy trägst du hier
     die von Render vergebene URL ein (z. B. `https://pruefungscoach.onrender.com`)
     und startest einmal neu.

   Alle Stripe-/E-Mail-Felder **leer lassen** — dann läuft die App kostenlos.

4. **Deploy abwarten** (~5 Minuten). Danach zeigt Render dir die URL.

5. **Testen:** Öffne die URL, registriere dich als Azubi, mach die Diagnose und
   eine Lerneinheit. Am Handy: Browser-Menü → **„Zum Startbildschirm hinzufügen"**
   → die App liegt wie eine echte App auf dem Homescreen.

6. **Weitergeben:** Schick den Azubis einfach die URL. Jeder registriert sich
   selbst und hat einen eigenen, getrennten Lernstand.

## Danach (wenn du verkaufen willst)

Bezahlung anschalten = Stripe-Konto anlegen und drei Werte in Render nachtragen
(`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`) — Details in
[DEPLOYMENT.md](./DEPLOYMENT.md). Kein Code-Umbau nötig.

## Bevor echtes Geld fließt (Pflicht in DE)

- Impressum-/AGB-Platzhalter unter `/impressum` und `/agb` mit deinen echten Daten
  füllen und einmal rechtlich prüfen lassen (z. B. eRecht24).
- Optional: eigene Domain in Render verbinden.
