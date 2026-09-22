# Project Context — AI-Editable Nutrition & Fitness Tracker

> Automatically loaded by the AI agent (e.g. **pi**) at every session. This file holds the **how** (workflow, structure, conventions).
> The **data** (weigh-ins, workouts, body comp, diet) lives in `tracker.html` and `macro-analysis.md`: read them when needed, don't duplicate them here.
> This folder doesn't use external tools: all memory lives in the files written here (AGENTS.md, macro-analysis.md). No backend needed: the "database" is HTML + Markdown, modified by the agent.

> ⚠️ **BINDING RULE**: test changes in a working file `test-*.html` (a copy of `tracker.html`), then port them to `tracker.html` **only after user confirmation**. Never touch the main file without explicit confirmation.

## Agent requirements
- File read/write and bash (pi, Codex CLI, Gemini CLI, etc.).
- **Vision**: scanning nutrition labels from photos requires a multimodal model. Without vision: estimate macros with standard tables (see `macro-analysis.md`) and ask the user for values.
- Playwright for visual verification ("Operating workflow" section); if unavailable, ask the user for a screenshot.
- **"Avena" (default) = common oats** (standard estimates, no label). **"Avena Pro"** = Fiorentini protein oats (403 kcal / 21 P / 6.3 F / 59 C per 100 g, photo `avena_pro.jpg`) — used ONLY when the user explicitly says "avena pro".

## Objectives
1. **Website / document** (`tracker.html`) — one-pager to share with a nutritionist or keep for yourself: workout, body comp, diet. Pure HTML, **no JavaScript**.
2. **Daily macro analysis** — the user reports everything they ate; the agent calculates the summary (kcal, P, F, C) in a chat table, archives it in `macro-analysis.md`, and **updates the HTML diary in parallel**.
3. **Weigh-in tracking** — every week (or chosen cadence) the user weighs in with a smart scale and saves the screenshot; the agent updates the body comp section with carousel + deltas.

## Quick start (new instance)
1. Copy this folder into a new project.
2. In `tracker.html`: replace "Name" (brand/h1/footer), the hero chips (`MM/DD/YYYY`, `XX.XX kg`…), the section 04 placeholders with the first weigh-in data, the 5-week dates, and the workout plan.
3. Reset `macro-analysis.md` (food table + days).
4. Tell the agent: "follow AGENTS.md" — the rest comes from the workflows.

### Workflow for a new day (diary)
1. Calculate macros: **first labels from photos** in `photos/<food_name>.jpg`; only if absent, use standard estimates.
2. Table in chat: item | portion | kcal | P | F | C + day totals + % kcal per macro.
3. Add the summary to `macro-analysis.md` (section `## Analyzed days`).
4. In `tracker.html` → Meal Log section: replace the `<div class="day-card empty">` for that day with a `<details class="day-card">` (summary: day + date + total kcal + mini meals; `dc-detail`: `table.foods` with `tr.m-mini` per meal + `dc-macro` with P/F/C totals). **Each food row uses the current pattern (with `tabindex` and `.fkcal`)** — see "Food table structure" at the bottom of this file.
5. Update `.ws-days` (N/7) and `.ws-total` (week total kcal) in the week's `.wk-summary`.
6. If the day is in a week that doesn't exist yet: duplicate `radio` + `label` + panel `.wkN` + CSS rule `#wkN:checked ~ .diet-zone .wkN` (radios must stay as **siblings** of `.wk-tabs`/`.diet-zone`, NEVER inside `.wk-tabs`).

## Role of files (data vs workflow)
- `AGENTS.md` — the **how** (workflow, structure, conventions) + weigh-in archive (scale data).
- `macro-analysis.md` — contains **ONLY food values**: nutrition tables for foods (from label photos) and daily macro summaries. No workflow instructions, no weigh-in data.
- `tracker.html` — the one-pager (HTML, no JS). **Single source of visible data**.
- `_validate_mechanics.js` — Node script that validates carousel mechanics without rendering: `node _validate_mechanics.js tracker.html`. Use after changes to radio/carousel structure.
- `photos/` — food labels (`.jpg`), weigh-in screenshots (`weighin_XX_YY.jpg`), handwritten routine sheet if applicable.

