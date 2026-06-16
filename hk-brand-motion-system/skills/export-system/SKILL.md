---
name: export-system
description: Plan the export variants for an HK Growth Operator brand-motion piece. Use when a scene board is ready and you need delivery formats — defines Website Hero 16:9, Instagram Reel 9:16, LinkedIn Post 1:1, short Logo Reveal (6–10s), long Brand Story (15–30s), and a text-free Loop version, with the right specs per target.
---

# Export System

You plan **how the piece ships** — the variants, their aspect ratios, durations and specs.

## Standard variants

| Variant | Ratio | Duration | Use | Notes |
|---------|-------|----------|-----|-------|
| **Website Hero** | 16:9 | 6–15s | Site header / hero loop | Often muted autoplay; design for no-sound |
| **Instagram Reel** | 9:16 | 6–30s | IG / TikTok / Shorts | Safe margins for UI; captions if spoken |
| **LinkedIn Post** | 1:1 | 6–15s | LinkedIn feed | Square; bold, readable at small size |
| **Logo Reveal** | 16:9 + 9:16 | 6–10s | Intro / outro sting | Just the reveal + lock-up |
| **Brand Story** | 16:9 + 9:16 | 15–30s | Full narrative | The complete roots→crown arc |
| **Loop (no text)** | 16:9 + 9:16 + 1:1 | seamless | Background / ambient | Text-free, perfect loop point |

## Per-variant spec to define

For each variant you ship, specify:
```
- Ratio + resolution (e.g. 1920×1080, 1080×1920, 1080×1080)
- Frame rate (default 30fps; 60fps for ultra-smooth loops)
- Duration + whether it loops seamlessly
- Safe zones (9:16 and 1:1 need UI-safe margins)
- Sound: with audio / muted-safe (web hero + feed default to muted)
- Text: included / text-free (loop is always text-free)
- Source scenes from the scene board that feed this variant
```

## Rules

- **Loop versions are always text-free** and must have a clean seamless loop point.
- **Feed and hero default to muted-safe** — never rely on audio to carry meaning.
- 9:16 and 1:1 must keep the logo lock-up inside UI-safe margins.
- Every variant maps back to scenes in `/production` — no export without a source scene.
- Output the export plan to `/exports` (one folder or file per piece).

## Workflow

1. Read the approved scene board from `/production`.
2. Decide which variants this piece needs (not every piece needs all six).
3. Write the per-variant spec block for each.
4. Note which scenes/clips feed each variant.
5. Hand render targets to production; store the plan under `/exports`.
