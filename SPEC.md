# Mali Journal — Reference Spec

Self-contained reference for the redesign. Built by reconciling:
- **Jonas's email** (May 27, 2026) — 7-item review list, attached pregnancy header mock
- **May 28 meeting transcript** — [mali-source/feedback.txt](mali-source/feedback.txt), Sudhir + Jonas walking the deck together
- **Deck v2** — [mali-source/feedback.pptx](mali-source/feedback.pptx), 56 slides, 38 active comments by Jonas (May 22–28). Extracted text + comments at [mali-source/deck-extracted.txt](mali-source/deck-extracted.txt)
- **Deck v3 (Round 2)** — [mali-source/feedback02.pptx](mali-source/feedback02.pptx), 66 slides, Jonas comments + on-slide annotations (2026-06-01). Slides 3–15 captured in **Part B2** below.
- **Existing prototype** at https://mali-proto.vercel.app and on disk

> **Convention on sharing the deck**: PDF export drops comments. PPTX preserves them. To share with anyone who needs the comment thread, send the .pptx (current path: `mali-source/feedback.pptx`) or share the Google link with comment access on. Inside Chrome MCP I can read both.

## Status legend

| Symbol | Meaning |
|---|---|
| **DONE** | Already shipped to `mali-proto.vercel.app` |
| **BUILD** | Approved, ready to implement |
| **DECIDE** | Needs Sudhir's call (or a 5-min Jonas check) before building |
| **DROP** | Explicitly out / Jonas struck through |
| **OPEN** | Owned externally (Jonas's team / Junporn) or future scope |

---

## Part A — Cross-cutting decisions

These touch many screens. Pin them first so per-screen specs stay short.

### A1. Color: drop the teal/coral phase split → pink everywhere

**DECIDE.** Status changed 2026-05-28 evening: Jonas re-opened this as an opinion question in a follow-up email — *"what do you think about changing the app color to be pink only? … It's more of a branding question, but I thought I'd ask for your opinion."* Slide 54's earlier *"Make Parenting also Pink"* annotation now reads as Jonas's leaning, not a locked call. Awaiting Sudhir's reply (in draft).

If/when it locks to BUILD, the implications are:

- `--color-primary` and family stop swapping on `[data-phase="parenting"]`. Both phases use the coral/salmon palette currently used for pregnancy.
- Category colors (sleep purple, nursing green, diaper amber, etc.) stay as-is — they're tied to category, not phase.
- The phase distinction now has to come from elsewhere — **content** (different StatStrip subject, different quick-logs, MilestoneHero vs JourneyHero), not chrome color.
- `BirthHandoff` overlay: currently coral→teal gradient. Change to a coral→deeper-coral or coral→cream gradient so the "chapter change" still reads visually without invoking teal.
- Mom-tracking-in-parenting (A2 below) is the place where we still need a *secondary* visual cue — so don't waste pink on every Mom row; reserve a paler tint or a "Mom" chip.
- Open sub-question (raised in our reply to Jonas): if pink-only, do we add a secondary accent (soft sage / baby-blue) on Mom-tracking rows in parenting to keep some chromatic variety? Answer changes scope from 1-day swap to 3-day rethink.

Files to touch when unblocked: [globals.css](src/app/globals.css), [MobileFrame.tsx](src/components/MobileFrame.tsx) (BirthHandoff gradient), all components that branch on `data-phase` for color (none should after this).

### A2. Mom vs Baby visual track in Parenting

**BUILD.** Slide 29 comment: *"show which ones are for the mom"* (anchored to the Activity section of the Add Journal grid). Slide 13 comment: *"would be great to allow moms to track the weight after giving birth, but the graph would need to change or we work with tabs."*

Approach (proposing — confirm before building):

- **Composer (`/log`)**: a small "Mom" pill on category tiles that belong to mom (Symptoms, Mood, Sleep-mom, Water, Weight-mom). Or stack them under a "For mom" subsection above Pregnancy/Activity sections. Pill is simpler.
- **Journal Moments**: Wellbeing section continues to live in parenting (currently pregnancy-only). Section header reads "For mom" or "Your wellbeing".
- **StatStrip in parenting**: currently Length | Lu | Weight. Add a small "Mom" affordance — either swap the Length side for "Mom · Sarah" when tapped, or surface Sarah on a long-press, or add a secondary row. **Open question** — needs design alignment.
- **Mom-weight graph in parenting**: needs a chart variant that spans the *whole journey* (pregnancy weight gain → postpartum return-to-baseline). My Baby uses tabs (Weight / Height / Head); Jonas suggests "tabs" as one path. See [/journal/category/weight-mom](src/app/(prototype)/journal/category/%5Bid%5D/page.tsx).

### A3. Background-running timers (sleep especially)

**DONE (prototype-level), now multi-timer.** Built `ActiveTimer` context + sticky chip ([active-timer.tsx](src/lib/active-timer.tsx), [ActiveTimerChip.tsx](src/components/ActiveTimerChip.tsx)). Survives navigation inside the phone shell.

**Concurrent timers (Jonas email 2026-05-29).** Sleep and Pumping (etc.) can now run at once: the context holds an array keyed by category — `start(catId)` only no-ops if *that* category is already running — and the chip stacks one pill per running timer above the tab bar. Forms no longer block each other (the old SleepForm "stop the other timer first" guard is gone). Jonas's alternative phrasing ("move the countdown into the Journal overview, like My Baby") is the **OPEN** follow-up: surface running timers inline on the feed quick-logs. Note: he raised this against a stale `mali-proto.vercel.app` deploy that predated the retro Sleep form (slide 30), so his companion point about start/end + live tracking was already shipped — alias re-pointed same day.

True iOS Live Activity / Dynamic Island / macOS Continuity (slide 27 shows all three) is platform-native and **OPEN** — out of scope for the prototype, would be a real-app build task. Mali deck shows these as the goal, not the prototype requirement.

### A4. Photo attach on every entry form (except Kicks/Contractions)

**DONE.** [log/[category]/page.tsx](src/app/(prototype)/log/%5Bcategory%5D/page.tsx) has a `<PhotoAttachField>` on Timer / Measurement / Event / Note forms. Kicks and Contractions skipped per email.

**OPEN follow-on (slide 51 comment):** *"It would be nice if users can see the picture full screen (and maybe share)."* — tap a photo in an entry card / category list → full-screen viewer with swipe between photos. Touches [JournalEntryCard.tsx](src/components/JournalEntryCard.tsx), [journal/category/[id]/page.tsx](src/app/(prototype)/journal/category/%5Bid%5D/page.tsx), [journal/entry/[entryId]/page.tsx](src/app/(prototype)/journal/entry/%5BentryId%5D/page.tsx).

### A5. Pregnancy header — 45% of screen budget

**BUILD remaining bits; partial DONE.** Slide 4 spec: *"Ideally the Pregnancy header takes no more than 45% of the full screen."* Parenting can be 50-55% (slide 26 says "50-55%").

Compact pregnancy header DONE; remaining sub-tasks:

- **A5a. Center subline = ageLabel "Week 32 . Day 6"** — done (we render `baby.ageLabel = "Week 32, Day 4"`). Period vs comma is Jonas's preference; switch to "Week 32 · Day 6" (middle-dot) for consistency with our other places.
- **A5b. Right ring: due date + tap to update** — slide 4 (*"Change to countdown or baby weight"*) and slide 6 (*"Due date 24.10.2026"*). Right-side ring should toggle between baby weight (current) and "Due date 24.10.2026" — Jonas's preference is **due date** as primary, baby weight as secondary. Tap opens a "Change due date" sheet.
- **A5c. Baby weight is from backend, NOT user-editable** (transcript). When tapping the baby-weight reading, the only action is the small "estimate" badge — no edit form. The mom weight tap stays editable.
- **A5d. Weekly illustration replaces the static mom-figure** — slide 4 comment *"change to weekly image"* and slide 4 comment *"We don't need the Weekly Update"* (the standalone Mali Weekly Update card is going away; the image moves into the header). Use `public/mali-art/weekly/wN.png` for the center hero based on `baby.week`. Parenting keeps a different image — *"Keep this image for the Parenting header unless users added an image of their baby"* (slide 4 comment) — so until a user uploads a baby photo, parenting uses the line-art baby illustration; once uploaded, that photo takes over.
- **A5e. Baby name in center, not mom name** — slide 4 comment *"Needs to be the baby name (we hardly have the moms name)"*. **This is for PARENTING.** Pregnancy still centers Mom (per transcript: *"the mom is the user during pregnancy"*). Center text per phase: pregnancy = Sarah; parenting = Lu.
- **A5f. "1" notification badge on My Weight card** — slide 4 annotation says *"This counter does make sense in Parenting when you want to see how many feeds your baby already go today. In Pregnancy it would only apply to weight—maybe it's not needed or we call it 'due' or its just a dot."* Translation: keep the numeric badge in **parenting** (legitimate counter — "5 feeds today"). In **pregnancy**, replace numeric badge with a small "due" red dot or remove entirely. Currently we use it as a stale-weight nudge — re-cast as a `due` dot.

### A6. Scroll behavior: sticky pill, fruit-size momentary explainer, FAB hides

**BUILD.** Slides 7–9 spec a 3-state scroll transition:

1. **Top of feed** (slide 7 SCROLLING NOW): full pregnancy header.
2. **Mid-scroll explainer** (slide 8): for ~1 second as user starts scrolling, the center hero shows *"Sarah is now the size of a pepper"* (week-aware) — the mom-figure morphs to "size of X" copy as a one-shot tooltip.
3. **Scrolled** (slide 9): everything collapses except a single floating pill at the top: **"Week N day D"**. Bullets from slide 9:
   - *Plus button disappears* (the persistent `+` FAB hides)
   - *Arrow turns into week tag* (the chevron-down expand control becomes a small pill labeled with the week)
   - *On click, week tag opens menu* (tapping the pill re-expands the full header — like a reverse-collapse)

Slide 6 comment *"could this fade when scrolling?"* refers to the "FOR YOU · THIS WEEK" content card — yes, fade as it leaves view. Standard CSS animation; not blocking.

Files: [FeedHeader.tsx](src/components/FeedHeader.tsx), [PrimaryFAB.tsx](src/components/PrimaryFAB.tsx).

### A7. Haptic feedback on tap (kick + feed)

**BUILD.** Slide 17 comment: *"can we make this haptic feedback?"* Web Vibration API is fine for the prototype: `window.navigator.vibrate(20)` on Android Chrome (Safari iOS silently no-ops). Add to:
- Kick tap button (`/log/kicks`)
- Bottle "feed" button if we add one
- Anywhere with a satisfying micro-action

Use a single helper, e.g. `tinyHaptic()` in [src/lib/haptic.ts](src/lib/haptic.ts) (new).

### A8. Image rule: large-photo card variant ONLY for Notes, Pictures, Milestones

**BUILD.** Slide 11 comment: *"Proposed logic for images. Only show them from Notes, Pictures and Milestones large."* — settles the open question from JournalEntryCard.tsx.

Currently `JournalEntryCard` uses a `memory` variant (big 16:10 photo + serif title + caption) chosen by category. Lock the rule: **memory variant fires only for `note` / `picture` / `quote` / `milestone:*` categories.** Photos on care-log entries (sleep, nursing, diaper) show as a small thumbnail on the right of the compact row, never as a hero.

### A9. Trimester archive page — DROP. Trimester chapter wrappers in Timeline — DROP. But add "3rd trimester" label inside the JourneyHero card.

Transcript: *"with new Journal it covers so much already that we don't need this trimester and open chapter"* + slide 23 has a giant X overlay on the Trimester Archive screen + slide 11 X over the trimester chapter header in Timeline. **DROP both surfaces.**

Slide 6 comment *"Move trimester here"* is anchored to the JourneyHero card — Jonas wants the literal text "3rd trimester" to live inside that card (it already does in slide 6's mock: "3rd trimester / Week 32 / Your baby is about size of a ladybug / 80% through pregnancy / Due date 24.10.2026 →").

Files to delete/clean: [journal/trimester/[t]/page.tsx](src/app/(prototype)/journal/trimester/%5Bt%5D/page.tsx), the Trimester chapter wrappers in Timeline page, related routes in DemoNavigator. Update CLAUDE.md to remove the "trimester archive" locked-IA mention.

### A10. Plus FAB on every journal screen

**BUILD.** Slide 11 comment *"Add + Button"* anchored to Timeline. Currently FAB is missing on Timeline and big-photo Memory views per the comment screenshot. Audit:
- [journal/page.tsx](src/app/(prototype)/journal/page.tsx) (Timeline) — confirm FAB present
- [journal/moments/page.tsx](src/app/(prototype)/journal/moments/page.tsx) — present
- [journal/calendar/page.tsx](src/app/(prototype)/journal/calendar/page.tsx) — present
- [journal/category/[id]/page.tsx](src/app/(prototype)/journal/category/%5Bid%5D/page.tsx) — confirm; slide 17 shows it on Kicks detail.

Per A6 the FAB hides on scroll-down — implement together.

### A11. Graph rules

From slides 12, 13, 17, 18, 38, 39, 40:

- **Static SVG, no interaction** (transcript: *"No it's just where you are in your pregnancy and then we will plot the dots... not interactive"*). No drag, no zoom, no tooltip-on-tap.
- **Reference range as background band** — the green/coral shaded band on weight/length/head graphs. Jonas's team plots the band via SVG; we render dots on top.
- **Kicks: dots not a line** — slide 17 comment *"Would something like this be an illustration of the data?"* + transcript *"Kick is not a continuous line kind of visualization. Dots way is better. It's a count and it doesn't need any [line]."*
- **Contractions: dots** — slide 18 comment region. Same logic.
- **Weight/Length/Head: line + reference band** — slide 38 layout shows it.
- **"Last 12 weeks" subtitle → "Last 7 days"** — slide 18 comment *"Change to 'Last 7 days'"* on the contractions TREND label. Audit the same label across category-detail pages — Sleep, Kicks, Contractions all want "Last 7 days" for short-period trackers; growth metrics can keep "Last 12 weeks" or longer.
- **Parenting graphs need a 5–10 year time range** — slide 38 comment *"Allow users to track for 5 or 10 years"*; slide 39 inline text on the LENGTH slide repeats it. Reference ranges (WHO bands) only make sense to ~2 years for weight/length/head. Either (a) drop the band beyond 2y, or (b) render a different chart variant. Decide as we build — easiest is to clamp the band rendering and keep dots.

### A12. Drive folder for new pregnancy illustrations

Slide 6 comment: *"We have these ones: https://drive.google.com/drive/folders/1m8W_ey6mBRes53oBXue4P6YvUCgSMr9v"* — Jonas pointed at a Drive folder with new weekly/pregnancy illustrations. **OPEN** — pull these down if we haven't already; merge into [public/mali-art/](public/mali-art/). The deck's slide 4 image is the current Mali Weekly Update art; this Drive may have an updated set.

### A13. "Always allow Other" on preset pickers

**BUILD.** Slide 16 comment (Mood): *"Always allow to 'Other'"*. Apply to every chip-style preset picker: Mood, Symptoms, Diaper, Solids, Doctor's visit, Vaccinations, Illnesses, Medications. "Other" reveals a freeform text field. Currently [presetsFor()](src/app/(prototype)/log/%5Bcategory%5D/page.tsx) returns fixed arrays — add an "Other" terminal option with custom-input behavior.

### A14. Birth handoff trigger

Slide 54: *"Should be triggered during pregnancy one day after due date. Add X."* — meaning the handoff overlay should auto-fire 1 day after due date (not on phase-flip alone), and have an X close button. Currently we trigger on phase change. Adjust the `BirthHandoff` trigger to be due-date-aware in cold-mode demo path; keep the manual phase-flip path for demos. Add a close X.

### A15. Sponsor / Cryoviva slot

Slide 55 introduces a sponsor concept: *"or Join Cryoviva (could be on rotation until clicked)"* with a yellow CTA card *"S-26 Club: 203 moms joined today – sign up today →"*. This is an idea for monetization placement, not a confirmed build. **DECIDE** — Sudhir's call on whether to mock this in the prototype. If yes, location is between JournalPulse and the For-You section in the pregnancy feed. Cryoviva is a stem-cell banking partner; S-26 is a formula brand (Nestlé).

---

## Part B — Slide-by-slide reference

Each entry lists what's in the slide and what action it implies. Slide IDs are the `data-slide-page-id` so the deck can be re-opened to a specific slide via `…/edit#slide=id.<SLIDE_ID>` once auth is in place.

### Slide 1 — Cover

`g25e7af4f2ee_0_0`

Mali brand cover. *"The trusted digital health companion for new moms in Thailand."* 4.8 stars, 200,000+ downloads, "Medical app store rank Thailand: Top 15." Phone mock holding baby's foot. Marketing/intro slide, no spec implication.

### Slide 2 — Section "EVENTS"

`g3e9a920e82e_0_0`. Section divider, no content.

### Slide 3 — Section "PREGNANCY"

`g3e401859f3b_0_0`. Section divider, no content.

### Slide 4 — FEED (pregnancy, current vs proposed)

`g3e401859f3b_0_4`. **The most heavily annotated slide.**

Three phone mockups: Mali-current (left), Mali-proposed (middle), My Baby Thai reference (right). Big "45%" callout — pregnancy header height budget.

On-slide annotations:
- *"Change to countdown or baby weight"* — right side ring should be due-date countdown OR baby weight (A5b)
- *"Text should probably be 'Week 32 . Day 6'"* — subline format
- *"This counter does make sense in Parenting when you want to see how many feeds your baby already go today. In Pregnancy it would only apply to weight—maybe it's not needed or we call it 'due' or its just a dot."* — the badge logic (A5f)
- Big *"45%"* — pregnancy header height ceiling

Comments (5):
- 2026-05-22 09:24 — *"change to weekly image"* (the center mom-figure should become the per-week watercolor illustration)
- 2026-05-22 09:24 — *"Keep this image for the Parenting header unless users added an image of their baby."* (parenting fallback)
- 2026-05-25 01:53 — *"This could link to due date."* (right ring → due date)
- 2026-05-25 01:53 — *"We don't need the Weekly Update"* (kill the standalone Weekly Update card; the weekly image migrates into the header)
- 2026-05-22 10:13 — *"Needs to be the baby name (we hardly have the moms name)"* (center label — parenting only; pregnancy stays mom)

**Implications:** all rolled into A5 / A1 / A2.

### Slide 5 — DIRECTIONS (research tables)

`g3e401859f3b_2_174`. Two large tables of competitor research:
- **Table 1** — Mali's internal popularity research. Top 10 tracking metrics by popularity / confidence / trimester target / competitor benchmarks. Order: Fetal Growth Visuals (81-89%), Gestational Symptom Tracking (71-75%), Maternal Weight & BMI (60-65%), Fetal Kick Counting (50-60%, T3), Clinical Appointment (40-50%), Labor Timing (40-50%), Hydration (35-40%), Sleep Quality (30-40%), Mood (25-35%), Nutrition (25-30%).
- **Table 2** — feature/popularity/confidence per competitor's external estimates. Weekly fetal development (90-95%), Symptom logging (70-80%), Mood (55-65%), Weight tracking (55-65%), Appointments (50-60%), Kick counter (45-55%, late preg), Baby name browsing (45-55%).

Phone mock on the slide shows a tighter version of the compact pregnancy header with **5 mini tiles in one row** (Symp · Water · Sleep · Contr · Symp) — confirms our current build. Right-side caption "Symptom / Weight / Kicks / Doctor / Contraction" — naming the tile set.

**Implication:** ratifies the 5-tile compact row. The popularity tables are useful background but no immediate build action.

### Slide 6 — DIRECTIONS (variants)

`g3e401859f3b_2_143`. Two compact pregnancy header variants side by side. **The right variant shows what the expanded JourneyHero should look like:**
- "3rd trimester" (small caption above)
- "Week 32" (large)
- "Your baby is about size of a ladybug" (kid-friendly explainer)
- Progress bar at "80% through pregnancy"
- "Due date 24.10.2026 →" (tappable, opens change-due-date)
- Ladybug illustration on the right (week-appropriate fruit/animal)

Comments (3):
- 2026-05-22 16:13 — *"We have these ones: https://drive.google.com/drive/folders/1m8W_ey6mBRes53oBXue4P6YvUCgSMr9v"* — new illustration set (A12)
- 2026-05-22 16:15 — *"Move trimester here"* — anchor for moving the trimester text into the hero (A9)
- 2026-05-25 02:17 — *"could this fade when scrolling?"* — fade-on-scroll (A6)

**Implications:** rebuild [JourneyHero](src/components/journal/JourneyHero.tsx) to match this layout. Currently we have most pieces; check that "3rd trimester" label appears + ladybug-style animal/fruit illustration + "Due date YYYY →" is tappable.

### Slide 7 — SCROLLING NOW

`g3e9f697c098_2_2`. Reference: My Baby's scroll behavior on Thai feed (left = top-of-feed, right = scrolled). Their compact pill reads "Week 18, Day 1" overlaid on a hero photo. Connecting arrow shows the transition.

**Implication:** model our pregnancy scroll on this pattern (A6).

### Slide 8 — SCROLLING DOWN (the fruit-size transition)

`g3e401859f3b_2_2`. Four phone states left-to-right showing the scroll transition:
1. Full header (Sarah + Lu/avocado)
2. Mid-scroll: center hero morphs to **"Sarah is now the size of a pepper"** with pepper illustration — momentary explainer
3. Compact: just the pepper text overlaid on FOR YOU content
4. Final: floating pill **"Week 13 day 6"**

Comments (2):
- 2026-05-22 17:36 — *"See next page"* (refers to slide 9)
- 2026-05-22 17:34 — *"Explain fruit when scrolling down."* (this is the fruit-size momentary card)

### Slide 9 — SCROLLING DOWN (final state)

`g3e401859f3b_2_30`. Final scrolled state — single "Week 13 day 6" pill at top, content fills the rest. Bullets on slide:
- *Plus button disappears*
- *Arrow turns into week tag*
- *On click, week tag opens menu*

**Implication:** see A6. The "arrow" is the chevron-down expand control in our current FeedHeader.

### Slide 10 — ADD JOURNAL (pregnancy)

`g3e401859f3b_0_126`. The `/log` composer in pregnancy phase. Top: "+ Right now" + 4 mini tiles "BASED ON TIME OF DAY" (Sleep, Water, Symptoms, My Weight with red "due" dot). Sections: Memories (Note, Picture), Health (Doctor's visit), Pregnancy (My Weight, Mood, Symptoms, Water, Sleep, Kicks, Contractions).

Comments (2):
- 2026-05-22 18:19 — *"We could also move the flag here."* (the "due" red dot/flag could anchor on the Add Journal composer too, not just on /feed)
- 2026-05-22 18:22 — *"Should be weekly, if nothing was added."* (the BASED ON TIME OF DAY recommendation defaults to weekly cadence when no log exists — for the prototype it's static, fine)

**Implication:** the "due" flag concept (red dot) is the same as the My Weight nudge; reuse the visual treatment across feed-header tiles AND `/log` time-of-day tiles. See A5f.

### Slide 11 — JOURNAL (Timeline / Moments / Calendar, pregnancy)

`g3e401859f3b_0_37`. Four phone mockups for the three Journal tabs.

Key X-marks (struck through):
- **Trimester chapter header** in Timeline (e.g. "TRIMESTER 1 / Weeks 8-12 / YOU ARE HERE") — Jonas crossed it out → A9
- **Open chapter →** link inside that header — also crossed → A9

Comments (5):
- 2026-05-22 19:15 — *"I think this can go."* (the trimester header — confirms A9)
- 2026-05-22 19:11 — *"Add timer (see My Baby)"* (anchored to a Sleep entry — A3 done at prototype level)
- 2026-05-22 19:11 — *"Add image. All entries should allow to add an image."* (A4 done)
- 2026-05-22 19:13 — *"Proposed logic for images. Only show them from Notes, Pictures and Milestones large."* (A8 — the big-photo card variant rule)
- 2026-05-22 19:15 — *"Add + Button"* (A10)

### Slide 12 — WEIGHT (pregnancy + reference)

`g3e401859f3b_0_21`. Four mocks: Mali empty category, Mali form, Mali entry detail, Thai My Baby category with reference-range chart.

Comments (1):
- 2026-05-22 19:13 — *"Show how it looks if an image was added."* (we need a slide/screen showing the category-detail view when entries have photos — currently TBD)

### Slide 13 — WEIGHT 2 (just the category screen)

`g3e401859f3b_2_106`. Single Mali empty-state weight category screen with reference range chart.

Comments (2):
- 2026-05-22 19:33 — *"How would you need us to create these graphs?"* (asks for the format we want the SVGs in. Answer to Jonas: SVG with a `<path>` for the median line, a `<path>` filled for the band, and a `<g>` for dots — exactly the format we already render to. Provide a spec.)
- 2026-05-25 02:32 — *"I would be great to allow moms to track the weight after giving birth, but the graph would need to change or we work with tabs."* (A2 — mom-weight continuity in parenting)

### Slide 14 — NOTE (pregnancy)

`g3e401859f3b_1_294`. Mali Note form (tan/beige) and entries list with "Pediatrician very happy with weight" example. No comments.

### Slide 15 — PICTURE (pregnancy)

`g3e401859f3b_1_302`. Mali Picture form + entries list with photo examples ("First giggle" — wait, that's parenting content in a pregnancy section, suggests the picture form is phase-shared).

Comments (1):
- 2026-05-25 02:34 — *"It would be nice that if we click the image it would become full screen and moms can swipe through."* (A4 follow-on — full-screen photo viewer)

### Slide 16 — MOOD

`g3e401859f3b_0_26`. Lavender Mood form, mood picker (Cheerful selected, Fine, Anxious, Overwhelmed, Grateful), entries list.

Comments (1):
- 2026-05-25 02:34 — *"Always allow to 'Other'"* (A13 — apply to every preset picker)

### Slide 17 — KICKS

`g3e401859f3b_0_32`. Four-state kicks flow: counter form ("Tap for a kick" big button, count "3 of 10 kicks", "Done"), entry detail, category trend chart, **celebration** ("Great! / You felt 10 movements / in / 18 minutes"). Arrow annotation points to the celebration screen as the after-completion target.

Comments (3):
- 2026-05-22 19:22 — *"can we make this haptic feedback?"* (A7 — vibrate on tap)
- 2026-05-22 19:25 — *"Would something like this be an illustration of the data?"* (anchored to the trend chart — A11, dots not a line)
- 2026-05-22 19:30 — *"Can we add positive feedback upon completion?"* (BUILD — when count reaches goal, show the celebration screen; we currently just save. Add a `KickComplete` overlay or interstitial.)

### Slide 18 — CONTRACTIONS

`g3e401859f3b_0_167`. Four states: category empty, contractions running ("00:45 Current contraction", "Stop contraction" red button, "Done"), entry detail, Mali current Thai contraction counter reference.

Comments (2):
- 2026-05-22 19:31 — *"Change to 'Last 7 days'"* (A11 — TREND chart subtitle)
- 2026-05-22 19:32 — *"Note that this is relevant. Pls show somewhere."* (anchored to the educational paragraph *"True contractions indicate the onset of labor. They increase in frequency until they are 5 minutes apart or reach 12 contractions per hour."* — BUILD: surface this paragraph on the Mali contractions screen too, probably as a collapsible "What's a true contraction?" panel under the timer.)

### Slide 19 — SYMPTOMS

`g3e401859f3b_0_183`. Lavender Symptoms form: chips for Nausea/Headache/Swelling/Heartburn/Fatigue/Back pain/Cramping, NOTE field, Save. Entries list. No comments — but A13 applies (add "Other").

### Slide 20 — WATER

`g3e401859f3b_1_31`. Water form with chip presets: Cup (250ml), Glass (350ml), Bottle (500ml), Large (1L). No comments — A13 applies.

### Slide 21 — SLEEP (pregnancy variant)

`g3e401859f3b_1_40`. Mali Sleep timer + entries list. Identical to parenting Sleep visually (lavender).

### Slide 22 — DOCTOR VISITS (pregnancy)

`g3e401859f3b_1_49`. Doctor visit form: type chips Checkup/Sick visit/Specialist + note. Entries list with multiple checkups.

### Slide 23 — TRIMESTER (struck through with giant X)

`g3e401859f3b_0_159`. Mali trimester archive screen ("Trimester 3 / Weeks 28-40 / 9 entries logged · you are in week 32") and Thai My Baby trimester reference. **The whole slide has a gray X overlay — Jonas explicitly killed this screen.** See A9.

### Slide 24 — Section "PARENTING"

`g3e401859f3b_0_45`. Divider.

### Slide 25 — FEED (Birth Handoff)

`g3e401859f3b_0_49`. The Birth Handoff overlay: pale green gradient, smiling baby line-art, *"Welcome, Sarah. / Your new chapter begins. / Lu has arrived. Every moment from here lives in your journal. / Your pregnancy story is kept safe — saved as 'before Lu'. / [Begin]"*

**Implications:** already built ([BirthHandoff.tsx](src/components/BirthHandoff.tsx)). Per A1, swap the teal Begin button to coral. Per A14, change the trigger to "1 day after due date" with an X close.

### Slide 26 — FEED (parenting, 50-55% header)

`g3e401859f3b_2_147`. Parenting feed showing:
- Header strip: "63 cm / Length" | "Lu / 3 months, 2 days" | "5.4 kg / Weight"
- 3 quick-log cards: Sleep, Nursing, Diaper (with `+` affordance)
- "6 entries today · last just now →" pulse
- Chevron expand
- (expanded variant on right): MilestoneHero "0-3 months / 2 of 7 done · Next milestone: Pays attention to faces →" + 5 mini tiles (Bottle, Solids, Pumping, Bathing, Weight)
- "A WEEK AGO TODAY" memory section
- Memory card example: "Lu's first bath at home / Picture · 3:30 PM" with photo
- "Your baby" content card 3 / 1.4K hearts: "Lu is nearly doubling in weight each week at this point"
- FAB

Annotation: *"50-55%"* — parenting can have a taller header than pregnancy's 45%.

Right-most mock = Thai My Baby parenting reference (green chrome).

**Implication:** confirms the current parenting feed layout. Minor: per A1 the green needs to become coral. Per A2, find a spot for a Mom indicator.

### Slide 27 — SLEEP (background timer + Live Activity demo)

`g3e9abc87710_4_173`. The most aspirational slide. Shows Sleep timer running across surfaces:
- Mali Sleep form with extended fields (Daytime/Night toggle, Start/End times, 00:00:00, "Fell asleep" button, Comments, Add photo, Save)
- iPhone lock screen "Fri 22 May / 12:10" with Dynamic Island showing "Sleep / 11:36 - Now / 2:34:41 / [stop]"
- iPhone Chats app with Dynamic Island still showing the sleep timer (red arrows pointing it out)
- My Baby home feed showing a running Sleep timer chip in the quick-log row + Sleep entry in the journal
- macOS desktop screenshot with the Sleep widget showing "13:07 - Now 48:33" — Continuity bridging iOS to macOS
- My Baby Add event central recording-button UI

Red label: *"Even desktop:"*

**Implications:** This is the gold standard but **out of scope** as actual Live Activity. We've already shipped the in-app sticky chip (A3). The Mali Sleep form on this slide has more fields than ours — Daytime/Night toggle + Comments + Add photo. **BUILD** matching the Mali form: add Daytime/Night toggle to Sleep form, add Start/End time pickers, add Comments textarea, add Add Photo (already done), keep Save.

### Slide 28 — JOURNAL (parenting)

`g3e9a920e82e_0_5`. Parenting variant of the three Journal tabs.
- Timeline: Filter chips: All / Nursing / Bottle / Diaper / Sleep / Bathing. Entries list (6 today).
- Moments: MEMORIES (Note 2e, Picture 3e, Quote not yet). DEVELOPMENT: Milestones hero (2 of 7 done) + 3 tiles (Weight 1e, Length not yet, Head circ not yet). CARE LOGS section partially visible.
- Calendar: Month grid with photo cells highlighting days with memories.

**Implication:** confirms current build of [/journal](src/app/(prototype)/journal/page.tsx). Color swap (A1).

### Slide 29 — ADD JOURNAL (parenting)

`g3e401859f3b_0_118`. Mali parenting /log composer, plus My Baby's full Add event reference.

Mali sections: Right now / Based on time of day (4 tiles: Sleep, Nursing, Diaper, Bottle), Memories (Milestone, Quote, Note, Picture), Food (Nursing, Bottle, Solids, Pumping), Activity (Diaper, Sleep, Stroll, Bathing — **highlighted yellow**), Growth rate (Weight, Length, Head circumference, partially visible).

My Baby sections: Food / Activity / Growth rate / Health (Doctor's, Vaccinations, Temperature, Illnesses, Medications) / Mood (Cheerful, Fine, Sad, Crying) / Important event (5 star tiles).

Comment (1):
- 2026-05-25 02:28 — *"show which ones are for the mom"* — anchored to the Activity section. **Implication: A2** — Mom-tracking categories (Mom mood, Symptoms, Sleep-mom, Water, Mom weight) need a visual tag in parenting since they otherwise blend in.

### Slide 30 — SLEEP (parenting + Mali Pattern view + reference)

`g3e401859f3b_0_94`. Three mocks:
- Mali Sleep form (purple)
- Mali Sleep category: *"1h 21 min today · 2 naps / 4 entries logged"*, **PATTERN - LAST 7 DAYS** dot visualization (*"Dot size = how often sleep happens at that hour across the week"*), entries list
- My Baby Sleep form reference: same Daytime/Night + Start/End + Comments + Add photo pattern as slide 27

Comment (1):
- 2026-05-25 02:02 — *"we pref this one."* — anchored to the My Baby form. **BUILD: copy My Baby's Sleep form structure** (matches the slide 27 build note).

### Slide 31 — SLEEP (Live Activity duplicate)

`g3e9f697c098_0_103`. Visually identical to slide 27. Looks like a duplicate / late copy. No new info.

### Slide 32 — BATHING

`g3e401859f3b_1_104`. Mali Bathing form + entry detail with photo + My Baby Bathing reference. All standard. No comments.

### Slide 33 — NURSING

`g3e401859f3b_1_96`. Mali Nursing timer + entries list (4 min avg · 2 today) + My Baby Nursing reference with Manual/Timer toggle and Left/Right/Both breast picker. PATTERN dot chart visible on Mali variant.

(Slide had a stray File menu open in the screenshot — ignore the chrome.)

### Slide 34 — BOTTLE

`g3e401859f3b_1_112`. Mali Bottle timer + entries list + My Baby Bottle reference. My Baby has **Quantity (ml)** field + **Breast milk / Formula** toggle. **BUILD addition:** add a quantity field + milk-type toggle to our Bottle form — currently we just have a timer.

### Slide 35 — SOLIDS

`g3e401859f3b_1_122`. Mali Solids form with TYPE chips (Veg, Fruit selected, Grain, Protein, Dairy) + My Baby reference with free-text **"Food eaten"** field. **DECIDE:** keep chips or add free-text?

### Slide 36 — PUMPING

`g3e401859f3b_1_128`. Mali Pumping timer + entries list + My Baby reference with **Quantity (ml)** field + **Left/Right/Both breast** toggle. **BUILD:** add quantity + breast fields to Pumping form.

### Slide 37 — DIAPER

`g3e401859f3b_1_135`. Mali Diaper form with TYPE chips (Wet selected, Dirty, Mixed, Dry) + entries list (2 today · 1 wet · 1 soiled, PATTERN chart). My Baby reference adds **"Clean"** option. **BUILD:** add Clean to the chips.

### Slide 38 — WEIGHT (parenting)

`g3e9abc87710_4_211`. Mali weight category detail with TREND chart + reference range + entry. **Two reference graphs at bottom** showing WHO weight-for-age curves (multi-line graph with percentiles) — Jonas indicating he wants WHO bands.

Comments (2):
- 2026-05-25 05:43 — *"Allow users to track for 5 or 10 years."* (A11)
- 2026-05-25 05:44 — *"Who shall we prep the graphs?"* (A11 — we need to spec the SVG format)

### Slide 39 — LENGTH

`g3e9abc87710_4_106`. Mali length category + Pon's height chart reference + My Baby Length form (Baby's length (cm) field). Annotation: *"Allow users to track for 5 or 10 years."* (A11)

### Slide 40 — HEAD CIRCUMFERENCE

`g3e9abc87710_4_96`. Mali Head circ category + Pon's head circumference reference + My Baby form. Educational paragraph *"The head size indicates a child's brain growth and overall health. Tracking a baby's head circumference remains important up until age 3."* — BUILD: surface that paragraph on the Mali category screen too.

### Slide 41 — DOCTOR'S VISIT (parenting)

`g3e401859f3b_1_143`. Mali Doctor's visit form + entries + My Baby reference with **dropdown list of doctor specialties** (Dentist, Ear nose & throat, Eye doctor, Hospital, Neurologist, Orthopedist, Pediatrician, Psychiatrist, Surgeon, + "New Doctor" custom).

Comment (1):
- 2026-05-25 02:17 — *"@junporn@mali.me screen missing"* (assigned to Junporn — Jonas's teammate)

**Per transcript**: Jonas concluded the extra doctor list is *"a little bit overkill I guess"* — DROP. Keep Mali's simpler Checkup/Sick visit/Specialist chips. Use the Note field if a specialist name is needed.

### Slide 42 — VACCINATIONS

`g3e401859f3b_1_149`. Mali form (TYPE chips: DTP, Hep B, MMR, Flu) + entries list + My Baby reference with a much longer list (DTaP, Encephalitis, HepA, HepB, Hib, Influenza, IPV, MMR, PCV, RV, TB, Varicella, + "New Vaccine" custom).

**DECIDE:** extend Mali's chip list to match the My Baby breadth, or keep top-4 + "Other"? Per A13, "Other" gets us the rest. Keep our chips short, add Other.

### Slide 43 — TEMPERATURE

`g3e401859f3b_1_156`. Mali Temperature form (lavender, just WHEN + NOTE + Save) + entries (showing "38") + My Baby reference with **numeric "Baby's temperature (°C)"** field, date/time, comments, Add photo. **BUILD:** add a numeric input to Mali Temperature — it's currently a generic event form, but the value (e.g. "38.5°C") is the whole point. Convert to a Measurement form variant.

### Slide 44 — ILLNESSES

`g3e401859f3b_1_164`. Mali Illnesses (TYPE chips Fever, Cough selected, Cold, Rash) + entry list + My Baby reference with long list (Bronchitis, Chicken pox, Cold, Diarrhea, Dry cough, Ear infection, Flu, Laryngitis, Respiratory infection, Rubella, Sniffles). One entry in the My Baby list reads `jjnenebbenenenenenennenenenenen` — looks like test data, ignore.

A13 — add Other.

### Slide 45 — MEDICATIONS

`g3e401859f3b_1_282`. Mali Medications (TYPE chips: Paracetamol, Ibuprofen selected, Vitamin D) + entry list + My Baby reference with a "Please choose" dropdown. A13 — add Other.

### Slide 46 — FIRST STEP

`g3e9abc87710_4_35`. Standalone My Baby-style milestone entry form for "First step". Yellow accent. Date/time, Comments, Add photo, Save. This is a one-off milestone-entry form pattern — used for marking a *specific* milestone (e.g. "first step", "first word"). Maps to our `/journal/category/milestone/[milestoneId]` Capture form.

### Slide 47 — CHEERFUL

`g3e9abc87710_4_1`. My Baby Cheerful (mood) entry form. Pink/lavender. Just date + comments + Add photo + Save. Different from our Mood form (which has a picker). My Baby's pattern is "each mood is its own entry form" — clearly simpler but more screens. **DECIDE:** keep our pill-picker pattern (less screens) or follow My Baby's separate-form-per-mood? Our pattern wins on usability.

### Slide 48 — MILESTONES (browser)

`g3e401859f3b_1_173`. Mali milestone browser ("< Milestones / 2 of 17 reached / 12% through Lu's 0-12 month milestones / Up next: Pays attention to faces →") with filter chips (All / Cognitive / Language / Emotional / So...) and a 3×N grid of milestone tiles (Smiles spontaneously [done], Sucks on hands, Looks at you, Pays attention to faces, Becomes bored, Holds head up [done], etc.). FAB. Right side: My Baby reference with similar grid + "Coos and gurgles" cloud illustration + "P Add" big button.

Comment (1):
- 2026-05-25 02:13 — *"Can create users their own?"* (custom milestones — "first time daddy", "first time grandmother".)

**BUILD — confirmed by Jonas follow-up email 2026-05-28:**

> *"Lets keep it. Once users click add (+), they should be able to add a date, image, title and notes. That's it. It then appears with a checkbox in the overview."*

Spec:
- The `+` FAB on `/journal/category/milestone` opens an add-custom-milestone form.
- Form fields: **Date** (defaults to today), **Image** (optional, via `PhotoAttachField`), **Title** (required, short text), **Notes** (optional, multiline).
- On save: create a custom milestone tile in the overview grid. Visually identical to preset tiles but checkbox **already checked** (the act of adding it = marking it done — Jonas's framing is "users click + to record a milestone they reached," not "users define a milestone to chase").
- Stored alongside presets in the milestone store. Extends the existing `setMilestoneDone(id, label, when, extra?)` flow; custom milestones get a generated id like `custom:<timestamp>` and a `label` matching the user's title.
- Threads back into the journal as a `milestone:custom:<id>` entry, same path preset milestones already take.
- No category filter chip change — custom milestones aggregate under an implicit "All" or a new "Yours" / "Custom" chip.
- **DECIDE micro-question:** add a "Custom" filter chip to the milestone browser, or fold custom into "All" only? Lean: "All" only — fewer chips, less complexity.

Files to touch: [src/lib/journal-store.tsx](src/lib/journal-store.tsx) (extend milestone store for custom entries), [src/app/(prototype)/journal/category/milestone/page.tsx](src/app/(prototype)/journal/category/milestone/page.tsx) (FAB → form), possibly a new sheet/page route.

### Slide 49 — MILESTONES (detail)

`g3e401859f3b_1_191`. Three Mali milestone detail tabs (Overview / Details / Chart) for "Holds head up":
- **Overview:** big tinted card with line-art illustration + "Holds head up / Completed on May 14, 2026" + "Saved · tap to undo"
- **Details:** "COGNITIVE · 0-3 MONTHS / Holds head up / Lifts head during tummy time. / What to watch for: Most babies reach this milestone between 2.0 and 4.5 months. / Every baby develops at their own pace — the chart shows what's typical, not a deadline. / If you're concerned, your next checkup is a good time to mention it."
- **Chart:** "% OF BABIES WHO REACH THIS · 0-3 months range" sigmoid + "Most babies reach holds head up around 3.0 months. Lu is at 3.1 months." Source: Denver Developmental Screening Tests.
- Right: My Baby reference (3 tabs equivalent, "Pon 2 did it" red button)

Comment (1):
- 2026-05-28 04:03 — *"If image was updated, this should be the image of the child."* — **CRITICAL: when a user captures a milestone with a photo, the line-art illustration in the Overview tab is replaced by the user's uploaded photo.** Touches [journal/category/milestone/[milestoneId]/page.tsx](src/app/(prototype)/journal/category/milestone/%5BmilestoneId%5D/page.tsx). Already supported partially (we store photo via `setMilestoneDone`); just need to render it in the Overview card instead of the registry illustration.

### Slide 50 — NOTE (parenting)

`g3e401859f3b_1_319`. Mali Note form (tan/beige) + entries list ("Pediatrician very happy with weight", "Held Lu skin-to-skin for an hour. Quietest hour I've ever had."). My Baby reference: Journal header → Notes filter chip selected → "Note" form with date + 2 textareas + SUBMIT.

### Slide 51 — PICTURE (parenting)

`g3e401859f3b_1_333`. Mali Picture form + Picture entries list with photo + My Baby Picture reference (full-screen image viewer with date caption + change-picture button).

Comment (1):
- 2026-05-25 02:15 — *"I think it would be nice if users can see the picture full screen (and maybe share)."* (A4 follow-on)

### Slide 52 — QUOTE

`g3e401859f3b_1_326`. Mali Quote form + entries + My Baby Quote reference.

### Slide 53 — Section "IDEAS FOR US"

`g3e3fc075785_0_8`. Divider for the late-deck ideas section.

### Slide 54 — FEED (Birth handoff + Pink)

`g3e9f697c098_0_131`. Same Birth Handoff visual as slide 25. Annotations:
- *"Should be triggered during pregnancy one day after due date. Add X."* (A14)
- *"Make Parenting also Pink."* (A1)

### Slide 55 — FEED (Cryoviva sponsor concept)

`g3e9f697c098_0_27`. Compact pregnancy header **with sponsor slot**:
- Same top strip (68 kg / Sarah Week 32 Day 5 / 200g)
- 5 mini tiles
- "Nothing today yet · last 2d ago →"
- Chevron expand
- **Yellow sponsor card**: "S-26 Club: 203 moms joined today – sign up today →"
- Heart "ลูกของคุณ" content card
- "Do you travel internationally often?" CTA

Side annotations:
- *"or Join Cryoviva (could be on rotation until clicked)"* (the right-side baby-weight ring alternates with a Cryoviva CTA)
- *"Rest of feed we keep the same."*

Right side: separate phone showing **"Parenting"-labeled article cards** stacked in the feed slot ("Some babies are born with long nails...") with a "Week 0, day 0" separator. Idea: content blocks in the feed that look like cards from a parenting team.

**Implications:** A15. Sponsor slot is a monetization idea — DECIDE whether to mock.

### Slide 56 — FEED ("Nice idea!")

`g3e9f697c098_0_118`. Mali parenting feed showing a new **inline quote card** in the feed:
- "+ A WEEK AGO TODAY" memory of "Lu's first bath at home"
- "Your baby" 3 / 1.4K content card
- **New: inline quote card** styled with `"` glyph + serif text *"The best and most beautiful things in the world cannot be seen or touched; they are felt. — HELEN KELLER"* + heart 1.4K + 0 comments + small baby illustration
- "Do you travel internationally often?" CTA

Annotation arrow → quote card → *"Nice idea!"* — Jonas approves the inline quote-of-the-day concept. **BUILD:** add a quote card to the parenting feed (or to both feeds). Picks from a curated list of parenting/pregnancy quotes. Likeable + shareable.

---

## Part B2 — Round 2 deck (feedback02.pptx, 2026-06-01)

Second review pass from Jonas. **Slide numbers here are from `feedback02.pptx` and do NOT match Part B** (a different, 66-slide deck). Single author (Jonas Lenz Koblin); feedback is a mix of pinned comments and text typed directly onto slides. This batch covers slides 3–15 (reviewed 2026-06-02).

**Build status (2026-06-02, corrected after a checklist re-review):** s4, s5, s6, s8, s9, s11, s14 **BUILT** and verified by production build (visual QA was code-review-only — Chrome MCP was down all session).

**s3 redone correctly (pass 2):** the first attempt put the due-date sheet + size-of banner on the StatStrip and collapsed the hero — all the *wrong* targets. Jonas's slide-3 mock is the **`JourneyHero` card**. Reverted StatStrip/FeedHeader to their pre-round-2 state and rebuilt `JourneyHero` as the shared compact card (Feed + Moments): trimester · Week · "Your baby is about the size of a <X>" + image · progress · **tappable due date** (opens a change-due-date sheet). The Feed FAB now hides on scroll (`PrimaryFAB hideOnScroll`) while Journal's stays visible (resolves the s3-vs-s7 conflict). ⚠️ **baby-as-animal image still a placeholder** (reuses the weekly watercolor — no creature art asset; size value is still fruit, not an animal).

**s7:** "replicate card from Feed" now **DONE** (same `JourneyHero` renders on both surfaces); FAB stays big/visible on Journal.

**s13:** "Mom's wellbeing" rename applied to **both** the Moments section and the `/log` composer group header; first-person labels done; **pink = surgical** (MOM badge coral only — the `[data-phase="parenting"]` teal override still stands; full pink-only A1 remains open).

**s13 mood — corrected 2026-06-02 (was mis-targeted twice).** Jonas's "reduce to one, same like MOM … move it up to Health" is about the **baby** mood: the four tiles (Cheerful/Fine/Sad/Crying, group "Mood") are now a **single `mood` category in the Health group** that opens a picker (like `mom-mood`). The "Mood" group is gone. `mom-mood` ("My Mood") stays in Mom's wellbeing (a prior pass wrongly moved *mom-mood* to Health — reverted).

Still DECIDE / not built: **s10** (article reader), **s12** (image-only legacy graphs), **s15** (icon-vs-drawing rule), and the **baby-as-animal art** (asset-blocked).

**s5 revisited (2026-06-02):** the sticky SaveBar was clunky — Sudhir reverted it. `TimerEntryForm` was redesigned compact and fits without scrolling, so Save sits naturally at the bottom (satisfies Jonas's "Save always visible" without pinning): no duration headline (small label by End), no preset chips. Capture method is a **`Manual | Live timer` toggle** at the top (My Baby Manual/Timer pattern, slide 34) — Manual shows Start/End + extras + Save; Live shows Start→Stop, then hands the filled times back to Manual to review & save. **Daytime/Night manual toggle dropped** — auto-derived from the start time and still saved, but it was redundant with the start and drove nothing in-app.

### R2 s3 — Feed header
- **BUILD.** Due-date element should be a **link** (*"see right"*) — same ask as A5b; reinforces making the right-ring due date tappable.
- **BUILD.** Add a **baby-as-animal image** to the header plus the line *"Baby is the size of xxx"* — carries the weekly-hero "size of" framing onto the feed.
- **BUILD.** A header element should **collapse on scroll** — *"Make this disappear when scrolling down (we prefer not to have it)."* Extends the existing scroll-collapse behavior (Part B, round-1 slide 9).

### R2 s4 — Timer screens (roll new form everywhere)
- **BUILD.** *"A lot of screens still have the old timer, we prefer the new one / SLEEP."* Roll the retro **start/end** SleepForm pattern out to **every** timer category (nursing, bottle, pumping, stroll, bathing — all still `TimerForm`). Rationale: *"you can't add historic data"* on the old timer. Only `sleep`/`sleep-mom` use the new form today ([log/[category]/page.tsx](src/app/(prototype)/log/%5Bcategory%5D/page.tsx), `SleepForm` vs `TimerForm`).

### R2 s5 — Sleep entry form
- **BUILD.** Simplify field styling — *"Current design we have lines around entry fields"* vs *"MY BABY looks more simple."* Lighten/remove the boxed borders on Start/End.
- **BUILD.** Make **Save always visible** — in My Baby *"the SAVE is always visible"*; ours only appears after scrolling. Pin/stick the SaveBar. Also clarify the CTA (*"Does this CTA be more clear?"*).

### R2 s6 — Composer (/log)
- **BUILD.** *"If only one category is selected, the PLUS button should open to add entry from that category."* When the journal/composer is filtered to a single category, the FAB should deep-link straight to that category's add-entry form.

### R2 s7
- **BUILD.** *"Replicate card from Feed"* (carry a feed card pattern over — confirm which card visually) and *"keep plus button big and visible at all times."*

### R2 s8 — My Weight category
- **BUILD.** Add-weight affordance isn't discoverable. *"Do you think people will see the + here, or shall we add a PLUS button … (more intuitive)"* + pinned *"Fix this."* Add a clear PLUS / FAB to log weight from the category overview.

### R2 s9 — Save routing
- **BUILD.** *"After SAVE I should come to My Weight overview."* Post-save should land on the **category overview**, not go back. ⚠️ Conflicts with the current save contract (`useSaveEntry` → `router.back()` — see CLAUDE.md "Entry form save contract"). Reconcile by routing to `/journal/category/<id>` after save instead of `back()`.

### R2 s10 — Article reader
- **DECIDE.** *"Show how we display an article."* Design the in-app article/content surface behind "Read more" (tip / quote / educational cards). No reader screen exists yet.

### R2 s11 — Milestones
- **BUILD.** *"Add default milestone drawing (which we replace with an image if it was added)."* Default each milestone to its line-art mascot; swap in the user's photo when one is attached. Art registry already exists ([milestone-art.ts](src/lib/milestone-art.ts)).

### R2 s12 — Legacy growth graphs
- **DECIDE.** *"We don't have this graph as data, but just as pictures. Can you show us how we can add this to the new design with the existing images?"* Propose how to surface image-only legacy graphs inside the new charts UI.

### R2 s13 — Moments: Wellbeing section
- **BUILD.** Rename section to **"Mom's wellbeing"**; rename tiles to first person — **"My Weight / My Mood / My …"**.
- **BUILD.** The **MOM badges render teal** — make them **pink**. This is a color bug regardless of the A1 pink-only outcome (teal shouldn't appear). Ties to A1/A2.
- **DONE.** *"Reduce to one, same like MOM, so in the overview we got only one. Move it up to Health."* The four baby-mood tiles (Cheerful/Fine/Sad/Crying) collapsed into a single `mood` tile in the **Health** group that opens a mood picker (like `mom-mood`). The standalone "Mood" group is gone. (mom-mood stays in Mom's wellbeing.)

### R2 s14 — "/log" Right-now suggestions
- **BUILD** (Jonas invited input — *"what do you think?"*). Change **"Based on time of day" → "Based on your use"** and show the **top-4 most-used** categories instead of time-of-day picks. Rationale: babies sleep/eat at irregular times, so time-of-day suggestions misfire.

### R2 s15 — Icons vs illustrations
- **DECIDE.** *"When do we use icons and when these little drawings?"* Define a usage rule (utility icons vs brand illustrations). Ties to the 3-layer Iconography system in CLAUDE.md.

---

## Part C — Open questions for next Jonas check

- **Pink-only color (A1)** — Jonas re-opened in follow-up email 2026-05-28 as an opinion question. Sudhir's reply drafted (leaning yes, asking about secondary accent for Mom-tracking rows in parenting). Awaiting Jonas's read on the accent sub-question.
- ~~**Custom milestones**~~ — **RESOLVED 2026-05-28** by Jonas email: keep. Form = date / image / title / notes; appears with checkbox in overview. See slide 48 entry above.
- **Sponsor / Cryoviva placement** (A15) — Sudhir's call on whether to mock.
- **Mom-track visual** in parenting (A2) — pill label vs colored row vs side strip. Blocked on A1 outcome.
- **Solids: chips vs free-text** (slide 35) — pick one.
- **Vaccinations: short chip list + Other vs longer list** (slide 42) — confirm.
- **Mom-weight graph in parenting**: extend the pregnancy chart, or use a tab pattern? (slide 13 comment, A2.)

Round 2 (feedback02.pptx) decides:
- **Article reader** (R2 s10) — how do we display a "Read more" article in-app? No surface exists.
- **Legacy growth graphs** (R2 s12) — old graphs are images, not data; how to surface them in the new charts UI?
- **Icons vs illustrations** (R2 s15) — define when to use utility icons vs brand "little drawings".
- **Save routing** (R2 s9) — confirm post-save lands on category overview (changes the `router.back()` save contract).

## Part D — Asset and resource references

- **New pregnancy illustrations**: https://drive.google.com/drive/folders/1m8W_ey6mBRes53oBXue4P6YvUCgSMr9v (slide 6 comment — pull down, merge into `public/mali-art/weekly/`)
- **Existing assets**: `public/mali-art/{weekly,milestones,category}/` (registries in [milestone-art.ts](src/lib/milestone-art.ts), [category-art.ts](src/lib/category-art.ts))
- **Source PPTX**: [mali-source/feedback.pptx](mali-source/feedback.pptx) (Sudhir's local copy with comments preserved)
- **Plain-text extraction** of slides + comments: [mali-source/deck-extracted.txt](mali-source/deck-extracted.txt) (regen with `python3 /tmp/extract_pptx.py`)
- **Transcript**: [mali-source/feedback.txt](mali-source/feedback.txt)
- **My Baby reference screenshots**: `mali-source/screenshots/IMG_*.PNG` (IMG_9049/9050/9055/9060/9062/9063/9064 are the positive references)
- **Production prototype**: https://mali-proto.vercel.app (requires Deployment Protection disabled to view publicly)

## Part E — Glossary

- **Cryoviva** — stem-cell banking service, slide 55. Potential paid placement in the feed.
- **S-26 Club** — Nestlé S-26 formula brand's loyalty club, slide 55. Same sponsor slot idea.
- **My Baby** — competitor app the team explicitly references positively. Several entry forms (Sleep, Bottle, Pumping, etc.) should match its patterns.
- **Mali Weekly Update** — the standalone "Your week N" content card in the current pregnancy feed. Slide 4 comment says *"We don't need the Weekly Update"* — i.e., kill this card; the weekly illustration moves into the header.
- **Pon** — name used in My Baby reference screens (parallel of our "Lu").
- **Junporn** — Jonas's teammate (`@junporn@mali.me`) who owns the missing-screen production tasks.