**Photo convention**: every food with a scanned label → `photos/<food_name>.jpg` (snake_case, ascii name). Always use label values for macros first; only foods without photos (eggs, apple, banana, raw rice, chicken, olive oil…) are estimated.

## Operating workflow
> Mandatory operating rules for every session. This is the "how to do it", not the "what".

### 1. Binding rule (repeated)
- **ALWAYS a working file `test-*.html` first** (copy of `tracker.html`), always. Only after user confirmation: port the change to the main file.

### 2. Automated visual verification with Playwright (DO NOT ask for manual screenshots)
Before delivering a CSS change, **always verify** it with headless screenshots. Commands (from the project folder):
```
# base screenshot (viewport 1280x900):
npx -y playwright screenshot --viewport-size=1280,900 file:///<path>/tracker.html out.png

# full page:
npx -y playwright screenshot --viewport-size=1280,5200 --full-page file:///<path>/tracker.html out.png

# other breakpoints: 1280 (desktop), 900 (tablet 760px+), 420 (phone 480px-)
```
**Trick for collapsed diary**: filled days are `<details class="day-card">` (closed by default). To see them in the screenshot, make a **temporary copy** of the file with `open` added:
```
python -c "src=open('tracker.html',encoding='utf-8').read().replace('<details class=\"day-card\">','<details class=\"day-card\" open>'); open('tmp-open-check.html','w',encoding='utf-8').write(src)"
```
and shoot the copy (NOT the original file). **Clean up `tmp-*` files and screenshots at end of session.**

**Loop debug rule**: if a CSS change doesn't produce the expected effect, DON'T immediately ask the user "how does it look" — first create a **minimal isolated HTML page** (just the card in question, same CSS, same colgroup 47/53%) and test variants (A, B, C…) with side-by-side screenshots. Only when you have a working solution in isolation, port it to the real file and re-verify. This solved the 50–53 bug in 1 cycle instead of N.

