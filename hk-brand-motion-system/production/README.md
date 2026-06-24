# HK Brand Motion — Produktions-Übersicht (Handoff)

Stand-Überblick: was fertig ist, wo es liegt, wie du es nutzt. Alles im Ordner `production/`.

## 1. Fertige Filme (Code-Motion-Design, MIT Ton, sofort abspielbar)
Vollständige Markenstory: Chaos → Wurzeln → Stamm/HK → Sichtbarkeit → Website → Automation → KI → Zeit → Krone → Lockup.
Premium-Veredelung (Kamera-Push-in, Vignette, warmer Lichthof) + Sounddesign.

| Format | Hauptfilm (~33s) | Kurzfilm (~10s) |
|--------|------------------|-----------------|
| **16:9** | `hk-cinematic-brand-story.mp4` | `hk-cinematic-short.mp4` |
| **9:16** | `hk-cinematic-vertical.mp4` | `hk-cinematic-vertical-short.mp4` |
| **1:1** | `hk-cinematic-square.mp4` | `hk-cinematic-square-short.mp4` |

(Je auch als `.webm`. Quelle/Animation: `hk-cinematic-brand-story.html` + `…-short.html`. Neu rendern: `render-video.mjs`.)

## 2. Hyperrealistische Clips aus deinem ECHTEN Logo (in deiner Higgsfield-Bibliothek)
Image-to-video, seeded mit dem echten Logo (`762fd8eb…`, dunkle Version). Siehe `generation-log.md` für Job-IDs.
- **Cinema Studio Pro** — Final Lockup (mit Ton) · Reveal aus der Dunkelheit (mit Ton)
- **Seedance 2.0** — Living Logo, Licht steigt aus den Wurzeln (**nativer Sound**)
- **Kling 3.0** — Krone atmet · Lockup 16:9 · Lockup 9:16 · Lockup 1:1

## 3. Weiterbauen in Higgsfield
- `higgsfield-prompt-pack.md` — fertige, markensichere Prompts je Shot (zum Reinkopieren), Modell-Empfehlung, Negativ-Regeln, Styleframe-Prompts für Nicht-Logo-Szenen, Montage-Anleitung.

## 3b. Transparenter Veredelungs-Layer (Alphakanal)
- `hk-logo-overlay-transparent.webm` — 6s-Loop: Bronze-Gold-Lichtsweep + Goldpartikel + Leitbahnen,
  **transparent**, zum **Drüberlegen über den echten-Logo-Lockup** (Quelle: `…-overlay-transparent.html`).

## 4. Briefs / Specs / Doku
- `hk-brand-film-produktionsplan.md` — dein Director-Brief (10 Szenen, Stil, Farbe, Kamera, Sound, Asset-Liste, Qualitätsregeln) + Umsetzungsstatus.
- `hk-cinematic-brand-story.md` — Phasen, Kundennutzen, Layer, Annahmen.
- `hk-premium-animation-visual-spec.md` — visuelle Detail-Spezifikation (Form/Farbe/Licht/Bewegung).
- `hk-cinematic-chaos-preview.png`, `hk-premium-preview.png` — Standbilder.

## 5. Wiederverwendbare Skills (`../skills/`)
brand-motion-director · higgsfield-prompt-engineer · logo-consistency-guard · hk-brand-language · scene-board-builder · export-system.

---

## Finaler Schnitt — Schritt für Schritt (Resolve / After Effects / Higgsfield)
Aus den vorhandenen Teilen wird der fertige Film. Reihenfolge:

1. **Timeline anlegen** im Zielformat (zuerst 16:9, 1920×1080, 30fps).
2. **Aufbau-Story importieren:** `hk-cinematic-brand-story.mp4` (mit Ton) auf Spur V1 — das ist die
   Erzählung Chaos → Wurzeln → Stamm/HK → Systeme → Krone.
3. **Letzte ~2–3s ersetzen:** Wo der symbolische Lockup kommt, blende mit einem weichen Cross-Dissolve
   (0,5–1s) auf den **Higgsfield-Lockup aus deinem echten Logo** (aus deiner Higgsfield-Bibliothek,
   z. B. Cinema-Studio- oder Seedance-Clip). → „der Baum löst ins echte Logo auf".
4. **Veredelung drüberlegen:** `hk-logo-overlay-transparent.webm` auf eine Spur ÜBER den echten-Logo-Lockup,
   Blend-Modus **Screen** oder **Add** (nur das Licht/die Partikel addieren, Logo bleibt unangetastet).
5. **Wortmarke setzen:** „HK Growth Operator" als saubere Typografie manuell unter das Logo (nicht KI-Text).
6. **Ton:** Der Code-Film bringt das Ambient-Sounddesign mit; optional den nativen Seedance-Ton des
   Lockups einmischen. Pegel ruhig halten (kein Trailer-Boom).
7. **Export 16:9** finalisieren. Danach **9:16** und **1:1** (die fertigen Versionen liegen vor) mit
   angepasster Bildführung exportieren.

Kurz: **Code-Story** + **echtes-Logo-Lockup** + **transparenter Overlay** + **manuelle Wortmarke** = fertiger Premium-Markenfilm mit deinem echten Logo.

## Bekannte Grenzen (ehrlich)
- KI-Video belebt ein **fertiges** Logo schön, **baut** es aber nicht fehlerfrei Stück für Stück auf → daher der Hybrid (so empfiehlt es auch dein Produktionsplan).
- Die echten Logo-Dateien (2–3 MB) lassen sich in dieser Umgebung **nicht lokal** verarbeiten (Hosts gesperrt), daher läuft der Code-Film mit dem **symbolischen** Logo; das **echte** Logo kommt über Higgsfield/Schnitt in den finalen Lockup.

## Eine offene Entscheidung von dir
Welcher **Higgsfield-Clip** trifft den HK-Look am besten (Cinema Reveal / Seedance Living-Logo / Lockup)?
→ Davon erzeuge ich die fehlenden Formate + eine längere Version und den Anschluss an den Code-Film.
