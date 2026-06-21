# HK Premium Tree System Animation — Dokumentation

Hochwertige Motion-Design-Logo-Animation für **HK Growth Operator**, die aus dem HK-Baumlogo
eine Markenstory erzählt: *Aus dem Fundament eines Unternehmens wird ein funktionierendes
Wachstumssystem.* Premium, ruhig, unternehmerisch — keine fliegenden Angebots-Chips, kein SaaS-Look.

## Dateien
| Datei | Zweck |
|-------|-------|
| `hk-premium-tree-system-animation.html` | **Hauptversion** (~26s, 9 Phasen, Markenfilm) |
| `hk-premium-tree-logo-reveal-short.html` | **Kurzversion** (~9s) — nur die Essenz |
| `hk-premium-preview.png` / `.svg` | Statisches Vorschaubild des Premium-Looks |
| `reveal-buildup-prototype.html` | alter, einfacher Prototyp (bleibt erhalten, nicht überschrieben) |

## Öffnen
Im Browser öffnen (Doppelklick oder Datei in ein Browserfenster ziehen).
Steuerung Hauptversion: **Replay**, **Pause**. Läuft als Loop. Reine HTML/CSS/SVG/JS, keine Abhängigkeiten.

## Ablauf (Hauptversion, 9 Phasen)
| Phase | Zeit | Inhalt | Bedeutung |
|-------|------|--------|-----------|
| 1 Stille & Ursprung | 0–2.5s | Dunkler Raum, feiner goldgrüner Logo-Umriss (Silhouette) | Ruhe, Ernst, Premium |
| 2 Wurzeln aktivieren | 2.5–5s | Wurzeln erscheinen + leuchten, feine Linien | Fundament, Werte, Prozesse, operative Tiefe |
| 3 Stamm & HK Operating Core | 5–8s | Lichtfluss steigt in den Stamm; H+K werden **organisch** sichtbar (kein harter Snap) | HK als verbindende operative Struktur |
| 4 Sichtbarkeit | 8–11s | Eleganter Sichtbarkeitsstrom: Content-Frames, vertikale Video-Silhouetten, Lichtsweep | Social / Brand / Personal Brand Content |
| 5 Website & Conversion | 11–14s | Abstrakte Website-Struktur: Hero, Linien, CTA-Pill, Conversion-Linie | Websites als funktionale Conversion-Systeme |
| 6 Automation & Schnittstellen | 14–17.5s | Leitbahnen Formular→Kalender→CRM→Dashboard, fließende Daten | Weniger manuelle Arbeit, klare Übergaben |
| 7 KI als Werkzeug | 17.5–20.5s | Pipeline-Stufen, Entscheidungs-Knoten (Raute), strukturierte Outputs, Puls | KI verdichtet Arbeit — kein Roboter, keine KI-Krone |
| 8 Krone | 20.5–23.5s | Krone öffnet organisch, natürliches Licht | Wachstum, Frucht, Freiheit, Zeit, Familie, Sinn |
| 9 Finaler Lockup | 23.5–26s | Alle Ströme ziehen sich in den Baum zurück; vollständiges HK-Logo, Wortmarke „HK GROWTH OPERATOR" | Ruhige, klare, hochwertige Markenmarke |

## Layer-Struktur (im Code so benannt/kommentiert)
`particles` · `connectors` · `silhouette` · **Root Layer** (`#roots`) · **Trunk Layer** (`#trunk` + `#trunkVeins`)
· **HK Letter Layer** (`#hk`) · **Crown Layer** (`#crown`) · **Visibility Layer** (`#layVis`)
· **Website/Conversion Layer** (`#layWeb`) · **Automation Flow Layer** (`#layAuto`)
· **AI Pipeline Layer** (`#layAI`) · **Final Lockup Layer** (`#lockup`).

Die Systemebenen (4–7) erscheinen nacheinander und **ziehen sich vor dem Lockup elegant zurück**
in den Baum (Recede-Window ~22.2–23.6s), damit am Ende nur das ruhige Logo steht.

