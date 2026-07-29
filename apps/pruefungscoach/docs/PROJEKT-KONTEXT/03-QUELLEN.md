# Datenquellen — wo der Inhalt herkommt

Die Inhalte sind der Kern des Produktwerts. **Alle vier Quelldokumente sind
bereits als Text ins Repo übernommen** (`apps/pruefungscoach/seed/sources/`) —
das Repo ist damit auch das Backup der Quellen. Die Google-Drive-Originale
gehören dem Nutzer (Konto: nickgrowthoperator@gmail.com).

## Quellen im Repo (Text, extrahiert)

| Repo-Datei | Original (Google Drive) | Hierarchiestufe | Inhalt |
|---|---|---|---|
| `seed/sources/pruefung-44.md` | PDF „Prüfung 44-komprimiert-zusammengefügt.pdf", ID `1iW74slWb4YUQebPoQHMCXN_1EWQeNXf2` | **1 (Originalprüfung)** | Echte IHK-Prüfungsaufgaben mit Punktwerten (OCR) |
| `seed/sources/pruefungsstruktur-notizen.md` | Doc „Notizen Lern-Coach", ID `1QlTSKaf8g9FCPRiEXsCUzl02QIpyuUdIrgwjPz2CjCM` | 3 | Prüfungsstruktur Sommer 2026 (TK 50 %/150 min, SAN 30 %/90 min, WiSo 20 %), High-Priority-Themen aus Lehrerhinweisen |
| `seed/sources/wissensbuendelung.md` | Doc „Arbeitsblätter abgeschrieben Wissensbündelung", ID `1HOQLG6puGaLnMZypdmwSmz0lY-xMyDgyvTvLri6e40s` | 4 | Abgeschriebene Arbeitsblätter (74k Zeichen) |
| `seed/sources/hauptdatei.md` | Doc „Buchinhalt Wissensbündelung", ID `1IUyGHXP2huHicD4IbYjGkWrXYpIbdwN3FY4dKNtCEyg` | 4 | Fachbuch-Wissensbündelung mit Seitenangaben (185k Zeichen) |

Drive-Ordner: `https://drive.google.com/drive/folders/1e7qTUHcNWTO6eSD39mZzkv2UkZv21dQn`

## Daraus erzeugte Inhalte

- `seed/content/competencies-*.json` + `questions-*.json` — 129 Mikrokompetenzen,
  295 Fragen (Zod-validiert via `scripts/validate-seed.ts`, geseedet via
  `npm run seed`)
- Präfixe: BAS PLA TKW TKD BPH SAN DGA FBE SON → 8 Hauptbereiche

## Noch NICHT vorhandene Quellen (für die Roadmap nötig)

- **Zwischenprüfungs-Unterlagen** (Ausbaufacharbeiter, alte Zwischenprüfungen)
- **Grundstufen-Material** (1. Lehrjahr, berufsfeldbreite Grundbildung Bau)
Der Nutzer hat angedeutet, dass es dazu Material gibt („bei der Zwischenprüfung
war es im Prinzip genauso, aber ein bisschen anders") — beim Wiederaufnehmen
danach fragen.

## Offizielle Struktur-Recherche

`apps/pruefungscoach/docs/ihk-struktur-recherche.md` — Ausbildungsweg,
Prüfungsstruktur (alt: BauWiAusbV 1999; neu ab 1.8.2026: AusbauBAusbV 2024 mit
gestreckter Gesellenprüfung), Lernfeld-Mapping und priorisierte Lückenliste.
