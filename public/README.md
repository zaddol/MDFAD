# Diet & Workout Tracker

Single-page HTML file — **no JavaScript, no build step, no dependencies** — designed to be **edited directly by AI agents** (Claude, Codex, Copilot, etc.) or by hand.

## What's inside

| Section | Description |
|---------|-------------|
| **01 Workout** | Weekly routine (strength + cardio) with sets/reps or time |
| **02 Body Composition** | Carousel of weigh-ins (scale: weight, BMI, body fat, muscle mass, BMR…) with Δ vs previous weigh-in. Pure CSS (`radio` + `:checked ~`), no JS. |
| **03 Meal Log** | Per-day diary with macro per food (kcal, P, G, C) and daily/weekly totals. Also a CSS carousel (one tab per week). |

## Quick start

1. Open `tracker.html` in a browser.
2. Edit the HTML directly (or ask your AI agent to edit it).
3. That's it. There's no `npm install`, no `build`, no framework.

## How the AI agent works

The `AGENTS.md` file in this repo is the **agent's memory**: it describes the page's structure, the non-negotiable CSS rules, the workflow for adding weigh-ins, and how to fill in the meal log. Every time you open a session with an AI agent on this repo, it loads `AGENTS.md` automatically and already knows how to proceed.

`macro-analisi.md` is the **log of macro analyses** (per-day summary: kcal, P, G, C, source, notes) — the agent writes here every time a meal is recorded.

## Requirements (to let the agent work well)

The agent needs:
- **Photos of food labels** (or a reliable description) to extract exact macros from the nutrition table.
- **Photos of the scale app** (screenshot) to read the values for each weigh-in.
- A plain-language description of the workout for section 01.

The more precise the input, the better the output.

## Privacy

This file contains **only placeholders** (`XX.XX kg`, `MM/DD/YYYY`, `Name`). Before sharing the repo or publishing the page, **remove all personal data**: name, photos, measurements, real dates.

## License

MIT — see `LICENSE`.
