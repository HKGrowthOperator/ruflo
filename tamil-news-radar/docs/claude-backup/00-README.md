# Claude-Sicherungsordner – Tamil.de / Tamil News Radar

**Zweck:** Dieser Ordner ist die komplette Wissenssicherung des Projekts.
Lade ihn in ein Claude-Projekt (claude.ai → Projekt → Projektwissen) oder gib ihn
einer neuen Claude-Sitzung — damit kann jede frische Claude-Instanz exakt an dem
Wissensstand weiterarbeiten, an dem diese Sitzung aufgehört hat.

**Stand:** 2026-07-29

## So nimmst du die Arbeit wieder auf

1. Neuen Claude-Chat öffnen (idealerweise Claude Code mit Zugriff auf das Repo
   `HKGrowthOperator/ruflo`, Branch `claude/tamil-news-radar-requirements-gf5i5q`).
2. Diesen Ordner als Wissen mitgeben (alle 7 Dateien).
3. Den Inhalt von `01-wiederaufnahme-prompt.md` als erste Nachricht einfügen.
4. Claude liest damit Arbeitsweise, Regeln, Status und offene Punkte — und macht
   genau dort weiter.

## Inhalt

| Datei | Inhalt |
|---|---|
| `01-wiederaufnahme-prompt.md` | Der Prompt, mit dem eine neue Claude-Sitzung startet |
| `02-projektstatus.md` | Aktueller Stand: was gebaut ist, was echt läuft, was Mock ist |
| `03-redaktionsstandard.md` | Unverhandelbare redaktionelle Regeln (Relevanz, Risiko, Bildrechte) |
| `04-architektur.md` | Technik: Monorepo, Pakete, Datenfluss, Befehle, Tests |
| `05-zugaenge-inventar.md` | Inventar aller Zugänge/Dienste — **ohne Geheimwerte** — inkl. Notfallplan bei Hack |
| `06-offene-punkte.md` | Blocker, ausstehende Entscheidungen, V2-Roadmap |

## Wichtiger Sicherheitsgrundsatz

**Dieser Ordner enthält bewusst keine Passwörter, Keys oder Tokens.**
Ein Backup, das Geheimwerte enthält, wäre selbst das größte Risiko (Ordner geteilt =
alle Zugänge offen). Stattdessen dokumentiert `05-zugaenge-inventar.md`:

- *welche* Zugänge existieren und *wo* sie hinterlegt sind,
- *wie* man jeden einzelnen nach einem Hackerangriff rotiert (Passwort/Key neu erzeugt),
- welche Systeme danach neu konfiguriert werden müssen.

So bleibt das Projekt auch dann vollständig wiederherstellbar, wenn ein Angreifer
Passwörter geändert hat: Der Code liegt in Git, das Wissen liegt hier, und jeder
Zugang lässt sich anhand des Inventars neu aufsetzen.

## Backup aktuell halten

Nach jedem größeren Arbeitsblock Claude bitten:
> „Aktualisiere den Ordner `docs/claude-backup/` auf den heutigen Stand."

Der Ordner liegt im Repo (Git = zweite Sicherung). Zusätzlich die ZIP-Datei
herunterladen und lokal/in Claude ablegen.
