# COPY.md — every on-screen string in the Mali prototype

This is the index of all user-facing text in the prototype, organized by screen.
Use it to find any piece of copy and where it lives, so you can change wording
without hunting through code.

## How to edit copy (for the Mali team)

1. Open this repo in **Claude Code** — easiest is the browser at
   **claude.ai/code** (no local setup), pointed at `github.com/sudhirnain/mali-proto`.
2. Describe the change in plain English, pasting the **exact current string**.
   Example: *"On the nursing form, change `How did it go?` to `How was the feed?`"*
   Claude will find it and make the edit.
3. Claude opens a **pull request**. Sudhir reviews it and deploys — the change
   goes live at **mali-proto.vercel.app**.

Tips:
- **Search by the quoted string, not the line number.** Line numbers here are
  approximate and drift as the code changes; the exact text is the reliable anchor.
- Many strings differ by **phase** (pregnancy vs parenting) or **state**
  (cold/empty vs populated) — those variants are grouped together below, so change
  the right one (or both).
- Strings in `{curly braces}` are filled in by data (a name, a number, a date) —
  edit the words around them, leave the `{...}` placeholders in place.
- **Long-form content** (articles, weekly blurbs, quotes, the seeded journal
  entries) lives in dedicated files listed at the end — edit those directly.

---

## Feed page — `src/app/(prototype)/feed/page.tsx`

- "Your baby" — tip card section heading
- "FAQ" — FAQ card section heading
- "Read more →" — article card link
- Article eyebrows/titles/bodies (pregnancy feed): "Nutrition" / "The importance of DHA and Omega-3 in pregnancy"; "3rd trimester" / "What's safe to eat — and what to skip"; "Preparing" / "Your hospital bag — the short version"; "Wellbeing" / "Sleep tips for late pregnancy"; "What to expect" / "Braxton-Hicks vs. the real thing"
- FAQ: "I think my baby is moving less. Is there something wrong?" / "Baby moving less can be caused by a medication or your stress level…"

## Feed header — `src/components/FeedHeader.tsx`

- "{babyName} is the size of {article} {sizeFruit}" — scroll pill, pregnancy only
- "Collapse" / "Show progress and more trackers" — chevron aria-label (expanded / collapsed)

## Stat strip — `src/components/StatStrip.tsx`

- Parenting: "Length", "Weight" — side-stat captions
- Pregnancy: "Your weight", "Add weight" (empty CTA), "Baby's weight", "Needs update" (stale-weight dot)
- "Change family photo" — camera badge aria-label, top-right of the header photo (cycles the family-photo backdrop; lives in `FeedHeader.tsx`)
- "Add family photo" — aria-label of the no-photo state's hand-drawn polaroid + arrow + camera button (same spot, shown when no family photo is set; lives in `FeedHeader.tsx`)

## Welcome card (cold state) — `src/components/WelcomeCard.tsx`

- Parenting headline: "Welcome, {baby.name} — let's capture today."
- Pregnancy headline: "Let's start your journal today."
- Pregnancy suggestions: "Take this week's bump photo" · "Log a kick session" · "Note how you're feeling"
- Parenting suggestions: "Log {name}'s first nursing" · "Take {name}'s first Mali photo" · "Note how today's going"

## Journal pulse strip — `src/components/JournalPulse.tsx`

- Cold: "Start your journal — tap a card above"
- Populated: "{N} entry today" / "{N} entries today" · "Nothing today yet" · " · last {time} ago"

## Memory thread — `src/components/MemoryThread.tsx`

- Anniversary labels: "A week ago today" · "Two weeks ago today" · "A month ago today" · "Three months ago today" · "A year ago today"

## Quick-log cards — `src/components/QuickLogCard.tsx`

- Card title = category label · subtext = last event time or "Not yet" (cold)

## Floating "+" button — `src/components/PrimaryFAB.tsx`

- "Add to Journal" (label + aria-label)

## Bottom tab bar — `src/components/BottomTabBar.tsx`

- "Feed" · "Shop" · "Care" · "Journal" · "Deals" · "More" (Shop/Care/Deals/More are disabled)

---

## Journal — Timeline tab — `src/app/(prototype)/journal/page.tsx`

- Header: "Journal" · "{N} entry this week" / "{N} entries this week"
- Tab labels: "Timeline" · "Moments" · "Calendar"
- Filter chips: "All"
- Single-filter shortcut: "See {category} chart & stats"
- Day buckets: "Today" / "Yesterday" · "{N} entry" / "{N} entries"
- No-results: "No matches" / "Try fewer filters or a different category."
- Cold state: "Nothing logged yet" · "Your journal starts here" · "Every moment with {baby.name} — every nursing, every smile, every photo — lives here." · "Tap Moments above to browse every kind of moment you can capture."

