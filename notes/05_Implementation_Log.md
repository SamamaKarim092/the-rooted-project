# 05. Implementation & Progress Log

Parent: [[00_Index]] | Previous: [[04_Features_and_Workflows]]

---

## 📅 Chronological Activity Log

### [Step 1] - Project Discovery & Specification Review
- Read and analyzed the full project specification in `Project_Detail.md`.
- Identified the core 5 pillars: Tasks, Habits & Streaks, Calendar History, Progress Analytics, and Long-Term Goals.
- Reviewed the philosophy: `Plan → Act → Track → Review → Improve` and `Daily Actions → Milestones → Goals`.

### [Step 2] - Visual Design Alignment & Tech Stack Selection
- Selected design from `design/design_concept_6.jpg` ("Rooted").
- Extracted design tokens:
  - Background: Warm cream linen (`#F7F4EB`)
  - Primary cards: Deep forest green (`#1E3127`)
  - Secondary cards: Warm off-white / light cream (`#FFFFFF`)
  - Accents: Terracotta (`#D98A6C`), Sage green (`#7C9A86`), Sand (`#D4A373`)
  - Typography: Serif (`Fraunces`) for headers + Sans (`Plus Jakarta Sans`) for UI.
- Selected Tech Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, SQLite database via Prisma ORM, and `lucide-react`.

### [Step 3] - Next.js Scaffolding & Setup
- Initialized Next.js project with App Router, TypeScript, Tailwind CSS, and ESLint.
- Resolved project directory name restrictions and restructured clean root workspace.
- Updated `package.json` with project name `rooted`.
- Commenced installation of `lucide-react`, `prisma`, and `@prisma/client`.

### [Step 4] - Agent Governance & Obsidian Notes Vault
- Updated `AGENTS.md` with:
  - Clear project directives and non-negotiable aesthetic rules based on `design_concept_6.jpg`.
  - Anti-hallucination guardrails to keep code focused and grounded.
  - Mandatory documentation protocol for maintaining the `notes/` folder.
### [Step 5] - Monthly Tracking, Retrospectives & Multi-Month Seed
- Seeded rich historical data for **August 2026** (31 days of habit logs across all 6 habits, plus 10 real tasks) alongside current **September 2026** data.
- Upgraded **Seasons (`/seasons`)** with a dedicated view switcher:
  - `Day-by-Day Calendar`: Month calendar with daily activity indicators and date inspection.
  - `Monthly Reflection & Archive`: Full scoreboard for any selected month (Monthly Harmony %, Tasks completed vs pending, total habit check-ins, anchor habit, and full scrollable task archive).
- Upgraded **Growth (`/growth`)** with period filters:
  - `September 2026 (Current Season)`
  - `August 2026 (Previous Month)`
  - `Rolling 60 Days`
  - Month-over-month trajectory insights (e.g. August 82% to September 91%, +9% consistency gain).
- Verified production build (`npm run build`) succeeded with 0 errors across all routes.
- Created `notes/06_Monthly_Tracking_and_Reviews.md` detailing the entire monthly tracking architecture.

### [Step 6] - Prominent Date Headings & Grouping on Tasks Page
- Enhanced the **Tasks (`/tasks`)** page with structured, visible date section headings:
  - **`Today` tab**: Prominently displays `Today, 5 Sep 26` (with weekday and count pill).
  - **`Upcoming` tab**: Automatically computes relative dates:
    - 1 day after today $\rightarrow$ `Tomorrow, 6 Sep 26`
    - Later dates $\rightarrow$ `Wednesday, 10 Sep 26` (or `10 Sep 26`)
    - Tasks are cleanly grouped in chronological date order under each date heading.
  - **`Completed` tab**: Grouped by completion/due date (e.g. `Today, 5 Sep 26`, `Yesterday, 4 Sep 26`, `31 Aug 26`).
  - **`Overdue` tab**: Grouped by overdue date with a terracotta `"Needs Attention"` badge.
  - **`All` tab**: Chronological date groups.
### [Step 7] - Expanded Categories: Study (Education) & Career (Job)
- Added two new foundational categories:
  - **`Study` (Education)**: Academic study, university coursework, technical reading, and exam preparation. Styled in tranquil scholar slate blue (`#EBF1F5` / `#3D637E`).
  - **`Career` (Job / Professional)**: Professional deliverables, executive roadmaps, client syncs, and career progression. Styled in grounded olive/gold (`#F4F5EB` / `#636E39`).
