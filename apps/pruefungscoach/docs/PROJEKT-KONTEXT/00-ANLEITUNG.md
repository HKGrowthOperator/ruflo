# Projekt-Kontext „Prüfungscoach Trockenbau" — Anleitung

**Zweck dieses Ordners:** Vollständige Wiederaufnahme des Projekts in einem
neuen Claude-Chat (oder durch einen anderen Entwickler), auch wenn der
ursprüngliche Chat-Verlauf verloren ist. Stand: **2026-07-28**.

## So benutzt du diesen Ordner

1. Neuen Claude-Chat/Claude-Code-Session öffnen, Zugriff auf das Repository
   `HKGrowthOperator/ruflo` geben (Branch `claude/exam-coach-masterbrief-herx69`
   bzw. `main`, falls der PR gemerged wurde).
2. Diesen Ordner hochladen (oder darauf verweisen — er liegt auch im Repo unter
   `apps/pruefungscoach/docs/PROJEKT-KONTEXT/`).
3. Den Text aus `06-WIEDERAUFNAHME-PROMPT.md` als erste Nachricht einfügen.

## Inhalt

| Datei | Inhalt |
|---|---|
| `01-PROJEKTSTAND.md` | Was gebaut ist, Architektur, Entscheidungen, Verifikationsstand |
| `02-MASTERBRIEF.md` | Der ursprüngliche vollständige Bau-Auftrag (Original) |
| `03-QUELLEN.md` | Alle Datenquellen inkl. Google-Drive-Links und Repo-Pfade |
| `04-ZUGANGS-INVENTAR.md` | Welche Konten/Schlüssel existieren, wo sie verwaltet werden, Notfall-Checkliste — **bewusst ohne Passwörter, siehe Begründung darin** |
| `05-ROADMAP.md` | Produktvision (Basis/Premium × Zwischen-/Abschlussprüfung), offene Punkte |
| `06-WIEDERAUFNAHME-PROMPT.md` | Fertiger Text für die erste Nachricht im neuen Chat |

## Wichtigste Wahrheit in einem Satz

Der **Code + Inhalte liegen versioniert im Git-Repository** (das ist das echte
Backup); dieser Ordner liefert das **Wissen drumherum** — Kontext, Entscheidungen,
Quellen, Konten und nächste Schritte — damit ein neuer Assistent nahtlos
weitermachen kann.
