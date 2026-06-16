# Brief 001 — 6–10s HK Logo Reveal

- **ID:** brief-001
- **Piece:** Logo Reveal (brand sting / intro-outro)
- **Status:** DRAFT — awaiting decision-point approval before prompt generation
- **Language:** DE-first (no spoken copy; tagline optional, see §12)
- **Owner:** <name>
- **Date:** 2026-06-16

> ⚠️ **Asset state:** We do NOT yet have the final transparent logo, SVG, full brandkit,
> exact hex colors or font files in the repo. Every part that depends on those is marked
> **`WAITING_FOR_ASSET`** and must be resolved before Higgsfield prompts are written.

---

## 1. Goal of the animation
A short, premium **logo reveal** that stamps the HK Growth Operator brand. It should feel
like a system coming into being — foundation first, then the operating core, then growth —
ending on a clean, locked, brand-accurate logo. Reusable as an intro/outro sting across
website, social and presentations.

## 2. Target format
- **Master:** 16:9, 1920×1080, 30fps
- **Derivatives (planned, via `export-system`):** 9:16 (1080×1920) and 1:1 (1080×1080)
- **Duration:** 6–10s (target build = 8s; see §5 for 6s and 10s variants)
- **Audio:** muted-safe (must read with no sound); optional sound design later
- **Background:** `WAITING_FOR_ASSET` — neutral premium (deep/dark or clean light) pending brandkit

## 3. Core message
**"Erst das Fundament, dann das Wachstum."** — HK builds the system from the roots up so the
business can actually grow. The reveal shows order and depth, not flashy tech.

## 4. Logo symbolism (source of truth)
The logo = **H and K integrated into the trunk of a tree** (roots · trunk · crown).

| Element | Meaning |
|---------|---------|
| **Roots** | Foundation, values, processes, stability, operating depth |
| **Trunk** | HK as the operating core |
| **H + K** | Brand identity integrated into the system |
| **Branches** | The four service areas (Social / Web / Automation / AI) |
| **Flow lines** (roots, trunk, branches) | Automation, interfaces, data flows, AI — as **tools** |
| **Crown** | Real growth, life, freedom, family, nature, fruit, higher order |

## 5. Scene structure (6–10s)

**Target build (8s):**
```
S1  0.0–2.5s  Roots draw in from below — foundation forms.
S2  2.5–4.5s  Trunk rises; H and K resolve cleanly inside it.
S3  4.5–6.5s  Branches fan out; flow lines pulse ONCE, subtly (AI as tool).
S4  6.5–8.0s  Crown blooms (organic); full lock-up holds, brand-accurate.
```

**6s variant (tight):** compress S1→1.6s, S2→1.6s, S3→1.6s, S4→1.2s.
**10s variant (luxe):** add ~1s of held breathing room on S1 (roots) and ~1s on S4 (final hold).

Order is fixed: **roots → trunk (H+K) → branches → crown.** Never reorder.

## 6. Visual action, second by second (8s reference)
| Time | On screen | Symbolism |
|------|-----------|-----------|
| 0.0–1.0s | Darkness/neutral field; first root lines trace inward from edges | Foundation begins |
| 1.0–2.5s | Root network completes, settles, grounds | Stability, processes |
| 2.5–3.5s | Trunk grows upward from the root base | Operating core forms |
| 3.5–4.5s | H and K resolve crisply within the trunk — exact, readable | Brand identity integrated |
| 4.5–5.5s | Branches extend outward (four implied) | Service areas |
| 5.5–6.5s | A single calm pulse of flow lines travels root→trunk→branch | AI/automation as a tool |
| 6.5–7.5s | Crown blooms above — organic leaves/light, warm, alive | Growth, freedom, life |
| 7.5–8.0s | Everything settles into the final locked logo; subtle hold | Brand stamp |

## 7. What AI is allowed to represent
- **Flow lines / light pulses inside roots, trunk and branches** — thin, elegant, purposeful.
- Data/automation suggested as **movement along the structure** (a current, an interface link).
- AI = a **tool inside the system**: subtle, supportive, secondary to the tree.
- At most **one** clean pulse in the reveal — restraint reads as premium.

## 8. What AI must NOT represent
- ❌ No AI presence in or over the **crown**.
- ❌ No robots, no humanoid AI, no generic AI icons (brain, chip, sparkles, "AI" text).
- ❌ No cyberpunk, neon-grid, HUD/UI, dashboards, holograms, circuit-board textures.
- ❌ No religious symbols. No fantasy-forest styling. No magic particles overload.
- ❌ AI must never dominate, replace, or "power" the crown.

