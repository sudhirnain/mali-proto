@AGENTS.md

# Mali journal redesign — project conventions

## Live deployment

Production alias: **https://mali-proto.vercel.app** (Vercel scope `sudhir-4400`, project `mali-proto`). First deploy auto-promoted to production; deploy with `vercel deploy --prod --yes`. No external deps — pure mock data, deploys clean. If the URL hits a Vercel auth wall, fix at Project settings → Deployment Protection.

The shareable demo lands a stranger on `/feed` (root redirects there via `(prototype)/page.tsx`). The DemoNavigator widget — always visible top-right on desktop, compact pill on mobile — is the discovery surface. It has Phase / State / Jump to / **In case you missed** sections. No separate welcome flow.

## Source of truth

The deck `~/Library/CloudStorage/Dropbox/Mali/Mali 2026 SignUp Onboarding, Tracking UI_UX.pdf` is the brief, NOT a suggestion. Page 14 lists explicit goals for header and journal. When in doubt, re-read the relevant pages directly — don't invent patterns that aren't shown.

Reference apps:
- **My Baby** (positive reference for the journal pattern) — screenshots IMG_9049 / 9050 / 9055 / 9060 / 9062 / 9063 / 9064 in `~/Library/CloudStorage/Dropbox/Mali/screenshots/`
- **Current Mali** (the UX we're replacing — Sudhir called it "terrible") — IMG_9042-9048 and the screen recording `maliflowforjournal.MP4`

## What's in scope / out of scope

**In scope:** the feed (header + content), the journal (Timeline / Moments / Calendar / Trimester archive / Category detail / Entry detail), entry forms, mom-experience track for pregnancy, birth-handoff celebration, memory threading.

**Explicitly out of scope:** onboarding funnel. The `(onboarding)` route group was deleted on 2026-05-20. Don't reintroduce it without asking.

## Journal IA (locked)

Three tabs on `/journal`, each a different browsing axis — **same entries, three lenses**:

- **Timeline** (`/journal`) — chronological, day-grouped. In pregnancy phase, day groups are wrapped by **Trimester** chapter headers that link into the archive (see below).
- **Moments** (`/journal/moments`) — by topic. Phase-aware section grouping; **Memories first** to enforce the family-record framing.
- **Calendar** (`/journal/calendar`) — month grid with photo/tint cells.

**Moments sections (locked)**:
- Parenting: Memories · Development (hero=milestones, plus weight-baby / length / head tiles) · Care logs · Health
- Pregnancy: Memories · Your journey (hero=weekly-journey, no tiles) · Body (kicks, contractions) · Wellbeing (mom-mood, symptoms, hydration, sleep-mom, weight-mom) · Health

**Don't revert** to a peer-level "Milestones" tab. Milestones is a category (`/journal/category/milestone`), reached as the hero in the Development section. Growth merged into Development for parenting — they're both "how is baby developing." Wellbeing is the mom-experience vertical for pregnancy.

**Trimester archive** (`/journal/trimester/[t]` where `t = t1 | t2 | t3`) — chapter view of pregnancy entries, with a T1/T2/T3 spine for navigation, week-grouped entries, "you are in week N" / "chapter complete" markers. Reached from JourneyHero, from Timeline trimester headers, from the spine.

## Phase philosophy ("EY baby-first, pregnancy mom-first")

Client direction, drives every header decision. Parenting (Early Years) centers the **baby**: Lu's name, age, length, weight, baby-care quick-logs. Pregnancy centers the **mom**: Sarah's name, mom-weight, mom-experience quick-logs (mom-mood, kicks, weight-mom).

In pregnancy `StatStrip`, the center is the mom illustration + Sarah's name + "Week N · X weeks to go"; the baby moves to a small right-side fruit-emoji ring labeled "Lu · avocado-sized" (tap → Your-journey hero). Cold copy reads "Welcome, Sarah" — never "Welcome, Lu" in pregnancy.

`/feed` body for pregnancy users surfaces `MyWeekCard` (mom-week content) above the tip/quote/CTA cards — pregnant users read about themselves, not the baby. Content from `src/lib/mom-content.ts` (handcrafted blurbs for weeks 6 / 12 / 20 / 28 / 32 / 36 with a fallback).

**Default landing state (set 2026-05-22):** Pregnancy + Populated. Set in [src/lib/phase.tsx:15](src/lib/phase.tsx) (`useState<Phase>("pregnancy")`). Rationale: pregnancy is Mali's differentiator vs My Baby; landing in pregnancy showcases the mom-first track AND sets up the birth-handoff demo. Don't default to parenting — a reviewer may never flip back and miss the peak moment.

## Phase color system

- Pregnancy phases (t1-2, t3) → salmon/coral
- Parenting phase → teal/green

The system: `--color-primary*` CSS variables (in `globals.css`) default to coral at `:root` and swap to teal under `[data-phase="parenting"]`. The `data-phase` attribute is set on the outer `<MobileFrame>` wrapper.

Components consume the phase color via `bg-[var(--color-primary)]` / `text-[var(--color-primary-dark)]` / etc. — never hardcoded `bg-coral` for things that should track the phase.

Categories keep their own colors (sleep = purple, nursing = green, etc.) — only the chrome and primary CTAs track the phase.

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

**Trimester helpers** in `src/lib/trimester.ts`: `currentMilestoneBucket`, `trimesterFromWeek`, `weekOfEntry`, `getTrimester`, `TRIMESTERS`. Used by Timeline trimester headers + Trimester Archive page.

**Entry form save contract.** `useSaveEntry(cat, editing?)` in `src/app/(prototype)/log/[category]/page.tsx` does add-entry **and** `router.back()`. Callers must NOT also navigate — otherwise double-back. `SaveBar` and `DoneBar` are the standard terminal buttons; both call into the same flow. `DoneBar` now requires an `onDone` prop (used by KicksForm + ContractionsForm). If `onDone` doesn't trigger a save (e.g., count was 0), the caller must `router.back()` itself.

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
- **`BirthHandoff` overlay** in `MobileFrame` — watches phase transition `pregnancy → parenting` via `useRef`+`useEffect`, fires once per transition. Renders inside the phone shell at z-60 with coral→teal gradient. Re-fires every transition (handy for demos).
- **Milestone-as-memory** — `/journal/category/milestone/[milestoneId]` shows a Capture form when not done (date / note / photo). `setMilestoneDone` accepts `extra = { note, photo }`. Note appends to meta with em-dash. CTA is "Save as memory", not "Lu did it!".
- **Mom-experience track** — pregnancy `/feed` shows `MyWeekCard` (mom-week content) above the tip/quote/CTA. StatStrip pregnancy centers Mom. Wellbeing section in Moments holds mom-experience categories. Pregnancy Right-now suggestions never duplicate verb destinations.
- The phase-color CSS variable system — easy to extend, no class-name string concatenation hacks.
- **Symmetric StatStrip side rings** — both phases now use the same SideStat treatment on both left and right (`border border-[var(--color-primary)]/40 bg-white/40`) so the side icons read as a pair flanking the center hero. Don't introduce stronger borders/fills on one side only.
- **DemoNavigator "In case you missed"** — 4-item demo-path list at the bottom of the widget. Each row orchestrates phase + cold mode + route in one click. The birth-handoff entry uses a 350ms setTimeout to force React to commit the pregnancy state before flipping to parenting (otherwise React batches the two setPhase calls and the BirthHandoff `useRef` transition detector doesn't fire). Placed last on purpose — "safety net" framing, not "starting line".
- **Wired terminal buttons on every entry form.** Kicks: Done saves `{count} kicks, {min} min` with duration. Contractions: Stop toggles running state + counter; Done saves `{N} contractions, ~45s each`. Timer/Measurement/Event/Note all use SaveBar wired to useSaveEntry. No more dead Done buttons.

## Plan file

The active plan lives at `~/.claude/plans/we-are-working-on-linked-forest.md` (Feed Header redesign + Mom-experience track + Trimester archive + JournalEntryCard variants + BirthHandoff + Memory thread + Milestone-as-memory + verb-row revert).

Earlier plan (still relevant for the 10 user scenarios): `~/.claude/plans/i-am-myself-confused-snazzy-moth.md`.
