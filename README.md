# Diet & Workout Tracker

Single-page HTML file — **no JavaScript, no build step, no dependencies** — designed to be **edited by AI agents** (Claude, Codex, Copilot, etc.) — the agent does the work, you just ask.

## What's inside 🏋️

| Section | Description |
|---------|-------------|
| **01 Workout** | Weekly routine (strength + cardio) with sets/reps or time |
| **02 Body Composition** | Carousel of weigh-ins (scale: weight, BMI, body fat, muscle mass, BMR…) with Δ vs previous weigh-in. Pure CSS (`radio` + `:checked ~`), no JS. |
| **03 Meal Log** | Per-day diary with macro per food (kcal, P, F, C) and daily/weekly totals. Also a CSS carousel (one tab per week). |

## Quick start 🚀

1. **Fork the repo** and open it in your favorite AI agent (Claude Code, Codex, Copilot, …) — the agent loads `AGENTS.md` automatically and already knows how to proceed.
2. **Just talk to it in plain language:** "I ate 150 g chicken breast, 50 g raw rice, and 1 egg for lunch" → it calculates the macros and adds the day to the diary. "New weigh-in: 78.4 kg, 15.2% fat (screenshot attached)" → it adds a new slide to the body-composition carousel.
3. **Open the page in a browser** (`public/tracker.html`) to see your tracker — every edit the agent makes shows up immediately, no `npm install`, no `build`, no framework, no JS.

> 💡 The agent works best with **quantities** ("150 g", "1 egg", "20 min") — the more precise the input, the better the output.

## How the AI agent works 🤖

The `AGENTS.md` file in this repo is the **agent's memory**: it describes the page's structure, the non-negotiable CSS rules, the workflow for adding weigh-ins, and how to fill in the meal log. Every time you open a session with an AI agent on this repo, it loads `AGENTS.md` automatically and already knows how to proceed.

`macro-analysis.md` is the **log of macro analyses** (per-day summary: kcal, P, F, C, source, notes) — the agent writes here every time a meal is recorded.

## Requirements (to let the agent work well) 📋

The agent needs:
- **The quantities of everything eaten** (weight/measure per food, e.g. "150 g chicken breast, 50 g raw rice, 1 egg") so the AI can calculate macros precisely for each meal.
- **Photos of food labels** when available (to extract exact values from the nutrition table); if a label is missing, the AI uses standard estimates.
- A plain-language description of the workout for section 01.

The more precise the input, the better the output.

## Privacy 🔒

The **template** in `public/tracker.html` contains only placeholders (`XX.XX kg`, `MM/DD/YYYY`, `Name`) and randomized data — it's safe to share as-is. The page at the repo root (`index.html`, also the [live page](https://zaddol.github.io/MDFAD/)) is a **personal instance with real data** (my diet, my weigh-ins, my workouts). If you want to fork it for yourself: start from `public/tracker.html` and remove anything that's still personal — name, photos, measurements, real dates.

## A note from the vibe coder 🎸😄

This project started as a no-coder's idea and was built with vibe coding: I'm not a developer, an AI agent writes the code with me. So please expect rough edges, bugs, and occasional malfunctions — that's part of the deal, and honestly half the fun 😄. I'm personally using it for my own diet (how long I'll hold up is still to be seen 👀). If you like the idea, feel free to copy it, modify it, and make it yours 🎉.

## License ⚖️

MIT — see `LICENSE`.
