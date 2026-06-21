# HK Growth Operator — Cinematic Brand Story (Dokumentation)

Cinematischer High-End-Markenfilm: nicht nur ein Logo-Reveal, sondern **das Betreten der Welt von
HK** — von operativem Chaos in die neue Ära aus reibungslosen Business-Systemen, Automation, KI,
Sichtbarkeit und echtem Wachstum. Fokus: **Kundennutzen**, visualisiert in Szenen.

## Dateien
| Datei | Zweck |
|-------|-------|
| `hk-cinematic-brand-story.html` | **Hauptfilm** (~33s, 10 Phasen + Chaos-Eröffnung) |
| `hk-cinematic-brand-story-short.html` | **Kurzversion** (~10s): Chaos → Wurzeln → HK-Stamm → System-Flows → Krone → Logo |
| `hk-cinematic-chaos-preview.png/.svg` | Standbild der Chaos-Eröffnungswelt (Phase 0) |
| `hk-premium-preview.png` | Standbild des aufgelösten Systems (Baum + Ebenen) |

Frühere Dateien (`hk-premium-tree-system-animation.html` etc.) bleiben erhalten.
**Öffnen:** `.html` im Browser; Hauptfilm mit Replay/Pause, läuft als Loop. Reines HTML/CSS/SVG/JS.

## Phasen & Kundennutzen
| # | Phase | Was man sieht | Kundennutzen |
|---|-------|---------------|--------------|
| 0 | Operative Überlastung | Dunkle, fragmentierte Bürowelt: verstreute Dokumente/Dashboards/Browser-Karten (kalt, schief, „Alert"-Punkte), Unternehmer-Silhouette im Lärm gefangen, getrennte Tools schweben | (Ausgangsschmerz) |
| – | Struktur tritt ein | Tiefes Grün + Bronze-Gold-Licht steigt von unten — keine Tech-Spielerei, sondern Struktur | |
| 1 | Wurzeln scannen das Fundament | Wurzeln wachsen in den dunklen Boden; Bronze-Gold-Analyse-Scan, pulsierende Werte-Knoten | Das Unternehmen versteht, was bremst und wo Wachstum entsteht |
| 2 | Chaos wird Struktur | Die verstreuten Karten gleiten geordnet in klare Bahnen zu den Wurzeln und werden absorbiert | Weniger Chaos, weniger verlorene Leads, weniger manuelle Schritte |
| 3 | HK-Stamm · Operating Core | Starker Stamm wächst; H und K **emergieren** als Kern (kein Snap) | Eine klare Struktur statt vieler getrennter Probleme |
| 4 | Sichtbarkeit statt Lärm | Content-Frames, Lichtsweep, Brand-Panels — eine Sichtbarkeits-Engine (keine Plattform-Logos) | Autorität, Vertrauen, Nachfrage |
| 5 | Website als Conversion-System | Onepager-Struktur: Hero, CTA, Trust, Buchung, Conversion-Linie; Besucher-Journey | Aus Aufmerksamkeit werden Termine & Kunden |
| 6 | Buchung & Automation | Glühende Eingabe-Karte → Daten fließen automatisch in Kalender/CRM/Dashboard; Copy-Paste löst sich auf | Keine doppelte Arbeit, keine vergessenen Follow-ups |
| 7 | KI als praktischer Hebel | Pipeline im Stamm/in den Bahnen: Idee → Konzept → Vorbereitung → Entscheidungs-Knoten → Output | Projekte schneller, Stunden gespart, Entscheider greift nur an Schlüsselpunkten ein |
| 8 | Unternehmer gewinnt Zeit | Bürowelt öffnet sich, Silhouette ruhig & frei, klares Dashboard, fließende Leads | Mehr Zeit am Unternehmen, mehr Leben |
| 9 | Krone · echtes Wachstum | Krone öffnet organisch, Frucht-Licht, aufsteigende Samen — **kein** Tech, **keine** KI | Wachstum, Freiheit, Familie, Zeit, Sinn |
| 10 | Finaler Logo-Lockup | Alle Ströme kehren in den Baum zurück; vollständiges HK-Emblem zentriert; Wortmarke | Klarheit, Tempo, Zeit, Wachstum, Freiheit |

## Layer-Architektur (im Code benannt)
`particles` · `chaos` (JS-generiert: Office-Karten + Noise) · `figure` (Unternehmer) · `rise` (Struktur-Licht)
· **Root** (`#roots`,`#rootMeaning`) · **Trunk** (`#trunk`,`#trunkVeins`) · **HK** (`#hk`) · **Crown** (`#crown`,`#crownLife`)
· **Visibility** (`#layVis`) · **Website** (`#layWeb`) · **Automation** (`#layAuto`) · **AI** (`#layAI`)
· **Time-back/Calm** (`#calm`) · **Lockup** (`#lockup`). Zentrale JS-Timeline (`requestAnimationFrame`) steuert alles.

## Stil / Negative (umgesetzt)
- Deep Forest Green + Bronze-Gold, dunkler Premium-Hintergrund (kalt → warm), feine Partikel, ruhige Kamera, weiche easeInOut-Bewegung.
- **Kein**: fliegende Chips, SaaS-Icons, Plattform-Logos, Roboter, generische KI-Symbole, Cyberpunk-Neon, Glitch, Fantasy/Comic, religiöse Symbole.
- **KI bleibt im Stamm/in den Bahnen** — nie die Krone; Krone bleibt organisch. H+K immer lesbar, Logo nie verzerrt, Stamm durchgehend.

## Annahmen
1. **Echtes Logo nicht als Datei im Repo nutzbar** → hochwertige symbolische Vektor-Version; der **Final-Lockup ist die Austausch-Ebene** fürs echte hyperrealistische Logo (Platz zentriert vorgesehen). Optionaler Wortmarken-Text entfernbar.
2. **Längen:** Hauptfilm **33s** (innerhalb 25–35s), Kurzversion **10s** (innerhalb 8–12s).
3. **Unternehmer** abstrakt als Silhouette (kein Gesicht), in Eröffnung gefangen, in Phase 8 frei.
4. **Service-Welten** als organische Motion-Layer + sehr dezente Mikro-Labels (Orientierung, kein Hauptmotiv).
5. **Hintergrund dunkel**, Cold-to-Warm; transparente Variante später ableitbar. Kein Sound im HTML.

## Nächster Schritt (MP4 / Higgsfield)
1. **MP4:** Headless-Browser (Playwright) Frames abgreifen → `ffmpeg -framerate 30 -i f_%04d.png -pix_fmt yuv420p out.mp4`. ⚠️ `ffmpeg` hier nicht installiert → bereitstellen oder lokal/CI rendern.
2. **Echtes Logo** im Final-Lockup einsetzen (Auflösung des symbolischen Baums ins echte Logo).
3. **Higgsfield-Veredelung optional:** fertiges MP4 / Key-Frames als `start_image` (image-to-video, nie Text-zu-Video) für zusätzliche Tiefe/Partikel/Licht.
4. **Sounddesign**: tiefer Aufbau, weicher Impuls bei der Krone, ruhiger End-Akkord.
