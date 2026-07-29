# Tamil.de – Redaktionsstandard (Stylebook)

Führende Fassung der redaktionellen Regeln. Der KI-Prompt in
`packages/ai/src/provider.ts` und die Bewertungslogik in
`packages/shared/src/relevance.ts` spiegeln dieses Dokument – bei
Änderungen beide anpassen.

## Grundsatz

Tamil.de berichtet aus deutschsprachig-tamilischer Diaspora-Perspektive.
Leitfrage jedes Beitrags: **„Warum ist dieses Thema für Tamilinnen und
Tamilen in Deutschland, Österreich oder der Schweiz relevant?"** Der
Tamil-Bezug muss real sein und benannt werden – ohne Menschen auf ihre
Herkunft zu reduzieren.

**Der Agent ist kein Text-Spinner.** Niemals: fremde Artikel absatzweise
paraphrasieren, Strukturen einzelner Quellen übernehmen, Synonyme
tauschen, Unverifiziertes ergänzen, Zitate erfinden, Sekundärquellen als
eigene Recherche ausgeben. Jeder Text ist eine eigenständige Synthese
mehrerer Quellen. (Negativbeispiele im Bestand: nahezu wörtliche
Übernahmen von Tagesschau- und Urlaubspiraten-Beiträgen – das wird
ausdrücklich nicht reproduziert.)

## Die fünf Stilmodi

| Modus | Für | Ton |
|---|---|---|
| NEWS_NEUTRAL | Politik, Behörden, Wirtschaft, Sri Lanka, Unfälle | neutral, präzise, keine Leseransprache |
| COMMUNITY_SUCCESS | Auszeichnungen, Wahlen, Sport, Unternehmertum | positiv-würdigend, sachlich, keine Überhöhung |
| CULTURE_IDENTITY | Sprache, Religion, Tempel, Tradition, Feste | respektvoll, erklärend, kulturkundig |
| ENTERTAINMENT | Film, Musik, Kino, Streaming | lebendig, zugänglich; max. 1 Ausrufezeichen in der Überschrift |
| EVENT_SERVICE | Konzerte, Tempelfeste, Community-Treffen | klar, serviceorientiert; vorsichtiges „ihr" erlaubt |

Standardaufbau (NEWS/COMMUNITY): **Nachricht → Tamil-Bezug → Hintergrund
→ Details → Bedeutung/Ausblick.** Events: Was → Wann/Wo → Für wen →
Programm → Preis/Anmeldung → Veranstalter.

## Überschriften

- Max. ~75 Zeichen, Ereignis + möglichst Person/Organisation/Ort, sachlich korrekt.
- Muster: „[Person] wird [Auszeichnung]", „Tamilische Gemeinde in [Ort]
  feiert [Ereignis]", „Von [DACH-Ort] nach Tamil Nadu: …",
  „[Entwicklung] betrifft Reisende aus Deutschland".
- **Verboten:** „Unglaublich!", „Sensation", „Du wirst nicht glauben",
  „Historischer Mega-Erfolg", unbelegte Superlative, Clickbait.

## Sprache

