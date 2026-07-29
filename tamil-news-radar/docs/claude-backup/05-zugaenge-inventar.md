# Zugänge-Inventar & Notfallplan (bewusst OHNE Geheimwerte)

**Grundsatz:** Hier stehen keine Passwörter, Keys oder Tokens — ein Backup mit
Geheimwerten wäre selbst das größte Leck. Stattdessen: *welche* Zugänge
existieren, *wo* sie hinterlegt sind und *wie* man jeden nach einem Angriff
rotiert und neu einrichtet. Damit ist das Projekt auch nach geänderten
Passwörtern vollständig wiederherstellbar.

## Inventar

| # | Dienst | Konto/Ort | Wird benutzt für | Hinterlegt in | Rotation nach Hack |
|---|---|---|---|---|---|
| 1 | **GitHub** | Org `HKGrowthOperator`, Repo `ruflo` | Code, PR #4, CI | GitHub-Login des Nutzers; Claude-Code-GitHub-Integration | GitHub-Passwort + 2FA neu; unter Settings → Applications alle verdächtigen OAuth-Apps/Tokens widerrufen; Deploy-Keys prüfen |
| 2 | **Anthropic** | Konto des Nutzers | `ANTHROPIC_API_KEY` (KI-Redakteur; aktuell NICHT gesetzt → Mock) | console.anthropic.com → API Keys; als Env-Var in Vercel/lokal | Alten Key in der Console löschen, neuen erzeugen, Env-Var aktualisieren |
| 3 | **Supabase** | Org „HK" (Free-Limit erreicht, Prod-DB noch nicht angelegt) | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | supabase.com Dashboard → Project Settings → API | Service-Role-Key rotieren (Dashboard), Env-Vars aktualisieren; DB-Passwort zurücksetzen |
| 4 | **WordPress Tamil.de** | Redaktions-Benutzer (Zugangsdaten noch nicht übergeben) | `WORDPRESS_URL/USER/APP_PASSWORD` (Publishing) | WordPress → Benutzer → Profil → **Anwendungspasswörter** | Anwendungspasswort löschen + neu erzeugen; WP-Hauptpasswort ändern; unter Benutzer fremde Admin-Konten suchen/löschen; veröffentlichte Beiträge auf Manipulation prüfen |
| 5 | **Vercel** (geplantes Hosting) | Konto des Nutzers | Web-App + Cron; hält alle Env-Vars | vercel.com → Project → Settings → Environment Variables | Vercel-Passwort/2FA neu; Tokens unter Account → Tokens widerrufen; alle Env-Vars nach Rotation der Dienste neu setzen |
| 6 | **Admin-Dashboard** | `/admin` der App | `ADMIN_USER` / `ADMIN_PASSWORD` (Basic Auth) | Env-Var (Vercel/lokal) | Neues starkes Passwort als Env-Var setzen, neu deployen |
| 7 | **Cron-Schutz** | Vercel-Cron-Endpoint | `CRON_SECRET` | Env-Var | Neuen Zufallswert setzen (Env-Var + `vercel.json`-Header bleiben synchron) |
| 8 | **Pinata/IPFS** | nur Haupt-Repo ruflo (Plugin-Registry), NICHT Tamil.de | `PINATA_API_*` | `.env` im Repo-Root (nicht committet) | Keys im Pinata-Dashboard rotieren |

## Notfall-Checkliste bei Verdacht auf Hackerangriff

1. **Sofort rotieren** in dieser Reihenfolge: GitHub (1) → Vercel (5) →
   WordPress (4) → Supabase (3) → Anthropic (2) → Admin/Cron (6, 7).
2. **WordPress prüfen:** fremde Benutzer, geänderte Beiträge, unbekannte Plugins.
3. **GitHub prüfen:** unbekannte Commits/Branches/Webhooks/Actions-Secrets.
4. **Alle Env-Vars in Vercel neu setzen** und neu deployen.
5. **Dieses Backup nutzen:** Code aus Git klonen, `01-wiederaufnahme-prompt.md`
   in neue Claude-Sitzung geben — kein Wissen geht verloren, da nichts davon an
   die alten Geheimwerte gebunden ist.

## Wichtig für jede Claude-Sitzung

- Geheimwerte nur als Env-Vars zur Laufzeit; **niemals** in Code, Doku, Commits
  oder dieses Backup schreiben.
- `.env` steht in `.gitignore` — so lassen.
