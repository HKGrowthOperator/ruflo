# HK Growth Operator — Brand-System-Audit & Higgsfield-Produktionsplan

Stand: 2026-07-10 · Basis: Code-Audit der Onepage-Site `hk-growthoperator.de` (Site-ID `945361d9`, 9 Seiten, Homepage mit 19 Custom-React-Sektionen)

---

## 1. Kurzes Urteil zur aktuellen Website

**Das Fundament ist deutlich besser als der Asset-Layer.** Die Seite hat eine echte Conversion-Architektur (Problem → System → Leistungen → Prozess → Vergleich → Vorher/Nachher → Cases → Gründer → Fit → Quiz → Analyse → Garantie → Kontakt → FAQ), eine konsistente Typo (Bricolage Grotesque / Hanken Grotesk), die richtige Farbwelt (#157A4E auf #F7F5F0 / #16150F) und saubere, ruhige Framer-Motion-Animationen. Das ist kein Canva-Problem.

**Das Problem sitzt eine Ebene tiefer: Die Marke hat kein visuelles Eigentum.** Überall dort, wo ein Bild, Icon oder eine Grafik die Arbeit machen müsste, steht heute entweder ein Platzhalter, ein generisches Stroke-Icon, ein dekoratives Olivenbaum-Foto ohne Systemaussage oder ein Fake-Browser-Skeleton. Die Texte erzählen "System" — die Bilder erzählen nichts. Genau deshalb wirkt die Seite "fast premium, aber nicht ganz".

**Konsequenz:** Wir bauen keine neuen Bilder, wir bauen die fehlende Bildsprache — ein Baum-Schichten-System, aus dem Logo, Produktgrafiken, Icons, Fotos und Motion alle abgeleitet werden.

---

## 2. Die 10 größten Baustellen (visuell + conversion-relevant)

| # | Baustelle | Befund im Code | Warum es Conversion kostet |
|---|-----------|----------------|---------------------------|
| 1 | **Logo / Brandmark** | Nav lädt ein hochgeladenes `logoImage` (Bitmap) in den `@siteui/site-nav`; kein SVG, kein Systembezug, keine Ableitungen (Favicon, Siegel, Watermark) | Erster Eindruck; ein weiches Bitmap-Logo bricht das Premium-Versprechen in Sekunde 1 |
| 2 | **Wachstums-Baum-Sektion** | Card-Stack mit echten Olivenbaum-Fotos (`alt="Olivenbaum, …"`); die Schichten-Logik (Wurzeln→Stamm→Äste→Krone→Operating Layer) existiert nur im Text | Das ist DIE Kernmetapher des Angebots — aktuell Deko statt Produktdarstellung |
| 3 | **System-Demo-Grafik** | Inline-SVG: Kreis "HK" + 4 Punkte + gestrichelte Linien (200×166px) | Das ist faktisch die Produktgrafik der Firma; wirkt wie ein Diagramm-Entwurf, nicht wie ein Operating System |
| 4 | **Leistungen-Icons** | 6 generische Stroke-Glyphs (Browser, Trichter, Netzwerk, Person, Gebäude, Zahnrad) | Exakt der generische Icon-Look, der vermieden werden soll; Leistungen wirken austauschbar |
| 5 | **Cases/Proof-Mockups** | Fallback = Fake-Browser-Skeleton (graue Balken + Branchen-Tag) wenn kein Bild gesetzt | Fake-Optik im Beweis-Bereich ist das Teuerste, was eine Premium-Marke tun kann |
| 6 | **Video-Sektion** | `placeholderNote` ohne Video, platziert NACH dem FAQ (Index 17 von 19) | Totes Conversion-Asset an toter Stelle |
| 7 | **Hero-Visual fehlt** | Der Hero rendert nur die Text-Spalte; das komplette "osStage"-Visual (Browser + 4 Modul-Pills) liegt als toter CSS-Code da; rechts füllt nur ein rotierendes Hintergrundbild | Der Hero erklärt nichts — er behauptet nur |
| 8 | **Trust-Row** | Avatar-Kreise = graue Gradient-Platzhalter mit `grayscale(1)` | Sichtbare Platzhalter im Vertrauens-Element = Anti-Beweis |
| 9 | **Kein wiederkehrendes Emblem-System** | Jede Sektion erfindet ihre eigene Mikro-Grafik; nichts wiederholt sich zwischen Homepage, Leistungen-, Projekte-, Analyse-Seite | Wiedererkennung entsteht durch Wiederholung — aktuell null Wiederholung |
| 10 | **Seitenökonomie** | 19 Sektionen auf einer Seite; Garantie/Quiz/Analyse/Kontakt/FAQ/Video stapeln sich am Ende | Jede zusätzliche Sektion ohne neues Argument verdünnt die vorherige |

---

## 3. Welche bestehenden Grafiken mit Higgsfield verbessert werden

1. **Olivenbaum-Fotos der Baum-Sektion** → ersetzt durch eine gezeichnete Master-Systemgrafik (Gravur-/Fine-Line-Stil), pro Schicht ein Ausschnitt desselben Baums. Ein Baum, fünf Schichten, eine Geschichte.
2. **Hero-Hintergrund-Rotator** → ersetzt durch EIN stehendes Material-Still (dunkles Holz/Leinen/Papier mit feiner Gravur-Linie), optional als 6–8s Loop animiert.
3. **Video-Poster** → hochwertiges Poster-Frame statt leerem Platzhalter (bis das echte Video existiert).
4. **Cases-Mockup-Hintergründe** → Szenen-Stills (Gerät auf Stein/Holz/Leinen), in die echte Screenshots montiert werden.

## 4. Welche neuen Assets wirklich sinnvoll sind

1. **Master-Asset: Der HK-Systembaum** — eine einzige, große, präzise Illustration des Baums in 5 beschrifteten Schichten (Wurzeln = Positionierung, Stamm = Struktur/Website/Conversion, Äste = Content/Kanäle, Krone = Nachfrage/Vertrauen, Operating Layer = feine horizontale Linienebene unter den Wurzeln). Aus diesem einen Asset werden ALLE anderen abgeleitet.
2. **Brandmark-Kandidaten** (Exploration, danach Vektorisierung — siehe §5).
3. **6 Leistungs-Embleme** im selben Linien-Stil (Ableitungen aus dem Master-Baum, siehe Prompts).
4. **Scroll-Animations-Frames**: Baum baut sich Schicht für Schicht auf (5 Frames oder 1 Video-Loop als Referenz für die Code-Umsetzung).
5. **1 Hero-/Section-Loop** (image-to-video, 6–8s, kaum Bewegung: Lichtwanderung über Material).

## 5. Was wir NICHT mit Higgsfield machen (wichtig)

| Nicht mit Higgsfield | Warum | Stattdessen |
|---|---|---|
| **Finales Logo/Brandmark als Datei** | Logos müssen Vektor sein (skalierbar, 1-farbig, Favicon-tauglich); KI-Raster liefert weiche Kanten und Zufallsdetails | Higgsfield nur für Richtungs-Exploration; finale Marke als SVG nachbauen (kann ich direkt im Code liefern) |
| **UI-Icons für Leistungen (final)** | 24px-Icons brauchen pixelgenaue Strokes | Embleme als SVG codieren, Higgsfield-Bilder als Stilvorlage |
| **Screenshots / Website-Mockups-Inhalte** | Fake-UI ist verboten (eigene Regel!) | Echte Screenshots der Kundenprojekte, Higgsfield nur für die Szene drumherum |
| **Scroll-Animationen selbst** | Die Seite kann Framer-Motion — Code-Animation ist schärfer, leichter, responsive | SVG-Pfad-Animation im Code; Higgsfield liefert nur den Stil-Frame |
| **Beliebige Moodbilder / Baum-Stockfotos** | Genau das Problem, das wir gerade entfernen | — |
| **Text in Bildern (deutsche Labels)** | KI-Text ist fehleranfällig | Labels als HTML/SVG-Text über das Bild legen |

---

## 6. Priorisierter Produktionsplan

### A) Muss sofort (höchster Hebel)
| Asset | Typ | Einsatzort | Verkaufsfunktion |
|---|---|---|---|
| A1 Master-Systembaum (Illustration) | Text-to-Image → Upscale | Baum-Sektion (ersetzt Olivenfotos), Über-uns, Sales-PDF, Video-Overlay | Macht das Angebot als System sichtbar — das zentrale "Aha" |
| A2 Brandmark-Exploration (3–5 Richtungen) | Text-to-Image (Varianten) | Auswahl → SVG-Neubau → Nav, Favicon, Siegel, Watermark | Premium-Signal in Sekunde 1 |
| A3 Hero-Material-Still | Text-to-Image → Upscale | Hero-Hintergrund (statt Rotator) | Ruhe + Teuer-durch-Reduktion im wichtigsten Viewport |

### B) Hoher Hebel für Premium-Wirkung
| Asset | Typ | Einsatzort |
|---|---|---|
| B1 Emblem-Stilrahmen für 6 Leistungen | Image-to-Image (Stil vom Master-Baum) | Leistungen-Karten (Homepage + /leistungen) → danach SVG-Codierung |
| B2 Baum-Aufbau-Sequenz (5 Schichten-Frames) | Image-to-Image vom Master | Referenz für Code-Scroll-Animation der Baum-Sektion |
| B3 Cases-Szenen-Stills (2–3) | Text-to-Image | /projekte + Cases-Sektion, echte Screenshots werden hineinmontiert |
| B4 Video-Poster-Frame | Text-to-Image | Video-Sektion (bis echtes Video existiert) |

### C) Nice-to-have (nur wenn Tokens übrig)
| Asset | Typ | Einsatzort |
|---|---|---|
| C1 Hero-Loop 6–8s | Image-to-Video von A3 | Hero-Hintergrund (WebM, stumm, loop) |
| C2 Operating-Layer-Loop | Image-to-Video von A1-Ausschnitt | System-Demo-Sektion / Erklärvideos |
| C3 OG-/Social-Card-Master | Image Editing von A1 | SEO/Share-Preview aller Seiten |

### Code-Umsetzungen (0 Tokens, direkt via Onepage-MCP machbar)
1. Leistungen: 6 generische Glyphs → bespoke SVG-Embleme im Baum-Linien-Stil
2. System-Demo: Hub-SVG → präzises "Operating Layer"-Diagramm (Schichten statt Sterntopologie)
3. Baum-Sektion: Scroll-getriebene SVG-Pfad-Animation (Wurzeln→Krone bauen sich beim Scrollen auf)
4. Hero: totes osStage-CSS entfernen ODER als echtes Visual rendern
5. Trust-Row: Platzhalter-Avatare raus (durch Zahl/Logo-Leiste ersetzen, bis echte Kundenbilder da sind)
6. Video-Sektion nach oben ziehen (vor Cases) oder bis Video-Existenz unpublishen
7. Cases: Fake-Skeleton-Fallback entfernen — Karten ohne echtes Bild zeigen kein Mockup

---

## 7. Token-/Versuchsplan

Logik: **breit variieren → hart auswählen → wenig finalisieren.** Nie am fertigen Asset iterieren, immer an der billigsten Vorstufe.

| Phase | Generierungen | Zweck |
|---|---|---|
| 1. Stil-Findung | 6–8 | Master-Baum: 2 Prompt-Varianten × 3–4 Seeds. Auswahl: 1 Gewinner |
| 2. Brandmark | 10–12 | 5 Richtungen × 2 Versuche. Auswahl: 1–2 Richtungen |
| 3. Verfeinerung | 6 | Gewinner-Baum: Detailkorrekturen via Image-to-Image; Brandmark-Favorit: 3 enge Varianten |
| 4. Ableitungen | 8–10 | Embleme-Stilrahmen (1), Schichten-Frames (5), Hero-Still (2–3) |
| 5. Szenen & Poster | 4–6 | Cases-Stills (2–3), Video-Poster (1–2) |
| 6. Finalisierung | 3–5 | Upscale (2K/4K) nur der final ausgewählten Assets |
| 7. Motion (optional) | 2–3 | Image-to-Video Loops (Hero, Operating Layer) |
| **Summe** | **~40–50** | Alles darüber ist Deko-Verbrennung |

Regeln:
- Jede Phase endet mit Auswahl, bevor die nächste startet. Keine Parallel-Finalisierung.
- Upscale/Video IMMER zuletzt (teuerste Operationen nur auf Gewinner).
- Gleicher Seed + Stil-Referenzbild (Image-to-Image mit dem Master-Baum) für alle Ableitungen = Konsistenz.
- Kein Asset ohne definierten Einsatzort aus §6.

---

## 8. Brand-System-Definition

**Stilname (intern): "Engraved System" — Gravur-Präzision trifft Operating System.**

- **Linien:** 1 Strichstärke pro Asset (fein, ~1.5px-Äquivalent), Stichel-/Kupferstich-Anmutung, keine Verläufe in Linien
- **Farben:** Linien in Deep Green-Black #10180F auf Warm Cream #F7F5F0 (hell) ODER Cream-Linien auf #10180F (dunkel). Forest Green #157A4E ausschließlich als Einzelakzent (aktive Schicht, ein Knoten, eine Linie). Muted Olive #5A6048 für Sekundär-Labels
- **Material:** mattes Papier-Korn, dunkles Holz, Stein, Leinen — immer matt, nie glänzend
- **Komposition:** viel Negativraum, zentriert oder streng geometrisch, Editorial-Raster
- **Baum-Grammatik:** Wurzeln (unten, breit) = Positionierung · Stamm (ein starker Pfad) = Struktur/Conversion · Äste (geordnete Verzweigung, KEIN Wildwuchs) = Content/Kanäle · Krone (Punkte/Blätter als Knoten) = Nachfrage · Operating Layer (feine horizontale Linienebene UNTER den Wurzeln) = AI-Automationen
- **Motion-Regel:** Nur Aufbau (Linien zeichnen sich), Licht (wandert langsam), Puls (ein Knoten). Nichts fliegt, nichts dreht sich, nichts glüht.

### Brandmark: 5 Richtungen (Bewertung)

| Richtung | Kurzbeschreibung | Pro | Contra | Empfehlung |
|---|---|---|---|---|
| R1 Reduziertes Baum-Siegel | Kreis-Siegel, Baum aus ~9–12 Linien, Wurzel/Krone symmetrisch | Skaliert, stempelbar, Premium-Editorial | Siegel-Form ist verbreitet | **★ Produzieren** |
| R2 Wurzel-Krone-System | Baum, dessen Wurzeln exakt die gespiegelte Krone sind (Systemsymmetrie) | Stärkste Story (oben ernten, unten fundieren) | Anspruchsvoll in klein | **★ Produzieren** |
| R3 Abstrakter Growth-Knoten | Verzweigungs-Diagramm: 1 Pfad → 3 Knoten, angedeutete Baumform | Tech-tauglich, einzigartig | Verliert Baum-Wärme | Backup |
| R4 Operating-Layer-Baum | Baum über 3 feinen horizontalen Linien (der Layer trägt den Baum) | Erzählt das ganze Produkt | In 16px-Favicon zu viel | Als Sekundär-Grafik, nicht als Logo |
| R5 HK-Monogramm | Nur falls H+K organisch als Stamm/Ast lesbar | Klassisch | Hohe Generik-Gefahr | Nur testen, wenn R1/R2 enttäuschen |

**Finale Empfehlung: R1 als Primärmarke (Nav, Favicon, Siegel) + R2-Symmetrie-Idee in R1 integrieren. R4 wird die große Systemgrafik, nicht das Logo.**

---

## 9. Paste-fertige Higgsfield-Prompts

> Alle Prompts englisch, direkt einsetzbar. Format-Empfehlung je Asset. Nach jeder Generation: Qualitätscheck-Fragen unten beantworten, erst dann iterieren.

### P1 — Master-Systembaum (A1) · Text-to-Image · 4:5 oder 1:1 · höchste Detailstufe

```
Prompt:
A precise botanical-technical engraving of a single olive tree rendered as a
layered system diagram, fine copperplate etching linework, uniform thin line
weight, ink color deep green-black #10180F on warm cream paper #F7F5F0.
The tree is divided into five clearly readable horizontal zones: wide elegant
root network at the bottom, one strong clean trunk, orderly branching limbs,
a crown of small node-like leaves, and beneath the roots a separate thin
horizontal band of three fine parallel lines suggesting an invisible operating
layer. One single accent: exactly one branch path drawn in forest green #157A4E.
Large negative space, centered composition, editorial print quality, subtle
paper grain, engraved atlas plate aesthetic, no text, no labels.

Negative Prompt:
photo, photorealistic tree, watercolor, glow, neon, gradient lighting, 3d render,
fantasy tree, tree of life ornament, esoteric symbols, gold, bokeh, background
scenery, landscape, text, letters, numbers, logo, watermark, thick brush strokes,
sketchy lines, chaotic branches

Qualitätscheck: 5 Zonen einzeln erkennbar? Genau EIN grüner Akzent? Linien gleichmäßig?
Iteration: Wenn Baum zu "hübsch/organisch-wild": add "architectural, systematic,
constructed" — wenn zu technisch/kalt: add "hand-engraved warmth, organic curvature".
```

### P2 — Brandmark R1: Baum-Siegel · Text-to-Image · 1:1 · mehrere Seeds

```
Prompt:
Minimalist circular seal logo mark, a stylized olive tree constructed from nine
to twelve continuous fine lines, roots and crown visually balanced, enclosed in
a thin double circle ring, single color deep green-black #10180F on plain warm
cream background #F7F5F0, flat vector style, engraved stamp aesthetic, extreme
reduction, perfectly symmetrical composition, premium editorial brand identity,
crisp edges, no text, isolated mark only.

Negative Prompt:
photo, realistic bark, leaves detail, gradient, shadow, 3d, glow, gold, ornament,
mandala, celtic, esoteric, tree of life poster, landscape, text, letters,
monogram, multiple colors, texture background

Qualitätscheck: Funktioniert das Motiv gedanklich bei 16px? Wurzel:Krone ~ 1:1?
Iteration: Beste Variante als Vorlage → finale Marke wird als SVG nachgebaut
(nicht das Raster verwenden!).
```

### P3 — Brandmark R2: Wurzel-Krone-Symmetrie · Text-to-Image · 1:1

```
Prompt:
Abstract brand mark of a tree whose root system is an exact mirror reflection of
its crown, drawn with thin uniform lines, the trunk as a single vertical stroke
connecting both halves, geometric and calm, single color deep green-black #10180F
on warm cream #F7F5F0, flat minimal vector aesthetic, premium consultancy brand
mark, generous negative space, no circle enclosure, no text.

Negative Prompt:
photo, realism, foliage texture, gradient, glow, neon, 3d, gold, yin yang,
esoteric, mandala, text, letters, busy detail, asymmetry
```

### P4 — Hero-Material-Still (A3) · Text-to-Image · 16:9 · danach Upscale 4K

```
Prompt:
Quiet luxury still life background: a sheet of warm cream handmade paper #F7F5F0
laid on a dark matte oak surface, soft directional daylight from the left, subtle
linen textile edge in the corner, on the paper a barely visible embossed fine-line
engraving of tree roots, extremely calm editorial composition, large empty area on
the left for typography, muted natural tones, matte finish, high-end print
campaign photography.

Negative Prompt:
glow, neon, bokeh balls, plants, actual tree, people, hands, devices, text,
saturated colors, gold, glossy reflections, hdr look, busy props

Qualitätscheck: Links 50% ruhige Fläche für die Headline? Licht weich, matt?
```

### P5 — Leistungs-Embleme Stilrahmen (B1) · Image-to-Image mit P1-Gewinner als Stilreferenz · 1:1, 6 Motive

```
Gemeinsamer Prompt-Rumpf (Motiv-Zeile austauschen):
Fine-line engraved emblem in the exact same linework style as the reference
image, single uniform thin stroke, deep green-black #10180F on warm cream
#F7F5F0, one small forest green #157A4E accent node, circular composition,
minimal, no text.

Motive:
1. Premium Website  -> "an architectural facade of thin vertical lines growing
   from a single root line, suggesting structure and trust"
2. Funnel & Conversion -> "a calm path of one line passing through three node
   gates, narrowing with intention, decision architecture"
3. Social Media System -> "one branch dividing into ordered smaller branches,
   each ending in a small leaf node, rhythmic distribution"
4. Personal Brand -> "a single strong vertical line with concentric rings around
   its center point, focused core"
5. Unternehmensbrand -> "three horizontal layered planes stacked with slight
   offset, connected by one vertical line, identity architecture"
6. AI-First Automation -> "three fine parallel horizontal lines beneath a small
   root system, an invisible operating layer, quiet precision"

Negative Prompt (alle):
icon pack style, thick outline, rounded ui icon, 3d, gradient, glow, robot, chip,
circuit board, neon, gold, text, letters, clipart, emoji style

Hinweis: Ergebnisse dienen als Stilvorlage — finale Icons werden als SVG codiert.
```

### P6 — Baum-Schichten-Frames (B2) · Image-to-Image vom P1-Gewinner · 5 Ausschnitte 4:5

```
Frame-Prompts (jeweils auf P1-Bild anwenden):
F1: "isolate only the root network zone of the reference engraving, everything
     else faded to 8% opacity, roots fully inked"
F2: "roots plus trunk fully inked, branches and crown faded to 8% opacity"
F3: "roots, trunk and main branches inked, crown faded"
F4: "full tree inked including crown nodes"
F5: "full tree plus the horizontal operating layer band beneath the roots inked,
     the operating layer band in forest green #157A4E"

Verwendung: Referenz für die Code-Scroll-Animation (SVG-Pfade), NICHT als
eingebettete Bilder-Sequenz. Export: PNG, 2000px+, gleiche Crop-Box bei allen 5!
```

### P7 — Cases-Szenen-Still (B3) · Text-to-Image · 4:3 · 2–3 Varianten

```
Prompt:
A matte-screen laptop standing on a natural stone slab beside a linen notebook
and one olive branch sprig, warm cream studio backdrop #F7F5F0, soft window
light, the laptop screen is a plain solid light grey surface with no content,
quiet luxury product photography, editorial magazine style, muted tones, matte
surfaces, generous negative space.

Negative Prompt:
screen content, ui, dashboard, text, glow, neon, plants overload, people, hands,
gold, glossy, hdr, saturated

Wichtig: Screen bleibt LEER — echte Projekt-Screenshots werden per CSS/Bild-
montage eingesetzt. Nie Fake-UI generieren.
```

### P8 — Video-Poster (B4) · Image Editing von P1 oder P4 · 16:9

```
Prompt:
Widescreen cover frame: the engraved system tree from the reference placed on
the right third, large calm cream negative space on the left, subtle paper
grain, one forest green accent branch, premium documentary cover aesthetic,
no text.
```

### P9 — Hero-Loop (C1) · Image-to-Video von P4 · 6–8s, 16:9

```
Prompt:
Extremely subtle cinemagraph: soft daylight slowly drifting across the paper
surface, faint shadow of foliage moving almost imperceptibly, everything else
perfectly still, seamless loop, calm, no camera movement.

Negative: camera pan, zoom, fast motion, flicker, people, particles, glow
Export: WebM/MP4, stumm, <4MB fürs Web.
```

### P10 — Operating-Layer-Loop (C2) · Image-to-Video von P6/F5 · 6s, 1:1 oder 16:9

```
Prompt:
The three horizontal engraved lines beneath the tree roots pulse with a slow
travelling light along their length, one after another, everything else static,
seamless loop, minimal, precise.

Negative: glow bloom, neon, particles, camera movement, morphing
```

---

## 10. Benötigte Inputs vom Team

1. **Aktuelles Logo** als Datei (SVG/PNG in Originalgröße) — für Analyse + Ableitung
2. **Die aktuell in der Baum-Sektion gesetzten Olivenbaum-Fotos** (oder OK, dass sie ersatzlos ersetzt werden)
3. **2–3 echte Projekt-Screenshots** (Kunden-Websites) für die Cases-Montage
4. **Entscheidung Video:** existiert Material für die Video-Sektion, oder unpublishen wir sie vorerst?
5. **Higgsfield-Zugang:** In dieser Session sind nur die Website-/Shorts-/Explainer-Tools des Higgsfield-MCP registriert — `generate_image`/`generate_video`/`models_explore` fehlen. Prompts oben sind so geschrieben, dass sie direkt in der Higgsfield-App (oder einer Claude-Session mit vollem Higgsfield-MCP) einsetzbar sind.

## 11. Umsetzungsreihenfolge (empfohlen)

1. **Sofort (0 Tokens, via Onepage-MCP):** Code-Fixes aus §6 — neue SVG-Embleme, System-Demo-Diagramm, Scroll-Baum als SVG-Pfad-Animation, Hero aufräumen, Platzhalter-Avatare raus
2. **Higgsfield Phase 1–2:** Master-Baum + Brandmark-Exploration (Prompts P1–P3)
3. **Auswahl-Review** mit dir → Gewinner festlegen
4. **Higgsfield Phase 3–5:** Ableitungen + Szenen (P4–P8)
5. **SVG-Finalisierung:** Brandmark + Embleme als Vektor nachbauen, in Nav/Favicon/Sektionen einsetzen
6. **Optional Motion:** P9/P10 nur, wenn Tokens übrig
