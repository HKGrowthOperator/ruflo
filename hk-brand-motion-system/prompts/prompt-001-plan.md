# Prompt PLAN — Brief 001: 8s HK Logo Reveal (Option A)

> 🚧 **STATUS: DRAFT PLAN — NOT FINAL, NOT RUNNABLE.**
> This is the structural bridge from scene board → final prompts. Every `«WAITING_FOR_ASSET»`
> token must be filled from committed assets, and the whole set must return **PASS** from
> `logo-consistency-guard`, before any prompt is sent to Higgsfield.
>
> - Brief: [briefs/brief-001-6s-logo-reveal.md](../briefs/brief-001-6s-logo-reveal.md)
> - Board: [production/board-001-6s-logo-reveal.md](../production/board-001-6s-logo-reveal.md)
> - Decisions locked: D1 8s · D2 warm-dark-olive · D3 one cool flow pulse · D4 organic-leaf
>   crown · D5 no end tagline · D6 linger on roots · D7 16:9 first · **D8 simplified vector master**
> - Negative prompt: [prompts/shared-negative.txt](./shared-negative.txt) ✅ ready

## Asset tokens (fill before finalizing)
| Token | Source | State |
|-------|--------|-------|
| `«LOGO_ANCHOR»` | `assets/logo/hk-logo.svg` (simplified vector master) | `WAITING_FOR_ASSET` |
| `«HEX_LETTER_GREEN»` `«HEX_GOLD»` `«HEX_LEAF»` `«HEX_ROOT»` | official brandkit hex | `WAITING_FOR_ASSET` |
| `«HEX_CROWN_LIGHT»` (warm) / `«HEX_FLOW»` (cool) | brandkit accents | `WAITING_FOR_ASSET` |
| `«BG»` | warm-dark olive field + soft backlight halo (per brandkit-reference) | provisional |

### Proposed logo anchor (verbatim once vector exists)
> the HK Growth Operator logo: the letters H and K integrated into the trunk of a stylized tree
> with roots below, trunk through the letters, and an organic leaf crown above — clean simplified
> vector, exact, undistorted, upright, premium, brand-accurate

---

## A) Master Prompt — skeleton
Global style spine reused by every clip (direction is final; asset tokens pending):

```
Premium brand logo reveal of «LOGO_ANCHOR».
Style: warm, natural, cinematic, high-end, minimal — hand-crafted not techy.
Palette: deep green «HEX_LETTER_GREEN», gold-cream edge «HEX_GOLD», natural leaf greens «HEX_LEAF»,
warm root tan «HEX_ROOT», on a «BG». Crown lit with warm natural light «HEX_CROWN_LIGHT».
The tree is the hero; any automation/flow energy is a thin cool accent «HEX_FLOW» that stays
inside roots/trunk/branches and NEVER enters the crown. Roots→trunk(H+K)→branches→crown order.
Calm, confident, restrained. Subtle, premium, brand-accurate. 16:9.
```

## B) Per-Clip Prompts — skeletons (3–5s each; 8s total)

### Clip S1 — Roots (0.0–2.5s) · linger (D6)
- **Direction (final):** from a warm-dark field, root lines trace inward and settle into a wide
  grounded fan beneath where the letters will be. Foundation forming. Slow, organic ease-in.
- **Prompt skeleton:**
```
«LOGO_ANCHOR», only the root system forming first — fine warm-tan «HEX_ROOT» roots drawing
inward and grounding into a wide fan on «BG», letters not yet visible, slow organic growth,
soft warm key light, premium, cinematic, no text. [master style]
```

### Clip S2 — Trunk + H/K resolve (2.5–4.5s)
- **Direction (final):** trunk rises from the root base; the H and K resolve crisply and stay
  fully readable in deep green with the gold-cream edge.
- **Prompt skeleton:**
```
trunk of «LOGO_ANCHOR» rising from the roots, the letters H and K resolving cleanly and
readably in deep green «HEX_LETTER_GREEN» with gold-cream «HEX_GOLD» edge, upright, exact,
no distortion, warm light, premium. [master style]
```

### Clip S3 — Branches + single flow pulse (4.5–6.5s) · AI-as-tool (D3)
- **Direction (final):** branches extend outward (four implied = service areas); ONE calm, thin
  cool pulse travels root→trunk→branch and **stops before the crown**.
- **Prompt skeleton:**
```
branches of «LOGO_ANCHOR» extending outward, four implied limbs, a single subtle cool «HEX_FLOW»
light pulse travelling from roots up the trunk into the branches and stopping before the crown,
restrained, elegant, premium, no UI, no icons. [master style]
```

### Clip S4 ⭐ — Crown bloom + lock-up (6.5–8.0s) · CROWN = LIFE, NO AI
- **Direction (final):** organic leaf crown blooms above in natural greens with pale highlights,
  warm natural light only — no flow lines, no tech. Everything settles into the upright, centered,
  brand-accurate final lock-up; gentle hold, no drift/rotation.
- **Prompt skeleton:**
```
organic leaf crown of «LOGO_ANCHOR» blooming above in natural greens «HEX_LEAF» with pale
highlights, warm natural light «HEX_CROWN_LIGHT», alive and breathing, NO flow lines or tech in
the crown, then the full logo settling into an upright centered brand-accurate lock-up, calm hold.
[master style]
```

## C) Negative Prompt
Use [prompts/shared-negative.txt](./shared-negative.txt) on every clip. ✅ ready.

---

## Guard gate (must PASS before finalizing — see brief §14)
- [ ] `«LOGO_ANCHOR»` resolved from committed `hk-logo.svg` (no placeholder).
- [ ] All `«HEX_*»` filled from official brandkit.
- [ ] Order roots→trunk(H+K)→branches→crown intact across S1–S4.
- [ ] H and K exact, readable, undistorted; final lock-up upright, no tilt.
- [ ] Flow pulse stops before crown; crown organic-only.
- [ ] No robots / AI icons / cyberpunk / HUD / religious / fantasy.
- [ ] `logo-consistency-guard` verdict: **PASS** → only then send to Higgsfield.
