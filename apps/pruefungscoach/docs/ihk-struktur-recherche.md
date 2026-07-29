# IHK-/Ausbildungsstruktur Trockenbau — Recherche & Abgleich mit App-Inhalten

> Recherche-Report (nur lesend gegen Seed-Content erstellt, keine Änderungen an Seed-/Content-Dateien).
> Stand: 2026-07-14. Autor: Recherche-Agent.
>
> **Quellen-/Verifizierungshinweis:** Die maßgeblichen Primärquellen (gesetze-im-internet.de,
> buzer.de, kmk.org, IHK-Seiten, bau-innung.de) sind aus dieser Session per Egress-/Fetch-Policy
> **nicht direkt abrufbar (HTTP 403)**. Die folgenden Angaben stammen daher aus der Synthese der
> Websuche über diese Quellen. Prüfungsbereiche/Gewichtungen/Dauern der Abschlussprüfung sind
> mehrfach übereinstimmend belegt (**gesichert**). Exakte Lernfeld-Nummerierung und
> Zeitrichtwerte (Stunden) konnten **nicht aus der Primärquelle verifiziert** werden und sind
> als **[UNSICHER]** gekennzeichnet. Vor produktivem Einsatz sollten LF-Titel/Stunden gegen die
> KMK-Rahmenlehrpläne und die IHK-Umsetzungshilfe gegengeprüft werden.

---

## 0. Wichtigste Erkenntnis vorab: Zwei parallele Prüfungsordnungen

Es existieren **zwei Regelwerke**, die sich 2026 überschneiden. Das ist für das Produkt zentral:

| Regime | Rechtsgrundlage | Struktur | Gilt für |
|--------|-----------------|----------|----------|
| **ALT** | BauWiAusbV 1999 (Verordnung über die Berufsausbildung in der Bauwirtschaft) | Klassische **Stufenausbildung**: Ausbaufacharbeiter (Stufe 1, 2 J.) → Trockenbaumonteur (Stufe 2, 3. Jahr). Separate Zwischenprüfung + Gesellenprüfungen. | **Der Nutzer** (Abschlussprüfung Trockenbaumonteur Sommer 2026) — seine Gewichtung TK 50 % / Sanieren 30 % / WiSo 20 % **entspricht exakt** dieser Ordnung. |
| **NEU** | AusbauBAusbV (Verordnung vom 3. Juni 2024) | **Gestreckte Gesellenprüfung** (Teil 1 im 4. Semester + Teil 2 am Ende), neuer Lernfeld-Bildungsplan. | Ausbildungen, die **ab 1. August 2026** neu beginnen. Erste Abschlussprüfungen nach neuem Recht erst später. |

Für den aktuellen Nutzer ist also das **ALT-Regime (BauWiAusbV 1999)** maßgeblich. Das NEU-Regime
ist aber relevant für die Produktstrategie (Zwischenprüfung gewinnt strukturell an Bedeutung, s. Abschnitt 6).

---

## 1. Ausbildungsweg-Übersicht

### 1.1 Stufung (ALT — BauWiAusbV 1999, Stufenausbildung)

```
                 ┌─────────────────── Stufe 1: Ausbaufacharbeiter/-in (2 Jahre) ───────────────────┐
1. Ausbildungsjahr  │  GRUNDSTUFE — berufsfeldbreite Grundbildung Bau                                 │
(Grundstufe)        │  gemeinsam für Hochbau / Tiefbau / Ausbau, erst danach Spezialisierung          │
                 ├────────────────────────────────────────────────────────────────────────────────┤
2. Ausbildungsjahr  │  FACHSTUFE I — Schwerpunkt "Trockenbauarbeiten"                                 │
(Fachstufe I)       │  → am Ende: ZWISCHENPRÜFUNG + Gesellenprüfung Ausbaufacharbeiter (= "Teil 1")   │
                 └────────────────────────────────────────────────────────────────────────────────┘
                 ┌─────────────────── Stufe 2: Trockenbaumonteur/-in (3. Jahr) ────────────────────┐
3. Ausbildungsjahr  │  FACHSTUFE II — Vertiefung Trockenbau, Sanierung, Brandschutz, Sonderbau        │
(Fachstufe II)      │  → am Ende: GESELLENPRÜFUNG / ABSCHLUSSPRÜFUNG Trockenbaumonteur                │
                 └────────────────────────────────────────────────────────────────────────────────┘
```