- Integrated across:
  - **Tasks page (`/tasks`)**: Category filter pills, modal creation dropdown, item badge rendering.
  - **Dashboard (`/`)**: Daily Intentions card badges and modal creation dropdown.
  - **Habits page (`/habits`)**: Habit category badges and modal creation dropdown.
  - **Seasons page (`/seasons`)**: Retrospective task badge rendering.
  - **Seed script (`prisma/seed.ts`)**: Populated sample `Study` and `Career` tasks.
### [Step 8] - Multi-Horizon Task Tracking (Today, Week, Month)
- Built the **`TaskRhythmScoreboard`** component and placed it at the top of the **Tasks page (`/tasks`)**:
### 2026-09-06 — Today Clock Dial on `/tasks` & Main Page `Task` Overview Tab
- **Refined `/tasks` Header**:
  - Replaced the multi-card scoreboard on `/tasks` with an organic, bespoke **`TodayClockDial`** (`src/components/tasks/TodayClockDial.tsx`).
  - Positioned neatly in the top header row adjacent to the `+ New Intention` button.
  - Implemented 12 clock hour dots, an SVG progress circumference arc, central digital fraction (`completed/total`), percentage indicator, and intention status summary.
- **Relocated Weekly & Monthly Velocity to Main Page (`/`)**:
  - Created `src/components/dashboard/DashboardMainView.tsx` with a dual-tab switcher: **`[Journal]`** and **`[Task]`**.
  - **`Journal`**: Retains the canonical 4-card layout faithfully matching `design/design_concept_6.jpg`.
  - **`Task`**: Renders `DashboardTaskOverview.tsx` showcasing:
    - **This Week's Flow**: Monday–Sunday rhythm window, weekly velocity %, completed vs remaining counts, 7-segment weekday indicators, and weekly task list.
    - **Monthly Horizon**: Switchable dropdown (September 2026, August 2026), monthly achievement progress bar, category distribution pills (`Craft`, `Body`, `Mind`, `Study`, `Career`), and monthly task details.
    - Quick navigation button to open the full task queue.
- **Clean Slate for Real Data Entry**:
  - Removed all 19 mock/dummy tasks from the SQLite database via Prisma (`prisma.task.deleteMany({})`).
  - Added `deleteTask` and `deleteAllTasks` server actions in `src/lib/actions.ts` with instant path revalidation (`/` and `/tasks`).
  - Integrated individual task deletion trash buttons on task items in `TasksClient.tsx`.
  - Refined empty state rendering across `TodayClockDial`, `DailyIntentionsCard`, and `DashboardTaskOverview` to cleanly present `0/0` and `0%` without layout breaks or NaN errors.
  - Visually confirmed clean states via browser subagent (`tasks_clean_state`, `journal_tab_clean_state`, `task_tab_clean_state`).
- **Drag Handle, Time Removal & Category Labels**:
  - Added 3-horizontal-line drag grip handle (`w-3.5 h-[2px] rounded-full` triplets) on every task card with `cursor-grab active:cursor-grabbing`.
  - Implemented HTML5 drag-and-drop to shuffle and reorder tasks up and down with instant state reordering and `reorderTasks` server action database persistence.
  - Removed completion time badges from task cards across `/tasks` and the dashboard Daily Intentions checklist.
  - Removed time input from task creation modals, streamlining the form into 3 responsive columns (`Category`, `Priority`, `Due Date`).
  - Cleaned category naming across all selectors, modals, and pills from `Study (Education)` and `Career (Job)` to **`Study`** and **`Career`**.
  - Visually confirmed via browser subagent (`task_card_drag_handle_no_time_1788681969035.png` and `tasks_new_intention_modal_1788681916766.png`).

### [Step 9] - Habits Page Redesign, Database Purge & Botanical Polish
- **Database Purge of Mock Habits**:
  - Cleared all 217 habit completion logs and all 6 dummy habits from the SQLite database (`prisma.habitLog.deleteMany({})` and `prisma.habit.deleteMany({})`).
  - Database now holds 0 habits, providing a clean slate for real user habit cultivation.
- **Server Actions Enhancements (`src/lib/actions.ts`)**:
  - Added `deleteHabit` and `deleteAllHabits` server actions with instant path revalidations (`/`, `/habits`, `/seasons`, `/growth`).
  - Upgraded global metrics (`harmonyScore`, `rootedDays`) to calculate dynamically from real data rather than falling back to hardcoded defaults.
  - Corrected streak calculation algorithm so 0 completions correctly shows 0-day streak instead of forcing 1.
