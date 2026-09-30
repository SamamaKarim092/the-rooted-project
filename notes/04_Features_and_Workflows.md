# 04. Features & Interactive Workflows

Parent: [[00_Index]] | Previous: [[03_Architecture_and_Data_Model]] | Next: [[05_Implementation_Log]]

---

## 🖥️ Screen-by-Screen Breakdown

### 1. Dashboard (`/` or Today Sanctuary)
The unified single-screen "Today" sanctuary matching **`design_concept_7_homepage_redesign.jpg`**:
- **Editorial Header & Floating Metric Capsules**:
  - Greeting: "Good morning, Alex · September 21, 2026" (or dynamic time-of-day greeting with formatted calendar date).
  - Grounding mantra: "Grounded intentions for a conscious, steady flow."
  - Floating metric capsules:
    - Harmony % (e.g. `91% Harmony`).
    - Days Rooted streak (e.g. `24 Days Rooted 🔥`).
    - Sleep Rest duration (e.g. `7.8h Rest`).
    - Daily Intentions completed/total (e.g. `5 of 7 Intentions`).
- **Canonical 2x2 Sanctuary Grid**:
  1. **Daily Intentions Card (Top-Left, Forest Green `#1E3127`)**:
     - Strictly displays tasks where `dueDate === today`.
     - Header shows active count badge (`X of Y`) and subtitle "Strictly today's conscious focus".
     - Task items with one-click checkmark toggle, category pill badges, and due time tags.
     - "+" modal defaulting `dueDate` to today.
  2. **Today's Rituals Card (Top-Right, Off-White `#FFFFFF`)**:
     - Actionable checklist of today's recurring habits with one-click toggle commit (`toggleHabitLog`).
     - Category pill badges (`Mind`, `Body`, `Craft`, `Spirit`, etc.).
     - Flame streak count (`🔥 N`).
     - Real-time progress bar and percentage of habits completed today.
  3. **Long-Term Vision Card (Bottom-Left, Forest Green `#1E3127`)**:
     - Active long-term goals with carousel navigation (`< Goal 1 of 3 >`).
     - Dynamic progress bar and achievement percentage.
     - Botanical milestone progress track: dynamic node pins with botanical icons (`Seed 🌱`, `Sprout 🌿`, `Milestone 🌸`) and interactive toggle directly on the track.
     - "Explore Roadmap →" link to full milestones manager (`/milestones`).
  4. **Rest Sanctuary Clock Card (Bottom-Right, Off-White `#FFFFFF`)**:
     - 24-hour radial SVG clock dial with glow gradient arc connecting bedtime to wake-time along the perimeter.
     - Left panel: duration (`7.8 hrs`), target comparison chip (`+0.3h surplus` or deficit), quality badge (`Restful & Deep`), and bedtime/wake-time capsule chips.
     - Quick "Adjust / Log Rest" button triggering the `MorningSleepDialog`.
- **Automated Lifecycle Dialogs**:
  - **Morning Sleep Check-in**: Evaluates on load; if no sleep log exists for today and user hasn't dismissed it, prompts check-in pre-filled with yesterday's times.
  - **Periodic Rhythm Review Modal**: Automatic weekly (Mondays) and monthly (1st–5th) retrospective audits.

---

### 2. Tasks (`/tasks`)
A comprehensive to-do manager for organizing all actionable responsibilities:
- **Clean Drag-to-Shuffle Reordering**:
  - Each task card features an organic **3-horizontal-line drag grip handle** on the left.
  - Reordering resolves with immediate optimistic UI state updates (`setTasks(reordered)`) with zero latency and no page refresh needed.
  - Server persistence is executed safely via `startTransition(async () => { await reorderTasks(...) })` outside the render phase, committing the continuous sequence atomically to SQLite with `prisma.$transaction`.
