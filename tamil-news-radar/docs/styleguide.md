# Redaktioneller Styleguide – Tamil.de

Tamil.de ist ein **deutschsprachiges** Nachrichtenportal für die tamilische
Community im DACH-Raum (Deutschland, Österreich, Schweiz).

Diese Regeln sind die führende Fassung. Der KI-Prompt in
`packages/ai/src/provider.ts` (`EDITORIAL_SYSTEM_PROMPT`) spiegelt sie –
bei Änderungen hier auch den Prompt anpassen.

## Grundhaltung

- **Publikationssprache ist Deutsch.** Alle Artikel erscheinen auf Deutsch;
  tamilische und englische Quellen sind Rohmaterial und werden inhaltlich
  korrekt übersetzt (nie wörtlich).
- **Sachlich und neutral, schnell und direkt.** Kein Boulevard, keine
  Emotionalisierung, keine Meinung im Nachrichtentext.
- **Nur Themen mit Tamil-Bezug**: tamilische Diaspora im DACH-Raum,
  Tamil Nadu, tamilische Bevölkerung Sri Lankas, tamilische Kultur,
  Kino und Sport.

## Zielgruppe und Einordnung

- Leser:innen sind Tamil:innen und tamilisch Interessierte im DACH-Raum –
  viele in zweiter/dritter Generation, nicht alle mit Detailwissen zu
  Tamil Nadu oder Sri Lanka.
- Ereignisse aus Tamil Nadu/Sri Lanka in 1–2 Sätzen einordnen
  (Wer/Wo/Warum relevant), ohne belehrend zu wirken.
- Tamilische Begriffe (Pongal, Kovil, Kolam …) beim ersten Auftreten kurz
  erklären – siehe `docs/glossar.md`.

## Struktur

- Schlagzeile: konkret, ohne Clickbait, ohne Ausrufezeichen.
- Kurzfassung: 2–3 Sätze, beantwortet Wer/Was/Wo/Wann.
- Haupttext: 300–600 Wörter, 2–4 Zwischenüberschriften (`## `),
  Wichtigstes zuerst (umgekehrte Pyramide).
- Quellenblock am Artikelende ist Pflicht und öffentlich.

## Attribution und Unsicherheit

- Jede Tatsachenbehauptung muss durch Quellen gedeckt sein.
- Einzelquellige oder widersprüchliche Aussagen immer mit Attribution:
  „laut X", „wie X berichtet", „nach Angaben von X".
- Unsichere Aussagen werden in `uncertainNotes` gelistet und im
  Dashboard als Warnung angezeigt – der Admin entscheidet.
- Sensible Kategorien (Politik, Sri Lanka) verlangen mindestens 3
  unabhängige Quellen und aktive Prüfbestätigung.

## Sprache und Begriffe

- Politische Begriffe neutral halten – besonders zum Sri-Lanka-Konflikt
  (keine wertenden Kollektivbegriffe, Konfliktparteien neutral benennen).
- Tamilische Eigennamen und Ortsnamen in gängiger lateinischer Umschrift
  gemäß `docs/glossar.md`; bei Bedarf tamilische Originalschreibweise in
  Klammern beim ersten Auftreten.
- Zahlen und Währungen in deutscher Konvention; indische Einheiten
  (Lakh/Crore) in europäische Angaben umrechnen.
- Datumsangaben deutsch (15. Juli 2026).