- **New `TodayHabitDial` Component (`src/components/habits/TodayHabitDial.tsx`)**:
  - Bespoke clock-dial counter for today's habits positioned neatly in the `/habits` header.
  - Features 12 clock hour dots, dynamic SVG circular progress arc (terracotta in progress, soft sage green when 100%), central fraction display, and live status summary.
- **Enhanced Habits Page Layout (`src/app/habits/HabitsClient.tsx`)**:
  - **Dynamic Metric Scoreboard**:
    - `Active Grove`: Count of currently cultivated daily/weekly habits.
    - `Top Active Streak`: Maximum consecutive days achieved across all habits.
    - `Rolling 7-Day Rhythm`: Aggregate completion rate over the last 7 days.
  - **Category Filter Bar**: Filter by `ALL`, `Mind`, `Body`, `Craft`, `Spirit`, `Study`, `Career`.
  - **Dual View Mode Switcher**:
    - `Card View`: Tactile cards featuring category pills, unit targets, streak counter, 7-day rolling rhythm dots, and one-click check-in.
    - `Weekly Matrix View`: Full-width botanical table matrix displaying habits alongside Mon–Sun interactive check-in dots with instant progress tally.
  - **Interactive 7-Day Rolling Rhythm Track**: Users can click past days or today directly on each card to toggle check-ins.
  - **Botanical Empty State & Starter Rituals**:
    - When 0 habits are active, displays an elegant botanical graphic with quick 1-click starter rituals: *Morning Deep Work*, *Movement & Breathwork*, *Reflective Reading*, and *Stillness & Meditation*.
  - **Cultivate Habit Modal**: Streamlined modal allowing users to set Title, Description, Category, Target Value, Unit (min, pages, reps, etc.), Frequency (`Daily` vs `Weekly`), and Goal alignment.
- **Safeguarded Dashboard `HabitGrowthMatrix`**:
  - Handled `habits.length === 0` cleanly to prevent NaN or undefined row errors on the dashboard, displaying an inviting prompt to cultivate the first habit.
- **Verification**:
  - `npx tsc --noEmit` and `npm run build` compiled with 0 errors.

### [Step 10] - Habit Completion Tracking & Edit Habit Modal
- **Habit Completion Indicators & Finished State on Cards**:
  - Added a prominent status badge on each habit card:
    - `✓ Completed Today` (soft sage `#EAF0EC` / `#3B664B`) when checked off for today.
    - `⏳ Pending Today` (warm linen `#FAF8F2` / `#8E7E6A`) when pending.
  - Finished Card Styling: Completed cards transition to a gentle sage gradient (`bg-gradient-to-br from-[#FFFFFF] via-[#FAFDFB] to-[#F1F7F3]`) with an organic sage border highlight (`border-[#7C9A86]/60`).
  - Check-in button reflects completion status with `Completed ✓` vs `Mark Completed`.
- **Dedicated Completion Tracking Strip**:
  - **Weekly Consistency Progress**: Displays `${thisWeekCompletions} of ${targetDaysThisWeek} days (${weeklyProgressRate}%)` with an animated sage progress bar.
  - **Lifetime Completions Counter**: Displays `✨ ${totalCompletions} total completed` alongside unit cadence.
  - **Status Quick-Filter**: Integrated filter bar allowing users to filter by `All Habits (${habits.length})`, `✓ Completed Today (${completed})`, or `⏳ Pending Today (${pending})` to track completed rituals with ease.
- **Edit Habit Modal & Pencil Actions**:
  - Added an Edit button (`Pencil` icon) to every habit card and Weekly Matrix row.
  - Clicking Edit opens a pre-populated modal (`Edit Habit Ritual`) allowing changes to Title, Description, Category (`Mind`, `Body`, `Craft`, `Spirit`, `Study`, `Career`), Target Value, Unit, Frequency, Cadence, and Goal alignment.
  - Implemented `updateHabit` server action in `src/lib/actions.ts` to persist edits to SQLite via Prisma with optimistic UI updates and multi-page revalidation (`/`, `/habits`, `/seasons`, `/growth`).
- **Verification**:
  - `npx tsc --noEmit`: 0 errors.
  - `npm run build`: Successfully compiled and validated all 7 App Router pages.

### [Step 11] - Task Editing, Deletion, and Shuffle Engine Overhaul
- **Task Editing & Edit Modal**:
  - Added `updateTask` server action in `src/lib/actions.ts` to update Title, Description, Priority, Category, Due Date, and Goal alignment in SQLite via Prisma.
  - Integrated `Pencil` icon on each task card in `TasksClient.tsx`.
  - Built the `Edit Daily Intention` modal with pre-populated form inputs and optimistic UI updates.
