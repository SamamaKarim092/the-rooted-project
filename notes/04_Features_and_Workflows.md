# 04. Features & Interactive Workflows

Parent: [[00_Index]] | Previous: [[03_Architecture_and_Data_Model]] | Next: [[05_Implementation_Log]]

---

## 🖥️ Screen-by-Screen Breakdown

### 1. Dashboard (`/` or Journal)
The main hub directly matching **`design_concept_6.jpg`**, enhanced with a seamless dual-view tab switcher:
- **Header**:
  - Greeting: "Good morning, Alex" (dynamic time-of-day greeting).
  - Floating capsules: Harmony % (e.g. `91%`), Days Rooted streak (e.g. `24 Days`), Daily Intentions completed/total (e.g. `0 of 2`).
- **View Switcher Tabs**:
  - **`Journal` Tab**: The canonical 4-card grid faithful to `design_concept_6.jpg`:
    - **Daily Intentions Card (Forest Dark)**: Today's priority tasks and core habits with checkboxes and category pills.
    - **Habit Growth Card (Light Cream)**: Weekly habit matrix (Mon-Sun dot grid) and streak counters.
    - **Long-Term Vision Card (Forest Dark)**: Active goal with milestone progression pins (`Seed`, `Sprout`, `Milestone`).
    - **Weekly Flow Card (Light Cream)**: Dynamic completion wave chart and circular Harmony gauge.
  - **`Task` Tab (Tasks Overview & Velocity)**: Dedicated multi-horizon task tracking:
    - **This Week's Flow**: Monday to Sunday rhythm window with weekly velocity %, completed vs remaining/left counts, 7-segment weekday distribution bar, and weekly task list.
    - **Monthly Horizon**: Interactive month switcher (e.g. `September 2026`, `August 2026`), monthly achievement rate, progress bar, category distribution pills (`Craft`, `Body`, `Mind`, `Study`, `Career`), and monthly task details.
    - **Quick Action**: Direct link to open the full task queue (`/tasks`).
- **Periodic Rhythm Retrospective Dialogs (`PeriodicReviewModal.tsx`)**:
  - **Automated Lifecycle Trigger**:
    - **Weekly Retrospective**: Automatically pops up on Monday (or the first time the user opens the application in a new calendar week) reviewing the preceding Monday–Sunday cycle. Persists reviewed week key (`rooted_last_reviewed_week`) in `localStorage` so it triggers once per week.
    - **Monthly Retrospective**: Automatically triggers at the start of each new month (1st–5th of the month or first time opened in that month) reviewing the preceding calendar month. Persists `rooted_last_reviewed_month` in `localStorage`.
  - **Comprehensive Analyzation Dialog Features**:
    - **Dual Horizon Switcher**: Seamless tab toggle between `🌿 Past Week` and `🌙 Past Month`.
    - **Task Velocity Metric**: Percentage fulfilled with dynamic gradient progress bar (`X of Y intentions completed`).
    - **Due Date & Completion Audit**: Explicit count of Completed vs Deferred/Overdue vs Total Scheduled intentions.
    - **Pillar Balance Radar**: Dynamic badges displaying intention distribution across the 6 pillars (`Craft`, `Mind`, `Body`, `Spirit`, `Study`, `Career`).
    - **Habit Rhythm Consistency**: Rolling weekly/monthly habit completion rate and total ritual sessions logged.
    - **Inspect Detailed Intentions Drawer**: Expandable accordion listing every task from that period with status checkmark, category badge, and due date.
    - **Mindful Seasonal Quote & Encouragement**: Grounding botanical reflection tailored to support ongoing consistency.
    - **Testing Reset**: Includes a "Reset Triggers (Test Auto-Popup)" control allowing instant clearing of localStorage flags for development testing.
  - **Manual Access**: Accessible on demand from the dashboard header row via the dedicated **`[ ✨ Rhythm Review ]`** capsule button.

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
- **"Reschedule All Overdue to Today" (1-Click Morning Reset Banner)**:
  - Automatically appears at the top of the task list whenever there are pending overdue intentions from previous days (`dueDate < today`).
  - Displays: *"Morning Reset: X intentions left from previous days"*.
  - A single tap on **"Reschedule All to Today"** updates all past-due tasks to today's date both optimistically and in SQLite via `rescheduleAllOverdueTasks`, clearing overdue cognitive backlog instantly.
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

### 4. Seasons (`/seasons` - Calendar & Daily History)
Historical time-travel interface:
- Interactive monthly calendar with daily intensity dots.
- Date drill-down: Clicking any previous date opens the day's record showing:
  - Exact habits completed and missed.
  - Exact tasks completed on that date.
  - Day's consistency score.

---

### 5. Milestones (`/milestones` - Long-Term Goals)
Goal roadmapping and progressive milestone tracking:
- Categorized long-term goals (e.g., Career, Health, Creativity, Financial).
- Milestone checklists for each goal.
- Direct association with daily habits and tasks.
- Overall goal completion % derived from milestone achievements.

---

### 6. Growth (`/growth` - Analytics & Patterns)
Productivity insights and pattern discovery:
- Rolling consistency metrics (7-day, 30-day, monthly).
- Behavioral insights engine:
  - Identifies top-performing habits.
  - Detects days with drop-offs (e.g. "You tend to miss Exercise on Saturdays").
  - Compares this month's consistency against last month's.