## Journal — Moments tab — `src/app/(prototype)/journal/moments/page.tsx`

- Header: "Journal" · "{N} entries across {section}, {section}, and {section}"
- Per-section summary: "{N} entry" / "{N} entries"
- Section labels (parenting): "Memories" · "Development" · "Care logs" · "Health" · "Mom's wellbeing"
- Section labels (pregnancy): "Memories" · "Your journey" · "Body" · "Mom's wellbeing" · "Health"

## Journal — Calendar tab — `src/app/(prototype)/journal/calendar/page.tsx`

- Header: "Journal" · "{N} entry · {Month} {Year}" / "{N} entries · …"
- Month nav: "Previous month" / "Next month" (aria-labels)
- Weekday headers: S M T W T F S
- Selected day: "Today" / "Yesterday" · "{N} entry" / "{N} entries"
- Empty day: "Nothing logged that day" / "Tap a tinted tile or a photo tile to see what's there." / "Add an entry"

---

## Category detail — `src/app/(prototype)/journal/category/[id]/page.tsx`

- Title = category label · subtitle = "{N} entry logged" / "{N} entries logged"
- Computed headlines: "{avg} min avg · {N} today" (nursing/bottle/pumping) · "{h} h today · {N} naps" (sleep) · "{N} today · {wet} wet · {dirty} soiled" (diaper)
- **Fever warning (Temperature only):** "For newborns, a temperature of 38 °C or higher is a medical emergency — see a doctor immediately."
- Growth chart: "3rd – 97th percentile" (band) · "Lu is on track for healthy growth." (baby) / "You are on track with healthy weight gain." (mom) · "Read more"
- Range tabs: "3m" · "1y" · "5y" · "10y" · period labels "Last 7 days" / "Last 12 weeks" / "Last year" / "Last 5 years" / "Last 10 years"
- Empty: "No {category} entries yet" / "Once you start logging, you'll see your history and trends here." / "Add the first one"
- Error: "Unknown category" / "Back to Journal"

### Milestones list (category = milestone)
- "Milestones" · "{done} of {total} reached" · "{pct}% through {baby.name}'s 0–12 month milestones" · "Up next: {label} →" · "Add custom milestone"

## Milestone detail — `src/app/(prototype)/journal/category/milestone/[milestoneId]/page.tsx`

- Tabs: "Overview" · "Details" · "Chart"
- CTA: "Save as memory" (not done) / "Saved · tap to undo" (done)
- Capture form: "Capture this moment" · "When did this happen?" · "Add a note (optional)" · "The story of when {babyName} did this…" (placeholder) · "Add a photo (optional)" · "Tap to add a photo"
- Overview: "Completed on" · "When {babyName} reaches this, fill in the moment below and tap Save as memory."
- Details: "What to watch for" · "Most babies reach this milestone between {X} and {Y} months." · "Every baby develops at their own pace — the chart shows what's typical, not a deadline." · "If you're concerned, your next checkup is a good time to mention it."
- Chart: "% of babies who reach this" · "Most babies reach {milestone} around {N} months. {babyName} is at {N} months." · "Read more" · "Source: Denver Developmental Screening Tests"
- Error: "Unknown milestone" / "Back to Milestones"

## Entry detail — `src/app/(prototype)/journal/entry/[entryId]/page.tsx`

- Title = category label · "Duration" (callout) · "Edit" · "Delete" / "Confirm delete" · "See all {category} entries"
- Error: "Entry not found" / "Back to Journal"

---

## Add to Journal (the log composer) — `src/app/(prototype)/log/page.tsx`

- Header: "Add to Journal"
- Right-now strip caption: "based on your use"
- Section headings: "Memories" · "Care" · "Growth rate" · "Health" · "Mom's wellbeing" · "Pregnancy"
- Pregnancy coming-soon block: "After your baby arrives" / "A peek at what you'll track once baby is born."
- Mom badge (parenting): "Mom"

## Entry forms — `src/app/(prototype)/log/[category]/page.tsx`

- Page header: category label (new) / "Edit {category}" (editing)
- Error: "Unknown category"

### Timer form (sleep, bottle, pumping, stroll, bathing, Mom's sleep)
- Toggle: "Manual" / "Live timer"
- Live: "Running — keeps going if you navigate away" · "Stop & review" · "00:00" · "Start timer" · "Runs in the background — Stop fills the times so you can review & save."
- Fields: "Start" · "End" · "End is before start" (error) · "Quantity (ml)" · "Comments (optional)" / "Anything you want to remember?"
- Side toggle (nursing/bottle): left / both / right · Milk type: "Breast milk" / "Formula"

