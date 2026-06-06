# Mali Journal — Round 3 spec (Jun 5 2026 review)

Compiled from `mali-source/Mali 2026 New Journal.pptx` (slides **3–23** only),
the `mali-source/Jonas6June.md` transcript, and 7 annotated screenshots Sudhir
sent (the drawn X-marks / strikethroughs that text extraction can't carry).
Comments were read straight from the deck XML (`ppt/comments/*.xml`) and mapped
to true slide numbers; Jonas's reference mockups were read from the embedded
PNGs. This is the source of truth for round 3 — fold into [SPEC.md](SPEC.md)
once shipped.

## Phase plan (Sudhir's call)

- **Phase 1 — everything NOT chart/graph related. Build now.**
- **Phase 2 — the charts & graphs (the main ask). Next, separately.**

Decisions locked: Contractions CTA → **"End session"** (follows the written
comment; the transcript "not" is an ASR slip). `…` clarified as the dead 3-dot
ellipsis to delete everywhere.

### Phase 1 status — ✅ DONE & verified (Jun 6)
All 11 non-chart items shipped; `tsc --noEmit` clean; headless-Chrome QA passed
on every changed state (incl. contraction "00:01 since last contraction" inline,
nursing Live dual L/R timer, Kicks Mali-baby popup, `/log` Care merge, de-"My"
mom tiles, temperature fever banner, `…` removed). Files touched:
`categories.ts`, `log/page.tsx`, `log/[category]/page.tsx` (contractions, kicks,
hydration units, dual-timer `NursingForm`, `DoneBar` label), `journal/entry/[entryId]/page.tsx`,
`journal/category/[id]/page.tsx` (temp warning), `components/ActiveTimerChip.tsx`,
`lib/mock-entries.ts` (nursing meta → `(L)/(R)`).

### Phase 2 status — ✅ DONE & verified (Jun 6)
All chart items shipped; `tsc --noEmit` clean; headless-Chrome QA passed on every
new chart. New `components/CategoryBarChart.tsx` — a shared "last 30 days" bar
chart (deterministic representative data; real data is backend-supplied) wired
for **sleep** (grouped Baby/Mom bars + toggle, s9), **nursing** (stacked
yellow=success / grey=failure, s10–12), **pumping/bottle** (ml, s13–14),
**diaper** (stacked by type + legend, s15), **temperature** (≥38 °C in red, s16),
**water** (+2.5 L reference line, s17). New `components/MomWeightChart.tsx` —
phase-aware: pregnancy = ideal-gain band, parenting = last-12-months (s18).
Milestone `SigmoidChart` axes fixed — `%`/`100` no longer collide, clean months
row (s3). `PatternSection` (old 7-day dots) removed.

### Phase 2 refinements (Jun 6 — slide-by-slide synthesis pass with Sudhir)
Re-checked every chart against the written deck comments **and** the meeting
transcript together. Five refinements shipped + verified (headless Chrome,
populated mode):
- **Nursing → per-session segments** (comment6 "Indicate sessions" + L127): each
  day's bar is now a stack of individual sessions, each its own yellow/grey block
  with a thin gap — not the earlier aggregate success/fail split. `CategoryBarChart`
  gained a `sessions` config + render branch.
- **Water → 2.5 L ghost-bar behind** (comment10 "show in light behind" + L149):
  replaced the horizontal reference line with a faint full-height target bar
  behind each day's actual intake (`ghost` config; `refLine` removed).
- **Diaper → TYPE filter + Wet/Dirty labels** (slide 15 mock): the series toggle
  (was sleep-only) generalised to a `toggle` config; diaper relabelled Pee/Poo →
  **Wet/Dirty** to match the app's entries + his filter pills.
- **Bottle + Temperature → "Read more"** links wired to two new article stubs
  (`bottle-feeding-amounts`, `newborn-fever` in `lib/articles.ts`).
- **Sleep → dynamic blurb** that follows the toggle (baby guidance, mom guidance,
  or both) — also closes the slide-9 mom-guidance-copy gap.

Decisions confirmed with Sudhir (Jun 6): keep avg in the footer (not Jonas's
top-right); milestone m-face PNG stays a harmless fallback (Jonas's "raw data in
the backend", L75, makes the live SVG the real path). Contraction "End session"
(s22 comment12 `Call CTA "End session"` vs ASR "not"/"now") and nursing
Poor/Good/Great (vs the binary he floated then walked back, L131) both stand.

## Traceability — slides 3–23

| Slide | Ask | Phase |
|---|---|---|
| 3 | Milestone chart: render from data, fix cramped `%`/`100` + months axis ("Show original") | **2** |
| 4 | Between-contractions timer reads "…since last contraction" | 1 — *likely already done, verify* |
| 5 | "FEEDBACK 5.6" divider | — none |
| 6 | Merge Food+Activity → **Care** on `/log`; **remove "My"** from mom tiles | **1** |
| 7 | Pregnancy tiles vary by trimester | — backend |
| 8 | Show nursing side **(R)/(L)** on entries | **1** |
| 9 | **Sleep**: last-30-days bars + **mom/baby toggle** | **2** |
| 10–12 | **Nursing**: 30-day success/fail bars; CTA→**SUCCESS/FAILURE**; **left & right** timing; *(remove `…`)* | 1 (form) + 2 (chart) |
| 13 | **Pumping**: last-30-days **ml** bars | **2** |
| 14 | **Bottle**: last-30-days **ml** bars | **2** |
| 15 | **Diaper**: last-30-days **stacked bars by type** (pee/poo/mixed/clean/other colors) | **2** |
| 16 | **Temperature**: 30-day chart, **≥38° red**, **fever warning** | 1 (warning) + 2 (chart) |
| 17 | **Water**: 30-day + 2.5 L line; form units **Gulp 50ml / Small Glass 150ml, remove Other** | 1 (units) + 2 (chart) |
| 18 | **Mom weight**: pregnancy="Ideal weight gain", parenting="Last 12 month" (current TREND is X'd out) | **2** |
| 19 | reference image | — none |
| 20 | tracking on lock screen / desktop | — native widget, out of scope |
| 21 | "Show original" | — reference |
| 22 | **Contractions**: "Done"→**"End session"**; **remove** session-stats lines | **1** |
| 23 | **Kicks**: 🎉 in "Great!" popup → **Mali baby** illustration | **1** |
| (all) | Remove dead **`…`** ellipsis menu from every header | **1** |

---

## PHASE 1 — non-chart (build now)

### 1. Remove the dead `…` ellipsis (global) — *slide 12 "remove here and everywhere"*
The 3-dot "More" button does nothing. Delete it everywhere and keep headers balanced.
- `src/app/(prototype)/log/[category]/page.tsx:58` — `<button aria-label="More">` → replace with `<span className="w-9" aria-hidden />` (the spacer the category-detail header already uses).
- `src/app/(prototype)/journal/entry/[entryId]/page.tsx:74` — same.
- Grep for any other `aria-label="More"` before closing out.

### 2. `/log`: merge **Food + Activity → "Care"** — *slide 6 (Food/Activity struck through, "Combine in Care like in Memories")*
Moments already groups these as "Care logs"; the `/log` composer still shows two green groups. Combine into one **Care** section.
- `src/app/(prototype)/log/page.tsx` — `GROUP_ORDER` (line 20) and the render (line 142). Render Food + Activity under a single "Care" header (concatenate the two groups; drop the separate Activity header). `groupLabel` (line 32) can map the merged section's title to "Care".
- Order becomes: Memories · **Care** · Growth rate · Health · Mom's wellbeing · Pregnancy.
- Leave the `group` field on categories untouched if possible (Moments + tile colors key off it) — do the merge at the `/log` render layer.

### 3. Remove **"My"** from mom category labels — *slide 6 ("Take out My", X over Weight tile)*
Pink/MOM treatment already signals "mom"; the prefix is redundant + too long.
- `src/lib/categories.ts:63–67`: `My Weight`→`Weight`, `My Mood`→`Mood`, `My Symptoms`→`Symptoms`, `My Water`→`Water`, `My Sleep`→`Sleep`.
- **Known collision:** baby already has "Weight"/"Mood"/"Sleep". Accepted — they're differentiated by the pink MOM color and the separate "Mom's wellbeing" section. Confirm the MOM badge/pink still reads on every surface after the rename.

### 4. Contractions: **"Done" → "End session"** + remove session-stats — *slide 22*
- **CTA rename:** `DoneBar` (`src/app/(prototype)/log/[category]/page.tsx:1120`) is **shared by Kicks and Contractions** and hardcodes "Done". Add a `label` prop; Contractions (call site ~line 916) passes **"End session"**, Kicks keeps **"Done"** (screenshot 7 shows Kicks still says Done).
- **Remove stats lines** (X drawn over them): `:887` `{count} this session · avg {avgDurSec}s …` and `:892` `{…} contractions logged today`. Delete from the live screen. **Keep** writing the summary stats into the saved entry on End — only the on-screen clutter goes.

### 5. Contractions: "00:08 since last contraction" inline wording — *slide 4*
The state-swapped clock already exists (`:846–857`, shipped in `abb5f0c`) but renders the value over a separate "Since last contraction" label line. Jonas wants it to read as one phrase — **"00:08 since last contraction"**. Render the value and the phrase together (value prominent, "since last contraction" inline/adjacent) so it matches his quote.

### 6. Kicks: 🎉 → **Mali baby** illustration — *slide 23*
- `src/app/(prototype)/log/[category]/page.tsx:747` — `<div className="text-5xl">🎉</div>` in the "Great!" completion popup → swap for a Mali baby raster (`public/mali-art/…`) via `<Image>`, or an `<Illustration>` baby glyph. Brand-critical mascot, so prefer the production art if a fitting baby asset exists.

### 7. Nursing: outcome rating — *slide 12 ("change the CTA to be SUCCESS and FAILURE")*
Latching ≠ feeding; capture how the session went. **Final (Sudhir Jun 6):** an
**optional 3-level quality** — Poor / Good / Great (the nuance Jonas floated in
the meeting), nothing pre-selected, tap to clear — instead of a forced
Success/Failure toggle (softer for a postpartum app, and visually distinct from
the Manual/Live mode toggle). Lives in `NursingForm`; persisted on the entry
meta. The Phase-2 chart keeps Jonas's binary yellow=success / grey=failure
encoding (Good/Great roll up to success, Poor to failure).

### 8. Nursing: **left & right** per-side timing — *slide 12 ("introduce left and right for the time"; reference = two timers)*
Their reference (image22) shows two stopwatches, one per breast, each timed, with a Pause + side toggle. Today we have a single Left/Both/Right pill (`:281–288`).
- **Decision: full dual timer.** Track **left and right durations separately** — two stopwatches in Live mode (run/pause each side, like their reference), two Start/End pairs in Manual. The entry records per-side time. Reuse the category-keyed `ActiveTimer` by keying sub-timers `nursing:left` / `nursing:right`. This is the largest Phase-1 item.

### 9. Nursing: show side as **(L)/(R)** on entries — *slide 8 ("2 min ago (R)", "2h 3m ago (L)")*
Side is baked into `meta` at `:342` (`parts.push(side)`) and rendered raw by `JournalEntryCard`. Format nursing side as **(L)/(R)** wherever entries show (entry rows, feed quick-logs, "Right now").

### 10. Water: add units **Gulp (50 ml) / Small Glass (150 ml)**, remove **Other** — *slide 17*
`hydration` is `formKind: "event"` and uses the preset-chip picker (the "Other" sentinel lives at `:1132`). For water specifically: add **Gulp = 50 ml** and **Small Glass = 150 ml** chips and **drop the "Other" chip**. (The 2.5 L reference line + 30-day chart are Phase 2.)

### 11. Temperature: **fever warning** banner — *slide 16*
Add a static warning on the temperature detail (and/or form): *"For newborns, a temperature of 38 °C or higher is a medical emergency — see a doctor immediately."*
- `src/app/(prototype)/journal/category/[id]/page.tsx` (temperature is `cat.id === "temperature"`). (The "≥38° in red" chart coloring is Phase 2.)

---

## PHASE 2 — charts & graphs (next)

The spine: **one shared `Last30DaysBarChart`** (Jonas's reusable mockup — ~30
rounded-top bars on faint gridlines, endpoints "30 days ago / today", a
"N daily avg" footer), with per-category modes. This **replaces** the current
`PatternSection` (24h dot-density, "last 7 days") and `ChartSection` dots for
the care/health trackers, and **adds** charts where there are none today
(temperature, water). All live in
`src/app/(prototype)/journal/category/[id]/page.tsx`.

| Category | Slide | Mode | Axis / encoding |
|---|---|---|---|
| **Sleep** | 9 | grouped bars + **mom/baby toggle** (check mom / baby / both) | total hours/day, 0–20 h; two bars/day when both shown |
| **Nursing** | 10–12 | **stacked** bars | minutes/day, 0–500; **yellow=success, grey=failure**; indicate sessions |
| **Pumping** | 13 | bars | **ml**/day, 0–1000 |
| **Bottle** | 14 | bars | **ml**/day, 0–1000 |
| **Diaper** | 15 | **stacked by type** | pee=yellow, poo=brown, mixed=tan, clean=light-grey, other=dark-grey + legend |
| **Temperature** | 16 | points/bars | 37–41 °C; **≥38° in red** (pairs with the Phase-1 warning) |
| **Water** | 17 | bars + reference line | litres/day, 0–3 L; faint **2.5 L recommended** line |

**B. Mom weight (slide 18)** — phase-aware, replacing the X'd-out "TREND · Last 12 weeks":
- **Pregnancy →** "Ideal weight gain": kg vs gestational week, shaded ideal-range band, "based on your pre-pregnancy weight of 50 kg and height 160 cm, you should now have gained 10.8 kg."
- **Parenting →** "Last 12 month": kg over 12 months (gain-then-loss shape).
- Code: `ChartSection` `weight-mom` branch (`Y_RANGE["weight-mom"]`).

**C. Milestone chart (slide 3)** — `SigmoidChart` (`milestone/[milestoneId]/page.tsx:456–518`):
- Fix the **y-axis collision** — the `%` unit (`:515`) overlaps the `100` tick (`:494`); make 100 a clean top.
- Fix the **months x-axis** (`:499`) — clean month ticks, label clear of the last tick.
- Render from real data (backend will supply it per Jonas) → can retire the `m-face` image-mode hack once data-rendered matches their original.

---

## Out of scope / backend / no action
- **Slide 7** — pregnancy tiles by trimester: backend logic.
- **Slide 20** — lock-screen / desktop live tracking: native iOS/Android widget (Jonas confirmed it's theirs, no design from us).
- **Slides 5 / 19 / 21** — divider / reference / "show original".
- **Multiple babies on one sleep graph** — deferred; ship the mom/baby toggle now, multi-baby later.

## Resolved decisions (Sudhir, Jun 6)
1. **Nursing per-side (slide 12):** **full dual timer** — two stopwatches (left/right), per-side durations recorded.
2. **Contraction stats (slide 22):** **remove both** "N this session · avg Xs" *and* "N contractions logged today".
3. **Slide 4 wording:** **implement inline** — "00:08 since last contraction".
