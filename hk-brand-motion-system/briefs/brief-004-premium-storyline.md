# Brief 004 — Premium Motion Storyline (15–25s) · HK Growth Operator

> Creative direction for a luxury-tech brand animation, developed **from the existing HK logo**
> (H+K in the trunk of a tree: roots · trunk · crown). Logo is never redesigned; H/K stay exact
> and readable. Look: luxury tech branding — calm, deep, organic, precise, cinematic 3D motion;
> deep forest green + bronze gold; fine data particles; subtle process lines; elegant light.
> Prompts are written in **English** (best Higgsfield generatability); direction is in German.
> Real logo already imported: media_id `34e37ea0…` (dark) / `9fc6becc…` (light) — use the
> **transparent** version as `start_image` once provided.

---

## 1. Szenenstruktur (≈20s, 6 Clips)

| Clip | Zeit | Inhalt |
|------|------|--------|
| **C1 — Wurzeln** | 0–4s | Kamera tief im dunklen, satten Erdreich. Die Wurzeln graben sich tief, feine bronze-goldene Lichtadern erwachen in den Wurzeln (Analyse, Fundament, Stabilität). |
| **C2 — Stamm + H/K** | 4–7s | Kamera fährt am Stamm hoch. H und K fangen weiches bronze-goldenes Licht, klar lesbar. Erste feine Prozesslinien zünden im Stamm (HK als operativer Kern). |
| **C3 — Äste / 4 Bereiche** | 7–12s | Vier Äste treten hervor. Jeder deutet seinen Bereich **abstrakt & edel** an: ① Premium-Content-Frames/Lichtreflexe, ② Website-Layouts/Scroll/CTA-Linien, ③ ruhige Datenfluss-Karten (Kalender/CRM), ④ feine KI-Pipeline-Linien. Keine echten Logos, keine Icons. |
| **C4 — Leitbahnen / Datenfluss** | 12–15s | Bronze-goldene Datenpartikel und Prozesslinien fließen ruhig durch Stamm und Äste — ein klares Betriebssystem. KI als Werkzeug **in den Bahnen**, nie in der Krone. |
| **C5 — Krone** | 15–19s | Kamera hebt zur Krone. Organische Blätter atmen, warmes natürliches Licht von oben. **Keine** Daten, **keine** Tech. Wachstum, Leben, Freiheit, Natur, höhere Ordnung — subtil über Licht. |
| **C6 — Lock-up** | 19–22s | Rückzug auf das vollständige Logo. Ruhiger, premium Halt mit bronze-goldenem Akzent. Optional dezenter Claim. |

## 2. Symbolische Zuordnung
- **Wurzeln** → Fundament, Werte, Analyse, Stabilität, operative Tiefe.
- **Stamm** → HK als operativer Kern des Systems.
- **H / K** → Markenidentität, fest im System integriert.
- **Äste** → die 4 Bereiche: Social/Brand · Websites/Conversion · Automationen/Schnittstellen · KI.
- **Leitbahnen** → Automatisierung, Schnittstellen, Datenflüsse, **KI als Werkzeug**.
- **Krone** → echtes Wachstum, Leben, Frucht, Freiheit, Familie, Natur, höhere Ordnung (**KI-frei**).

## 3. Master-Prompt (Higgsfield)
```
Cinematic 3D luxury-tech brand animation built FROM the provided HK Growth Operator logo
(the letters H and K organically integrated into the trunk of a tree with roots, trunk and crown).
Keep the logo exact and unchanged — H and K clearly readable, the tree, roots, trunk and crown
recognizable; do not redesign. Mood: premium, calm, deep, organic, precise, modern. Palette: deep
forest green and warm bronze gold on a dark, rich background. Fine bronze-gold data particles and
subtle elegant process lines flow through roots, trunk and branches as a quiet operating system —
technology and AI appear only as a refined tool inside the structure, never in the crown. The crown
stays organic, alive, calm and meaningful, lit by soft warm natural light from above (a sense of
higher order through nature and light, never overtly religious). Elegant cinematic lighting, shallow
depth of field, slow controlled camera. No clutter, no cheap tech look. 1:1 (reframe to 16:9 / 9:16).
```

## 4. Einzelclip-Prompts (3–5s, image-to-video aus dem Logo)
> Jeder Clip: Modell `kling3_0_turbo` (oder `seedance_2_0` für Identitätstreue), `start_image` =
> dein transparentes Logo, Negative Prompt aus §6. `[MASTER]` = Master-Prompt-Stil oben.