## 9. Crown symbolism — clearly separated from AI
The crown is **life, not tech.** It represents real growth, freedom, family, nature, fruit and
higher order. Render it **organically**: leaves, soft volume, warm natural light, a sense of
breathing/aliveness. **No flow lines, no glow circuits, no data, no AI elements touch the crown.**
The hard boundary: flow lines may travel up to where branches begin — they **stop before the
crown.** The crown's energy is natural light/growth, visually distinct from the cool
automation pulse below.

## 10. Visual style direction
- Premium, calm, confident, cinematic. Fewer effects done perfectly.
- Clean negative space; the logo is the hero, not the background.
- **Palette:** `WAITING_FOR_ASSET` — use exact brandkit hex once provided. Likely a restrained
  natural/premium range (deep neutral + organic crown accent + cool automation accent), but
  **do not finalize colors until brandkit hex is in repo.**
- **Type/tagline font:** `WAITING_FOR_ASSET` — only if a tagline is approved (§12).
- No cheap gloss, no heavy bevels, no lens-flare spam.

## 11. Motion direction
- **Easing:** smooth ease-in-out; organic growth feel, nothing mechanical or snappy.
- **Build:** sequential reveal (roots → trunk → branches → crown), each element settling before
  the next begins — controlled, not chaotic.
- **Flow pulse:** one calm travelling pulse, low intensity, cool tone, stops before the crown.
- **Crown:** soft organic bloom/breath, warm, slightly slower than the structural build.
- **Final hold:** logo locks centered and upright; gentle settle, no drift, no rotation.
- **Camera:** minimal — a slow, almost-still push-in at most. No spins, no parallax gimmicks.

## 12. Asset requirements
| Asset | Needed for | State |
|-------|-----------|-------|
| Transparent logo **PNG** (high-res) | Logo anchor, final lock-up | `WAITING_FOR_ASSET` |
| Vector **SVG** master | Crisp scaling, exact H/K geometry | `WAITING_FOR_ASSET` |
| Exact brand **hex colors** | Palette, crown vs flow accents | `WAITING_FOR_ASSET` |
| **Font** file(s) + weights | Optional tagline lock-up | `WAITING_FOR_ASSET` |
| Logo **clear-space / lock-up rules** | Safe-margin, no-crop guarantee | `WAITING_FOR_ASSET` |
| Logo **do's & don'ts** reference | Distortion guard accuracy | `WAITING_FOR_ASSET` |
| Tagline text (DE) + approval | Whether reveal ends on text | `WAITING_FOR_DECISION` (D5) |

> Until the logo PNG/SVG exists, the reveal cannot use the real mark. Any pre-asset motion test
> must use a **placeholder block** clearly labeled as non-final and is NOT brand-accurate.

## 13. Risks for logo distortion
- **Warped / stretched H or K** during the trunk grow-in (morph artifacts).
- **Reinvented tree** — model inventing a different tree shape instead of the real logo.
- **Unreadable letters** mid-animation (H/K must stay legible once resolved).
- **Tilt / perspective error** on the final lock-up (must be upright, no false 3D).
- **Crown contamination** — flow lines/glow bleeding into the crown (breaks §9).
- **Effect overload** burying the mark and killing the premium feel.
- **Color drift** if generated before exact hex is locked (`WAITING_FOR_ASSET`).

## 14. Guard checklist (before any prompt generation)
Run via `logo-consistency-guard`. All must be ✅ before prompts are written:
- [ ] Real logo PNG/SVG present in `assets/logo/` (no placeholder for final).
- [ ] Exact hex colors present in `assets/brandkit/`.
- [ ] Scene order = roots → trunk (H+K) → branches → crown.
- [ ] H and K stay exact, undistorted, readable throughout.
- [ ] Final lock-up upright, centered, no tilt / no perspective error.
- [ ] Flow pulse stops before the crown; crown is organic-only.
- [ ] No robots / AI icons / cyberpunk / HUD / religious / fantasy elements.
- [ ] Effects restrained; premium look intact.
- [ ] Negative prompt drafted to block all of the above.

## 15. Decision points I need you to approve (before Higgsfield prompts)
- **D1 — Duration:** 6s, 8s, or 10s as the primary build? (default proposed: **8s**)
- **D2 — Background:** dark/premium or light/clean? (`WAITING_FOR_ASSET` informs this)
- **D3 — Flow pulse intensity:** one subtle pulse (recommended) vs none at all?
- **D4 — Crown style:** stylized organic leaves vs soft abstract light-bloom?
- **D5 — Tagline:** does the reveal end on a text tagline? If yes, supply DE text + font.
- **D6 — Build order emphasis:** equal timing vs lingering longer on roots (foundation story)?
- **D7 — Derivative formats now or later:** ship 16:9 only first, or 16:9 + 9:16 + 1:1 together?

> No Higgsfield prompts will be written until D1–D7 are decided and §14 guard items that depend
> on assets are resolved.