- **Full Task Lifecycle (Edit & Delete)**:
  - **Edit Intention Modal**: Clicking the `Pencil` icon opens the pre-populated Edit modal allowing modifications to Title, Description, Category, Priority, Due Date, and Goal alignment. Persisted via the `updateTask` server action with optimistic updates and multi-page cache revalidation.
  - **Instant Deletion**: Clicking the `Trash2` icon removes the intention instantly from the UI and deletes it from SQLite via `deleteTask`.
- **Streamlined Task Metadata**:
  - Time completion badges have been removed from task cards to keep focus purely on execution and date deadlines.
  - Task creation modal streamlined to 3 core attributes: Category, Priority, and Due Date.
- **Cleaned 6-Pillar Categories**:
  - Cleaned up parenthetical suffixes: **`Study`** and **`Career`** (removed `(Education)` and `(Job)`).
- **Today's Clock Dial Counter**:
  - Positioned prominently in the top header row right beside the `+ New Intention` button.
  - Styled as an organic circular clock dial with 12 hour tick marks, SVG progress arc (terracotta in progress, sage green at 100%), central `${completed}/${total}` counter and percentage, and textual intention status (`X intentions left` or `✨ All intentions met!`).
  - Keeps the `/tasks` page focused strictly on today's execution rhythm without visual clutter.
- **Prominent Date Section Headings**:
  - Below the filter tabs, tasks are grouped under prominent, editorial date section headings with intuitive icons and intention count badges:
    - **`Today` tab**: Shows a prominent banner heading like `Today, 6 Sep 26` (with day of week `Sunday`).
    - **`Upcoming` tab**: Automatically recognizes relative dates:
      - If due 1 day after today: `Tomorrow, 7 Sep 26`
      - If due later: `Wednesday, 10 Sep 26` (or `10 Sep 26`)
      - Tasks are sorted chronologically under their respective date headings.
    - **`Completed` tab**: Grouped by date completed/due (e.g. `Today, 6 Sep 26`, `Yesterday, 5 Sep 26`, `31 Aug 26`).
    - **`Overdue` tab**: Grouped by overdue date (e.g. `Yesterday, 5 Sep 26`, `28 Aug 26`) with a terracotta `"Needs Attention"` badge and overdue day counter.
    - **`All` tab**: Chronological date groups showing overdue, today, tomorrow, and future roadmaps.
- **Filter & Ordering Engine (`Filter & Order` button)**:
  - Accessible via a prominent editorial button (`SlidersHorizontal` icon) in the task navigation bar.
  - Displays an active notification pip (`bg-[#D98A6C]`) whenever a custom sort or filter is active.
  - **Ordering Modes**:
    - **Last entered on top (Top - Bottom)**: Sorts intentions by creation timestamp descending (`createdAt` newest first).
    - **Last entered on bottom (Bottom - Top)**: Sorts intentions by creation timestamp ascending (`createdAt` oldest first).
    - **Custom manual rhythm**: Uses custom drag-to-shuffle sequence (`order` index).
    - **Priority (Urgent → Low)**: Arranges by urgency weight (`Urgent` $\rightarrow$ `High` $\rightarrow$ `Medium` $\rightarrow$ `Low`).
    - **Due Date (Earliest → Latest)**: Sorts by closest calendar deadline.
  - **Priority Filters**: Quick buttons to isolate `ALL`, `URGENT`, `HIGH`, `MEDIUM`, or `LOW` intentions.
  - **Goal Alignment Filters**: Filter between `All Intentions`, `Linked to Goal`, or `Independent Only`.
  - **Visual-Order-Aware Drag & Drop**: Dragging a task while in any view calculates placement relative to the active on-screen visual sequence, smoothly auto-switches to `CUSTOM` rhythm, and saves the new order atomically to the database.
  - **Uncluttered Interface**: Removed redundant banner strips below the tabs; active filter status is indicated cleanly via the button's pulsing indicator pip and the checkmarks within the popover menu.
