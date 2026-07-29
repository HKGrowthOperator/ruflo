# Offene Punkte & Roadmap (Stand 2026-07-29)

## Blocker — warten auf Entscheidung/Zugänge des Nutzers

| Punkt | Was fehlt | Wirkung |
|---|---|---|
| Anthropic-Key | `ANTHROPIC_API_KEY` setzen | Echte deutsche Artikel statt Mock-Entwürfen |
| Supabase | Org „HK" am 2-Projekte-Free-Limit: Projekt pausieren ODER Pro-Upgrade | Persistente Produktions-DB statt JSON-DevStore |
| WordPress | URL + Benutzer + Anwendungspasswort von Tamil.de | Echter Publishing-Kanal live |
| KI-Bildretusche | Variantenwahl: (a) Zuschnitt/Format, (b) Qualität/Upscaling, (c) KI-Symbolbilder mit Kennzeichnung | Bildstrecke im Workflow |
| Vercel-Deploy | Go-Live-Freigabe (Checkliste in `docs/deployment.md`) | App + Cron öffentlich erreichbar |

## Laufende Aufgabe

- **PR #4 überwachen** (stündlicher Selbst-Check-in): CI, Kommentare,
  Mergeability — bis Merge/Close. Bei Wiederaufnahme in neuer Sitzung:
  PR-Status prüfen und Schleife bei Bedarf neu aufsetzen.

## V2-Roadmap (aus dem redaktionellen Masterprompt, noch nicht gebaut)

1. **Entity-Intelligenz:** Datenbank lernt Personen, Organisationen, Tempel,
   Vereine der Community; Verknüpfung mit Stories
2. **Strukturierte Faktenmatrix:** je Claim CONFIRMED/CONTRADICTED über Quellen
   hinweg; Widerspruchserkennung zwischen Quellen
3. **Rollen & Rechte** in der Redaktion (Chefredaktion vs. Redakteur)
4. **Onboarding-Assistent** für neue Redakteure
5. **Nicht-RSS-Quellen:** Scraper, Social-Media-Quellen
6. **KI-Bildpipeline** (nach Variantenentscheidung, mit Kennzeichnungspflicht)

## Zuletzt abgeschlossen (Kontext)

- Master-Korrekturprompt Runde 1: Admin-Shell-Redesign (Sysbar + Navigation),
  `/admin/system` (Agentenstatus), `/admin/wordpress` (echter Verbindungstest),
  Ehrlichkeits-Kennzeichnung von Mock-Entwürfen — Commit `c3d23f3`, CI grün
- CI-Fix `js-yaml` v5 (Commit `d407c25`, Repo-Root)
- Design-System: Georgia-Serifen, warme Neutraltöne, Nachrichtenrot, Dark Mode