- Verständliches Standarddeutsch, mittellange Sätze, nahbar, respektvoll,
  ohne akademische Schwere, ohne KI-Floskeln („In einer Welt, in der…",
  „Es bleibt abzuwarten…", „bahnbrechend", „revolutionär", „sorgt für
  Furore").
- Schreibweisen: Tamilinnen und Tamilen, tamilische Community, Sri Lanka,
  sri-lankisch, Tamil Nadu, DACH-Raum. „Eelam-Tamilen" nur mit
  Einordnung, nie pauschal.
- Zahlen: eins bis zwölf ausschreiben (außer Daten/Preise/Statistik),
  13.500, 35 Euro, 14. November 2026, 18.30 Uhr.
- Begriffe wie Pongal, Kovil, Bharatanatyam beim ersten Auftreten kurz
  erklären (siehe `docs/glossar.md`).

## Fakten, Quellen, Zitate

- Mindestens **zwei unabhängige Quellen**, möglichst eine Primärquelle.
  Quellenhierarchie: Behörden → Organisationen → Veranstalter →
  Agenturen → etablierte Medien → Lokalmedien → Fachmedien → öffentliche
  Social-Posts → Blogs. Eine einzelne Instagram-Story reicht nicht.
- Einzelquellige Angaben mit Attribution: „Nach Angaben des
  Veranstalters…" – nie als Fakt.
- Zitate nur mit verifizierter Originalquelle; nie sinnverändernd,
  nie aus Sekundärquellen als eigene Recherche.
- Widersprüche: nur Gesichertes in den Artikel, Widerspruch intern
  dokumentieren (uncertainNotes), Story bleibt in Prüfung.
- **Quellenbox ist Pflicht** (öffentlich, Website + WordPress) inkl.
  redaktionellem Hinweis.

## Relevanzscore (0–100)

| Komponente | Punkte |
|---|---|
| Tamilischer Bezug | 0–30 |
| DACH-Bezug | 0–20 |
| Aktualität | 0–15 |
| Community-Nutzen | 0–15 |
| Öffentliches Interesse | 0–10 |
| Quellenqualität | 0–10 |

**80–100** sofortige Redaktionsprüfung · **65–79** guter Lead ·
**50–64** beobachten/Kurzmeldung · **<50** normalerweise ablehnen ·
**<40** automatisch verwerfen.

Tamil-Bezug wird nicht nur am Wort „Tamil" erkannt: direkte Treffer
(Tamil Nadu, Chennai, Jaffna, Eelam, Kollywood …), Entitäten (Personen,
Vereine, Tempel – lernende Liste, V2) und indirekte Muster (Person mit
tamilischem Namen gewinnt Preis, Tempelfest lokal angekündigt …).

## Risikoklassen

- **GRÜN** (automatisierbarer Entwurf): Eventankündigungen mit
  Veranstalterquelle, Kinostarts, Vereinsmeldungen, Auszeichnungen,
  Kulturprogramme, belegte Serviceinfos.
- **GELB** (immer menschliche Freigabe): Politik, Demonstrationen,
  Migration/Abschiebung, Religion, Sri-Lanka-Konflikt, Gerichtsverfahren,
  Vorwürfe, Unfälle, Todesfälle, Minderjährige, Gesundheit.
- **ROT** (nie automatisch verarbeiten): unbestätigte Vorwürfe, private
  Personen ohne öffentliche Relevanz, Social-Media-Gerüchte,
  Opferidentitäten, sensible personenbezogene Daten, Inhalte aus
  geschlossenen Gruppen, Einzelquellen-Gerüchte.

Im System: ROT bekommt keinen automatischen Entwurf; GELB trägt einen
Pflicht-Prüfhinweis. Veröffentlicht wird grundsätzlich nur nach
menschlicher Freigabe.

## Bilder

**Retusche fremder Bilder beseitigt keine Urheberrechte.** Urheberrecht,
Persönlichkeitsrecht, Markenrecht sind getrennt zu prüfen.

Prioritäten: 1. eigene Fotos · 2. freigegebene Pressebilder ·
3. lizenzierte Agenturbilder · 4. korrekt geprüfte CC-Bilder ·
5. offizielle Embeds · 6. eigene Illustrationen · 7. neutrale Symbolbilder.

KI-Bilder nur als erkennbare Illustration (stilisierte Skyline,
Kulturmotive, Karten) – niemals fotorealistische Darstellungen realer
Ereignisse, Personen, Unfälle oder Straftaten. Kennzeichnung:
„KI-generierte Illustration", „Symbolbild", „Illustration: Tamil.de",
„Pressefoto: [Rechteinhaber]".

## Freigabe

Standardstatus jedes Beitrags: **pending_review** (im System:
WordPress-Entwurf via `WORDPRESS_PUBLISH_STATUS=draft`). Die finale
publizistische Verantwortung liegt immer bei einem Menschen.