- **Inline Quick-Add Bar (Speed of Capture)**:
  - Positioned directly above the task list for frictionless daily capture.
  - Input field (*"Plant an intention for today... (Press Enter to save)"*) allows instant keyboard-driven intention entry without opening any modal dialog.
  - Features quick inline selectors for Category (`Craft`, `Mind`, `Body`, `Spirit`, `Study`, `Career`) and Priority (`Low`, `Medium`, `High`, `Urgent`).
  - Pressing `Enter` or clicking `Plant →` inserts the task optimistically into today's list and persists to SQLite via `createTask`.
- **1-Click Quick Reschedule ("Move to Tomorrow" / "+1 Day")**:
  - Located directly on the action strip of every **Pending (uncompleted)** task card (`CalendarPlus` icon).
  - Automatically hidden once a task is marked completed to preserve visual cleanliness.
  - In a single click, calculates tomorrow's calendar date (`+1 day`), updates the task's due date optimistically, and moves it to tomorrow in SQLite via `rescheduleTask`.
- **"Reschedule Yesterday's Intentions to Today" (1-Click Morning Reset Banner)**:
  - Automatically appears at the top of the task list whenever there are pending intentions specifically from yesterday (`dueDate === yesterday`). Older backlog intentions remain organized in the historical Overdue/All tabs without cluttering the morning ritual.
  - Displays: *"Morning Reset: X intentions left from yesterday"*.
  - Subtitle: *"Bring unfinished intentions directly into today's focus with one click."*
  - A single tap on **"Reschedule to Today"** moves only yesterday's pending tasks to today's date both optimistically and in SQLite/Turso via `rescheduleYesterdayTasks`, providing an uncluttered, grounded morning start.
  - Includes a **1-Day Persistent Dismissal** button (`X`): dismisses the banner for the entire calendar day (persisted in browser `localStorage`), ensuring it will not reappear upon page reload or navigation until the next morning.
- **Mindful "Rooted" Polish & Motivation**:
  - **Tranquil Completion Ripple**: Toggling an intention to completed fires an active, organic multi-sensory ripple: concentric expanding wave rings pulse from the checkmark button, a radial botanical glow sweeps across the card, the card lifts with a soft sage aura (`bg-[#EBF5EE] ring-2 ring-[#7C9A86]/50 shadow-[0_4px_24px_rgba(124,154,134,0.35)] scale-[1.015]`), and a playful `"🌿 Grounded!"` badge bounces in beside the title before settling into a peaceful completed state.
  - **"All Intentions Met" Evening Tranquility Banner**: When all today's intentions are completed in the `Today` view, a serene botanical celebration card appears (*"🌿 All daily intentions fulfilled. Take a deep breath, ground yourself, and enjoy the stillness"*).
- **Filter Tabs & Category Pills**:
  - Main status filters: `Today`, `Upcoming`, `Anytime`, `Completed`, `Overdue`, `All`.
  - 6-pillar category filter pills: `ALL`, `Mind`, `Body`, `Craft`, `Spirit`, `Study`, `Career`.
- **Anytime Intentions (Backlog & Undated Chores)**:
  - **Purpose**: Solves the problem of chores, thoughts, and aspirations that must be captured and completed eventually (e.g. *"Organize my study table"*, *"Clean bookshelf"*, *"Service bicycle"*), but have no fixed calendar due date or urgent deadline.
  - **Isolation Guarantee**: Anytime tasks (`dueDate: null`) are completely decoupled from daily pressure. They **never** appear in the `Today`, `Upcoming`, or `Overdue` views, and do not influence or distort the `TodayClockDial`.
  - **Dedicated Filter Tab**: A first-class `ANYTIME` tab in the main status bar displaying a real-time count badge.
  - **Instant Capture via Inline Quick-Add**: When on the `ANYTIME` tab, the top inline input bar dynamically reconfigures to plant undated anytime intentions (*"Plant an anytime intention... (No due date - Press Enter)"*).
  - **Modal Creation & Edit Support**: The Task Creation and Edit modals feature an interactive **"Anytime?"** toggle (`✨ Anytime`) that clears the date picker and sets `dueDate: null`.
  - **1-Click "Do Today" Action**: Every anytime task card features a prominent green **"📅 Do Today"** button on its action strip, allowing seamless promotion into today's execution rhythm whenever the user is ready.
  - **Card Identifier**: Anytime cards are clearly distinguished by an organic botanical `✨ Anytime` badge on their metadata strip.
