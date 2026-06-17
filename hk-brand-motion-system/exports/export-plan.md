# HK Brand Motion — Export Plan

> Planned by `export-system`. Maps each delivery variant to specs + source piece.
> Pieces: 001 = 8s Reveal · 002 = 15s Brand Short · 003 = 30s Brand Story.

## Variant matrix
| Variant | Ratio | Resolution | Dur | FPS | Sound | Text | Source piece |
|---------|-------|-----------|-----|-----|-------|------|--------------|
| Website Hero | 16:9 | 1920×1080 | 6–8s loop | 30 | muted-safe | text-free | 001 (reveal) |
| Instagram Reel | 9:16 | 1080×1920 | 15–30s | 30 | muted-safe (captions if spoken) | optional | 002 or 003 |
| LinkedIn Post | 1:1 | 1080×1080 | 6–15s | 30 | muted-safe | optional | 001 or 002 |
| Logo Reveal sting | 16:9 + 9:16 | 1920×1080 / 1080×1920 | 6–8s | 30 | muted-safe | lock-up only | 001 |
| Brand Story | 16:9 + 9:16 | as above | 15–30s | 30 | muted-safe | tagline | 002 / 003 |
| Loop (no text) | 16:9 + 9:16 + 1:1 | as above | seamless | 30–60 | muted | text-free | 001 (no lock-up text) |

## Rules
- **Loop = always text-free**, seamless loop point (drop the final lock-up text frame).
- **Hero + feed default to muted-safe** — never rely on audio for meaning.
- **9:16 / 1:1:** keep logo lock-up inside UI-safe margins; re-center, do not crop the mark.
- Every variant maps to a source piece above — no export without a source scene.
- Each rendered variant → `exports/<piece>/<variant>/`.

## Per-variant production notes
- **Website Hero (16:9):** use Reveal S1–S4; hold final lock-up ~1s; export a clean loop variant too.
- **Reel (9:16):** recompose vertically — roots fan narrower, crown taller; keep H/K centered.
- **LinkedIn (1:1):** tighter square crop; ensure roots + crown both fit; bold at small size.
- **Loop:** Reveal without the lock-up text; match first/last frame for a seamless cycle.

## Status
Specs ready. Renders pending first Higgsfield generation (per piece) → then adapt to each ratio.