### 3. Non-negotiable CSS rules (memory)
- **`word-break:break-word` NEVER** on food name elements (`.f-lead-txt`, `.fname`, …). Breaks per-character in narrow columns → vertical text. Use `overflow-wrap:normal` (breaks only on spaces) or `overflow-wrap:break-word` (only words that don't fit).
- **`.f-lead` = `display:flex`, NEVER `display:grid`** (see bug 50–53 history below).
- **`.f-item` = `display:block`**, NEVER `display:flex`: the child `.f-lead` width:100% inside a flex container doesn't resolve width and the name collapses to 0.
- **`.fporz` always on row 2, under the icon, `margin-left:0`, never inline**.
- **`.f-lead-txt` max 2 lines with ellipsis** (`-webkit-line-clamp:2`): the compromise to keep kcal always visible even with very long names.

### 4. Working file convention
- **No temporary files left behind**: `tmp-*.html`, `tmp-*.png`, `*.png` screenshots → delete at end of session.
- **AGENTS.md must be updated at EVERY significant change** (CSS, structure, workflow). This file is the project memory: if a rule isn't here, it's as if it didn't exist in the next session.

## Style / design (binding rules)
- Single page, dark "gym site" look (accent `#ff4d2e`, bold uppercase). One file, inline CSS, **no JavaScript** (carousels = radio + `:checked ~`, expansions = `<details>`).
- Breakpoints: `960px`, `760px` (tablet), `480px` (phone).
- **CSS traps already resolved — DO NOT reopen**:
  - Horizontal overflow on phone: `table-layout:fixed` + `max-width:100%` + `<colgroup>` (47/53%, 2 columns) on `table.foods`; `.f-macros{white-space:nowrap}`; compact nav on phone with `overflow-x:auto` fallback; safety net `html,body{overflow-x:clip}` — **`clip`, never `hidden`** on html/body (creates a scroll context and breaks smooth scroll on anchors).
  - Double meal title: on tablet/phone `tr.meal-row{display:none}` + `tr.m-mini{display:table-row}`; on desktop the opposite. **Never** hide the macro cells in any responsive block: the macros would disappear.
  - `scroll-margin-top:56px` on sections (sticky nav, anchor jumps).
  - Body composition on phone: `table.comp` → stacked cards (td `display:block`, thead hidden).
  - **kcal+"Kc" atomic**: `.fkcal{display:inline-flex;white-space:nowrap;flex:0 0 auto;}` (never break "Kc" under the number).
  - **Expandable name WITHOUT JS**: `tabindex="0"` on every `.f-lead-txt` + `:focus{display:block;-webkit-line-clamp:unset;...}` → click/tap expands the full name, click outside collapses.
  - **P·F·C right-aligned in cell**: `.f-mcol{text-align:right;}`.
  - **Day card symmetry**: `.day-card{display:flex;flex-direction:column}` + `.dc-detail` and `.dc-macro` `flex:1 1 auto` → the summary always anchors to the bottom, week cards are equal height.
  - **Portion always visible**: `.f-lead > .fporz{flex:0 0 auto;max-width:100%;overflow:hidden;}` — the badge doesn't exceed the right border of the cell.

## Repo rule (binding)
- **`foto/` is LOCAL-ONLY — never committed.** Only images in `photos/` that feed the site (new food labels, weigh-ins, meal photos) may go to git, and **only when the user explicitly asks**.
- **Never push files without explicit user consent.**

## Platform layer & motion (applied — DO NOT regress)
> Small CSS/meta fixes that make the page feel installed, not "a website in a browser". Already in `tracker.html`; any new CSS must follow these rules.

- **Easing vars in `:root` (ALWAYS these, never ad-hoc `ease`/`cubic-bezier`)**: `--ease: cubic-bezier(.25,.46,.45,.94)` for color/background/border transitions (120–200ms); `--ease-out: cubic-bezier(.23,1,.32,1)` for transform/rotate/scale (180–240ms, never under 150ms).
- **Meta (head)**: `viewport-fit=cover` + `interactive-widget=resizes-content`, single dark `theme-color`, `html{scroll-behavior:smooth;overflow-x:clip;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%}`.
- **`:hover` ALWAYS inside `@media (hover:hover) and (pointer:fine)`** — on touch it creates stuck hover (row highlighted after tap). Any new `:hover` goes there, never top-level.
- **`:active` press feedback on controls**: `transform:scale(.97)` + darker bg/border, replacing hover on touch (nav links, week/weigh-in tabs).
- **`touch-action:manipulation` + `user-select:none` ONLY on controls** (nav links, tab labels, day-card summary, `.f-lead-txt`): removes 300ms tap delay; informational text stays selectable.
- **`@media (prefers-reduced-motion:reduce)`**: disables smooth scroll and transitions (respects OS setting).
- **`100vh` NEVER** — use `dvh` if a viewport height is needed. No `overscroll-behavior` on html (pull-to-refresh is welcome).
- `::-webkit-details-marker{display:none}` on day-card summaries (native marker replaced by `.dc-chev`).

## Food table structure (diary)

### Layout: 2 columns — colgroup 47/53

| Column | `td` | Width | Content |
|--------|------|-------|--------|
| 1 | `<td>` (no class) | 47% | `<div class="f-item"><span class="f-lead">…</span></div>` |
| 2 | `<td class="f-mcol">` | 53% | `<span class="f-macros">P·F·C</span>` |

### `.f-lead` — row structure (to use for EVERY food)

```
<span class="f-lead">
  <span class="ficon">🥛</span>              ← icon (FIRST)
  <span class="f-lead-txt" tabindex="0">
    <span class="fname">Kefir</span>         ← name (SECONDARY, expandable on click)
  </span>
  <span class="fkcal"><span class="f-kcal">46</span><span class="kcal-u">Kc</span></span>  ← kcal+"Kc" atomic (THIRD)
  <span class="fporz">100 ml</span>           ← portion (FOURTH, row 2)
</span>
```

**Base CSS (desktop + tablet + phone) — FLEX, NOT GRID (bug 50–53 closed)** — canonical copy in `tracker.html` ("FOOD ROW" block):
```
.f-lead{display:flex;flex-wrap:wrap;align-items:flex-start;column-gap:6px;row-gap:2px;min-width:0;max-width:100%;width:100%;}
.f-lead .ficon{flex:0 0 auto;font-size:16px;line-height:1.2;}
.f-lead .f-lead-txt{flex:1 1 auto;min-width:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.f-lead .fkcal{flex:0 0 auto;display:inline-flex;white-space:nowrap;}   ← kcal+"Kc" atomic (NEVER split)
.f-lead .f-kcal{font-weight:800;font-variant-numeric:tabular-nums;}
.f-lead .kcal-u{font-size:10px;}
.f-lead > .fporz{flex:0 0 100%;max-width:max-content;}                ← portion ALWAYS row 2, under the icon
.f-item{display:block;width:100%;min-width:0;overflow:hidden;max-width:100%;}
.f-item .fname{overflow-wrap:normal;font-size:13px;font-weight:600;line-height:1.3;}
.f-item .fporz{font-weight:800;font-variant-numeric:tabular-nums;color:var(--accent2);font-size:10.5px;background:rgba(255,210,63,.08);border:1px solid rgba(255,210,63,.22);border-radius:5px;padding:1px 6px;line-height:1.3;}
.f-mcol{min-width:0;text-align:right;}
.f-macros{font-size:11px;white-space:nowrap;line-height:1.5;}
.f-macros .sep{display:block;width:100%;font-size:0;height:0;}   .f-macros .u{font-size:9px;}
```

**Responsive (≤760px / ≤480px)**: the per-meal summary row (`.m-mini`) replaces the meal title (`.meal-row` → `display:none`), and the food table switches to the compact phone metrics (`.fname` 12px, `.f-macros` 10px / `.u` 8.5px, tighter `td` padding).

**Bug history (DO NOT reopen)**:
- `.f-lead` was `display:inline-flex` → didn't occupy the cell → kcal value positioned AFTER the name → variable position.
- **Grid attempt** (`display:grid; grid-template-columns:auto minmax(min-content,1fr) max-content max-content`): **DOES NOT WORK** — with `table-layout:fixed` + colgroup 47% the first `<td>` cell is ~50–120px; the CSS Grid contention resolution, with a breakable name (min-content ≈ 1 char), gives ~0px to the `1fr` column and the name goes **vertical**. `minmax(0,1fr)` makes it worse. **Grid with `table-layout:fixed` + colgroup % is a dead end for this pattern.**
- **SOLUTION (flex)**: `display:flex; flex-wrap:wrap`. `.f-lead-txt{flex:1 1 auto;min-width:0}` ALWAYS takes the space between icon and kcal (row 1, never 0); `.f-kcal`/`.kcal-u` (inside `.fkcal`) don't compress the name and stay in row 1; `.fporz{flex:0 0 100%;max-width:max-content}` ALWAYS goes to row 2 under the icon, never inline. `flex-wrap:wrap` also fixes the order reversal on phone (icon after kcal).
- `.f-item` stays `display:block` (NOT flex).
- `word-break:break-word` **NEVER** on `.f-lead-txt` or `.fname`.

### HTML row structure (2 `<td>`) — to use for EVERY food
```
<tr>
  <td><div class="f-item"><span class="f-lead"><span class="ficon">ICON</span><span class="f-lead-txt" tabindex="0"><span class="fname">NAME</span></span><span class="fkcal"><span class="f-kcal">NNN</span><span class="kcal-u">Kc</span></span><span class="fporz">PORTION</span></span></div></td>
  <td class="f-mcol"><span class="f-macros"><span class="mv">NN</span><span class="u">P</span><span class="sep">·</span><span class="mv">NN</span><span class="u">F</span><span class="sep">·</span><span class="mv">NN</span><span class="u">C</span></span></td>
</tr>
```

## Carousel structure (CSS-only mechanics)
- Carousels = `<input type="radio">` + `:checked ~` + CSS, **zero JS**.
- **Mandatory sibling order**: radios must be **TOP-LEVEL siblings** of tabs and zones (both inside the same `<div class="wrap">`), **NOT inside** the `.pz-tabs`/`.wk-tabs` containers — otherwise `:checked ~` never works.
- Rules for each panel:
  ```
  section#bodycomp input#pzN:checked ~ .pz-tabs label[for="pzN"]{ …active state… }
  section#bodycomp input#pzN:checked ~ .pz-zone .pzN{display:block;}
  ```
- **Never mix `pz` radios and `wk` radios**: they are two separate groups.
- **Always validate** after changes: `node _validate_mechanics.js tracker.html`.

### Diary
- 5 tabs Week 1–5 (extendable: duplicate radio + label + panel `.wkN` + CSS rules). Day-card placeholders show `DD/MM`.
- **Tab order (convention, fixed in this instance)**: week tabs in the order **current first** (leftmost, `checked`, with a `CORRENTE` badge via `<span class="wcur">`), then future weeks in chronological order, and **past weeks last** (dimmed, with a `PASSATA` badge via `<span class="wpast">` + `.wk-past` class on the label). When a new current week starts: move `checked` to the new radio, add its `wcur` badge rule, remove `wcur` from the old label, add `class="wk-past"` + `.wpast` badge to the old label, append its pill at the end of `.wk-tabs`, and add `wk-past` to the old panel's div (opacity .85 + dashed borders). CSS: `.wk-tabs .wk-past{opacity:.55;background:var(--bg2);}`, `#wkN:checked ~ .wk-tabs .wk-past{opacity:1;}` (for each past radio), `.wk-panel.wk-past{opacity:.85;}` + dashed borders on `.wk-summary`/`.day-card`.
- Each week: `.wk-summary` (`.ws-days` + `.ws-total`) + `.wk-grid` (7 columns → 4 on tablet → 1 on phone).
- Filled day: `<details class="day-card">`; to fill: `<div class="day-card empty">`.
- `table.foods` tables have NO `<thead>` and use `<colgroup><col style="width:47%"><col style="width:53%"></colgroup>` (2 columns).

### Weigh-ins
- pz1 = latest weigh-in (checked, on top, with Δ vs previous); pz2… = reverse chronological archive (no deltas).
- Tab with counter `(N)`. Hero chips + section tag + footer always reflect the latest weigh-in.

## Weigh-in archive (scale)

> Source: scale app screenshots saved in `photos/weighin_XX_YY.jpg`. Values shown in `tracker.html` (section 04, carousels pz1/pz2/…) always reflect the latest weigh-in.

| # | Date | Weight (kg) | BMI | %Fat | Fat mass (kg) | %Muscle | Muscle mass (kg) | BMR (kcal) | Metabolic age |
|---|------|-------------|-----|------|---------------|---------|------------------|------------|---------------|
| 1 | … | … | … | … | … | … | … | … | … |

Δ 1→2: (to be filled)

## Weigh-in workflow — adding a new weigh-in (weekly cadence)
> Source: scale app screenshot saved in `photos/weighin_XX_YY.jpg`. This is the "how": the VALUES live in the "Weigh-in archive" table (above) and in the HTML file, NOT in `macro-analysis.md`.

1. **Save the screenshot** of the weigh-in in `photos/weighin_XX_YY.jpg`.
2. **Update the "Weigh-in archive"** in this file: new row in the table + Δ row vs previous.
3. **In `tracker.html`, section 04 (pz carousel)**:
   - Move the `checked` attribute from the current radio (pz1) to the new radio.
   - Add `<input type="radio" name="pz" id="pzN" checked>` — **sibling** of existing `pz` radios, NOT inside `.pz-tabs`.
   - Add `<label for="pzN">Weigh-in (N)</label>` in `.pz-tabs` (N = total number of weigh-ins).
   - Add the panel `<div class="pzN">`: copy the existing `pz1` panel, replace values with the new ones, **add the `div.delta`** (Δ vs previous: weight, BMI, % fat, fat mass, % muscle, muscle mass, BMR, metabolic age) — archive panels have NO deltas.
   - The old `pz1` panel STAYS as-is (its `div.delta` remain, they are relative to the previous weigh-in) and simply becomes archive (no more `checked`).
   - Add the CSS rules (same schema as existing): copy the `#pz1:checked ~ …` selectors and change the number.
4. **Update the 3 points that reflect the latest weigh-in** (ALWAYS the latest):
   - **Hero chips**: Weight (kg) + measurement date.
   - **Section 04 tag**: weigh-in date.
   - **Footer**: list of weigh-in dates.
5. **Validate**: `node _validate_mechanics.js tracker.html` → all `pz` and `wk` radios present, correct sibling order, exactly ONE `checked` per group.
6. **Playwright visual verification**: screenshot of the section 04 area to check the new card is the visible one and deltas are correct.

## TODO (to customize in the instance)
- [ ] **Real goal** (cutting / bulking / recomposition) — hero chip.
- [ ] **Height, age, sex** — to be entered in an info box.
- [ ] **Meal times** (if requested).
- [ ] Rename placeholders `MM/DD/YYYY`, `XX.XX kg` throughout the page at the first weigh-in.