- **Task Creation Modal & Edit Modal**:
  - Title, description, due date (or Anytime toggle), priority flag (`Low`, `Medium`, `High`, `Urgent`), category tag, and optional link to a Goal Milestone.

---

### 3. Habits (`/habits`)
Dedicated mindful habit growth and consistency tracking:
- **Today's Habit Dial Counter (`TodayHabitDial.tsx`)**:
  - Circular clock dial located in the top header row adjacent to "+ Cultivate Habit".
  - Shows 12 radial hour dots, circular SVG progress arc (terracotta when in progress, sage green at 100%), central digital ratio (`completed/total`), and percentage.
  - Textual status summary: `X of Y Rooted` or `✨ All rituals completed!`.
- **Dynamic Scoreboard Capsules**:
  - **Active Grove**: Count of active habits and today's completed tally.
  - **Top Active Streak**: Real-time highest active streak with flame badge.
  - **7-Day Rhythm Rate**: Rolling 7-day average completion percentage across all habits.
- **Filter Controls**:
  - **Category Filter Pills**: `ALL`, `Mind`, `Body`, `Craft`, `Spirit`, `Study`, and `Career`.
  - **Completion Status Quick-Filter**: `All Habits (${habits.length})`, `✓ Completed Today (${completed})`, `⏳ Pending Today (${pending})` to track completed vs pending habits at a glance.
- **Dual View Modes**:
  - **Card View**:
    - Organic cards with Category pill, streak badge (`X Day Streak`), and **prominent completion badge** (`✓ Completed Today` in soft sage vs `⏳ Pending Today` in warm linen).
    - **Visual Finished State**: When completed today, cards feature a serene sage gradient (`from-[#FFFFFF] via-[#FAFDFB] to-[#F1F7F3]`) and soft green border highlight.
    - **Dedicated Weekly & Lifetime Tracking Strip**:
      - Weekly Consistency metric (`X of Y days done (Z%)`) with a dynamic progress bar.
      - Target & unit cadence (`Target: X mins • Daily or Xx/week`).
      - Total lifetime completions (`✨ X total completed`).
      - Linked goal alignment tag if attached.
    - **Interactive 7-Day Rolling Rhythm Track**: Clicking any past day or today toggles completion for that exact date with optimistic updates.
    - **Action Controls**: Dedicated Edit (`Pencil`) and Delete (`Trash2`) buttons.
    - Tactile check-in button (`Completed ✓` vs `Mark Completed`).
  - **Weekly Matrix View**:
    - Expansive table layout displaying all habits side-by-side with Monday through Sunday interactive check-in cells, streak count, and both Edit and Delete actions.
- **Botanical Empty State**:
  - When `habits.length === 0`, presents an inspiring botanical sprout card with 4 one-click starter ritual templates:
    - ✍️ *Morning Deep Work* (Craft • 60m)
    - 🏃 *Movement & Breathwork* (Body • 30m)
    - 📚 *Reflective Reading* (Study • 20p)
    - 🧘 *Stillness & Meditation* (Mind • 15m)
- **Cultivate New Habit Modal & Edit Habit Modal**:
  - **Cultivate**: Create new habits with Title, Description, Category (`Mind`, `Body`, `Craft`, `Spirit`, `Study`, `Career`), Target Value, Unit, Frequency Type (`Daily` or `Times per week`), and optional Goal linkage.
  - **Edit**: Clicking the pencil icon on any habit card opens the pre-populated Edit modal, allowing instantaneous modifications persisted directly to SQLite via the `updateHabit` server action.
