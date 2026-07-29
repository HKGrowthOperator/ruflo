# MASTERBRIEF FÜR CLAUDE CODE
## Prüfungscoach Trockenbaumonteur – vollständige Produkt- und Umsetzungsanweisung

> **Arbeitsmodus**
>
> Arbeite autonom, pragmatisch und umsetzungsorientiert. Stelle nur dann Rückfragen, wenn eine echte Blockade besteht, die sich weder aus den vorhandenen Dateien noch aus dem Repository oder sinnvollen technischen Annahmen lösen lässt.
>
> Ziel ist keine weitere Chatbot-Demo, sondern eine tatsächlich nutzbare, moderne und adaptive Lern- und Prüfungsapp. Untersuche zuerst das Repository, die bereitgestellten Dateien und die vorhandene Infrastruktur. Bewahre funktionierende Teile, verbessere schwache Teile und baue den vollständigen Kernfluss fertig.
>
> Implementiere zuerst einen durchgängig nutzbaren Lernkreislauf. Vermeide Overengineering, aber lege Datenmodell und Code so an, dass später weitere Berufe, Prüfungen und Rollen ergänzt werden können.

---

# 1. PRODUKTVISION

Die App ist ein echter digitaler Prüfungscoach und kein offenes GPT-Chatfenster.

Der Coach soll:

1. den aktuellen Wissensstand diagnostizieren,
2. die verbleibende Zeit bis zur Prüfung berücksichtigen,
3. prüfungsrelevante Inhalte priorisieren,
4. individuelle Wissenslücken erkennen,
5. täglich eine optimale Lernroute erzeugen,
6. Active Recall statt bloßes Lesen nutzen,
7. Fehlerursachen statt nur falsche Antworten speichern,
8. Wiederholungen intelligent terminieren,
9. freie Antworten anhand von Teilpunkten bewerten,
10. realistische Prüfungssimulationen durchführen,
11. die erwartbare Prüfungsleistung transparent darstellen,
12. selbst bei sehr später Vorbereitung die verbleibende Zeit maximal effizient nutzen.

Der zentrale Produktgedanke:

> Der Schüler soll nicht selbst entscheiden müssen, was er als Nächstes lernt. Der Coach berechnet aus Prüfungsrelevanz, Wissensstand, Fehlerprofil, verbleibender Zeit und Lernaufwand den sinnvollsten nächsten Lernschritt.

---

# 2. ERSTER ANWENDUNGSFALL

- Beruf: Trockenbaumonteur / Ausbaufacharbeiter Schwerpunkt Trockenbau
- Ausbildungsstand: drittes Lehrjahr
- Ziel: schriftliche Abschlussprüfung bestehen
- Quellen: echte Prüfungsunterlagen, Schulunterlagen, Arbeitsblätter, Fachbuchinhalte, Wissensbündelungen und vorhandene Coach-Notizen

Wichtiger Real-Use-Case:

- schwache schulische Vorbereitung,
- kaum belastbares Vorwissen,
- Klausuren zuvor nur knapp oder mit Spicken bestanden,
- ernsthafter Lernstart erst etwa eine Woche vor der Prüfung,
- trotzdem deutlicher Lernerfolg durch einen einfachen GPT-Vorläufer.

Die neue App soll diesen Effekt systematisieren und verbessern. Keine Bestehensgarantie kommunizieren. Stattdessen die verbleibende Zeit auf Inhalte und Aufgabentypen mit maximaler Punktwirkung konzentrieren.

---

# 3. NICHT VERHANDELBARE REGELN

## 3.1 Geführter Lernfluss

Hauptfluss:

- Onboarding
- Diagnose
- Tagesplan
- Lernsession
- Wiederholung
- Prüfungssimulation
- Auswertung
- neuer Plan

Ein Chat ist nur Zusatzfunktion, etwa für Erklärungen und Rückfragen.

## 3.2 Keine erfundenen Systemwerte

Maximale Wandhöhen, Rohdichten, Plattenlagen, Brandschutzklassifizierungen, Profil-, Abhänger- und Befestigungsabstände dürfen nur aus freigegebenen Quellen stammen.

