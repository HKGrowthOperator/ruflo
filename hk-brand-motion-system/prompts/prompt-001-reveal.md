# Higgsfield Prompts — Brief 001: 8s HK Logo Reveal (Option A) — READY

> Working palette (provisional, from `assets/brandkit/brandkit-reference.md`) — swap to official
> hex when available, prompts unchanged otherwise. Anchor = simplified vector master `hk-logo.svg`.
> Negative prompt: `prompts/shared-negative.txt` (apply to every clip).
> Decisions: D1 8s · D2 warm-dark-olive · D3 one cool pulse · D4 organic crown · D5 no tagline · D8 vector master.

## Logo anchor (verbatim in every clip)
> the HK Growth Operator logo: the letters H and K integrated into the trunk of a stylized tree,
> roots below, trunk through the letters, an organic leaf crown above — exact, undistorted,
> upright, premium, brand-accurate, clean simplified vector

## Master Prompt
```
Premium brand logo reveal of the HK Growth Operator logo (H and K integrated into a stylized
tree trunk, roots below, organic leaf crown above). Style: warm, natural, cinematic, high-end,
minimal — crafted, not techy. Palette: deep forest green (#3F5E2E) letters with a gold-cream
(#C8AE6E) edge, natural leaf greens (#5E7A3A to #C8D58E), warm root tan (#BCA070), on a
warm-dark olive background (#232318) with a soft warm backlight halo. Any automation energy is a
single thin cool accent (#79C0D0) that stays inside roots/trunk/branches and never enters the
crown. Build order strictly roots → trunk (H+K) → branches → crown. Calm, confident, restrained,
brand-accurate. 16:9.
```

## Per-Clip Prompts

### Clip S1 — Roots (0.0–2.5s)
```
[master style] Only the root system forms first: fine warm-tan (#BCA070) roots tracing inward
from a dark field and grounding into a wide, calm fan; the letters are not visible yet; slow
organic growth; soft warm key light; premium, cinematic; no text.
```

### Clip S2 — Trunk + H/K resolve (2.5–4.5s)
```
[master style] A trunk rises from the roots and the letters H and K resolve cleanly and fully
readable in deep green (#3F5E2E) with a gold-cream (#C8AE6E) edge, upright and exact, integrated
into the trunk; gentle settle; warm light; no distortion; no text.
```

### Clip S3 — Branches + single flow pulse (4.5–6.5s)
```
[master style] Branches extend outward (four implied limbs); a single subtle cool (#79C0D0) light
pulse travels from the roots up the trunk into the branches and stops before the crown area;
restrained and elegant; no UI, no icons, no tech; warm premium look.
```

### Clip S4 ⭐ — Crown bloom + lock-up (6.5–8.0s)
```
[master style] An organic leaf crown blooms above in natural greens (#5E7A3A to #C8D58E) with pale
highlights, lit by warm natural light, alive and breathing, with NO flow lines or tech in the
crown; then the full logo settles into an upright, centered, brand-accurate lock-up; calm final
hold; no rotation, no drift; no text.
```

## Negative prompt
Apply `prompts/shared-negative.txt` to all four clips.

## logo-consistency-guard — VERDICT
```
VERDICT: PASS
LOGO INTEGRITY: ok (anchor present every clip; vector master keeps H/K exact)
CROWN RULE: ok (flow pulse stops before crown; crown organic-only, S4)
PREMIUM LOOK: ok (restrained, one pulse, warm-dark)
NOTES: detail-consistency risk mitigated via simplified vector master (D8=A) + low motion.
       Re-confirm after first render; reject any frame with warped H/K or crown contamination.
```