**C1 — Wurzeln (4s)**
```
[MASTER] Image-to-video. Slow camera deep in dark rich soil around the logo's roots; the roots
reach deeper and settle into the earth; faint bronze-gold light veins awaken along the roots
(foundation, analysis, stability). Warm low key light. The logo stays exact; H and K unchanged.
```
**C2 — Stamm + H/K (3–4s)**
```
[MASTER] Image-to-video. The camera rises along the trunk; the letters H and K catch soft
bronze-gold light and stay crisp and clearly readable; the first fine process lines ignite inside
the trunk. Premium, calm. No new letters, no distortion.
```
**C3 — Äste / 4 Bereiche (4–5s)**
```
[MASTER] Image-to-video. The camera glides across four branches; each branch subtly manifests its
domain as abstract premium visuals near it — elegant content frames and light reflections, clean
website layout panels with soft scroll and CTA lines, calm flowing data cards (calendar/CRM), and
fine AI pipeline lines. Abstract and tasteful, no real brand logos, no icons. Crown untouched.
```
**C4 — Leitbahnen / Datenfluss (3–4s)**
```
[MASTER] Image-to-video. Fine bronze-gold data particles and subtle process lines flow calmly
through roots, trunk and branches, connecting everything like a quiet operating system; AI as a
refined tool within the channels. The flow STOPS before the crown. Elegant, restrained.
```
**C5 — Krone (4s)**
```
[MASTER] Image-to-video. The camera lifts to the crown; organic leaves gently breathe in soft warm
natural light from above; a sense of growth, life and freedom. NO data lines, NO particles, NO tech
in the crown — purely organic and alive, calm and meaningful.
```
**C6 — Lock-up (3s)**
```
[MASTER] Image-to-video. The camera pulls back to reveal the complete HK logo, settling into a
calm, premium, upright lock-up with a soft bronze-gold accent; gentle final hold. No rotation,
no drift, no text artifacts.
```

## 5. Separater Logo-Reveal-Prompt (6–10s)
```
[MASTER] Image-to-video, 8s. The HK Growth Operator logo elegantly forms: fine bronze-gold particles
and roots draw inward and settle into the dark soil, the trunk rises with the letters H and K
resolving crisp and clearly readable, four branches extend, a single calm bronze-gold flow pulses up
the trunk and stops before the crown, then the organic crown gently blooms in warm natural light and
the full logo settles into a premium upright lock-up. Deep forest green and bronze gold, cinematic,
calm, luxury-tech. The logo is exact and unchanged; H and K never distorted; no text.
```

## 6. Negative Prompt (stark)
```
redesigned logo, reinvented tree, different tree, fantasy forest, enchanted woods, distorted H,
distorted K, warped letters, unreadable letters, extra letters, duplicated letters, gibberish text,
watermark, robots, androids, humanoid AI, generic AI icons, brain icon, chip icon, app logos,
social media logos, UI mockups, dashboards, HUD, holograms, cheap hologram, cyberpunk, neon, glitch,
datamosh, vaporwave, oversaturated, christian symbols, cross, halo, religious iconography, mystical
overload, magic sparkles, occult, AI in the crown, tech in the crown, data lines in the crown,
plastic 3D, cheap glossy render, busy effects, lens flare spam, clutter, low quality, blurry, jitter,
deformed, ugly
```

## 7. Logo richtig vorbereiten & hochladen
- **Format:** transparentes **PNG** (echte Alpha-Transparenz, kein weißer/grüner Hintergrund),
  möglichst auch **SVG** als Vektor.
- **Größe:** mind. **2048×2048 px**, scharfe Kanten, kein eingebrannter Schatten/Glow.
- **Rahmen:** Logo zentriert mit ~12–15 % Luft ringsum (Clear-Space), damit die Kamera Platz hat.
- **Varianten (hilfreich):** zusätzlich eine Version auf **dunklem Erdreich/Deep-Green** als
  cinematisches Startbild, und je 1:1 + 16:9 (gepaddet).
- **Teilen:** in Google Drive hochladen → Link „**Jeder mit dem Link**" → mir hier senden.
  Ich importiere ihn automatisch (`media_import_url`) — du brauchst nichts hochzuladen.
  *(Deine aktuellen Logos sind bereits importiert: `34e37ea0…` dunkel, `9fc6becc…` hell.)*

## 8. So arbeiten wir mit Higgsfield Szene für Szene (Co-Work)
1. **Look auf EINEM Clip festziehen:** zuerst nur C6 (Lock-up) oder C5 (Krone) generieren und den
   Master-Prompt feinjustieren, bis Licht/Farbe/Stimmung sitzen. Das ist unsere Referenz.
2. **Gleiches Startbild für alle Clips:** jeden der 6 Clips mit demselben `start_image` (dein Logo)
   + Clip-Prompt + Negative Prompt erzeugen, 3–5s, 1080p, 1–2 Varianten.
3. **Prüfen (Guard):** nach jedem Clip H/K lesbar? Krone KI-frei? Baum unverändert? Wenn nein →
   neu generieren (eine Sache pro Versuch ändern, gute `job_id`s merken).
4. **Zusammenschnitt:** die freigegebenen Clips in Reihenfolge C1→C6 in einem Editor (CapCut/
   Premiere/Resolve) montieren, Sounddesign drunter, Übergänge ruhig halten.
5. **Export:** 16:9 (Hero), 9:16 (Reel), 1:1 (LinkedIn), plus textfreie Loop — siehe `exports/export-plan.md`.
6. **Konstanz:** Startbild nie wechseln, Palette (deep forest green + bronze gold) konstant halten,
   Effekte sparsam — Premium kommt aus Ruhe, nicht aus mehr Effekten.
```
Reihenfolge im Schnitt:  C1 Wurzeln → C2 Stamm/HK → C3 Äste → C4 Leitbahnen → C5 Krone → C6 Lock-up
```
