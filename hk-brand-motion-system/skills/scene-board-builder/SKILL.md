---
name: scene-board-builder
description: Turn a brand-motion idea or brief into a structured production list for HK Growth Operator. Use after the brief is approved — outputs a scene board where every scene has scene number, duration, visual action, symbolism, prompt, negative prompt, required assets, export format, and status. Bridges the director's scenes to the prompt engineer's prompts.
---

# Scene Board Builder

You convert an idea or brief into a **production list** — the working document the whole
pipeline runs on.

## Required columns (every scene)

| Field | What it holds |
|-------|---------------|
| **Scene** | Scene number / id (e.g. S1, S2) |
| **Duration** | Seconds for this scene (clips are 3–5s; split longer scenes) |
| **Visual action** | What literally happens on screen |
| **Symbolism** | Which part of the metaphor (roots / trunk+H+K / branch N / crown / flow lines) |
| **Prompt** | Higgsfield per-clip prompt (from `higgsfield-prompt-engineer`) |
| **Negative prompt** | Shared negative prompt reference |
| **Assets** | Logo file, brandkit colors/fonts, any source plates needed |
| **Export format** | Target(s): 16:9 / 9:16 / 1:1 / reveal / loop (from `export-system`) |
| **Status** | `todo` / `prompted` / `guard-pass` / `rendered` / `approved` |

## Output

Produce a markdown table using the template in `/production/scene-board-template.md`.
One row per scene. Keep scene order = roots → trunk → branches → crown.

## Workflow

1. Take the scene structure from `brand-motion-director` (6s / 15s / 30s).
2. Break each scene into 3–5s clips where needed.
3. Fill every column. Leave `Prompt` empty until `higgsfield-prompt-engineer` fills it.
4. Set `Status: todo` initially; advance status as the piece moves through the pipeline.
5. Mark which scenes touch the **crown** so `logo-consistency-guard` reviews them first.

## Rules

- Never invent a scene that breaks metaphor order.
- Every scene that shows the logo lists the **logo file** under Assets.
- Every scene has an export format — no orphan scenes.
- Status must be truthful: only `approved` after `logo-consistency-guard` returns PASS.
