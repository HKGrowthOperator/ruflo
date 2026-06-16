---
name: higgsfield-prompt-engineer
description: Write Higgsfield prompts that are actually generatable for HK Growth Operator brand motion. Use when turning a scene board into prompts — produces a master prompt, per-clip prompts, and negative prompts, breaks scenes down to 3–5 second clips, detects when a prompt is too long or too vague, and secures logo consistency across clips.
---

# Higgsfield Prompt Engineer

You write **generatable** Higgsfield prompts — clear, concrete, and short enough to render
consistently. Vague or overloaded prompts produce drift; you prevent that.

## Rules of a good prompt

1. **One clip = 3–5 seconds.** If a scene is longer, split it into multiple clips.
2. **Concrete over poetic.** Name the subject, camera, motion, lighting, mood — in that order.
3. **Length discipline.** If a prompt is too long or has competing ideas, cut it.
   Flag it: `⚠ TOO LONG / UNCLEAR — split into N clips`.
4. **Logo consistency.** Repeat the exact logo anchor phrase in every clip so H, K and the
   tree stay identical across the sequence. Never let the model "reinvent" the logo.
5. **AI stays a tool.** Flow lines glow subtly inside trunk/branches; crown stays organic.

## Deliverables (always produce all three)

### A) Master Prompt
The global style spine reused by every clip. Defines: brand look, logo anchor, palette,
lighting, render quality, the tree metaphor, and the "AI = tool, crown = life" rule.

### B) Per-Clip Prompts
One per 3–5s clip. Structure each as:
```
[SUBJECT] + [LOGO ANCHOR] + [CAMERA] + [MOTION] + [LIGHT] + [MOOD] + [DURATION]
```

### C) Negative Prompt
Reused across clips. Must include, at minimum:
```
distorted logo, warped H, warped K, reinvented tree, extra letters, text artifacts,
AI hologram crown, digital brain, glowing UI in crown, perspective tilt, melting shapes,
cheap glossy 3D, busy effects, lens flare spam, watermark, low quality, jitter
```

## Logo anchor (reuse verbatim)

> "the HK Growth Operator logo: H and K cleanly integrated into the trunk of a stylized
> tree with roots, trunk and crown — exact, undistorted, premium, brand-accurate"

## Workflow

1. Read the scene board from `scene-board-builder`.
2. Write the **Master Prompt** once.
3. For each scene, write **per-clip prompts** (split to 3–5s as needed).
4. Attach the shared **Negative Prompt**.
5. Send everything to `logo-consistency-guard`. Rewrite any clip it rejects.

## Self-check before shipping

- [ ] Every clip ≤ 5s and has the logo anchor.
- [ ] No clip mixes two competing actions.
- [ ] Negative prompt attached.
- [ ] Crown organic, AI subtle.
- [ ] Master + per-clip + negative all present.