Fehlt eine belastbare Quelle:

> Dieser konkrete Systemwert ist in der freigegebenen Wissensbasis nicht eindeutig hinterlegt. Das Prinzip kann erklärt, der Wert jedoch nicht verbindlich bewertet werden.

## 3.3 Softwarelogik und KI trennen

Deterministischer Code:

- Punkte
- Statuswechsel
- Wiederholungstermine
- Mastery-Werte
- Prioritäten
- Timer
- Prüfungszusammenstellung
- Abdeckung
- Berechtigungen
- Versionierung

KI:

- freie Antworten verstehen
- Kriterien zuordnen
- Fehlvorstellungen erkennen
- kurze Erklärungen formulieren
- Aufgaben innerhalb freigegebener Grenzen variieren

## 3.4 Hilfe reduziert Beherrschungswert

Unterscheiden:

- selbstständig richtig
- nach Denkimpuls richtig
- nach Teilhinweis richtig
- nach geführter Lösung richtig
- Musterlösung nur gelesen

## 3.5 Mikrokompetenzen statt grober Themenwerte

Nicht nur „Bauphysik 72 %“, sondern zum Beispiel:

- unterscheidet Luft- und Trittschall,
- erklärt Randdämmstreifen,
- erkennt Schallbrücken,
- ordnet luftdichte Ebene korrekt an,
- unterscheidet Baustoffklasse und Feuerwiderstand,
- wählt ein Wandsystem aus Anforderungen,
- liest Maßketten,
- berechnet Dachneigung.

---

# 4. PRÜFUNGSORIENTIERUNG

Die Unterlagen bilden indirekt das Prüfungsmodell ab:

- Themen
- Häufigkeiten
- Aufgabenformen
- Kompetenzkombinationen
- typische Fehlantworten
- relevante Konstruktionen
- erforderliche Antworttiefe

Zentrale Prüfungskette:

> Projekt verstehen → Anforderungen erkennen → Zeichnung auswerten → Konstruktion auswählen → Materialdaten bestimmen → berechnen → Ablauf beschreiben → Ausführung beurteilen.

## Hauptbereiche

1. Dachgeschossausbau
2. Basics / Grundlagen
3. Bauphysik
4. Sanierung und Instandsetzung
5. Trockenbaukonstruktionen
6. Sonderkonstruktionen und Installationssysteme
7. Fußbodensysteme und Estrich
8. Baustellenvorbereitung und Planung

## Erste Arbeitsgewichtung

- Trockenbaukonstruktionen: 23 %
- Bauphysik: 20 %
- Planung, Leistungsbeschreibung, Planlesen und Arbeitsabläufe: 17 %
- Sanierung: 12 %
- Dachgeschossausbau: 10 %
- Fußboden und Estrich: 7 %
- Sonderkonstruktionen: 6 %
- isolierte Grundlagen: 5 %

Grundlagen wirken zusätzlich als Querschnitt und haben real mehr Einfluss.

---

# 5. LERNWISSENSCHAFT

## Active Recall

Wissen aktiv abrufen, nicht nur lesen.

## Spaced Repetition

Wiederholungen abhängig von Fehlerart, Sicherheit, Stabilität, Prüfungsnähe und Relevanz.

## Interleaving

Themen mischen statt nur Kapitelblöcke.

## Elaboration

Funktionen, Wirkungen und Begründungen formulieren lassen.

## Worked Examples mit Fading

1. vorgelöst
2. teilweise geführt
3. mit Denkimpuls
4. selbstständig
5. Transfer

## Mastery Learning

Eine Kompetenz gilt erst als stabil, wenn sie erkannt, frei abgerufen, angewendet, zeitversetzt und möglichst unter Zeitdruck gezeigt wurde.

## Fehlerbasiertes Lernen

Fehler als Ursachen speichern:

- Begriff unbekannt
- Begriffe verwechselt
- Funktion nicht verstanden
- Anwendung gescheitert
- Anforderung übersehen
- Regel übergeneralisiert
- Plan falsch gelesen
- Rechenmethode falsch
- Rechenfehler
- Antwort unvollständig
- Fachsprache fehlt
- geraten
- Operator übersehen
- Einheit fehlt
- Zeitproblem

