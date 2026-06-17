# Scene Board — Brief 001: 6–10s HK Logo Reveal

- **Piece:** Logo Reveal (brand sting)
- **Brief:** [briefs/brief-001-6s-logo-reveal.md](../briefs/brief-001-6s-logo-reveal.md)
- **Format target(s):** 16:9 (master) → 9:16 + 1:1 (derivatives)
- **Language:** DE (no spoken copy)
- **Owner:** <name>
- **Status:** PROMPTS READY (working palette/vector) — final prompts in `prompts/prompt-001-reveal.md`, guard PASS. Swap official hex/vector later.

> Order is fixed: roots → trunk (H+K) → branches → crown. Clips are 3–5s.
> ⭐ = crown scene → `logo-consistency-guard` reviews first.
> Prompts intentionally EMPTY — not generated until brief is approved.

| Scene | Duration | Visual action | Symbolism | Prompt | Negative prompt | Assets | Export format | Status |
|-------|----------|---------------|-----------|--------|-----------------|--------|---------------|--------|
| S1 | 2.5s | Root lines trace inward; network grounds | Roots = foundation, processes, stability | _(not yet)_ | shared-negative (TBD) | logo.svg `WAITING_FOR_ASSET` | 16:9 + 9:16 + 1:1 | blocked |
| S2 | 2.0s | Trunk rises; H+K resolve crisp & readable | Trunk = HK operating core; H+K | _(not yet)_ | shared-negative (TBD) | logo.svg `WAITING_FOR_ASSET` | 16:9 + 9:16 + 1:1 | blocked |
| S3 | 2.0s | Branches fan out; one calm flow pulse | Branches = 4 services; AI as tool | _(not yet)_ | shared-negative (TBD) | logo.svg `WAITING_FOR_ASSET` | 16:9 + 9:16 + 1:1 | blocked |
| S4 ⭐ | 1.5s | Crown blooms organically; lock-up holds | Crown = growth, freedom, life (NO AI) | _(not yet)_ | shared-negative (TBD) | logo.svg `WAITING_FOR_ASSET`, hex `WAITING_FOR_ASSET` | 16:9 + 9:16 + 1:1 | blocked |

## Status legend
`blocked` → `todo` → `prompted` → `guard-pass` → `rendered` → `approved`

## Working defaults (PROPOSED — see brief §15)
D1 **8s** · D2 **dark-premium** *(provisional, pending brandkit)* · D3 **one subtle pulse** ·
D4 **organic leaves** · D5 **no end tagline** · D6 **linger on roots** · D7 **16:9 first**.

## Blockers
- **Logo reference RECEIVED (2026-06-16):** analyzed in `assets/brandkit/brandkit-reference.md`
  (geometry, symbolism, approx palette confirmed). Detailed illustrative render — see D8.
- **Draft vector master CREATED:** `assets/logo/hk-logo.svg` (v0.1, simplified, D8=A) +
  preview `hk-logo-draft-preview.png`. Unblocks **structure/timing**. NOT the final hero —
  awaiting designer's official vector + official hex before final render.
- **For final render (still pending):** official simplified **vector** + official **hex**.
- **Decisions:** D1–D7 proposed defaults stand; **D8 = ✅ Option A (simplified vector master)**.
  All decisions now resolved. D2 leans warm-dark-olive per reference.
- **Only remaining blocker:** the simplified **vector master file** + **official hex** in repo.
  Once both land, board moves `blocked → todo` and prompts can be drafted (guard-gated).

## Notes
- **Storyboard created:** `production/storyboard-001-reveal.svg` (+ `.png`) — 4 beats visualized
  from the vector master, provisional palette, no video. For client review.
- Flow pulse (AI as tool) stops before the crown — crown is organic-only.
- Every logo scene lists the logo file under Assets; advance past `blocked` only when assets land.
- Advance to `approved` only after `logo-consistency-guard` returns PASS.