- **Task Deletion**:
  - Made the `Trash2` deletion icon cleanly accessible on every task card with warm terracotta hover states (`text-[#8E9E94] hover:text-[#D98A6C] hover:bg-[#F9ECE6]`).
  - Instant optimistic removal with server-side deletion via `deleteTask`.
- **Shuffle & Reordering Overhaul**:
  - **Identified root causes of previous shuffle failure**:
    1. HTML5 `onDragEnd` cleared `draggedTaskId` state before `onDrop` resolved in some browsers, causing `handleDrop` to exit early.
    2. `handleDrop` did not read native `e.dataTransfer.getData("text/plain")`.
    3. Missing `onDragEnter` and missing `useEffect` sync between `tasks` state and `initialTasks` prop.
    4. Sorting within same-date groups did not explicitly factor in `.order`.
  - **Implemented fixes**:
    1. Added `order?: number` to `interface Task` in `TasksClient.tsx` and query sorting by `order: "asc"` in `src/app/tasks/page.tsx`.
    2. Updated `handleDrop` to extract `e.dataTransfer.getData("text/plain") || draggedTaskId`, preventing early null exits.
    3. Replaced individual loop updates in `src/lib/actions.ts` with an atomic Prisma transaction (`prisma.$transaction`).
    4. Fixed `startTransition` execution: shifted out of the React state updater callback to eliminate the `Cannot call startTransition while rendering` runtime error.
    5. Cleaned task cards to retain the pure, uncluttered 3-line drag grip handle without extra arrow clutter.
- **Verification**:
  - `npx tsc --noEmit`: 0 errors.
  - Next.js production build verified.

### [Step 12] - Task Filter & Ordering Engine + Precision Polish
- **Filter & Order Dropdown Popover (`TasksClient.tsx`)**:
  - Added a prominent `Filter & Order` button (`SlidersHorizontal` icon) to the task filter row with an active notification pip (`bg-[#D98A6C] animate-pulse`).
  - Implemented popover dropdown styled faithfully with the warm linen aesthetic (`bg-[#FAF7F0]`, `border-[#EAE5D8]`, `text-[#1A241E]`).
  - **5 Ordering Modes**:
    1. **Last entered on top (Top - Bottom)**: Sorts intentions by `createdAt` descending (newest intentions first).
    2. **Last entered on bottom (Bottom - Top)**: Sorts intentions by `createdAt` ascending (oldest intentions first).
    3. **Custom manual rhythm**: Uses custom drag-to-shuffle sequence (`order` index).
    4. **Priority (Urgent → Low)**: Weighted sort by priority (`URGENT` = 4, `HIGH` = 3, `MEDIUM` = 2, `LOW` = 1).
    5. **Due Date (Earliest → Latest)**: Chronological sort by `dueDate`.
  - **Priority Filtering**: Filter between `ALL`, `URGENT`, `HIGH`, `MEDIUM`, or `LOW`.
  - **Goal Alignment Filtering**: Filter between `All Intentions`, `Linked to Goal`, or `Independent Only`.
  - **Active Filter Banner**:
    - Displayed below the category row when any non-default sort or filter is active.
    - Features badges for current ordering mode and active filters.
    - Includes a one-click `Clear Filter` / `Reset` button to immediately return to the default custom rhythm.
- **Visual-Order-Aware Drag & Drop**:
  - `handleDrop` now computes position indices relative to `groupedTasks.flatMap(g => g.items)` (the exact on-screen visual sequence).
  - Dragging any item seamlessly switches `sortBy` to `CUSTOM` so the newly dropped position immediately sticks and displays without jumping.
  - Generates contiguous continuous `order: 0, 1, 2...` across all visible and hidden tasks and persists atomically to SQLite via `prisma.$transaction`.
- **SSR Hydration Precision Polish**:
  - Rounded coordinate math (`Math.round(val * 100) / 100`) for clock dial tick marks in `TodayClockDial.tsx` and `TodayHabitDial.tsx` to eliminate floating-point discrepancy warnings between Node SSR and browser V8.
- **Verification**:
  - `npx tsc --noEmit`: 0 type errors.

### [Step 13] - Speed of Capture, Morning Reset & Mindful Polish
- **Inline Quick-Add Intention Bar (`TasksClient.tsx`)**:
  - Added organic inline input bar directly above the date-grouped task list.
  - Allows immediate keyboard-driven capture: type a task title and press `Enter` to plant it immediately into Today's list.
  - Features quick selectors for Category (`Craft`, `Mind`, `Body`, `Spirit`, `Study`, `Career`) and Priority (`Low`, `Medium`, `High`, `Urgent`).
  - Optimistic UI state update combined with `createTask` server action for instant feedback.
