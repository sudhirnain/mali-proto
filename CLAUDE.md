@AGENTS.md

# Mali journal redesign — project conventions

## Live deployment

Production alias: **https://mali-proto.vercel.app** (Vercel scope `sudhir-nain-s-projects`, project `mali-proto`). Re-linked 2026-05-27 after the old `sudhir-4400` account became inaccessible. Deploy with `vercel deploy --prod --yes` — the alias auto-updates because `mali-proto.vercel.app` is registered as the project's production domain (set 2026-05-29 via `vercel domains add`). No external deps — pure mock data, deploys clean. If the URL hits a Vercel auth wall, fix at Project settings → Deployment Protection (the new project still has Standard Protection on as of 2026-05-28).

GitHub: **https://github.com/sudhirnain/mali-proto** (private). Local `.vercel/project.json` is gitignored; re-link from CLI if it's missing or stale.

The shareable demo lands a stranger on `/feed` (root redirects there via `(prototype)/page.tsx`). The DemoNavigator widget — always visible top-right on desktop, compact pill on mobile — is the discovery surface. It has Phase / State / Jump to / **In case you missed** sections. No separate welcome flow.

## Source of truth

**Primary spec: [SPEC.md](SPEC.md) at the project root.** Compiled 2026-05-28 from the email + meeting transcript + 56-slide review deck. Part A = cross-cutting decisions; Part B = slide-by-slide. Start here before touching any screen.

Underlying sources (all under `mali-source/`, gitignored):
- `feedback.pptx` — May-22-to-May-28 review deck with Jonas's 38 active comments (56 slides)
- `deck-extracted.txt` — plain-text extraction of every slide + comment (author/timestamp/position/body)
- `feedback.txt` — May-28 meeting transcript
- `design-deck.pdf` — the original brief (page 14 lists explicit feed/journal goals)