## Confidence Calibration

Antwortsicherheit erfassen:

- geraten
- eher unsicher
- teilweise sicher
- sicher
- sehr sicher

Falsch + sehr sicher ist ein kritisches Fehlkonzept.

## Cognitive Load

Pro Ansicht eine klare Aufgabe. Feedback in Stufen:

- Kurzkorrektur
- Mikrolektion
- Grundlagenlektion
- Systemlektion

## Desirable Difficulty

Zielbereich der Lernaufgaben ungefähr 60–80 % Erfolgswahrscheinlichkeit.

---

# 6. PRÜFUNGSOPERATOREN

## Nennen

Geforderte Anzahl, unterschiedliche Fachpunkte, kurz und eindeutig.

## Beschreiben

Aufbau oder Ablauf in nachvollziehbarer Reihenfolge.

## Erklären

Funktion, Wirkung und technische Folge.

## Begründen

> Entscheidung + Anforderung + technische Wirkung

## Unterscheiden

Beide Begriffe und klare Abgrenzungsmerkmale.

## Bestimmen

Angaben filtern, System/Tabelle auswählen, Wert mit Einheit, keine Systemmischung.

## Berechnen

Formel, Werte, Rechenweg, Ergebnis, Einheit, Plausibilität.

## Beurteilen

Richtig/falsch, Fehler, Folge, fachgerechte Alternative.

---

# 7. KOMPETENZMODELL

Hierarchie:

1. Hauptbereich
2. Thema
3. Kompetenzgruppe
4. Mikrokompetenz
5. beobachtbare Handlung

Präfixe:

- BAS Grundlagen
- PLA Planung
- TKW Wände
- TKD Decken
- BPH Bauphysik
- SAN Sanierung
- DGA Dachgeschoss
- FBE Fußboden/Estrich
- SON Sonderkonstruktionen

Status:

- unbekannt
- Defizit
- begonnen
- erkannt
- abrufbar
- anwendbar
- stabil
- prüfungssicher
- rückfallgefährdet

Dimensionen:

- recognition_score
- recall_score
- application_score
- transfer_score
- stability_score
- confidence_calibration
- current_mastery
- last_error_type
- next_review_at
- independent_successes
- helped_successes
- incorrect_attempts

---

# 8. ERSTE KERNKOMPETENZEN

## Grundlagen

- CW, UW, UA, CD, UD
- Profilfunktionen
- Plattenarten
- Feuerschutzplatten
- imprägnierte Platten
- mehrlagige Beplankung
- Fugenversatz
- Mineralwolle
- Dämmstoffdicke
- Rohdichte als Systemwert
- Schrauben/Dübel
- Schraubenlänge
- Spachtelmassen
- Verarbeitungstemperatur
- Fugenbewehrung
- Anschlussdichtungsband
- Randdämmstreifen

## Planung

- Leistungsbeschreibung auswerten
- Maße markieren
- Brand/Schall/Feuchte/Last erkennen
- Türen und Installationen erkennen
- Legende lesen
- Maßketten lesen
- Wandstärken berücksichtigen
- Öffnungsmaße bestimmen
- Arbeitsablauf
- Materialbedarf
- Einheitenprüfung

## Wände

- Standardwand
- Anschlüsse
- Ständerabstand
- Wandhöhe
- Beplankung
- Dämmung
- Brandschutzwand
- Schallschutzwand
- Feuchtraumwand
- Türöffnung
- CW/UA
- Zarge
- Installationswand
- Doppelständerprinzip
- Gipsplattenlaschen
- Sanitärtragständer
- Traversen
- Konsollasten

## Decken

- UD/CD
- Grund- und Tragprofil
- Abhänger
- Direktabhänger
- Nonius
- Lastweg
- vier Abstandstypen
- selbstständige Brandschutzdecke
- Brandbeanspruchungsrichtung
- Einbauten
- Zusatzlasten
- Durchdringungen

## Bauphysik