- **1-Click Quick Reschedule ("Move to Tomorrow" / "+1 Day")**:
  - Added dedicated `CalendarPlus` action button on the action strip of each uncompleted task card.
  - Automatically hidden once an intention is marked completed.
  - Calculates tomorrow's date using deterministic local date arithmetic (`getTomorrowDate`).
  - Updates task due date optimistically and commits to SQLite via new `rescheduleTask` server action.
- **Morning Reset Banner ("Reschedule All Overdue to Today")**:
  - Evaluates `overdueTasks` count dynamically.
  - Renders a tranquil, warm reset card when overdue tasks exist (`dueDate < today` and `status: PENDING`).
  - Single tap on **"Reschedule All to Today"** shifts all past-due intentions to today's date in local state and executes `rescheduleAllOverdueTasks` in SQLite.
  - Includes **1-Day Persistent Dismissal** (`X` button): Stores today's date in `localStorage.setItem("rooted_dismissed_morning_reset_date", today)`. On mount/reload, checks if the saved date matches `today`, suppressing the banner across page reloads and tab navigations for the entire calendar day until tomorrow morning.
  - Automatically suppresses for the day as well upon clicking **"Reschedule All to Today"**.
- **Mindful Polish & Motivation**:
  - **Tranquil Completion Ripple**: Completed task cards transition to a serene sage gradient (`bg-gradient-to-r from-[#FAFDFB] to-[#F1F7F3] border-[#7C9A86]/50`) with an animated checkmark scale (`scale-105 duration-300`).
  - **All Intentions Met Celebration Card**: Appears in the `Today` tab when all scheduled intentions are fulfilled (`allTodayCompleted`), celebrating daily grounding and mindfulness.
  - **UI Decluttering**: Removed the redundant "Active View" filter banner strip below the tabs per user request, keeping the header clean and relying on the popover indicator pip.
- **Verification**:
  - `npx tsc --noEmit`: 0 type errors.

---

### Step 14: Habit Graduation & Mastered Rituals Archive (Learning Sprints & Completed Habits)
- **Problem & Intent**:
  - Users cultivate learning habits (e.g. "Learning DBMS", "Learning OOPs") or finite sprints (30-day challenges) that have a natural completion point.
  - Previously, habits ran indefinitely or had to be deleted (losing all history).
- **Database Schema Updates**:
  - `model Habit` in `prisma/schema.prisma`:
    - `status`: `String @default("ACTIVE")` (`"ACTIVE"` | `"COMPLETED"`)
    - `completedAt`: `DateTime?`
    - `completionNote`: `String?`
  - Synced using `npx prisma db push` and `npx prisma generate`.
- **Backend & Server Actions**:
  - `graduateHabit(habitId: string, note?: string)`: Sets status to `"COMPLETED"`, records `completedAt: new Date()`, and optional `completionNote`.
  - `reopenHabit(habitId: string)`: Restores habit status back to `"ACTIVE"` and clears `completedAt` and `completionNote`.
  - `getDashboardData`: Filters active habits (`status: "ACTIVE"`) for the daily checklist while preserving all past logs in `/seasons` and `/growth`.
- **Frontend & UI (`src/app/habits/HabitsClient.tsx`)**:
  - **Partitioning**: Partitioned habits into `activeHabits` and `graduatedHabits` so active dial, streak records, and 7-day rolling rates are not distorted by completed habits.
  - **Horizon Tabs Switcher**: Serene switcher between **Active Rituals** and **Graduated & Mastered**.
  - **Graduation Action**: Graduation cap button (`GraduationCap`) in both Cards view and Weekly Matrix view.
  - **Celebration Modal**: Displays journey stats (Start Date, Total Sessions Logged, Total Duration in days, Consistency Rate %) and an optional reflection textarea.
  - **Mastered Archive View**:
    - Showcase cards with botanical duration/session/consistency metrics.
    - Editorial reflection note quote box.
    - **Reopen** button (`RotateCcw`) to return a habit to active rotation.
    - **Plant Next Habit** button (`ArrowRight`) that opens the create modal pre-filled with category and context.
  - **Celebration Banner**: Congratulatory botanical banner with 1-click transition to plant the follow-up ritual.
- **Verification**:
### Step 15: Anytime Intentions (Backlog & Undated Chores System)
- **Problem & Motivation**:
  - Tasks like *"Organize my study table"* or *"Service bicycle"* need to be accomplished eventually, but do not have a hard calendar deadline.
  - Putting them into Today or Upcoming clutters the daily focus dial and creates false overdue alarms.