- **Habit Graduation & Mastered Rituals Archive**:
  - **Purpose**: Solves the problem of finite learning habits/sprints (e.g., "Learning DBMS", "Learning OOPs", 30-day challenges) that should not run indefinitely once completed.
  - **Graduation Trigger**: Active habit cards and weekly matrix rows include a graduation cap button (`🎓`).
  - **Celebration Modal**: Displays lifetime cultivation statistics (Start date, Total sessions logged, Duration in days, Consistency rate) and provides an optional reflection note textarea (e.g., "Completed all DBMS lectures and built schema!").
  - **Mastered Archive Showcase (`/habits` tab switcher)**:
    - Dedicated **Active Rituals** vs **Graduated & Mastered** horizon view tab switcher.
    - Preserves historical consistency and dates (`startedAt`, `completedAt`, `diffDays`, `totalSessions`, `consistencyRate`).
    - Displays reflection notes in editorial quote styling.
    - Includes a **Reopen** button (`RotateCcw`) if a user wishes to revive a mastered habit back into their active grove.
    - **Follow-up Ritual Pathway**: Each mastered card includes a **"Plant Next Habit"** button (`ArrowRight`) that opens the habit creation modal pre-configured with category and context to transition immediately into the next learning sprint (e.g. from DBMS to OOPs).
  - **Post-Graduation Celebration Banner**: A top-level celebration banner appears upon graduation, praising the milestone and prompting the user to cultivate their next ritual with one click.

---

### 4. Seasons (`/seasons` - Calendar & Panoramic Observatory)
Historical time-travel interface with 3 specialized lenses and unified daily drill-down:
- **3-Way Panoramic Lens Switcher**:
  - **`Habits` Lens**:
    - Habit constellation selector (click any habit to view its monthly calendar matrix).
    - Monthly ritual calendar with ticks (✓) for completed, crosses (✗) for missed, and upcoming placeholders.
    - Adherence percentage, honored count, and missed count capsules.
  - **`Tasks` Lens**:
    - Monthly execution velocity score, high/urgent priority achievement tally, and pending tasks count.
    - Search query bar, status filters (`All`, `Completed`, `Pending`), and category pills.
    - Accomplishments grouped by weekly intervals (`Week 1`, `Week 2`, `Week 3`, `Week 4 & Beyond`).
  - **`Sleep` Lens**:
    - Monthly sleep scoreboard: Average rest hours per night, cumulative rhythm balance (surplus/debt), restful nights count, and check-in adherence.
    - Monthly Sleep Matrix calendar: each day displays duration, bedtime $\rightarrow$ wake-time arc, quality tag, and color-coded background (sage for target met, sand for mild deficit, terracotta for deep deficit).
    - Quick "Log Today's Rest" trigger.
- **Unified 3-in-1 Daily Inspector Modal**:
  - Clicking **any calendar day** across all 3 lenses opens a comprehensive daily audit modal:
    1. 💤 **Rest Sanctuary**: Sleep duration, bedtime, wake-time, rest quality badge, reflection notes, and 1-click edit/log trigger.
    2. 🌿 **Habit Rituals**: Complete checklist of habits with direct interactive checkmark toggles for that date.
    3. 📋 **Daily Intentions**: Tasks scheduled for that day with category badges, priority, due time, and 1-click status completion toggle.

---

### 5. Milestones (`/milestones` - Long-Term Goals & Roadmaps)
Goal roadmapping and progressive milestone tracking:
- **`+ Add Life Goal` System**:
  - Modal to create custom life roadmaps with Title, Category (`Study`, `Career`, `Craft`, `Body`, `Mind`, `Spirit`), Target Completion Date (Month/Year), and Vision Description.
  - Multi-step initial milestone builder (customizable titles and stages).
