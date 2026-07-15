# Redaktioneller Styleguide (Fragen 35–37)

Diese Regeln sind die führende Fassung. Der KI-Prompt in
`packages/ai/src/provider.ts` (`EDITORIAL_SYSTEM_PROMPT`) spiegelt sie –
bei Änderungen hier auch den Prompt anpassen.

## Grundhaltung

- **Sachlich und neutral, schnell und direkt.** Kein Boulevard, keine
  Emotionalisierung, keine Meinung im Nachrichtentext.
- Publikationssprache ist **Tamil** (சுத்தமான செய்தித் தமிழ் –
  klare Nachrichtensprache, keine übermäßig literarische Diktion).
- Englische Quellen werden inhaltlich korrekt übersetzt, nicht wörtlich.

## Struktur

- Schlagzeile: konkret, ohne Clickbait, ohne Ausrufezeichen.
- Kurzfassung: 2–3 Sätze, beantwortet Wer/Was/Wo/Wann.
- Haupttext: 300–600 Wörter, 2–4 Zwischenüberschriften (`## `),
  Wichtigstes zuerst (umgekehrte Pyramide).
- Quellenblock am Artikelende ist Pflicht und öffentlich.

## Attribution und Unsicherheit

- Jede Tatsachenbehauptung muss durch Quellen gedeckt sein.
- Einzelquellige oder widersprüchliche Aussagen immer mit Attribution:
  „… என்று X தெரிவித்துள்ளது" / „X கூறுகிறது".
- Unsichere Aussagen werden in `uncertainNotes` gelistet und im
  Dashboard als Warnung angezeigt – der Admin entscheidet.
- Sensible Kategorien (அரசியல், இலங்கை) verlangen mindestens 3
  unabhängige Quellen und aktive Prüfbestätigung.

## Sprache und Begriffe

- Politische Begriffe neutral halten; keine wertenden Adjektive.
- Eigennamen, Orts- und Parteinamen gemäß `docs/glossar.md`.
- Zahlen: tamilische Konvention mit Lakh/Crore (லட்சம்/கோடி) plus
  internationaler Angabe in Klammern, wenn nötig.
- Datumsangaben ausgeschrieben (z. B. ஜூலை 15, 2026).