### Nursing form
- Toggle: "Manual" / "Live timer"
- Live sides: "Left" / "Right" · buttons "Start" / "Pause" / "Resume"
- **Quality: "How did it go?" — options "Poor" · "Okay" · "Good"** (Good is pre-selected)
- "Comments (optional)" / "Anything you want to remember?"
- Manual: "Left (min)" · "Right (min)" · header "Reset timers"

### Measurement form (weight, length, head, temperature)
- "Date" · "Today, {time}" · "{category} ({unit})" · "Your trend is on track. Tap the chart in the journal to see history."

### Event form (diaper, solids, doctor, vaccinations, illnesses, medications, symptoms, hydration)
- "When" · "Type" (preset chips) · "Describe" / "Note (optional)" · "What was it?" / "Anything else?" (placeholders)
- Diaper presets: Wet · Dirty · Mixed · Clean · Other
- Solids presets: Veg · Fruit · Grain · Protein · Dairy · Other
- Doctor presets: Checkup · Sick visit · Specialist · Other
- Vaccinations presets: DTP · Hep B · MMR · Flu · Other
- Illnesses presets: Fever · Cough · Cold · Rash · Other
- Medications presets: Paracetamol · Ibuprofen · Vitamin D · Other
- Symptoms presets: Nausea · Headache · Swelling · Heartburn · Fatigue · Back pain · Cramping · Other
- Hydration presets: Gulp (50ml) · Small Glass (150ml) · Cup (250ml) · Glass (350ml) · Bottle (500ml) · Large (1L)

### Mood pickers
- Baby mood (category = mood): label "Baby's mood" — Cheerful · Fine · Sad · Crying · Other
- Mom mood (category = mom-mood): label "How are you?" — Cheerful · Fine · Anxious · Overwhelmed · Grateful · Other

### Kicks form
- "of {goal} kicks" · "Tap for a kick" / "Reached!" · "Last session: {N} kicks, {N} min"
- Celebration: "Great!" · "You felt {count} movements in {minutes} minute(s)." · "Healthy babies move at least 10 times in two hours. Yours is doing great." · "Save session"

### Contractions form
- Running: "Current contraction" · "after a {gap} gap"
- Idle w/ history: "{time} since last contraction" · "Last contraction · {N}s"
- Fresh: "00:00" · "Tap below when a contraction starts"
- Button: "Start contraction" / "Stop contraction" / "Start next"
- Help: "What's a true contraction?" / "True contractions indicate the onset of labor. They increase in frequency until they are 5 minutes apart or reach 12 contractions per hour."
- CTA: "End session"

### Note / Quote / Picture form
- "When" · "Quote" / "Note" (label) · "Something they said today…" / "What's on your mind?" (placeholders) · "Tap to add a photo"

### Shared form buttons
- "Photo (optional)" · "Attach photo" · "Remove" · "Save" / "Save changes" · "Done"

---

## Article reader — `src/app/(prototype)/article/[slug]/page.tsx`

- Renders an article's eyebrow / title / "{N} min read · Mali" / body / "Source: {source}" (content in `articles.ts`)
- Error: "Article not found" / "Back to feed"

## Profile — `src/app/(prototype)/profile/page.tsx`

- "Profile" · baby name + age · phase label "Pregnancy" / "Parenting"
- Settings rows: "App settings" · "Due date & milestones" · "Birth certificate" · "Parenting guide" · "Care team" · "To-do lists"
- Footer: "Mali v2.9.4"

## Birth handoff overlay — `src/components/BirthHandoff.tsx`

- "Welcome, {mom.name}." · "Your new chapter begins." · "{baby.name} has arrived. Every moment from here lives in your journal." · "Your pregnancy story is kept safe — saved as \"before {baby.name}\"." · "Begin"

## Active-timer chip — `src/components/ActiveTimerChip.tsx`

- "{category} running, tap to manage" (aria-label)

---

## Hero cards — `src/components/journal/`

**MilestoneHero** (`MilestoneHero.tsx`): "Milestones" · bucket label (e.g. "0 – 3 months") · "{done} of {total} done" · "Next milestone: {label} →" / "All done — nice →"

**JourneyHero** (`JourneyHero.tsx`): "1st/2nd/3rd trimester" · "Week {week}" · "Your baby is about the size of {article} {animal}" · "{pct}% through pregnancy" · "Due date {date} →" · due-date sheet: "Change due date" / "Cancel" / "Save"

**CategoryTile** (`CategoryTile.tsx`): label · "Not yet" / "{N} today · last {time}" / "{N} entries · {time}"

## Milestones browser + custom sheet — `src/components/`

**MilestonesBrowser**: filter chips "All" · "Cognitive" · "Language" · "Emotional" · "Social"; buckets "0 – 3 months" / "4 – 6 months" / "7 – 12 months"; "{done} of {total} completed"

