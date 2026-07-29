# Zugangs-Inventar & Notfallplan

## Warum hier KEINE Passwörter stehen (wichtig, bitte lesen)

Dieser Ordner ist zum Hochladen in Chats und zum Herumliegen gedacht — genau
deshalb wäre er als Passwortspeicher das **attraktivste Angriffsziel** des ganzen
Projekts. Ein Backup, das alle Schlüssel enthält, schützt nicht vor einem Hack —
es IST dann der Hack. Zwei zusätzliche Fakten:

1. **Es existieren aktuell gar keine geheimen Zugangsdaten im Projekt.** Der
   Assistent hatte nie Render-/Stripe-/E-Mail-Konten oder echte Passwörter —
   alle Live-Konten legst du selbst an. Die einzigen „Passwörter" im Repo sind
   die öffentlichen Entwicklungs-Demos (unten), die in Produktion gar nicht
   existieren.
2. Für den Fall „Konto gehackt, Passwort geändert" hilft kein Passwort-Backup
   (der Angreifer hat es ja geändert), sondern: **Kontowiederherstellung über
   den Anbieter + Schlüsselrotation**. Genau dafür ist die Checkliste unten da.

**Empfehlung:** Lege alle echten Zugangsdaten in einen Passwortmanager
(z. B. Bitwarden/1Password) mit aktivierter 2-Faktor-Authentifizierung. Der
Passwortmanager ist dein Passwort-Backup — dieser Ordner ist dein Wissens-Backup.

## Konten-Inventar (was existiert bzw. geplant ist)

| Konto/Dienst | Zweck | Wer legt es an | Wiederherstellung bei Verlust |
|---|---|---|---|
| GitHub `HKGrowthOperator` | Code-Repository (das eigentliche Projekt-Backup) | existiert (Nutzer) | github.com Account-Recovery; Repo ggf. aus lokalem Klon neu pushen |
| Google-Konto `nickgrowthoperator@gmail.com` | Original-Quelldokumente (Drive) | existiert (Nutzer) | Google-Recovery; Inhalte liegen zusätzlich als Text im Repo (`seed/sources/`) |
| Render (o. ä. Hosting) | App-Hosting + Datenbank-Volume | Nutzer (geplant) | Render-Support; App aus Repo neu deployen, DB aus Volume-Backup |
| Stripe | Bezahlung | Nutzer (geplant) | Stripe-Support (Identitätsprüfung); Keys rotieren |
| Resend (o. ä.) | E-Mail-Versand (Passwort-Reset) | Nutzer (optional) | neu anlegen, API-Key ersetzen |
| Anthropic | KI-Bewertung freier Antworten | Nutzer (optional) | console.anthropic.com, Key rotieren |

## Geheimnisse = Umgebungsvariablen (nie im Code/Repo)

Alle Secrets werden ausschließlich als Env-Variablen beim Hoster gesetzt
(Vorlage: `apps/pruefungscoach/.env.example`):

`DATABASE_PATH`, `APP_BASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
`SESSION_SECRET`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`,
`STRIPE_WEBHOOK_SECRET`, `PRICE_DISPLAY_EUR`, `RESEND_API_KEY`, `EMAIL_FROM`

## Öffentliche Entwicklungs-Demos (KEINE Geheimnisse)

Nur wenn OHNE `ADMIN_PASSWORD` geseedet wird (lokal/Entwicklung):
`admin@coach.local`/`admin1234` und `azubi@coach.local`/`azubi1234`.
In Produktion existieren diese Konten nicht.

## Notfall-Checkliste „Verdacht auf Kompromittierung"

1. **Hosting:** Render-Passwort ändern (bzw. Account-Recovery), alle API-Keys/
   Deploy-Hooks rotieren, verdächtige Deploys prüfen.
2. **Secrets rotieren:** Beim Hoster ALLE Env-Werte neu setzen — neuer
   `SESSION_SECRET`, neue Stripe-Keys (im Stripe-Dashboard „Roll key"), neuer
   `STRIPE_WEBHOOK_SECRET`, neuer `RESEND_API_KEY`, neuer `ANTHROPIC_API_KEY`,
   neues `ADMIN_PASSWORD`. Neu deployen.
3. **Aktive Sitzungen töten:** In der DB `DELETE FROM auth_sessions;` (wirft alle
   Nutzer aus; sie melden sich neu an).
4. **GitHub:** Passwort + 2FA prüfen, unter Settings → Applications fremde
   Tokens/Apps entfernen; `git log` auf fremde Commits prüfen.
5. **Stripe:** Unter „Team" fremde Mitglieder entfernen, Auszahlungskonto prüfen.
6. **Nutzer informieren**, falls Daten betroffen sein könnten (DSGVO Art. 33/34:
   ggf. Meldung an die Aufsichtsbehörde binnen 72 h).
7. **Wiederaufbau im schlimmsten Fall:** Repo klonen → `SCHNELLSTART.md` folgen →
   in ~15 Minuten steht eine frische, saubere Instanz. Lernstände kommen aus dem
   letzten DB-Backup des Hosting-Volumes (Render: Disk-Snapshots).