- Baustoff- vs. Bauteilverhalten
- Feuerwiderstand
- EI
- Systemprinzip
- Abschottung
- Luftschall
- Trittschall
- Körperschall
- Schallbrücke
- Entkopplung
- Masse-Feder-Masse
- Wärmeleitfähigkeit
- Wärmedurchlasswiderstand
- Wärmedurchgangswiderstand
- U-Wert
- Dampfbremse
- Dampfsperre
- Luftdichtheit
- Winddichtheit
- Diffusion
- Konvektion
- Tauwasser
- Schimmelrisiko

## Fußboden

- schwimmender Estrich
- Dämmschicht
- Randdämmstreifen
- Schallbrücke
- Trockenestrich
- Fertigteilestrich
- Ausgleichsschüttung
- Holzbalkendecke
- Rieselschutz
- Fehlboden
- Eigengewicht
- Trittschallverbesserung

## Dachgeschoss

- Sparren-, Pfetten-, Kehlbalkendach
- Zwischen-, Unter-, Aufsparrendämmung
- Schichtenfolge
- Luftdichtheit
- Traufe
- First
- Giebel
- Dachflächenfenster
- Durchdringungen
- Installationsebene
- Dachneigung

## Sanierung

- Bestandsprüfung
- Tragfähigkeit
- Ebenheit
- Feuchte
- Risse
- lose Bestandteile
- Schadstoffverdacht
- Fugen-/Anschluss-/Bewegungsrisse
- Feuchteschaden
- Schimmel
- Kontamination
- Gefährdungsbeurteilung
- PSA
- Entsorgung

---

# 9. FEHLERCODES

- F1 Begriff unbekannt
- F2 Begriffe verwechselt
- F3 Funktion nicht verstanden
- F4 Wissen da, Anwendung gescheitert
- F5 Anforderung übersehen
- F6 Regel übergeneralisiert
- F7 Plan falsch gelesen
- F8 Rechenmethode falsch
- F9 Rechenfehler
- F10 Antwort unvollständig
- F11 Fachsprache schwach
- F12 geraten
- F13 Operator übersehen
- F14 Einheit fehlt/falsch
- F15 Zeitproblem
- F16 kritisches Sicherheits-/Fachfehlkonzept

Speichern:

- Kompetenz
- Fehlvorstellung
- Schweregrad
- Sicherheit
- Hilfestufe
- nächste Intervention

---

# 10. AUFGABENTYPEN

1. Single Choice
2. Multiple Choice
3. freie Kurzantwort
4. freie Langantwort
5. Zahlenfeld mit Einheit
6. Reihenfolge
7. Zuordnung
8. Plan-/Bildfrage
9. Fehlerfinder
10. Systemauswahl
11. Ablaufbeschreibung
12. kombinierte Projektaufgabe

Jede Frage braucht:

- ID
- Quelle
- Haupt- und Sekundärkompetenzen
- Operator
- Schwierigkeit
- Prüfungsrelevanz
- Bearbeitungszeit
- Musterlösung
- Kriterien
- typische Fehler
- Distraktor-Fehlertypen
- Status
- Version

---

# 11. FRAGENFAMILIEN

Pro Mikrokompetenz mindestens:

- Wiedererkennen
- freier Abruf
- Funktion
- Fehlererkennung
- Anwendung
- Transfer
- Zeitdruck

Nicht nur Zahlen austauschen. Variiere Kontext, Anforderungskombination, Darstellungsform, Operator und Ablenkungsinformationen.

---

# 12. FREIE ANTWORTEN

Erwartungshorizont mit:

- Kriterium
- Punkte
- Pflicht/optional
- akzeptierte Begriffe
- sinngleiche Formulierungen
- kritische Fehlvorstellungen

KI ordnet Kriterien zu. Code summiert Punkte.

Stufen:

- 0 nicht verwertbar
- 1 Ansatz
- 2 Kern vorhanden
- 3 vollständig und kontextbezogen

---

# 13. MASTERYSYSTEM

Startformel:

```text
Mastery =
0,20 × Erkennen
+ 0,25 × freier Abruf
+ 0,30 × Anwendung
+ 0,15 × Stabilität
+ 0,10 × Zeitdruck
```

Abschwächen bei:

- Hilfe
- Raten
- identischer Wiederholung
- langer Zeit
- Unsicherheit
- Teilantwort

Stärker erhöhen bei:

- freier selbstständiger Antwort
- Transfer
- längerer Pause
- korrekter Sicherheit
- Zeitdruck

---

# 14. PRIORITÄT

```text
Priorität =
Prüfungsrelevanz
× Defizit
× Abhängigkeitswert
× Punktepotenzial
× Zeitfaktor
× Fälligkeit
÷ Lernaufwand
```

Zusätzlich berücksichtigen:

- Themenabdeckung
- Diagnosewert
- Schwierigkeit
- Abwechslung
- heutige Wiederholungsanzahl
- kritisches Fehlkonzept
- Voraussetzungen

---

# 15. WIEDERHOLUNGEN

Mehrere Monate:

- sofort
- 1 Tag
- 3 Tage
- 7 Tage
- 14 Tage
- 30 Tage

3–6 Wochen:

- sofort
- gleicher Tag
- 1 Tag
- 3 Tage
- 7 Tage

7 Tage:

- sofort
- 10–20 Minuten
- Abend
- nächster Morgen
- 2 Tage
- Vortag

2 Tage:

- sofort
- 15 Minuten
- 2–3 Stunden
- Abend
- Morgen
- letzte Simulation

Fehlerabhängig anpassen.

---

# 16. ONBOARDING

Pflicht:

- Beruf
- Lehrjahr
- Prüfungstermin
- Prüfungsteil
- Ziel
- Minuten werktags
- Minuten Wochenende
- Lernzeit
- Konzentrationsblock
- Selbsteinschätzung

Optional:

- ADHS
- Konzentration
- Prüfungsangst
- Rechenprobleme
- Text/Sprache

Automatische Modi:

- >12 Wochen vollständig
- 6–12 regulär
- 3–6 fokussiert
- 14–20 Tage intensiv
- 7–13 Bestehensmodus
- 3–6 Notfall
- 1–2 Punkterettung

---

# 17. DIAGNOSE

Schnell:

- 20–30 Minuten
- 25–35 Aufgaben

Standard:

- 45–60 Minuten
- 45–60 Aufgaben

Blöcke:

- Grundlagen
- Konstruktionen
- Bauphysik
- Planung/Planlesen
- Rechnen
- Sanierung

Ausgabe:

- Risikostatus
- Punktebereich
- Stärken
- größte Hebel
- kritische Fehlkonzepte
- ungetestete Kernbereiche
- Lernplan

---

# 18. TAGESPLAN UND SESSION

Startseite:

- Tage bis Prüfung
- Lernzeit heute
- fällige Wiederholungen
- Schwerpunkt
- Punktebereich
- größtes Risiko
- schnellster Hebel
- Button „Heutige Einheit starten“

Tagesmix normal:

- 20 % Wiederholung
- 25 % Hauptdefizit
- 20 % Grundlagen
- 20 % Transfer
- 15 % sichere Punkte

Session:

1. Reaktivierung
2. Tagesziel
3. Diagnosefrage
4. Erklärung
5. geführte Übung
6. freie Aufgabe
7. Transfer
8. Mischung
9. Abschlussabruf
10. Bericht

Hilfen 0–5 von keine Hilfe bis vollständige Erklärung.

---

# 19. SIEBEN-TAGE-MODUS

Tag 1:
Diagnose, Profile, Platten, Mineralwolle, Rechnen, Standardwand, Operatoren

Tag 2:
Wände, Türen, UA/CW, Installationswand, Konsollasten

Tag 3:
Decken, Abhänger, Lastweg, Brandschutz, LBO

Tag 4:
Estrich, Randdämmstreifen, Schall, Wärme, Holzbalkendecke, Rieselschutz

Tag 5:
Dach, Dämmarten, Luft-/Winddichtheit, Dampfbremse, Dachneigung

Tag 6:
Sanierung, Risse, Feuchte, Schimmel, Kontamination, Projektaufgabe

Tag 7:
Simulation, Fehlerreparatur, sichere Punkte, Kernformeln, keine Randthemen

---

# 20. PRÜFUNGSMODUS

