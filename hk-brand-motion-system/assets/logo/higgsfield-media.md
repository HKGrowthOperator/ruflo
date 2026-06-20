# HK Logo — Higgsfield Media References

The real HK detail logos (provided by the user via Google Drive) were imported into Higgsfield
storage and can be reused as `start_image` / reference in future generations via their media_id.

| # | Source (Google Drive) | Higgsfield media_id | Notes |
|---|------------------------|---------------------|-------|
| 1 | file/d/1vq_DjLfnINOsShBlW3J4_CXvZVnnuA7g | `34e37ea0-8487-4fc2-b931-5530793ecce7` | detailed logo on dark/green background (cinematic) |
| 2 | file/d/1ujux18gn3w5v6TN5RSqqj5KLsbTMT0YA | `9fc6becc-6484-4761-b2a0-f5d9300f6798` | detailed logo on light/white background (clean) |

## Generations (image-to-video from the real logo)
| Job ID | Model | Format | Start image | Result |
|--------|-------|--------|-------------|--------|
| `b77d7969-b6f2-45ed-a9a6-e4839cbfd13d` | kling3_0_turbo | 1:1 · 5s · 1080p | media 1 | living-logo motion test (premium subtle) |

## How to reuse
```
generate_video(model=kling3_0_turbo, medias=[{role:start_image, value:<media_id>}], ...)
generate_image(model=nano_banana_pro|soul_2, medias=[{role:image, value:<media_id>}], ...)
```
> Note: this environment cannot upload bytes to Higgsfield directly (egress blocked). To import
> a new asset, share an HTTPS link (Google Drive “anyone with link”, etc.) and use media_import_url.