Reference apps:
- **My Baby** (positive reference) — screenshots IMG_9049 / 9050 / 9055 / 9060 / 9062 / 9063 / 9064 in `mali-source/screenshots/`. Jonas's slide 30 comment *"we pref this one"* anchored on My Baby's Sleep form — copy that pattern for our timer forms (Daytime/Night toggle, Start/End fields, Comments, Add photo).
- **Current Mali** (the UX we're replacing — Sudhir called it "terrible") — IMG_9042-9048 and the screen recording `mali-source/production-flow.mp4`

## What's in scope / out of scope

**In scope:** the feed (header + content), the journal (Timeline / Moments / Calendar / Category detail / Entry detail), entry forms, mom-experience track for both pregnancy AND parenting, birth-handoff celebration, memory threading.

**Explicitly out of scope:**
- Onboarding funnel. The `(onboarding)` route group was deleted on 2026-05-20. Don't reintroduce it without asking.
- **Trimester archive page** — dropped 2026-05-28 per Jonas's slide 23 strikethrough + transcript: *"we don't need this trimester and open chapter"*. The `/journal/trimester/[t]` route should be deleted along with the trimester chapter wrappers in Timeline.

## Journal IA (locked)

Three tabs on `/journal`, each a different browsing axis — **same entries, three lenses**:

- **Timeline** (`/journal`) — chronological, day-grouped. **No more trimester chapter wrappers** (dropped 2026-05-28 per slide 11 comment "I think this can go"). Just plain day-grouped entries.
- **Moments** (`/journal/moments`) — by topic. Phase-aware section grouping; **Memories first** to enforce the family-record framing.
- **Calendar** (`/journal/calendar`) — month grid with photo/tint cells.

**Moments sections (locked)**:
- Parenting: Memories · Development (hero=milestones, plus weight-baby / length / head tiles) · Care logs · Health (**baby `mood` leads here** — see below) · **Wellbeing (mom)** — mom-mood, symptoms, sleep-mom, weight-mom continue in parenting per Jonas's slide 13 comment about post-birth weight tracking
- Pregnancy: Memories · Your journey (hero=JourneyHero with "3rd trimester" + Week + size + due date + progress) · Body (kicks, contractions) · Wellbeing (mom-mood, symptoms, hydration, sleep-mom, weight-mom) · Health (doctor)

**Baby mood (Jonas round-2 s13 "reduce to one … move it up to Health"):** the old four baby-mood categories (`cheerful`/`fine`/`sad`/`crying`, group "Mood") were collapsed into a **single `mood` category** (`group: "Health"`, parenting) that opens a mood picker (Cheerful/Fine/Sad/Crying/Other — the same `MomMoodPicker` component, branched on `cat.id === "mood"`). The "Mood" `CategoryGroup` is now unused (no longer in `GROUP_ORDER`). `mom-mood` ("My Mood") stays a separate mom tracker in **Mom's wellbeing**, NOT merged with baby mood. (An earlier pass wrongly moved *mom-mood* to Health — reverted.)

**Don't revert** to a peer-level "Milestones" tab. Milestones is a category (`/journal/category/milestone`), reached as the hero in the Development section. Growth merged into Development for parenting — they're both "how is baby developing." Wellbeing is the mom-experience vertical, present in BOTH phases.

## Phase philosophy ("EY baby-first, pregnancy mom-first")

Client direction, drives every header decision. Parenting (Early Years) centers the **baby**: Lu's name, age, length, weight, baby-care quick-logs. Pregnancy centers the **mom**: Sarah's name, mom-weight, mom-experience quick-logs.

In pregnancy `StatStrip` (post 2026-05-28 redesign): left ring = mom weight, center = mom illustration + Sarah's name + ageLabel ("Week 32, Day 4"), right ring = **baby weight 200g + "Baby's weight" + estimate marker** (NOT user-editable per transcript — comes from backend). The previous fruit-emoji baby ring is replaced. The center mom-figure migrates to the per-week watercolor illustration per slide 4 *"change to weekly image"*.

Cold copy reads "Welcome, Sarah" in pregnancy. In parenting the center label is **Lu (baby name)**, per Jonas's slide 4 comment *"Needs to be the baby name (we hardly have the moms name)"*. Parenting also keeps a mom affordance (TBD design — pill, side strip, or section) since mom continues tracking post-birth.

The right ring in pregnancy alternately surfaces **due date** ("24.10.2026") per slide 4 *"This could link to due date"* — tap opens an edit-due-date sheet.

`/feed` body for pregnancy users surfaces `MyWeekCard` (mom-week content) above the tip/quote/CTA cards — pregnant users read about themselves, not the baby. Content from `src/lib/mom-content.ts` (handcrafted blurbs for weeks 6 / 12 / 20 / 28 / 32 / 36 with a fallback).

**Default landing state (set 2026-05-22):** Pregnancy + Populated. Set in [src/lib/phase.tsx:15](src/lib/phase.tsx) (`useState<Phase>("pregnancy")`). Rationale: pregnancy is Mali's differentiator vs My Baby; landing in pregnancy showcases the mom-first track AND sets up the birth-handoff demo. Don't default to parenting — a reviewer may never flip back and miss the peak moment.

## Color system (pink-only NOT yet applied — still teal-for-parenting)

**Reality check (corrected 2026-06-02):** the pink-only switch was *never actually shipped*. `globals.css` **still has the `[data-phase="parenting"]` override (lines ~93–99) flipping `--color-primary*` to teal** for parenting. So parenting chrome is teal today; pregnancy is coral. This is the open **A1** decision in SPEC.md (Jonas has asked for pink 3× — slide 54, the follow-up email, round-2 slide 13 — but it's still parked pending Sudhir's explicit call; full pink-only also requires updating the `BirthHandoff` coral→teal gradient). An earlier version of this doc wrongly claimed the override was removed — it was not.

The system: `--color-primary*` CSS variables resolve to coral at `:root`, teal under `[data-phase="parenting"]`. The `data-phase` attribute is set on the outer `<MobileFrame>` wrapper.

**Surgical exception (2026-06-02, Jonas round-2 s13 "make it all pink"):** the **MOM badge** on `/log` quick-log tiles uses `bg-[var(--color-coral)]` (the non-flipping coral var), NOT `var(--color-primary)`, so it stays pink even in parenting. This was the chosen scope — fix the mom indicator, leave the rest teal until A1 is decided. If/when full pink-only lands, this can revert to `--color-primary`.

Components consume via `bg-[var(--color-primary)]` / `text-[var(--color-primary-dark)]` / etc. — never hardcoded `bg-coral` (except the deliberate `--color-coral` MOM-badge case above), so future palette tweaks land in one place.

Categories keep their own colors (sleep = purple, nursing = green, diaper = amber, milestone = teal, etc.) — those are per-category, not per-phase. Unchanged.

Phase distinction now comes from **content**, not chrome: StatStrip subject (Mom vs Lu), default quick-logs (mom-experience vs baby-care), MilestoneHero (parenting) vs JourneyHero (pregnancy), MyWeekCard appears only in pregnancy.

`BirthHandoff` overlay was coral→teal; needs update to coral→cream or coral→deeper-coral so the "chapter change" still reads without invoking teal.

## Iconography

Three layers, in fallback order:

1. **Production art** (raster PNGs in `public/mali-art/`) — line-art milestone babies, weekly pregnancy heroes, colored category illustrations. Wired via two registries:
   - `src/lib/milestone-art.ts` — milestone IDs → `/mali-art/milestones/*.png`
   - `src/lib/category-art.ts` — category IDs → `/mali-art/category/*.png`
   Adding a mapping is a one-line edit. ~120 unlabeled `File_NNN.png` files sit in the public dir unused — Next only ships referenced files.
2. **Mali APK SVGs** (`MALI_ICON_SVG` in `src/lib/mali-icons.ts`) — extracted vector drawables. Watch for clip-path leaks: some entries have a giant background rect as the first path that needs stripping (see `kick` and `kick-stroke` for examples of fixes).
3. **Phosphor icons** (`@phosphor-icons/react` v2, mapped in `Illustration.tsx`) — utility fallback when neither of the above has a match.

`<Illustration name="…" />` checks in order: Mali SVG → Phosphor → empty-circle placeholder. The raster `mali-art` set is consumed directly by callers (not through Illustration) via `<Image>` from `next/image`.

Don't replace production art with Phosphor unless explicitly asked. Milestone mascots in particular are brand-critical.

## Production asset archives

Three zips in `mali-source/` (2026-05-21):
- `Milestones archieve-…-001.zip` — 156 line-art babies (28 named + 5 MS-numbered + 123 unlabeled)
- `Weekly update-…-001.zip` — 44 colored watercolor pregnancy heroes (`w1.png`..`w40.png` + postpartum)
- `drive-download-…-001.zip` — 6 colored category cartoons (height/head/weight/kicks/tummy-time/mom-weight)

Optimized copies live under `public/mali-art/{milestones,weekly,category}/`. If you re-receive a new batch, re-run the sips downscale (see git history for the exact commands).

## Tailwind 4 gotcha

`@theme inline { ... }` will TREE-SHAKE CSS variables that are only referenced via `var()` in inline `style={{}}` props — because Tailwind doesn't see them as Tailwind classes. This silently breaks dynamic styling.

Workaround already applied in `globals.css`: use `@theme { ... }` (no `inline` keyword) for the utility-class side, plus re-declare every category color under `:root { }` so `var(--color-cat-food)` etc. resolve in inline styles.

If you add new colors and want them usable in inline styles, declare them in both places.

**Includes neutral scale.** `--color-neutral-200/300/400/500` are also re-declared at `:root` because SVG chart strokes/text in category-detail and milestone-detail reference them via raw `var()` attrs (e.g. `stroke="var(--color-neutral-200)"`). Without the `:root` declaration, the gridlines render with no color. Added 2026-05-22 after the audit caught the silent breakage.

## Hydration

A browser extension was injecting `data-__host_prefix_...` on `<html>`, triggering React hydration warnings. Fixed via `suppressHydrationWarning` on `<html>` and `<body>` in `src/app/layout.tsx`. Don't remove those.

## Data layer

Entries and milestone state are **mutable React Context** (`src/lib/journal-store.tsx`), NOT immutable `MOCK_ENTRIES`. Read via `useEntries()` from `@/lib/journal-store`. Mutate via `useJournalStore()` (`addEntry`, `removeEntry`, `updateEntry`, `setMilestoneDone`).

Two slices — `live` (seeded from MOCK_ENTRIES + MILESTONES) and `cold` (empty) — selected by `useColdMode()`. The DemoNavigator's "Populated" / "Empty" toggle swaps them; mutations route to the active slice so each timeline keeps its own state.

`setMilestoneDone(id, label, when, extra?)` does triple duty: flips milestone status, inserts a `milestone:<id>` Entry into the journal, and (when `extra` is passed) attaches a user note (concatenated to meta with em-dash separator) and/or a photo. Pass `null` for `when` to unmark. The Capture form on the milestone detail page surfaces this — see "Milestone-as-memory" below.

`TODAY_DATE` in `mock-entries.ts` is dynamic — anchored to real today at 22:30 local. Entries the user adds during a session (which use `new Date()`) land in the same buckets as the seeded set. Don't hardcode TODAY_DATE back to a literal date unless you're recording a demo where reviewer must see the same state every time.

**Mom record** (pregnancy-centric): `src/lib/mock-baby.ts` exports `MOMS` and `FIRST_DAY_MOMS` (parallel to `BABIES`/`FIRST_DAY_BABIES`). Read via `useMom()` from `@/lib/cold-mode.ts`. Currently has `name` (default "Sarah") + `weight`. StatStrip and feed pages read latest `weight-mom` entry first, then fall back to `mom.weight` for cold-state.

**Pregnancy categories** added 2026-05-22: `mom-mood`, `symptoms`, `hydration`, `sleep-mom`. Quick-logs `defaultQuickLogs("pregnancy")` is `weight-mom · mom-mood · kicks`. `expandedHeaderExtras("pregnancy")` is `symptoms · hydration · sleep-mom · contractions`. Mom-mood opens a flex-wrap pill picker (emoji + label) with 5 options: Cheerful · Fine · Anxious · Overwhelmed · Grateful.

**Trimester helpers** in `src/lib/trimester.ts`: `currentMilestoneBucket`, `trimesterFromWeek`, `weekOfEntry`, `getTrimester`, `TRIMESTERS`. After the 2026-05-28 trimester drop, the only remaining caller should be the **JourneyHero card** ("3rd trimester" label inside the expanded progress card per slide 6 *"Move trimester here"*). Audit and remove callers in Timeline + the trimester archive route on cleanup.

**Entry form save contract.** `useSaveEntry(cat, editing?)` in `src/app/(prototype)/log/[category]/page.tsx` does add-entry **and** navigates: trackable categories `router.push(\`/journal/category/${cat.id}\`)` so you land on the category overview with the new entry in context (Jonas round-2 s9 *"After SAVE I should come to My Weight overview"*); **memory categories** (`note`, `quote`, `picture`, `milestone` — see `MEMORY_CATEGORIES`) fall back to `router.back()`. Callers must NOT also navigate — otherwise double-nav. `SaveBar` and `DoneBar` are the standard terminal buttons; both call into the same flow. `DoneBar` now requires an `onDone` prop (used by KicksForm + ContractionsForm). If `onDone` doesn't trigger a save (e.g., count was 0), the caller must `router.back()` itself.

**Quick-log nudge badge.** The "1" badge on the first quick-log card in pregnancy (`weight-mom`) is data-driven: shows when there's no weight-mom entry OR the latest is > 7 days old. Logic in [FeedHeader.tsx:29-42](src/components/FeedHeader.tsx). Cold-mode suppresses the badge since "Not yet" subtext already conveys it.

## Conventions

- Code is in `~/code/mali-proto` (not the symlink at `~/Library/CloudStorage/Dropbox/Mali/mali-proto`). Dropbox-synced folders make Turbopack glacial — keep code local.
- `pnpm` for installs (lockfile is `pnpm-lock.yaml`).
- TypeScript + Next 16 App Router. Read `node_modules/next/dist/docs/` before assuming behavior — Next 16 has breaking changes from training data.
- Phase-aware components use `usePhase()` from `@/lib/phase`. Always defer to that for any phase-dependent rendering.
- Back chevrons use `router.back()` (NOT hardcoded `Link href="/feed"`). Established in P0 #5.
- Persistent FAB lives on `/feed`, `/journal`, `/journal/calendar`, `/journal/moments` via `PrimaryFAB` component. Default label is **"Add to Journal"**, not "Add entry" — matches the family-record framing.
- `/log/milestone` redirects to `/journal/category/milestone` — the milestone form is gone; the browser is the canonical surface for marking milestones done.
- **Status-bar bleed pattern**: `MobileFrame` does NOT add a universal `pt-11` for the fake iOS status bar. Each page owns its clearance: **tinted-top pages** (category detail / milestone / entry detail / log form) bleed to top:0 of the phone shell with internal `md:pt-[60px]` (44 status bar + 16 breathing). **White-top pages** (Timeline / Moments / Calendar / Feed / Profile / /log) add `md:pt-11` to their outer wrapper. `/feed` is a tinted-top page because of `FeedHeader`'s phase-tinted bg — the `md:pt-11` sits on FeedHeader's `<section>`, not on the page wrapper.
- Sketches go in `~/Code/mali-proto/sketches/` — HTML mockups for iterating on layout without touching the prototype. Open in browser via `open path/to/sketch.html`.

## What's working well — don't unbuild

- **Three-tab Journal IA** (Timeline / Moments / Calendar). Moments replaced the old Milestones tab — don't re-add a Milestones tab; Milestones lives as the hero inside Development.
- **Memory-first list order on `/log`** — `GROUP_ORDER` leads with Memories so the composer feels like moment-capture, not a category picker. A previous attempt added a separate verb-tile row above the list (Note · Photo · Milestone · Care · Health); it was reverted because it created three redundant layers of pickers. Don't re-add the verb row; reorder/rename the existing groups instead.
- **`JournalEntryCard` variants** — memory (large, photo bleeds 16:10, serif title, dot+caption) / measurement (compact row, value prominent in serif tabular-nums) / care (tight horizontal row). Driven by category. Memories breathe; care logs compress.
- **`MilestoneHero` / `JourneyHero`** live in the Moments tab AND inside `FeedHeader` (rendered with `variant="header"` to drop the inner card bg). In FeedHeader they're behind the chevron — keep them there; expanding the chevron also reveals the secondary tracker grid (`MiniLogTile` for `expandedHeaderExtras`).
- **`StatStrip` values are tappable** to the category detail chart (Length → /journal/category/length, Weight → weight-baby, Mom weight → weight-mom). Side icons use Phosphor outline glyphs (`ruler` + `scale-outline`) at `buttonStyle="ring"` for consistent line weight. Mali's filled `scale` SVG is for category-detail heros, not the small side button.
- **`JournalPulse`** strip in FeedHeader — "X entries today · last Y ago →" linking to /journal. Cold state reads "Start your journal — tap a card above". Empty by design when no entries.
- **`MemoryThread` on /feed** — surfaces an anniversary entry (7 / 14 / 30 / 90 / 365 days ago) as a single rich card between MyWeekCard (pregnancy) and the content cards. Phase-aware filtering. Renders null when no anniversary match.
- **`BirthHandoff` overlay** in `MobileFrame` — watches phase transition `pregnancy → parenting` via `useRef`+`useEffect`, fires once per transition. Renders inside the phone shell at z-60. **Gradient needs update** from coral→teal to coral→cream/deeper-coral (post pink-only decision). Per slide 54, the trigger should also become "1 day after due date" with an X close button. Re-fires every transition (handy for demos).
- **Milestone-as-memory** — `/journal/category/milestone/[milestoneId]` shows a Capture form when not done (date / note / photo). `setMilestoneDone` accepts `extra = { note, photo }`. Note appends to meta with em-dash. CTA is "Save as memory", not "Lu did it!".
- **Mom-experience track** — pregnancy `/feed` shows `MyWeekCard` (mom-week content) above the tip/quote/CTA. StatStrip pregnancy centers Mom. Wellbeing section in Moments holds mom-experience categories. Pregnancy Right-now suggestions never duplicate verb destinations.
- The CSS variable system for `--color-primary*` — easy to extend, no class-name string concatenation hacks. (No longer phase-aware after the pink-only decision; still useful for future palette tweaks.)
- **Symmetric StatStrip side rings** — both phases now use the same SideStat treatment on both left and right (`border border-[var(--color-primary)]/40 bg-white/40`) so the side icons read as a pair flanking the center hero. Don't introduce stronger borders/fills on one side only.
- **DemoNavigator "In case you missed"** — 4-item demo-path list at the bottom of the widget. Each row orchestrates phase + cold mode + route in one click. The birth-handoff entry uses a 350ms setTimeout to force React to commit the pregnancy state before flipping to parenting (otherwise React batches the two setPhase calls and the BirthHandoff `useRef` transition detector doesn't fire). Placed last on purpose — "safety net" framing, not "starting line".
- **Wired terminal buttons on every entry form.** Kicks: Done saves `{count} kicks, {min} min` with duration. Contractions: see the dedicated bullet below. Timer/Measurement/Event/Note all use SaveBar wired to useSaveEntry. No more dead Done buttons. `SaveBar` is a **plain inline button at the form bottom — NOT sticky** (Sudhir 2026-06-02 reverted the sticky bar; the timer form was made short enough that Save is naturally visible, which is the cleaner answer to Jonas s5 "Save always visible"). **Don't re-add a sticky/pinned Save.**
- **All timer categories use `TimerEntryForm`** (`log/[category]/page.tsx`) for *every* `formKind: "timer"` category (sleep, sleep-mom, nursing, bottle, pumping, stroll, bathing). Layout (settled 2026-06-02):
  - **Top: a `Manual | Live timer` segmented toggle** (the My Baby Manual/Timer pattern, slide 34). **Manual** = Start/End fields + per-category extras (side / ml / milk-type) + Comments + Photo + Save — the full entry form. **Live timer** = a big `00:00` + "Start timer"; once running, a ticker + "Stop & review" that fills the times and flips back to Manual for review + Save. So Manual is the default/retro path and live tracking is a first-class peer (not a buried link).
  - **No big duration headline** (duration is a small label by the End field), **no quick-preset chips**, **no Daytime/Night toggle** — Daytime/Night is **auto-derived from the start time** (`inferSleepKind`) and still written to the entry meta, just not a manual control. The form fits the viewport without scrolling.
  - **Don't reintroduce:** the bare-stopwatch `TimerForm` (deleted), the preset chips, the duration headline, the Daytime/Night manual toggle, or a sticky Save.
- **`/log` "Right now" = top-4 most-used** (Jonas round-2 s14), labeled "based on your use" — counts entries per category for the phase, backfills to 4. Replaced the old time-of-day suggestion logic (babies' schedules are irregular).
- **Concurrent timers** (Jonas email 2026-05-29) — `ActiveTimer` context holds an **array** keyed by category, not a single timer. Sleep + Pumping run at once; `ActiveTimerChip` stacks one pill per running timer above the tab bar. API is category-keyed: `start(catId)` / `stop(catId)` / `timerFor(catId)` / `elapsedSec(catId)`. **Don't revert to a single `active` timer** — blocking concurrency was the exact bug Jonas flagged. Open follow-up: also surface running timers inline on the feed quick-logs (My Baby pattern).
- **Contractions = persistent tracker session** (Jonas round-2 s33 follow-up, 2026-06-02: "the timer seem to stop… I suggest we just put the timer in as a tracker, like with sleep"). Session state (in-flight `currentStart` + completed `{start,end}` events) lives in `ContractionSessionProvider` (`src/lib/contraction-session.tsx`, mounted in the prototype layout) — NOT component-local, so it survives navigation. The form registers `contractions` with `ActiveTimer` so the floating chip appears and links back; on each contraction stop the chip is re-baselined (`stop`+`start`) so its ticking number = **time since last contraction** (production Mali's page-top clock). Two real clocks on the form: current-contraction duration (their pop-up) + always-running since-last. Done saves real stats (`N contractions, avg Xs, ~Y min apart` — gap < 90s renders as `~45s`, matching their Rate column) and finalizes an in-flight contraction. **Don't reintroduce:** the hardcoded `00:45` headline, `running` initialized `true`, or component-local session state — all three were exactly what Jonas couldn't understand.

## Where to look

- **[SPEC.md](SPEC.md)** — canonical screen-by-screen spec (compiled from email + transcript + 56-slide deck on 2026-05-28). Part A = cross-cutting rules, Part B = per-slide reference.
- **[HANDOFF.md](HANDOFF.md)** — current state for picking up the project (what's done, what's next, open questions).
- **[BACKLOG.md](BACKLOG.md)** — older priority list of gaps; some items now in SPEC.md.
- Earlier plans (largely superseded by SPEC.md):
  - `~/.claude/plans/we-are-working-on-linked-forest.md` (Feed Header redesign + Mom-experience track + Trimester archive + JournalEntryCard variants + BirthHandoff + Memory thread + Milestone-as-memory + verb-row revert)
  - `~/.claude/plans/i-am-myself-confused-snazzy-moth.md` (10 user scenarios)