Kernpunkte (gesichert):
- Der **Ausbaufacharbeiter** ist eine eigenständige, anerkannte 2-jährige Erststufe; der
  **Trockenbaumonteur** baut als Fortführungsberuf im 3. Jahr darauf auf.
- Die **Gesellenprüfung des Ausbaufacharbeiters gilt beim Weiterlernen zum Trockenbaumonteur
  als dessen Zwischenprüfung** ("Zwischenprüfung gilt als bestanden" — genau die Notiz im Seed).
- Der **Rahmenlehrplan der ersten zwei Jahre ist inhaltsgleich** zwischen Ausbaufacharbeiter
  (Schwerpunkt Trockenbau) und Trockenbaumonteur.

### 1.2 Stufung (NEU — AusbauBAusbV, ab 1.8.2026)

- **Gestreckte Gesellenprüfung**: **Teil 1** im 4. Semester (Prüfungsbereich „Herstellen von
  Baukörpern und Durchführen von Ausbauarbeiten"), **Teil 2** am Ausbildungsende.
- Ausbaufacharbeiter bleibt als 2-jährige Stufe erhalten; Trockenbaumonteur als 3-jähriger Aufbau.
- Neuer **Lernfeld-Bildungsplan ab 2026** (KMK/Länder).

**Quellen (1):**
- BauWiAusbV 1999: https://www.gesetze-im-internet.de/bauwiausbv_1999/BJNR110200999.html · https://www.gesetze-im-internet.de/bauwiausbv_1999/BauWiAusbV_1999.pdf
- AusbauBAusbV, Abschnitt 8 Trockenbaumonteur: https://www.buzer.de/gesetz/16464/b45490.htm
- BauWiAusbV Ausbaufacharbeiter (2. Abschnitt): https://www.buzer.de/gesetz/2589/b7243.htm
- „Ausbildung gestalten" Trockenbaumonteur/Ausbaufacharbeiter 2025 (bau-innung/BIBB): https://www.bau-innung.de/images/AktuelleDownloads/Berufsbildung/AusbildungGestalten_Trockenbaumonteur_Ausbaufacharbeiter_2025.pdf · Spiegel: https://bildung.bauwirtschaft-bw.de/fileadmin/user_upload/download/AusbildungGestalten_Trockenbaumonteur_Ausbaufacharbeiter_2025.pdf
- IHK Region Stuttgart, Neuordnung Bauberufe: https://www.ihk.de/stuttgart/pal/berufe-a-bis-z/bauberufe-neuordnung-5711612 · Ausbaufacharbeiter Trockenbau (VO 3.6.2024): https://www.ihk.de/stuttgart/pal/berufe-a-bis-z/ausbaufacharbeiter-in-trockenbauarbeiten-infopraxis-6610132
- Berufsbildung NRW (Lernfelder/Bündelungsfächer, Bildungsplan ab 2026): https://www.berufsbildung.nrw.de/cms/bildungsgaenge-bildungsplaene/fachklassen-duales-system-anlage-a/berufe-a-bis-z/trockenbaumonteure/lf-buefae/index.html
- DQR-Profile: https://www.dqr.de/dqr/shareddocs/qualifikationen-neu/de/Trockenbaumonteur-Trockenbaumonteurin.html · https://www.dqr.de/dqr/shareddocs/qualifikationen-neu/de/Ausbaufacharbeiter-Schwerpunkt-Trockenbauarbeiten-Ausbaufacharbeiterin-Schwerpunkt-Trockenbauarbeiten.html
- BIBB Berufsprofil Trockenbaumonteur: https://www.bibb.de/dienst/berufesuche/de/index_berufesuche.php/profile/apprenticeship/78opl

---

## 2. Prüfungsstruktur

### 2.1 Zwischenprüfung / Gesellenprüfung Ausbaufacharbeiter (Ende 2. Jahr = „Teil 1")

Zwei Ebenen, die man auseinanderhalten muss:

**(a) Zwischenprüfung (im Verlauf der Stufe 1)** — gesichert dem Grundsatz nach, Detailwerte teils [UNSICHER]:
- Zeitpunkt: früher 3. Ausbildungshalbjahr; nach neueren Regelungen tendenziell **Ende des 1. Ausbildungsjahres**.
- **Praktische Aufgabe: bis zu 6 Stunden**. Für den Schwerpunkt Trockenbau: **Wand- und
  Deckenkonstruktion mit Verspachtelungsarbeiten** herstellen; dabei Arbeitsschritte planen,
  Baustoffe und Werkzeuge ermitteln, Arbeitsplatz sichern, Arbeitsschutz beachten und die
  Ausführung mündlich oder schriftlich begründen.
- Prüft Fertigkeiten/Kenntnisse **der Grundstufe + Fachstufe I**, soweit für die Berufsausbildung wesentlich.

**(b) Gesellenprüfung Ausbaufacharbeiter (Abschluss Stufe 1, zählt als Zwischenprüfung Trockenbaumonteur)**:
- Praktische Prüfung (Arbeitsaufgabe) + schriftliche Prüfungsfächer inkl. **Wirtschafts- und Sozialkunde**.
- Exakte Prüfungsbereichsnamen/Gewichtung der schriftlichen Ausbaufacharbeiter-Prüfung: **[UNSICHER]**
  (nicht aus Primärquelle bestätigt; typisch für die Bauwirtschaftsberufe: fachbezogene schriftliche
  Aufgaben + WiSo, praktische Arbeitsaufgabe mit hohem Gewicht).

### 2.2 Abschlussprüfung / Gesellenprüfung Trockenbaumonteur (ALT, § 47 BauWiAusbV) — **gesichert**

Schriftlicher Teil (Kenntnisprüfung), mehrfach übereinstimmend belegt und deckungsgleich mit den
Coach-Notizen des Nutzers:

| Prüfungsbereich | Gewichtung | Dauer |
|-----------------|-----------:|------:|
| **Trockenbaukonstruktionen** | **50 %** | **150 min** |
| **Sanieren und Instandsetzen von Bauwerken** | **30 %** | **90 min** |
| **Wirtschafts- und Sozialkunde (WiSo)** | **20 %** | **30 min** |

- Zusätzlich **praktische Prüfung: Arbeitsaufgabe bis zu 8 Stunden** — eigenständige
  Arbeitsplanung, Qualitätskontrolle, Arbeits-/Umweltschutz nachweisen.
- Aufgabenarten (aus Coach-Notizen, didaktisch belegt): projektbezogen, **gebundene** Aufgaben
  (MC, genau 1 richtige aus 4–5), **ungebundene** (frei), Zeichnung/Bauteile benennen,
  Konstruktionsauswahl, Arbeitsablaufplan, Materialermittlung (mit Zeichnungs-/Maßbezug),
  Fehleranalyse, Begründungs- und Kombinationsaufgaben.
- Interne Fachtraining-Gewichtung ohne WiSo (Nutzer): TK 62,5 % / Sanieren 37,5 %.

### 2.3 Abschlussprüfung Trockenbaumonteur (NEU, AusbauBAusbV) — **gesichert im Groben**

- **Teil 2** identische Gewichtung: **Trockenbaukonstruktionen 50 % / Sanieren und Instandsetzen 30 % / WiSo 20 %**.
- **Teil 1** (4. Semester): Prüfungsbereich „Herstellen von Baukörpern und Durchführen von Ausbauarbeiten".
- Bei der praktischen Arbeitsaufgabe inkl. Dokumentation Gewichtung **60 %** (Angabe aus IHK-Synthese, [teilweise UNSICHER]).
- Inhaltliche Beschreibung der Prüfungsbereiche (NEU): „Durchführen von Trockenbaukonstruktionsarbeiten"
  (Aufträge erfassen, Arbeitsabläufe planen/dokumentieren; Wand-, Decken-, Bodenkonstruktionen nach
  bauphysikalischen Anforderungen unterscheiden/auswählen) und „Durchführen von Sanierungs- und
  Instandsetzungsarbeiten" (Plattenoberflächen nach Qualitätsanforderungen unterscheiden/auswählen).

**Quellen (2):**
- § 47 BauWiAusbV (Gesellenprüfung): https://www.buzer.de/gesetz/2589/a36961.htm
- BauWiAusbV Ausbaufacharbeiter/Zwischenprüfung: https://www.buzer.de/gesetz/2589/b7243.htm · https://ra.de/gesetze/bauwiausbv-1999/zweiter-teil/1-abschnitt
- IHK Pfalz Trockenbaumonteur: https://www.ihk.de/pfalz/produktmarken/ausbildung/zwischen-und-abschlusspruefungen/pruefungen-a-z/trockenbaumonteur-in-1280642 · Ausbaufacharbeiter: https://www.ihk.de/pfalz/produktmarken/ausbildung/zwischen-und-abschlusspruefungen/pruefungen-a-z/ausbaufacharbeiter-in-1280408
- IHK Berlin Prüfung Trockenbaumonteur: https://www.ihk.de/berlin/pruefungen-lehrgaenge/ausbildungspruefungen/pruefung-trockenbaumonteur-in-6176834
- IHK Kassel-Marburg, Erläuterungen zum Prüfungsverfahren (PDF): https://www.ihk.de/blueprint/servlet/resource/blob/4123240/2eef84bc0945037c7883f2e44927444c/trockenbaumonteur-erlaeuterungen-zum-pruefungsverfahren-data.pdf
- AusbauBAusbV Abschnitt 8: https://www.buzer.de/gesetz/16464/b45490.htm

---

## 3. Lernfelder (Rahmenlehrplan) — Titel & Kerninhalte

> **[UNSICHER — Nummerierung und Zeitrichtwerte]:** Die KMK-PDFs waren nicht direkt abrufbar.
> Die folgende Liste gibt die inhaltlich belegten Lernfeld-**Titel/Themen** wieder; exakte
> LF-Nummern und Stundenwerte bitte gegen die KMK-Rahmenlehrpläne (Hochbau/Ausbau,
> „Ausbaufacharbeiter.pdf") und den NRW-Bildungsplan 2026 gegenprüfen.

### 3.1 Grundstufe (1. Ausbildungsjahr, berufsfeldbreite Grundbildung Bau — gemeinsam Hoch-/Tief-/Ausbau)

| LF (ca.) | Titel (Standard-KMK) | Kerninhalte |
|----------|----------------------|-------------|
| LF 1 | Einrichten einer Baustelle | Baustellenorganisation, Arbeitsschutz, Werkzeuge/Geräte, Sicherung, Aufmaß-Grundlagen |
| LF 2 | Erschließen und Gründen eines Bauwerks | Baugrund, Vermessen/Absteck-Grundlagen, Gründung, Erdarbeiten |
| LF 3 | Mauern eines einschaligen Baukörpers | Mauerwerksarten, Steine/Mörtel, Verband, Maßordnung |
| LF 4 | Herstellen einer Stahlbeton-/Betonkonstruktion | Schalung, Bewehrungsgrundlagen, Betonieren |

> Diese Grundstufe zählt **inhaltlich zur Zwischenprüfung** und wird in der App bisher **nicht** abgebildet (s. Abschnitt 5).

### 3.2 Fachstufe I (2. Ausbildungsjahr, Ausbaufacharbeiter Schwerpunkt Trockenbau) — belegte Themen

| LF (ca.) | Titel/Thema (belegt) | Kerninhalte | App-Bereich |
|----------|----------------------|-------------|-------------|
| LF | Herstellen von (einfachen) Trennwänden in Trockenbauweise | Metallständerwand, Profile, Beplankung, Verspachtelung | basics, trockenbaukonstruktionen |
| LF | Bauen von Unterdecken und Deckenbekleidungen | abgehängte Decke, Unterkonstruktion, Abhänger, Lastabtrag | trockenbaukonstruktionen (TKD) |
| LF | Herstellen von Verkleidungen und Vorsatzschalen | Bekleidung/Dämmung von Bauteilen, Vorsatzschale | trockenbaukonstruktionen (TKW) |
| LF | Herstellen von Estrich / Bodenkonstruktionen | schwimmender/Trocken-Estrich, Dämmung, Trittschall | fussboden |
| LF | Wärme-/Schall-/Brandschutz an Bauteilen (bauphysikal. Grundlagen) | Kennwerte, Dämmstoffe | bauphysik |

### 3.3 Fachstufe II (3. Ausbildungsjahr, Trockenbaumonteur) — belegte Themen

| LF (ca.) | Titel/Thema (belegt) | Kerninhalte | App-Bereich |
|----------|----------------------|-------------|-------------|
| LF | Ausbau eines Dachgeschosses | Dachaufbau, Dämmung, Luft-/Winddichtheit, Abseiten-/Giebelwand | dachgeschoss |
| LF | Sanieren/Instandsetzen von Bauteilen (Trockenputz, Trennwände) | Bestandsprüfung, Risse/Feuchte, Reparatur, Badabdichtung | sanierung |
| LF | Errichten von Brandschutzkonstruktionen | selbstständige/unselbst. Brandschutzdecken, EI-Klassen, Bekleidungen, Abschottungen | bauphysik, sonderkonstruktionen |
| LF | Herstellen von Sonderkonstruktionen / Sonderdecken | Akustik-, Heiz-/Kühl-/Klimadecken, Strahlenschutz, Systemdecken | sonderkonstruktionen |
| LF | Planen/Kalkulieren von Trockenbauaufträgen | Leistungsbeschreibung, Aufmaß, Materialermittlung, Ablaufplan | planung |

**Quellen (3):**
- KMK Rahmenlehrplan Hochbau (Grundstufe): https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/RLP-Bau-Hochbau-mit-EL.pdf
- KMK Rahmenlehrplan Ausbaufacharbeiter: https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Ausbaufacharbeiter.pdf
- NRW vorläufiger Bildungsplan Trockenbaumonteure 2026: https://www.qua-lis.nrw.de/system/files/media/document/file/bau-aus_trockenbaumonteure_vbp2026.pdf
- Berufsbildung NRW LF/Bündelungsfächer: https://www.berufsbildung.nrw.de/cms/bildungsgaenge-bildungsplaene/fachklassen-duales-system-anlage-a/berufe-a-bis-z/trockenbaumonteure/lf-buefae/index.html
- Sachsen Lehrplan Ausbaufacharbeiter/Hochbaufacharbeiter: https://www.schulportal.sachsen.de/lplandb/lehrplan/923 · https://www.schulportal.sachsen.de/lplandb/lehrplan/927

---

## 4. Mapping: offizielle Struktur → 8 App-Hauptbereiche

App-Bestand (129 Mikrokompetenzen): **basics** (BAS, 16) · **planung** (PLA, 13) ·
**trockenbaukonstruktionen** (TKW Wand 18 + TKD Decke 12) · **bauphysik** (BPH, 18) ·
**sanierung** (SAN, 14) · **dachgeschoss** (DGA, 16) · **fussboden** (FBE, 13) ·
**sonderkonstruktionen** (SON, 9).

| Offizieller Prüfungsbereich / Lernfeld | App-Hauptbereich(e) | Abdeckung |
|----------------------------------------|---------------------|-----------|
| **AP Trockenbaukonstruktionen (50 %)** | basics, trockenbaukonstruktionen (TKW+TKD), bauphysik, planung, fussboden, dachgeschoss, sonderkonstruktionen | **sehr gut** — Kern der App |
| **AP Sanieren und Instandsetzen (30 %)** | sanierung (+ Teile bauphysik, fussboden) | **gut** |
| **AP Wirtschafts- und Sozialkunde (20 %)** | — (bewusst nicht trainiert) | **nicht abgedeckt** (Design-Entscheidung) |
| LF Grundstufe: Baustelle einrichten / Vermessen / Mauern / Beton | — | **fehlt vollständig** |
| LF Trennwände Trockenbau | basics, trockenbaukonstruktionen (TKW) | sehr gut |
| LF Unterdecken/Deckenbekleidungen | trockenbaukonstruktionen (TKD) | sehr gut |
| LF Verkleidungen/Vorsatzschalen | trockenbaukonstruktionen (TKW-016) | gut |
| LF Estrich/Boden | fussboden (FBE) | sehr gut |
| LF Bauphysik (Wärme/Schall/Brand/Feuchte) | bauphysik (BPH) | sehr gut |
| LF Dachgeschossausbau | dachgeschoss (DGA) | sehr gut |
| LF Sanierung/Instandsetzung | sanierung (SAN) | gut |
| LF Brandschutzkonstruktionen | bauphysik + sonderkonstruktionen | gut |
| LF Sonderkonstruktionen/Sonderdecken | sonderkonstruktionen (SON) | mittel (nur 9 Kompetenzen) |
| LF Planen/Kalkulieren | planung (PLA) | sehr gut |

**Gesamtbild:** Der Bestand deckt die **Abschlussprüfung Trockenbaumonteur (ALT)** in ihren beiden
trainierten Bereichen (TK 50 % + Sanieren 30 %) **inhaltlich sehr gut** ab — genau darauf ist er
ausgelegt. Die zwei systematischen Lücken sind (a) die **Grundstufe/Grundbildung Bau** und
(b) alles, was speziell zur **Zwischenprüfung** gehört bzw. nicht Trockenbau-spezifisch ist.

---

## 5. Lückenliste (priorisiert)

### 5.1 Block A — Grundstufe & Zwischenprüfung (bisher NICHT im Fokus)

Priorität hoch, wenn das Produkt künftig auch **Zwischenprüfung / Ausbaufacharbeiter** bedienen soll.
Nur **Themenvorschläge** — keine erfundenen Prüfungswerte/Gewichtungen.

1. **Grundbildung Bau (neuer Hauptbereich, z. B. `grundstufe`)** — komplett neu:
   - Baustelle einrichten: Baustellenorganisation, Sicherung, Geräte, erste Hilfe/Arbeitsschutz-Basics.
   - Vermessen/Anreißen: Nivellier-/Messgrundlagen, Meterriss, Lot/Waage, rechter Winkel (3-4-5).
   - Mauerwerk-Grundlagen: Steinarten, Mörtelgruppen, Verband, Maßordnung/Achtelmeter — für „Massivbau vs. Trockenbau"-Verständnis.
   - Beton/Stahlbeton-Grundlagen: Schalung, Bewehrung, Rohdecke als Untergrund (Bezug zu Abhängern/Lastabtrag).
   - Baustoffkunde breit: Bindemittel, Holz, Putzarten (Bezug „Trockenputz").
2. **Zwischenprüfungs-Format** — praktische 6-h-Aufgabe „Wand- + Deckenkonstruktion mit Verspachtelung":
   Handlungsketten Arbeitsplanung → Baustoff-/Werkzeugermittlung → Ausführung → mündliche/schriftliche Begründung.
   (In der App vorhanden als Wissen, aber nicht als *zwischenprüfungs-typisches* Aufgabenformat gebündelt.)
3. **WiSo** (20 % der Abschluss- **und** Bestandteil der Zwischenprüfung): bewusst nicht trainiert —
   Entscheidung dokumentieren; für ein „Komplett"-Produkt wäre ein optionaler WiSo-Block zu ergänzen.
4. **Grundlagen-Fachrechnen breiter**: Grundstufe verlangt Baustellen-Mathe über Trockenbau hinaus
   (Mauerwerksmengen, Beton-/Mörtelmengen, Gefälle) — aktuell nur Trockenbau-Aufmaß in `planung`.

### 5.2 Block B — Abschlussprüfung-Feinschliff (Bestand vertiefen)

Priorität mittel; verbessert die vorhandene, gut ausgerichtete Abschlussprüfungs-App.

1. **sonderkonstruktionen** ist mit **9 Kompetenzen** dünn, obwohl LF „Sonderkonstruktionen/Sonderdecken"
   ein eigener Prüfungsschwerpunkt ist. Ergänzen: **Akustikdecken/Schallabsorption im Detail,
   Heiz-/Kühl-/Klimadecken, Strahlenschutzkonstruktionen**, Metallkassetten-/Paneeldecken,
   Trennwand-Anschluss an Bandraster.
2. **Sanieren/Instandsetzen (30 %)** verglichen mit TK etwas schlanker (SAN 14): ergänzen
   **Trockenputz/Ansetzbinder (Direktbekleidung), Innendämmung im Bestand + Tauwasser/Feuchteschutz,
   Schadensbilder-Katalog** (systematisch Schaden→Ursache→Maßnahme→Kontrolle als eigenes Format).
3. **Brandschutz-Detailtiefe**: Abschottungen/Schotts, Kabel-/Rohrdurchführungen, Revisionsklappen
   sind in SON/BPH angelegt, aber Prüfungsschwerpunkt — mehr Fall-/Tabellenaufgaben (U/A-Wert,
   Plattendicke) sinnvoll.
4. **Aufgabenformate** aus den Coach-Notizen konsequent als eigene Übungstypen abbilden:
   Zeichnung/Bauteile benennen, Konstruktionsauswahl, Arbeitsablaufplan, Materialermittlung mit
   Maßbezug, Fehleranalyse, Kombinationsaufgaben. (Inhalt vorhanden, Format-Coverage prüfen.)
5. **High-Priority-Themen des Coaches** gegenchecken (Badabdichtung/Feuchtraum, Vorsatzschale
   Giebelwand, Abseitenwand, CD-Decke/Lastabtrag, EI 30/60) — sind großteils abgedeckt (SAN-010,
   DGA-012/013, TKD-003/009, BPH-003); **als Prüfungsschwerpunkt-Tag markieren**, damit der Trainer priorisiert.

---

## 6. Kurzempfehlung: Produktzuschnitt vs. offizielle Struktur

- **Basis/Lite vs. Premium (Buchwissen vs. echte Altprüfungen):**
  Die 129 Mikrokompetenzen sind gelehrtes **Buch-/Regelwissen** (Systemwerte, Konstruktionsregeln,
  Bauphysik) — ideale **Lite-/Basis-Ebene**. Sie sind *Quellenhierarchie Stufe 3–5* (Unterricht +
  didaktische Ableitung), **keine** Original-IHK-Aufgaben. Ein **Premium-Layer** mit **echten
  Altprüfungen/Prüfungssimulationen** (gebundene + ungebundene Aufgaben, projektbezogene Fälle mit
  Zeichnungs-/Maßbezug) sitzt sauber darüber und ist rechtlich/didaktisch klar vom Basiswissen
  getrennt — genau die im Seed schon angelegte Aufgaben-Taxonomie.
- **Zwischen- vs. Abschlussprüfung:**
  Der Bestand ist praktisch **vollständig auf die Abschlussprüfung Trockenbaumonteur** (TK 50 % /
  Sanieren 30 %) zugeschnitten und passt dort exzellent zur offiziellen Gewichtung. Für ein
  **Zwischenprüfungs-Produkt (Ausbaufacharbeiter)** fehlt vor allem die **Grundstufe/Grundbildung Bau**
  (Baustelle, Vermessen, Mauern, Beton) plus das **praktische 6-h-Aufgabenformat**. Empfehlung:
  einen eigenen Hauptbereich `grundstufe` + Zwischenprüfungs-Aufgabenmodus ergänzen — das erschließt
  die komplette Zielgruppe „1.–2. Lehrjahr" zusätzlich zum bestehenden „3. Lehrjahr/Abschluss".
- **Zukunftssicherheit (NEU ab 2026):** Da die **gestreckte Gesellenprüfung** die Teil-1-Prüfung
  (4. Semester) strukturell aufwertet, gewinnt ein Zwischen-/Teil-1-Produkt an Bedeutung. Die
  Abschluss-Gewichtung (50/30/20) bleibt identisch — der vorhandene Content bleibt gültig; ergänzt
  werden muss v. a. der Teil-1-Bereich „Herstellen von Baukörpern und Durchführen von Ausbauarbeiten".

---

## 7. Offene Verifizierungspunkte (vor Content-Erweiterung prüfen)

1. Exakte **LF-Nummern + Zeitrichtwerte** aus KMK-Rahmenlehrplan (Hochbau + Ausbaufacharbeiter) und NRW-Bildungsplan 2026.
2. Genaue **Prüfungsbereiche/Gewichtung der Ausbaufacharbeiter-Gesellenprüfung** (schriftlich) — hier [UNSICHER].
3. Exakte **Zwischenprüfungs-Definition** je nach ALT/NEU-Regime und Bundesland (Zeitpunkt, Dauer, Bereiche).
4. Ob das Zielprodukt **ALT (BauWiAusbV 1999)** oder **NEU (AusbauBAusbV, ab 1.8.2026)** adressiert — bestimmt Teil-1-Zuschnitt.