- **Botanical Milestone Stages**:
  - 🌱 **Seed**: Initial research, scoping, and foundational setup.
  - 🌿 **Sprout**: Active development, core chapters, and execution sprints.
  - 🌳 **Milestone**: Major deliverable or final accomplishment.
- **In-Card Milestone Management**:
  - Dedicated **`+ Add Milestone`** button inside every roadmap card to append new steps at any point.
  - Checkbox toggle with live progress calculation.
  - Individual milestone deletion (`X` icon on hover).
- **Life Roadmap Controls**:
  - **Primary Dashboard Vision**: 1-click **Set as Dashboard Focus** to determine which life goal is highlighted on the Home Dashboard's `LongTermVisionCard`.
  - Roadmap deletion (`Trash2`) with cascading milestone safety.
- **Relational Alignment**: Direct association with daily habits and tasks linked to that goal.

---

### 6. Growth (`/growth` - Growth & Life Patterns)
A dynamic, data-driven personal analytics engine matching **`design_concept_8_growth_analytics.jpg`**:
- **Dynamic Time Horizon Selector**:
  - `This Week`: Rolling 7 days (`today - 6 days` to `today`).
  - `Current Month` (e.g. `September 2026`): 1st of current month to today.
  - `Previous Month` (e.g. `August 2026`): Full previous calendar month.
  - `All Time`: Rolling 90 days.
  - Dynamically recalculates all metrics, completion rates, streaks, and charts upon tab selection.
- **Row 1: The Triad Scorecard (3 Clean Summary Cards)**:
  1. **Task Execution**:
     - Completed vs total count (e.g., `42 / 48 Completed`) with prominent completion percentage (e.g., `88%`).
     - Mini segmented progress bar: Sage Green (`#7C9A86`) for done on time, Terracotta (`#D98A6C`) for missed/overdue, and Warm Sand (`#D4A373`) for pending.
     - Legend indicator pills.
  2. **Habit Consistency**:
     - Overall adherence percentage (e.g., `84% Consistency`) and total check-in count.
     - Longest active consistency streak badge with flame icon (`🔥 24-Day Best Streak`).
  3. **Sleep Sanctuary**:
     - Nightly average sleep duration (e.g., `7h 35m Avg`) displayed alongside `8.0h Target` with vertical divider.
     - Quality pill tag highlighting the percentage of restful/balanced nights (`85% Restful`).
- **Row 2: Deep Comparative Analysis**:
  1. **Task Velocity & Missed Analysis**:
     - Full-width segmented distribution bar of completed, missed/overdue, and pending intentions.
     - Large bold priority execution callout (e.g. `95%` on urgent tasks).
     - Breakdown table for `Urgent`, `High`, and `Normal` priority tiers.
  2. **Habit Anchors & Friction Points**:
     - **Top Anchor Habits (Strengths)**: Habits with $\ge 75\%$ adherence, showing title, completion percentage, and active streak counter (`🔥 N`).
     - **Needs Attention (Friction Points)**: Habits with $< 75\%$ adherence with automated pattern detection (e.g., *"Missed 5/8 weekend days"* or *"Missed primarily on Thursdays"*).
- **Row 3: Day-of-Week Rhythm & Rest Correlation (Deep Forest Green Banner)**:
  - Deep forest green (`#1E3127`) full-width banner.
  - **Day-of-Week Rhythm**: 7 vertical rounded bars (`Mon, Tue, Wed, Thu, Fri, Sat, Sun`) with heights proportional to daily execution consistency, visually highlighting weekday strengths vs weekend drops.
  - **Rest & Productivity Link**: Translucent pill container (`#24372D`) with info icon showing computed correlation between 8h+ sleep and daytime task completion rate (e.g., *"Rest Correlation: 26% higher task completion following 8h+ sleep"*).
