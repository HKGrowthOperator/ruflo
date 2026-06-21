# Generation Log — HK Brand Motion

Tracks every Higgsfield generation: what was made, from which source, status, and feedback.

| # | Date | Piece | Model | Source | Job ID | Result | Status |
|---|------|-------|-------|--------|--------|--------|--------|
| 1 | 2026-06-20 | Living-logo test (text-to-video) | kling3_0_turbo | text only (no logo) | 0b82ae8b | invented logo — REJECTED (only K, bad roots/crown) | ❌ rejected |
| 2 | 2026-06-20 | Living-logo reveal (image-to-video) | kling3_0_turbo | **real HK logo** (Drive upload → media cabb170e) | f976bb1f | 5s · 1080p · 1:1 · H+K exact, roots into soil, crown shimmer, slow push-in | 🟡 awaiting client feedback |
| 3 | 2026-06-21 | Final lockup (16:9) | kling3_0_turbo | real logo (762fd8eb, dark) | 21c6fb22 | 5s · 1080p · warm light sweep, push-in | ✅ in library |
| 4 | 2026-06-21 | Final lockup — Cinema Studio | **cinematic_studio_video_v2 (pro)** | real logo (762fd8eb) | 7cc77f6c | 6s · spectacle · sound on | ✅ in library |
| 5 | 2026-06-21 | Living logo, light rises from roots | **seedance_2_0 (1080p/high, audio)** | real logo (762fd8eb) | d44599dc | 6s · epic · **native audio** | ✅ in library |
| 6 | 2026-06-21 | Reveal from darkness | cinematic_studio_video_v2 (pro) | real logo (762fd8eb) | 7713ab3c | 6s · intimate · sound on | ✅ in library |
| 7 | 2026-06-21 | Crown breathes / light | kling3_0_turbo | real logo (762fd8eb) | f7a0c47b | 5s · 1080p | ✅ in library |
| 8 | 2026-06-21 | Lockup 9:16 | kling3_0_turbo | real logo (762fd8eb) | 6f41e380 | 5s · 1080×1920 | ✅ in library |
| 9 | 2026-06-21 | Lockup 1:1 | kling3_0_turbo | real logo (762fd8eb) | 1c6e2f14 | 5s · 1080×1080 | ✅ in library |

## Imported source assets (Higgsfield media_ids)
- Real logo (DARK bg, Drive file 1): `762fd8eb-a15c-4fe3-a15f-4c4f8a308eaf` ← primary, matches dark film
- Real logo (white-bg, Drive file 2): `eb0511b1-84c2-4ddf-85ba-839ee2430067`
- Start image used for job #2: `cabb170e-8155-4a8b-a145-4f26a978e8d5`

## Notes / learnings
- ❌ Text-to-video invents the logo → never use for brand reveal. ALWAYS seed image-to-video
  with the real logo as `start_image`.
- ✅ `media_import_url` (server-side fetch from a public Drive/Dropbox link) bypasses the
  environment's upload-host block — this is the working path to get the real logo into Higgsfield.
- Next: 16:9 website-hero version + longer (8–10s) + full build-up reveal (roots→trunk→crown).
