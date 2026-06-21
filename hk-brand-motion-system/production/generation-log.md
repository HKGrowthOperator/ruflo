# Generation Log — HK Brand Motion

Tracks every Higgsfield generation: what was made, from which source, status, and feedback.

| # | Date | Piece | Model | Source | Job ID | Result | Status |
|---|------|-------|-------|--------|--------|--------|--------|
| 1 | 2026-06-20 | Living-logo test (text-to-video) | kling3_0_turbo | text only (no logo) | 0b82ae8b | invented logo — REJECTED (only K, bad roots/crown) | ❌ rejected |
| 2 | 2026-06-20 | Living-logo reveal (image-to-video) | kling3_0_turbo | **real HK logo** (Drive upload → media cabb170e) | f976bb1f | 5s · 1080p · 1:1 · H+K exact, roots into soil, crown shimmer, slow push-in | 🟡 awaiting client feedback |

## Imported source assets (Higgsfield media_ids)
- Real logo (white-bg, Drive file 2): `eb0511b1-84c2-4ddf-85ba-839ee2430067`
- Start image used for job #2: `cabb170e-8155-4a8b-a145-4f26a978e8d5`

## Notes / learnings
- ❌ Text-to-video invents the logo → never use for brand reveal. ALWAYS seed image-to-video
  with the real logo as `start_image`.
- ✅ `media_import_url` (server-side fetch from a public Drive/Dropbox link) bypasses the
  environment's upload-host block — this is the working path to get the real logo into Higgsfield.
- Next: 16:9 website-hero version + longer (8–10s) + full build-up reveal (roots→trunk→crown).