- **Architectural Implementation**:
  - **Prisma Schema**: `dueDate` in `model Task` was already optional (`String?`). No schema migration needed.
  - **Server Actions (`src/lib/actions.ts`)**:
    - Updated `createTask(formData)`: Supports `dueDate?: string | null`. If `formData.dueDate === undefined`, defaults to today's date (`getTodayString()`), preserving backwards compatibility with `DailyIntentionsCard.tsx`. If explicitly `null` or empty, sets `dueDate: null`.
    - Updated `rescheduleTask(taskId, newDueDate: string | null)`: Supports clearing a due date or setting a new one (`dueDate: newDueDate || null`).
  - **Date Utilities (`src/lib/utils.ts`)**:
    - Updated `formatTaskDateHeading(dateStr: string | null)`: When `dateStr === null`, returns `heading: "Anytime Intentions"`, `subheading: "Chores & aspirations with no fixed deadline"`, `formattedDate: "Anytime"`, and `diffDays: 9999`.
- **Frontend & UI (`src/app/tasks/TasksClient.tsx`)**:
  - **Dedicated `ANYTIME` Tab**: Added to the main status filter bar alongside `TODAY`, `UPCOMING`, `COMPLETED`, `OVERDUE`, and `ALL`, displaying dynamic intention count.
  - **Complete Date Isolation**:
    - Tasks with `dueDate: null` are isolated to `activeTab === "ANYTIME"` (and `ALL`).
    - Excluded from `TODAY`, `UPCOMING`, and `OVERDUE` tabs.
    - Zero impact on `TodayClockDial` counter, keeping daily rhythm sacred and pressure-free.
  - **Inline Quick-Add Integration**:
    - When on the `ANYTIME` tab, the inline capture bar dynamically shows: *"Plant an anytime intention... (No due date - Press Enter)"*.
    - Pressing Enter automatically sets `dueDate: null`.
    - Features a serene sage guidance banner explaining anytime intention workflow.
  - **Task Creation & Edit Modals**:
    - Interactive **"Anytime?"** toggle button (`✨ Anytime`) in both Create and Edit modals.
    - Toggling Anytime clears and locks the date input, displaying a warm dashed `"✨ No fixed due date — preserved in Anytime tab"` indicator.
  - **1-Click "📅 Do Today" Promotion**:
    - Anytime task cards replace the "+1 Day" postponement button with a green **"📅 Do Today"** button.
    - Clicking it sets `dueDate: today` optimistically and commits to SQLite, immediately transferring the task into today's active execution queue.
  - **Card Badge**: Displays `✨ Anytime` pill badge on the card metadata strip.
- **Verification**:
### Step 16: Periodic Rhythm Retrospective Dialogs (Weekly & Monthly Reviews)
- **Problem & Motivation**:
  - Users need automated, mindful retrospectives at the close of natural productivity cycles (week-ends / Mondays and month-starts) to reflect on completed vs overdue intentions, velocity %, habit consistency, and pillar balance.
- **Architectural Implementation**:
  - **Date Utilities (`src/lib/utils.ts`)**:
    - `getWeekKey(dateStr)`: Deterministic ISO Monday-anchored week key (`YYYY-WMM-DD`).
    - `getPreviousWeekRange(dateStr)`: Computes previous Monday–Sunday date range, week days array, and formatted label.
    - `getPreviousMonthKey(monthKey)`: Computes previous month identifier (`YYYY-MM`).
    - `formatShortDate(dateStr)`: Formats short dates (e.g. `31 Aug`).
  - **Server Data (`src/lib/actions.ts`)**:
    - Increased habit log query in `getDashboardData()` to `take: 60` (from `14`) to provide complete historical habit records for previous month and week calculations.
  - **Retrospective Modal (`src/components/dashboard/PeriodicReviewModal.tsx`)**:
    - Dual horizon switcher: `🌿 Past Week` vs `🌙 Past Month`.
    - Task Velocity Metric: % fulfilled with progress bar and ratio (`completed / total`).
    - Due Date Audit: Detailed breakdown of Completed vs Deferred/Overdue vs Total Scheduled intentions.
    - Category Balance: 6-pillar badges showing completed tasks distribution.
    - Habit Rhythm: Habit consistency percentage and total ritual logs.
    - Inspect Intentions: Expandable accordion showing individual tasks, status checkmark, category, and due date.
    - Mindful Reflection Quote: Grounding botanical advice.
    - Testing Reset: "Reset Triggers (Test Auto-Popup)" button to clear localStorage keys for testing.
  - **Automated Lifecycle Integration (`src/components/dashboard/DashboardMainView.tsx`)**:
    - Checks `localStorage` on mount:
      - Automatically opens on new week (`rooted_last_reviewed_week !== currentWeekKey`).
      - Automatically opens on new month (`rooted_last_reviewed_month !== currentMonthKey` when within the first 5 days).
    - Dismissing via "Ground Myself & Continue" saves the reviewed period key so it does not reappear repeatedly.
    - Added **`[ ✨ Rhythm Review ]`** button in the dashboard switcher header for manual on-demand opening.
