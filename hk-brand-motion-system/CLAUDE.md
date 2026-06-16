# HK Brand Motion System — Project Rules

> Internal motion-design system for **HK Growth Operator**.
> Turns the HK logo, brandkit and service areas into clean motion-design briefings,
> Higgsfield prompts, scene plans and export variants.

---

## 1. What this project is

A structured pipeline that takes **brand inputs** (logo, brandkit, service areas, story)
and produces **production-ready outputs**:

```
Brand inputs ─▶ Brief ─▶ Scene Board ─▶ Higgsfield Prompts ─▶ Export Variants
                 │           │                 │                    │
            brand-motion  scene-board   higgsfield-prompt      export-system
              director      builder        engineer
                 └──────────── logo-consistency-guard (checks every step) ──────────┘
                 └──────────── hk-brand-language (checks all copy) ─────────────────┘
```

## 2. The Brand (single source of truth)

**HK Growth Operator builds holistic business systems for companies.**
We do not sell random tools. We integrate real solutions into business operations so
deeply that entrepreneurs and teams save time, reduce manual work, and can work more
**on** the company instead of being trapped **inside** daily operations.

Voice: clear, entrepreneurial, premium, direct. German brand, German-first copy unless
a target platform is explicitly English.

## 3. The Logo & Symbolism (NON-NEGOTIABLE)

The logo shows **H and K integrated into the trunk of a tree**. Tree = roots + trunk + crown.

| Element | Meaning |
|---------|---------|
| **Roots** | Foundation, values, business processes, analysis, stability |
| **Trunk** | HK as the operating core |
| **H and K** | Brand identity integrated into the system |
| **Branches** | Service areas |
| **Flow lines** (trunk + branches) | Automation, interfaces and AI — as **tools** |
| **Crown** | Real growth, life, fruit, freedom, family, nature, higher purpose |

**Hard rule: AI must NEVER visually dominate the crown. AI is only a tool inside the system.**
The crown is life and growth — never a tech hologram, never a "digital brain", never a UI.

## 4. Service Areas (the four branches)

1. **Social Media** — Brand, Personal Brand, Content.
2. **Websites** — Onepager, Conversion Systems, booking flows.
3. **Automations** — Interfaces, calendars, CRM, internal workflows.
4. **AI Integration** — Pipelines, decision-ready outputs, time compression.

## 5. Skills (in `/skills`)

| Skill | Job |
|-------|-----|
| `brand-motion-director` | Translate the brand story into concrete motion scenes (6s / 15s / 30s) |
| `higgsfield-prompt-engineer` | Write generatable Higgsfield prompts (master, per-clip, negative) |
| `logo-consistency-guard` | Check every prompt so the logo is never distorted or reinvented |
| `hk-brand-language` | Keep all copy in HK voice — premium, direct, no agency/hype/spiritual filler |
| `scene-board-builder` | Turn an idea into a production list (scene, duration, action, symbolism, prompts, assets, export, status) |
| `export-system` | Plan the export variants (16:9, 9:16, 1:1, reveal, story, loop) |

## 6. Folder Map

```
hk-brand-motion-system/
├── CLAUDE.md                 # this file — project rules
├── skills/                   # 6 reusable Claude skills
├── briefs/                   # creative briefs per piece (brief-template.md)
├── prompts/                  # generated Higgsfield prompts (prompt-template.md)
├── assets/                   # logo + brandkit source files
│   ├── logo/                 # transparent logo (PNG/SVG)
│   └── brandkit/             # colors, fonts, guidelines
├── exports/                  # rendered output variants
└── production/               # scene-board-template.md + working boards
```

## 7. Working Rules

- **Logo is sacred.** Every generated scene/prompt passes `logo-consistency-guard` before it ships.
- **Premium over busy.** Fewer, cleaner effects. No motion clutter, no cheap transitions.
- **Symbolism stays correct.** Roots→trunk→branches→crown order is never broken.
- **AI stays a tool.** Flow lines and pipelines may glow subtly; the crown stays organic.
- **One language per piece.** Don't mix German and English in a single output.
- **No final prompts without a brief + scene board.** Follow the pipeline order in §1.
- **Keep brand inputs in `/assets`** — never inline logo descriptions that drift from the real file.

## 8. Pipeline Order (do not skip steps)

1. `hk-brand-language` + `brand-motion-director` → write the **brief** (`/briefs`).
2. `scene-board-builder` → expand brief into a **scene board** (`/production`).
3. `higgsfield-prompt-engineer` → write **prompts** per scene (`/prompts`).
4. `logo-consistency-guard` → review every prompt; reject + rewrite on violation.
5. `export-system` → define **export variants** and render targets (`/exports`).