- Timer
- keine Hinweise
- keine Sofortbewertung
- Aufgabenübersicht
- Markieren
- Autosave
- Rechenfeld
- Abgabe am Ende

Simulationen:

- Mini
- Teilprüfung
- vollständig
- Belastung

Erste Verteilung:

- 30 % gebunden
- 20 % freie Kurzantworten
- 15 % Plan/Bild
- 15 % Rechnen
- 10 % Systemauswahl
- 10 % Projekt/Ablauf

---

# 21. AUSWERTUNG UND PRÜFUNGSREIFE

Auswertung:

- Gesamtpunkte
- Punktebereich
- Zeit
- Fachbereiche
- Aufgabentypen
- verlorene Punkte nach Ursache
- kritische Fehlkonzepte
- schnell rückgewinnbare Punkte
- Reparaturplan

Reifewerte:

- Fachwissen
- Anwendung
- Stabilität
- Punktebereich
- Prognosesicherheit

Interne Beispielschwellen:

- Gesamtprognose ≥60 %
- keine Kernkompetenz <40 %
- Planlesen ≥55 %
- Rechnen ≥65 %
- Konstruktionen ≥55 %
- Bauphysik ≥55 %
- Abdeckung ≥80 %
- zwei bestandene Simulationen
- letzte ohne Hilfen

Status:

- nicht diagnostiziert
- hohes Risiko
- Grundlagen
- bedingt bestehensfähig
- wahrscheinlich bestehensfähig
- prüfungsreif
- stabil prüfungsreif

---

# 22. UI/UX

Modern, ruhig, hochwertig, mobil, funktional.

Keine Kinderoptik, keine XP-Gamification, keine überladene Dashboard-Wand.

Startseite fokussiert auf:

- Countdown
- Hauptaktion
- Punktebereich
- Risiko
- Hebel

Lernansicht:

- eine Aufgabe
- klarer Operator
- große Lesbarkeit
- Bild/Plan
- Antwort
- dezente Hilfe
- Session-Fortschritt

Sinnvolle Motivation:

- „Heute 4–6 Prüfungspunkte stabilisiert.“
- „Drei kritische Lücken geschlossen.“
- „Planlesen seit letzter Woche +18 %.“

---

# 23. ADMIN

- Quellen
- Wissensobjekte
- Kompetenzen
- Fragen
- Erwartungshorizonte
- Originalprüfungen
- Konflikte
- Freigaben
- Versionen
- Qualitätsmetriken

Status:

- Entwurf
- fachlich geprüft
- didaktisch geprüft
- freigegeben
- gesperrt
- archiviert

---

# 24. KI-ROLLEN

Quellenagent:
nur freigegebene Quellen, keine Erfindungen

Aufgabenagent:
Varianten innerhalb freigegebener Inhalte, Distraktoren aus Fehlermodell

Bewertungsagent:
Kriterien, Teilpunkte, Fehlvorstellungen, strukturiertes JSON

Tutoragent:
kurzes passendes Feedback, Selbstkorrektur

Lernplaner:
Prioritäten, nächste Aufgabe, Wiederholungen

Qualitätsagent:
Eindeutigkeit, Quellenbezug, Operator, Bewertungsraster, MC-Korrektheit

---

# 25. DATENBANK

Mindestens Tabellen:

- users
- learner_profiles
- competencies
- knowledge_objects
- sources
- questions
- question_competencies
- choices
- answer_criteria
- attempts
- error_events
- learner_competencies
- study_plans
- study_plan_items
- simulations
- simulation_items

Wichtige Felder:

## competencies

- id
- parent_id
- main_area
- topic
- title
- description
- prerequisites
- exam_relevance
- dependency_value
- points_potential
- learning_effort
- criticality
- mastery_threshold
- status

## learner_competencies

- user_id
- competency_id
- status
- recognition_score
- recall_score
- application_score
- transfer_score
- stability_score
- confidence_calibration
- mastery
- next_review_at
- last_reviewed_at
- attempt_count
- independent_successes
- helped_successes
- incorrect_attempts

---

# 26. TECHNISCHE ARCHITEKTUR

Bevorzugt:

