# HK Growth Operator — Higgsfield Production Prompt-Pack

> Ready-to-paste Higgsfield prompts to build the brand film **in Higgsfield** from the **real logo**.
> Workflow that works: **image-to-video, seeded with the real logo as `start_image`** (never
> text-to-video — that invents the logo). For non-logo scenes (chaos/office), generate a styleframe
> image first, then animate it.

## Source assets (already in your Higgsfield library)
- **Real logo, DARK background** (matches the dark film): media `762fd8eb-a15c-4fe3-a15f-4c4f8a308eaf` ← use this
- Real logo, white background: media `eb0511b1-84c2-4ddf-85ba-839ee2430067`

## Models (best → use case)
- **Cinematic Studio Video v2 (mode: pro)** — most cinematic camera/color, has sound. Lockup & reveal.
- **Seedance 2.0 (1080p, bitrate high, generate_audio: on)** — strong identity + **native audio**. Living-logo.
- **Kling 3.0 Turbo (1080p)** — fast, reliable subtle motion. Format variants (9:16, 1:1), crown breath.
- When Higgsfield suggests the **"IN THE DARK" preset** → decline it for a controlled brand look (or try it once for a moodier reveal).

## Universal NEGATIVE / guardrails (append to every prompt)
```
Keep the logo EXACTLY as the image, undistorted; both letters H and K intact, equal and readable;
trunk continuous. No text, no UI, no neon, no robots, no AI brain, no holograms, no cyberpunk,
no extra letters, no duplicate wordmark, no morphing letters, no religious symbols, no cartoon.
```

## Shot list (seed every shot with the real logo as start_image)

### A · Final Lockup (hero) — Cinematic Studio (pro), 16:9, 6s, sound on
```
Premium cinematic final brand logo lockup. Calm dignified hold: crown leaves breathe and catch warm
light, a slow bronze-gold light sweep crosses the emblem, fine golden dust drifts, deep roots settle,
extremely slow subtle camera push-in. Deep forest green and bronze gold, dark elegant background,
hyperrealistic, resolved, powerful. [+ guardrails]
```

### B · Living Logo — light rises from roots — Seedance 2.0 (audio), 16:9, 6s
```
The HK tree logo comes alive: a warm bronze-gold light rises from the deep roots up through the trunk
into the crown; leaves shimmer and gently breathe; fine golden particles drift; extremely slow elegant
cinematic push-in. Deep forest green and bronze gold, dark elegant background, premium, organic, calm
and powerful. [+ guardrails]
```

### C · Reveal from darkness — Cinematic Studio (pro, intimate), 16:9, 6s
```
The HK tree emblem emerges from deep darkness as warm light gradually reveals it; soft bronze-gold rim
light; dust motes; slow reveal and gentle settle; serious, premium, dignified. [+ guardrails]
```

### D · Crown growth / light — Kling 3.0, 16:9, 5s
```
Gentle premium motion focused on the organic crown: leaves softly breathe and catch warm natural light,
a few light motes rise from the canopy; the deep roots and the H and K stay perfectly still and exact;
warm bronze-gold and deep forest green, dark background, calm dignified growth. [+ guardrails]
```

### E · Roots / foundation (close on roots) — Kling 3.0 / Seedance, 16:9, 5s
```
Slow cinematic move along the deep roots of the HK tree logo as fine bronze-gold light lines travel
through them like an intelligent foundation scan; warm dust; the trunk, H and K stay exact above;
deep forest green and bronze gold, dark elegant background, premium, controlled. [+ guardrails]
```

## Non-logo styleframes (generate IMAGE first, then animate)
Use an image model (e.g. **nano_banana_pro** or **soul_2** / **marketing_studio_image**), NO logo seed:

### Chaos / old business world (Scene 1)
```
Abstract dark premium business world: floating disconnected dashboards, scattered document cards,
empty website frames, calendar columns, faint email cards, lead cards sinking, broken data lines that
stop before connecting; cold desaturated slate tones on near-black; a lone abstract entrepreneur
silhouette surrounded by the fragments; cinematic, premium, NOT a hacker scene, no logos, no real text.
```
Then animate with a slow heavy push-in (Kling/Seedance) and dissolve into the roots scene.

### System worlds (Social / Website / Automation / AI)
Generate elegant abstract styleframes in the same palette (deep forest green + bronze gold, dark bg):
- **Social:** vertical content frames, camera light reflections, brand panels, trust signals (NO platform logos).
- **Website:** hero section, clear CTA, trust blocks, booking module, conversion line (NO lorem ipsum / fake UI text).
- **Automation:** form → calendar → CRM → dashboard nodes connected by calm bronze-gold data lines.
- **AI:** pipeline stages, a decision-node diamond, structured outputs (NO robots / brains / holograms).

## Assembly (in Higgsfield or an editor)
1. Order: Chaos → Roots → Trunk/HK → Social → Website → Automation → AI → Time-back → Crown → **Final Lockup (shot A)**.
2. End on the **real-logo lockup** (shot A or B) so the film resolves into the exact logo.
3. Keep cuts slow and soft; match the warm-light rises; add the wordmark "HK Growth Operator" as clean
   typography manually at the end (not AI-generated).

> The code-based film in `production/hk-cinematic-brand-story.*` (now with sound) is the full-story
> reference/pre-viz; these Higgsfield shots are the hyperreal hero moments from the real logo.