- **Verification**:
  - `npx tsc --noEmit`: 0 type errors.

### Step 17: Mindful Sleep Tracking & Morning Check-in System
- **Problem & Intent**:
  - Sleep and rest are foundational to conscious energy, focus, and holistic harmony.
  - When users open the application in the morning, they need a frictionless way to record when they went to sleep and when they woke up, have the system calculate their total sleep duration, and evaluate whether they underslept (sleep debt) or overslept against their personal target (e.g. 8.0 hours).
- **Database Schema**:
  - Added `model SleepLog` with `date`, `bedtime`, `wakeTime`, `durationMinutes`, `quality`, and `notes`.
  - Added `model SleepSetting` with `targetHours` (default 8.0h).
  - Pushed to SQLite via Prisma with clean migration.
- **Backend & Server Actions (`src/lib/actions.ts`)**:
  - `logSleep({ date, bedtime, wakeTime, quality?, notes? })`: Computes duration in minutes (accounting for midnight transitions), upserts record, and revalidates paths.
  - `updateSleepTarget(targetHours: number)`: Updates daily target with boundaries (5.0h – 12.0h).
  - `getSleepData()`: Structured retrieval of today's rest, target settings, and 60-day history.
  - Updated `getDashboardData()` to return sleep payload.
- **Sleep Arithmetic Engine (`src/lib/utils.ts`)**:
  - `calculateSleepDuration(bedtime, wakeTime)`: Handles overnight midnight transitions seamlessly.
  - `evaluateSleepTarget(durationMinutes, targetHours)`: Compares rest against target, yielding `Optimal Rest` (within $\pm 15$ mins), `+X Overslept`, or `-X Sleep Debt`.
- **Frontend Components**:
  - **Morning Sleep Check-in Dialog (`src/components/sleep/MorningSleepDialog.tsx`)**:
    - Automatic popup on first morning session of the day when today's rest has not been logged.
    - Quick presets for Bedtime and Wake time + custom inputs.
    - Real-time calculated duration pill and target comparison gauge.
    - Visual progress bar with target tick line (e.g. 8h marker).
    - 4 rest quality pills (`🌿 Restful`, `✨ Balanced`, `⚡ Restless`, `😴 Groggy`) and optional notes.
    - Single-click "Save Rest Record" and "Remind Me Later" (suppresses auto-popup for the day).
  - **Sleep Sanctuary Multi-Horizon Overview (`src/components/sleep/SleepRhythmOverview.tsx`)**:
    - Integrated as the third tab (`[Sleep]`) on the main Dashboard.
    - **Today's Rest Card**: Displays bedtime, wake time, duration, target fulfillment %, quality, and notes.
    - **Target Sleep Customizer**: Interactive `-0.5h` / `+0.5h` buttons to adjust daily sleep target dynamically.
    - **This Week's Rest Rhythm (Monday–Sunday)**: 7-day bar chart with dashed 8h target guideline, weekly average rest, adherence %, and net sleep debt/surplus.
    - **Monthly Horizon & Retrospectives**: Month selector, monthly average, target adherence %, total hours, and full night-by-night log archive.
  - **Dashboard Integration (`src/components/dashboard/DashboardMainView.tsx`)**:
    - Tri-tab switcher: `[Journal]`, `[Task]`, and `[Sleep]`.
    - `[ 🌙 Log Sleep ]` / `[ 🌙 Edit Rest ]` header button for on-demand manual access.
- **Multi-Month Data Seed**:
  - Seeded August (31 days) and September 2026 sleep logs in `prisma/seed.ts` with realistic rest distributions.