**CustomMilestoneSheet**: "New milestone" · "A moment worth remembering — first time at the beach, grandma's first visit, anything." · "Title" / "e.g. First time at the beach" · "Date" · "Notes (optional)" / "Anything you want to remember about this?" · "Photo (optional)" · "+ Add photo" · "Cancel" · "Save as memory"

---

## Charts — `src/components/CategoryBarChart.tsx` & `MomWeightChart.tsx`

Every "Last 30 days" chart shares: "Last 30 days" (header) · "30 days ago" / "today" (x-axis). Per chart:

- **Sleep** (`Sleep`, hours): series "Baby" / "Mom" (legend only — the interactive Baby/Mom pills were removed Jun-11); blurb "Total hours of sleep per day. Newborns often need 14–17 h of total sleep, toddlers 11–14 h. Pregnant mothers need ~8–9 h; new mothers often get 5–6 but need 10+ to heal."; footer "{N} h baby · {N} h mom daily avg". *Shows on both the baby Sleep and Mom's Sleep pages.*
- **Nursing** (`Feeds`, minutes): series "Poor" / "Okay" / "Good"; blurb "Each block is one nursing session — grey = poor, light green = okay, green = good. Minutes per day."; footer "{N} min daily avg"
- **Pumping** (`Pumping`, ml): "Total volume pumped per day (ml)." · "{N} ml daily avg"
- **Bottle** (`Bottle`, ml): "Bottle-fed milk per day (ml). First month ~450–750 ml, later 750–950 ml." · "{N} ml daily avg" · "Read more"
- **Diaper** (`Diapers`): series Wet / Dirty / Mixed / Clean / Other; "Diapers per day by type — … Tap a type to show or hide it." · "{N} daily avg"
- **Temperature** (`Temperature`, °C): "Highest temperature measured per day. 38 °C+ is shown in red (see the warning above)." · "{N} °C avg" · "Read more"
- **Water** (`Water`, litres): ghost label "2.5 L recommended"; "Total fluid per day against the 2.5 L target… Pregnant mothers ~2.5 L (about 10 cups), breastfeeding moms up to 3 L." · "{N} L daily avg"

**MomWeightChart** — pregnancy: "Ideal weight gain" / "During pregnancy" · "ideal range" · axis "wk 0 / wk 13 / wk 27 / wk 40" · blurb "Based on your pre-pregnancy weight of 50 kg and height of 160 cm, you should have gained about 10.8 kg by now." · "Read more". Parenting: "Last 12 months" / "Parenting" · "birth" marker · axis "12 mo ago / now" · "Your weight across the past 12 months — the climb to birth, then recovery." · "Read more"

---

## Category labels — `src/lib/categories.ts`

The name shown on every tile, card, and detail header. Some baby/mom pairs share a
label (Weight / Mood / Sleep) on purpose — the pink "Mom" treatment distinguishes them.

| id | label | | id | label |
|---|---|---|---|---|
| nursing | Nursing | | temperature | Temperature |
| bottle | Bottle | | illnesses | Illnesses |
| solids | Solids | | medications | Medications |
| pumping | Pumping | | weight-mom | Weight |
| diaper | Diaper | | mom-mood | Mood |
| sleep | Sleep | | symptoms | Symptoms |
| stroll | Stroll | | hydration | Water |
| bathing | Bathing | | sleep-mom | Sleep |
| weight-baby | Weight | | kicks | Kicks |
| length | Length | | contractions | Contractions |
| head | Head circumference | | milestone | Milestone |
| mood | Mood | | quote | Quote |
| doctor | Doctor's visit | | note | Note |
| vaccinations | Vaccinations | | picture | Picture |

---

## Long-form content — edit these files directly

- **`src/lib/articles.ts`** — the 8+ full articles (eyebrow, title, body paragraphs, source). Slugs include `dha-omega3`, `safe-to-eat`, `hospital-bag`, `sleep-late-pregnancy`, `braxton-hicks`, `bottle-feeding-amounts`, `newborn-fever`, `healthy-weight-gain`, `milestones-pace`.
- **`src/lib/mom-content.ts`** — weekly pregnancy blurbs (weeks 6 / 12 / 20 / 28 / 32 / 36 + fallback) shown on the feed's "My week" card.
- **`src/lib/mock-quote.ts`** — the rotating quotes + the feed tip + the FAQ question/answer.
- **`src/lib/mock-entries.ts`** — the pre-populated journal entries you see in the demo (their short descriptions / `meta` text).

## Not in this index (developer-only)

The **DemoNavigator** and **Adjust (for Mali team)** panel (`DemoNavigator.tsx`,
`TweakPanel.tsx`) are demo controls, not part of the app users see — their copy is
intentionally excluded.