- Next.js
- React
- TypeScript strict
- PostgreSQL
- Supabase oder vorhandene gleichwertige Infrastruktur
- Auth
- Storage für Pläne/Bilder
- Vektorsuche oder File-Search-Schicht
- strukturierte KI-Ausgaben
- responsive PWA
- Deployment auf bestehende Infrastruktur oder Vercel-ähnlich

Falls im Repo schon ein tragfähiger Stack existiert, diesen nutzen.

Pflicht:

- Schema-Validierung, etwa Zod
- serverseitige Secrets
- Logging
- Fehlerbehandlung
- Migrationen
- Seeds
- Tests
- reproduzierbarer Build

---

# 27. INHALTSIMPORT

Pipeline:

1. Dateien inventarisieren
2. Dokumenttyp erkennen
3. Seiten/Abschnitte extrahieren
4. acht Hauptbereichen zuordnen
5. Duplikate markieren
6. Widersprüche markieren
7. Quellenhierarchie anwenden
8. Mikrokompetenzen erzeugen
9. Wissensobjekte erzeugen
10. Originalaufgaben erfassen
11. Erwartungshorizonte und Fehlermodelle ergänzen
12. Freigabestatus setzen

Quellenhierarchie:

1. Originalprüfung
2. Original-Fach-/Systemmaterial
3. Arbeitsblätter/Unterricht
4. strukturierte Abschrift
5. didaktische Ableitung
6. ungeprüfte KI-Ergänzung

---

# 28. MVP

Pflicht:

- Login
- Onboarding
- Prüfungstermin
- Ziel/Lernzeit
- Eingangstest
- Kompetenzprofil
- Tagesplan
- adaptive Session
- MC
- freie Antworten
- Zahlenfragen
- Planfragen
- Feedback
- Hilfen
- Wiederholungen
- Fehlergedächtnis
- Mini-Simulation
- Teilprüfung
- Dashboard
- Admin
- Seed aus echten Unterlagen

Später:

- Sprachcoach
- Lehrerlizenzen
- mehrere Berufe
- native Apps
- soziale Funktionen
- Ranglisten

---

# 29. UMSETZUNGSREIHENFOLGE

Phase 0:
Repo- und Dateianalyse, danach direkt umsetzen

Phase 1:
DB, Kompetenzhierarchie, 100–200 Mikrokompetenzen, Wissensobjekte, echte Prüfungsfragen, Fehlercodes, Kriterien

Phase 2:
Onboarding, Diagnose, Tagesplan, Lernsession, Antworten, Mastery, nächste Aufgabe

Phase 3:
freie Antwortbewertung mit strukturierten KI-Ausgaben

Phase 4:
Wiederholung und Fehlergedächtnis

Phase 5:
Simulation, Timer, Bewertung, Reparaturplan

Phase 6:
Dashboard

Phase 7:
Admin und Qualität

Phase 8:
Deployment, Monitoring, Dokumentation

---

# 30. ERSTE SEED-PRÜFUNGSLOGIKEN

Mindestens:

- Montagewand mit Brand- und Schallschutz
- Installationswand-Bauteile
- Stabilisierung Installationswand
- Wandlänge aus Grundriss
- Öffnungsmaß
- Rohdichte im Brandschutzsystem
- Mindesttemperatur Spachtel
- Dämmschicht unter schwimmendem Estrich
- Fläche aus Umfang und Seite
- Wärmedurchgangswiderstand
- Rieselschutz
- Werkzeug Mineralwolle
- Kontamination
- Verschraubungsdetail
- selbstständige Brandschutzdecke
- LBO
- Dachneigung

Nicht nur kopieren, sondern in Kompetenzen, Fehlerlogik und Fragenfamilien überführen.

---

# 31. TESTS UND EVALUATION

Testdatensatz mit:

- richtig
- teilweise richtig
- Umgangssprache fachlich richtig
- fachlich klingend falsch
- Begriff verwechselt
- Einheit fehlt
- Aufzählung unvollständig
- sichere Fehlantwort
- Planlesefehler
- Rechenmethodenfehler
- Rechenfehler

Automatisch prüfen:

- konsistente Punkte
- sinngleiche Antworten ähnlich
- Fehlvorstellungen erkannt
- keine Punkte für Erfindungen
- Hilfen berücksichtigt
- nächste Aufgabe logisch
- Intervall korrekt
- Simulation reproduzierbar

---

# 32. ABNAHMEKRITERIEN

Funktional:

- vollständiger Nutzerfluss
- Diagnose gespeichert
- Tagesplan automatisch
- adaptive Aufgaben
- Hilfe beeinflusst Mastery
- Teilpunkte
- Fehler gespeichert
- Wiederholung geplant
- Simulation ohne Feedback
- Auswertung nach Ursachen
- Admin bearbeitbar

Fachlich:

- keine erfundenen Systemwerte
- Quellenbindung
- korrekte Trennung von Brand/Schall/Wärme/Feuchte
- kritische Fehlkonzepte erkannt

Didaktisch:

- Active Recall
- Wiederholung
- adaptive Schwierigkeit
- Selbstkorrektur
- Mischung
- keine Endlosschleifen
- Zeitdruckpriorisierung

Technisch:

- TypeScript sauber
- Kernlogik getestet
- KI-Ausgaben validiert
- Secrets serverseitig
- Build erfolgreich
- Migration/Seed reproduzierbar

---

# 33. PRODUKTSPRACHE

Direkt, fachlich, motivierend ohne Kitsch.

Gut:

> Der Kern stimmt. Für die volle Punktzahl fehlt noch die schalltechnische Wirkung.

Gut:

> Du hast EI 90 erkannt, aber die Wandhöhe übersehen. Prüfe bei Systemauswahl immer Geometrie, Brand, Schall, Feuchte, Last und Öffnungen.

Schlecht:

> Du bist ein Trockenbau-Held und bekommst 50 XP!

---

# 34. ARBEITSAUFTRAG AN CLAUDE CODE

1. Analysiere Repository und alle bereitgestellten Dateien vollständig.
2. Dokumentiere knapp den Ist-Stand, stoppe aber nicht danach.
3. Baue unmittelbar den ersten vollständigen Produktfluss.
4. Lege DB, Migrationen, Seeds und Kompetenzstruktur an.
5. Implementiere Onboarding und Diagnose.
6. Implementiere Tagesplan und adaptive Lernsession.
7. Implementiere Mastery-, Fehler- und Wiederholungslogik deterministisch.
8. Implementiere freie Antwortbewertung mit strukturierten KI-Ausgaben.
9. Implementiere Mini-Simulation und Auswertung.
10. Erstelle ein modernes, ruhiges, mobiles UI.
11. Erstelle Admin für Fragen, Quellen und Freigaben.
12. Integriere Originalprüfungen und Wissensdaten.
13. Schreibe Tests.
14. Führe Build aus und behebe Fehler.
15. Stelle die App deploybar bereit.
16. Dokumentiere Architektur, Setup, Env, Migration, Seed, Deployment, Konflikte und nächste Schritte.

Nicht nach jedem Teilschritt um Freigabe bitten. Ein echter nutzbarer Lernkreislauf steht vor Randfunktionen.

Oberste Qualitätsfrage:

> Verbessert diese Funktion die Wahrscheinlichkeit, dass ein schwach vorbereiteter Schüler die Prüfung besteht, oder sieht sie nur modern aus?

---

# 35. DEFINITION OF DONE

Version 1 ist fertig, wenn ein neuer Nutzer:

1. die App öffnet,
2. Prüfungstermin und Lernzeit eingibt,
3. einen adaptiven Eingangstest absolviert,
4. ein Kompetenz- und Risikoprofil erhält,
5. einen berechneten Tagesplan startet,
6. adaptive Aufgaben mit gezieltem Feedback bearbeitet,
7. Fehler und Wiederholungen gespeichert werden,
8. am nächsten Tag passende Wiederholungen erhält,
9. eine Simulation ohne Hilfen durchführt,
10. eine differenzierte Punkte- und Fehlerauswertung erhält,
11. einen aktualisierten Lernplan bekommt.

Dieser vollständige Kreislauf muss produktiv funktionieren.