- **UI Repositioning & Polish**:
  - Repositioned the **Morning Reset Banner** on `/tasks` from between the filter tabs and quick-add bar to the **very top of the page** (above the header title and Today Clock Dial), keeping the filter row and quick-add input cleanly connected.
  - Eliminated the bottom horizontal scrollbar under the status tabs (`TODAY`, `UPCOMING`, `ANYTIME`, `COMPLETED`, `OVERDUE`, `ALL`) via the `.no-scrollbar` utility.
  - Moved the `ALL`, `Mind`, `Body`, `Craft`, `Spirit`, `Study`, `Career` category pills off the main bar and directly into the **Filter & Order** dropdown.
  - Redesigned the **Filter & Order** popover to be minimal, simple, and compact with concise pill selectors for Category, Sort Order, Priority, and Goal Alignment.
- **Documentation**:
  - Created `notes/07_Sleep_Tracking_and_Rest_Rhythm.md`.
- **Verification**:
  - `npx tsc --noEmit`: 0 errors.
  - `npm run build`: Production build verified with all 7 App Router routes compiling cleanly.

### [Step 16] - Field Notes Page & Editor System (`/notes`)
- **Prisma Schema**:
  - Added `Note` model in `prisma/schema.prisma` with `id`, `title`, `content`, `category`, `isPinned`, `color`, `createdAt`, `updatedAt`.
  - Safely synchronized database schema via `prisma db push` and generated Prisma client.
- **Server Actions (`src/lib/actions.ts`)**:
  - Implemented `getNotes()`, `createNote()`, `updateNote()`, `deleteNote()`, and `togglePinNote()` with path revalidation on `/notes`.
- **User Interface (`src/app/notes/page.tsx` & `NotesClient.tsx`)**:
  - Built a master-detail dual-pane interface:
    - **Left Explorer**: Real-time search, category filters (`Mind`, `Body`, `Craft`, `Spirit`, `Study`, `Career`, `General`), pinned notes section, relative timestamps.
    - **Right Editor**: Large editorial serif heading input, spacious description textarea, category selector, pin toggle, live word & character counters, delete confirmation modal, and primary "Save Note" button with instant visual feedback.
    - **Keyboard Shortcut**: `Ctrl+S` / `Cmd+S` for quick saving.
- **Navigation (`src/components/layout/Sidebar.tsx`)**:
  - Added `Notes` link with `NotebookPen` icon to the primary sidebar.
- **Documentation**:
  - Created `notes/08_Field_Notes_System.md` and updated `notes/00_Index.md`.

---

## 📌 Current Status & Next Actions

- [x] Initial specification review
- [x] Technology stack approval (Next.js 16 App Router, Tailwind CSS v4, SQLite Prisma)
- [x] Next.js foundation scaffolding & directory structure
- [x] Agent directive (`AGENTS.md`)
- [x] Obsidian notes architecture (`notes/`)
- [x] Prisma SQLite schema and seed script (August + September data)
- [x] Rooted layout (Sidebar, Header capsules, theme tokens)
- [x] Dashboard page faithful to `design_concept_6.jpg`
- [x] Tasks (`/tasks`), Habits (`/habits`), Seasons (`/seasons`), Milestones (`/milestones`), Growth (`/growth`)
- [x] Monthly tracking, task archives, and month-over-month retrospectives
- [x] Prominent date section headings and relative date grouping on Tasks page
- [x] Expanded 6-pillar category system (`Mind`, `Body`, `Craft`, `Spirit`, `Study`, `Career`)
- [x] Dedicated Today Clock Dial counter in `/tasks` header
- [x] Dual-tab switcher on Main page (`[Journal]` & `[Task]`) with weekly & monthly velocity overview
- [x] Tasks page drag-to-shuffle handle, removal of time badges, clean category naming
- [x] Database purge of dummy tasks and habits for fresh user onboarding
- [x] Habits page redesign: TodayHabitDial, Card vs Weekly Matrix dual views, dynamic scoreboard, starter rituals
- [x] Habits completion indicators, weekly/lifetime tracking strip, status filter, and Edit Habit modal
- [x] Task editing, deletion, and drag-and-drop shuffle engine overhaul (clean 3-line handle)
- [x] Task Filter & Ordering engine (Last entered top/bottom, Priority, Due Date, Goal alignment)
- [x] Task speed of capture (Inline Quick-Add), 1-Click Postpone, Morning Reset, and Mindful Polish
- [x] Habit Graduation & Mastered Rituals Archive (Learning sprints, lifetime stats, reflection notes, plant next habit)
- [x] Anytime Intentions (Dedicated ANYTIME tab, undated tasks, 1-click Do Today promotion, inline capture)
- [x] Periodic Rhythm Retrospective Dialogs (Automated Weekly on Monday/first open & Monthly on 1st/new month open)
- [x] Mindful Sleep Tracking & Morning Check-in System (Auto-popup, target customizer, weekly & monthly sleep rhythms)
- [ ] User review and feedback