## Technische Umsetzung
- **Reine HTML/CSS/SVG/JS**, keine Libraries. Eine zentrale JS-Timeline (`requestAnimationFrame`)
  steuert pro Frame Opazität/Transform jeder Ebene über Zeitfenster (`seg()` + easeInOut).
- Kontinuierliche Datenflüsse über CSS `stroke-dasharray`-Animation (`.flow`), feine Partikel über CSS-Drift.
- Buchstaben H+K als exakte Vektorform, **lesbar, unverzerrt**, mit Bronze-Gold-Kante. Kein Re-Design.
- Palette: Deep Forest Green (#3F5E2E/#2c4620), Leaf (#6E883F/#8C9A57/#C8D58E), Bronze-Gold (#E8D49C→#A8843E), dunkler Hintergrund.

## Annahmen (autonom getroffen)
1. **Echtes Logo nicht als Datei im Repo nutzbar** (Chat-Upload nicht speicherbar, Drive-Host für
   lokalen Zugriff gesperrt). Daher: hochwertige **symbolische Vektor-Motion-Version** gebaut.
   → Im **Final Lockup Layer** (`#hk`/`#crown`) später das **echte hyperrealistische Logo** als
   präzise Bildebene einsetzen (Platz/Position bereits zentriert vorgesehen).
2. **Gesamtlänge 26s** gewählt (innerhalb 20–30s), Kurzversion **9s** (innerhalb 8–10s).
3. **Textlabels minimal & dezent** (SICHTBARKEIT, CONVERSION, KI·PIPELINE, Automations-Knoten) als
   leise Orientierung, nicht als Hauptmotiv — gemäß Vorgabe „keine plumpen Chips".
4. **Wortmarke** „HK GROWTH OPERATOR" in cleaner Serif als optionaler Schluss-Lockup (entfernbar).
5. **Hintergrund dunkel** (Deep-Forest-Radial) gewählt; transparente Variante später durch Entfernen
   des Stage-Backgrounds möglich.
6. **Kein Sound** eingebaut (HTML-Prototyp); Sounddesign kommt im MP4-Schritt.

## Verbesserungen gegenüber dem alten Prototyp
- Keine **fliegenden Angebots-Chips** / SaaS-Icons mehr → **organische Motion-Layer**: Sichtbarkeitsstrom,
  Website-Wireframe, Automations-Leitbahnen, KI-Pipeline mit Entscheidungs-Knoten.
- **HK erscheint organisch** (gewachsen), statt hartem „Snap"-Gimmick.
- Echte **Markenstory in 9 Phasen** (Fundament → System → Wachstum) statt simpler Aufzählung.
- **Premium-Lichtführung**, Bronze-Gold-Leitbahnen, feine Partikel, ruhige Kamera-Anmutung.
- Saubere, benannte **Layer-Architektur** für späteren MP4/Higgsfield-Export.

## Nächster konkreter Schritt (MP4 / Higgsfield)
1. **MP4-Export:** Animation mit einem Headless-Browser-Recorder rendern, z. B.
   `npx @puppeteer/browsers` + Screen-Capture oder **Playwright + ffmpeg** (Frames abgreifen →
   `ffmpeg -framerate 30 -i frame_%04d.png -pix_fmt yuv420p out.mp4`). *In dieser Umgebung ist
   `ffmpeg` aktuell nicht installiert* — daher entweder ffmpeg bereitstellen oder lokal/CI rendern.
2. **Echtes Logo einsetzen:** im Final Lockup die präzise Logo-Bildebene (transparentes PNG/SVG)
   einfügen, sodass der symbolische Baum am Ende ins echte HK-Logo „auflöst".
3. **Higgsfield-Veredelung (optional):** das fertige MP4 oder Schlüssel-Frames als `start_image`
   in ein Bild-zu-Video-Modell geben, um zusätzliche organische Tiefe/Partikel/Licht zu ergänzen —
   **immer image-to-video mit echtem Logo**, nie Text-zu-Video (das erfindet das Logo).
4. **Sounddesign** ergänzen (ruhiger Aufbau, weicher Impuls beim Krone-Öffnen, warmer End-Akkord).
