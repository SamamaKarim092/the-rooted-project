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

### [Step 17] - Streamlined Habits Page Navigation & Minimal Filter Popover
- **Repositioned View Switcher**:
  - Removed the static text `"Cultivate consistency daily • Graduate when mastered"` from the right side of the Active Rituals / Graduated tabs bar.
  - Positioned the **`[ Cards | Weekly Matrix ]`** toggle pill directly in that vacated space for a tighter, more functional header.
- **Compact & Minimal Filter Popover**:
  - Replaced the previous 2-row cluttered filter strip with a clean **`[ Filter ]`** popover button matching the Tasks page architecture.
  - Placed the Filter button directly adjacent to the Cards/Matrix view switcher.
  - Built a sleek popover modal containing:
    - **Ritual Status**: `All Active`, `Completed Today`, and `Pending Today` with live counts.
    - **Categories**: `ALL`, `Mind`, `Body`, `Craft`, `Spirit`, `Study`, `Career`.
    - **Sort Order**: `Custom Rhythm`, `Highest Streak`, `Consistency Rate`, and `Name (A-Z)`.
    - **Quick Reset & Close**: Instant reset button with outside-click dismissal.
  - Added a slim, elegant active filter notification badge strip when filters are active with 1-click clearing.
- **Verification**:
  - `npx tsc --noEmit`: 0 errors.
  - HTTP status 200 verified on `/habits`.

### [Step 14] - Seasons Page Redesign (Habit Row Drilldown & Seasonal Task Log)
- Implemented **Approach 1** for the **Seasons (`/seasons`)** page as a strict, read-only retrospective observatory ("panoramic lens").
- **Habit Consistency Lens**:
  - Top interactive habit constellation row displaying all user habits (`Read a Book`, `Coursera`, `Database Management System`, `Coding / Paper`).
  - Selecting any habit reveals its dedicated full-month calendar.
  - Days are marked with **✓** (sage checkmark in circle) for completed days, **✗** (terracotta cross in circle) for missed days, a highlighted ring for Today, and neutral `—` for upcoming future dates.
  - Dedicated monthly adherence scorecard showing consistency %, honored days (✓), and missed days (✗).
- **Task Execution Lens**:
  - Monthly execution scoreboard cards: Monthly Intentions count, Execution Velocity (%), Critical High & Urgent priority completion, and carried-over/pending count.
  - Seasonal Weekly Accomplishment Log: Groups monthly tasks into **Week 1 (Days 1–7)**, **Week 2 (Days 8–14)**, **Week 3 (Days 15–21)**, and **Week 4 & Beyond (Days 22–End)** with completion percentages and task cards.
  - Real-time search query, status filters (`All`, `Completed`, `Pending`), and category pills.
  - Integrated with unified month navigation (prev/next month, quick jumps to August, September, and current month).
- All changes strictly maintain read-only analytics integrity without adding/removing tasks or habits.

### [Step 15] - Morning Sleep Check-in Streamline & Up/Down Stepper
- Streamlined **Morning Sleep Check-in** dialog (`MorningSleepDialog.tsx`):
  - Removed all cluttered preset time chips (`10:00 PM`, `10:30 PM`, `6:00 AM`, etc.).
  - Defaulted to yesterday's recorded bedtime and wake time automatically on new check-ins.
  - Added 1-tap "Yesterday: ..." badge to easily reset or view yesterday's exact times.
  - Implemented sleek, minimal **Up Arrow (▲)** and **Down Arrow (▼)** steppers for both bedtime and wake time.
  - Each arrow click steps the time by $\pm 15$ minutes; Shift+click or keyboard ArrowUp/ArrowDown steps by $\pm 60$ minutes.
  - Formatted time values in large editorial serif font (`font-serif text-2xl font-bold text-[#1A241E]`) with direct text editing support.
- Updated `src/lib/utils.ts` with reusable `formatMinutesTo12Hour` and `stepTimeString` helpers.
- Updated `DashboardMainView.tsx` to automatically resolve and supply yesterday's sleep log.
- Verified TypeScript compilation (`npx tsc --noEmit`): 0 errors.

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
- [x] Field Notes System (`/notes` with rich cards, markdown/text support, and pin toggles)
- [x] Seasons Page Overhaul (Habit row selection, monthly tick/cross calendar drilldown, and seasonal task accomplishment log)
### [Step 16] - Interactive Goal & Milestone Management System
- Implemented full management capabilities for the **Milestones (`/milestones`)** page:
  - Added `+ Add Life Goal` button and modal to create custom life roadmaps with title, category (`Study`, `Career`, `Craft`, `Body`, `Mind`, `Spirit`), target completion date, vision description, and a dynamic list of initial milestone steps.
  - Implemented in-card `+ Add Milestone` button and modal to append new milestone steps to any existing roadmap at any time.
  - Added botanical stage selector (`Seed 🌱`, `Sprout 🌿`, `Milestone 🌳`) for milestone steps.
  - Built milestone checkbox toggling with automatic progress recalculation.
  - Added milestone deletion (`X` button) and life goal deletion (`Trash2` button).
  - Added 1-click **Set as Dashboard Focus** button to designate the active goal highlighted on the Home Dashboard's `LongTermVisionCard`.
  - Created server actions in `src/lib/actions.ts`: `createGoal`, `createMilestone`, `deleteMilestone`, `deleteGoal`, `setActiveGoal`.
- Verified TypeScript compilation (`npx tsc --noEmit`): 0 errors.

### [Step 17] - Clerk Authentication & Multi-Tenancy Engine
- Upgraded Rooted to a full multi-tenant architecture with **Clerk Authentication**:
  - Installed `@clerk/nextjs` (`^7.9.4`).
  - Configured live environment keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) and redirect variables in `.env`.
  - Partitioned database schema (`prisma/schema.prisma`) across all core models: `Task`, `Habit`, `Goal`, `Note`, `SleepLog`, and `SleepSetting` with `userId` and index directives.
  - Successfully executed `npx prisma db push` preserving all 39 existing tasks, 4 habits, 2 goals, notes, and sleep logs with zero data loss.
  - Built **Auto-Claim Protocol (`claimDefaultUserData`)** in `src/lib/actions.ts`: Automatically transfers existing local/seed data to the creator's Clerk account upon first login, ensuring seamless onboarding.
  - Scoped all server actions and queries across all pages (`/`, `/tasks`, `/habits`, `/seasons`, `/milestones`, `/growth`, `/notes`) using `getEffectiveUserId()` with graceful fallback.
  - Added customized Clerk provider theme in `src/app/layout.tsx` adhering to Rooted's botanical forest green and warm linen aesthetic.
  - Added dedicated `/sign-in` and `/sign-up` pages (`src/app/sign-in/[[...sign-in]]/page.tsx` & `src/app/sign-up/[[...sign-up]]/page.tsx`).
  - Integrated `<SignedIn>`, `<SignedOut>`, and `<UserButton />` into `src/components/layout/Sidebar.tsx`.
  - Added dynamic personalized greeting on the Home Dashboard (`HeaderCapsules`) using Clerk's `currentUser()`.
  - Created detailed documentation note: `[[09_Authentication_and_Multi_Tenancy]]`.
- Verified TypeScript compilation (`npx tsc --noEmit`): 0 errors.

### [Step 18] - Turso LibSQL Cloud Database Integration & Data Replication
- Connected Rooted to **Turso (LibSQL Cloud Database)**:
  - Installed `@libsql/client` and `@prisma/adapter-libsql`.
  - Configured `src/lib/prisma.ts` with a dual-engine architecture:
    - Automatically instantiates `PrismaLibSQL` adapter when `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are present in `.env`.
    - Automatically falls back to local SQLite if credentials are unset.
  - Initialized full schema tables and indexes in Turso (`Goal`, `Milestone`, `Habit`, `HabitLog`, `Task`, `SleepLog`, `SleepSetting`, `Note`).
  - Successfully replicated all 42 tasks, 4 habits, 36 habit logs, 2 goals, 3 milestones, notes, and sleep logs directly into Turso cloud.
  - Built `AppShell` full-screen standalone layout for `/sign-in` and `/sign-up` omitting the sidebar.
  - Verified compilation (`npx tsc --noEmit`): 0 errors.
  - Successfully tested and running live on `http://localhost:3000`.

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
- [x] Field Notes System (`/notes` with rich cards, markdown/text support, and pin toggles)
- [x] Seasons Page Overhaul (Habit row selection, monthly tick/cross calendar drilldown, and seasonal task accomplishment log)
- [x] Morning Sleep Check-in Minimal Up/Down Steppers & Yesterday Default
- [x] Interactive Goal & Milestone Management System (`+ Add Life Goal`, in-card `+ Add Milestone`, deletion, active vision toggle)
- [x] Multi-Tenant Clerk Authentication & Zero-Data-Loss Migration System
- [x] Standalone Full-Screen Auth Pages (`AppShell`)
- [x] Turso LibSQL Cloud Database Integration & Data Replication
- [x] Turso Schema Parity Audit & Terminal Error Resolution (Added missing `HabitLog.note`, `Habit.frequencyType`, `Task.scheduledTime`, configured middleware 307 redirect)
- [x] Habit & Milestone Timestamp Synchronization (`updatedAt` constraint fix & Prisma Client regeneration)
- [x] Morning Reset Scope Refinement (Strictly yesterday's unfinished tasks only)
- [ ] Vercel One-Click Production Deployment
- [ ] User review and feedback

---

### Step 18: Turso Schema Parity Audit & Terminal Error Resolution
- **Root Cause Identified**:
  - Terminal was logging: `ConnectorError: SQLite input error: no such column: main.HabitLog.note` whenever habit queries with logs ran.
  - In addition, earlier missing columns `Habit.frequencyType` and `Task.scheduledTime` caused query failures.
  - Unauthenticated visits to `/` were throwing 404 rather than redirecting to `/sign-in`.
- **Changes Applied**:
  - Ran a schema parity check across all tables against `prisma/schema.prisma`.
  - Added missing column `note` to `HabitLog`.
  - Added missing column `frequencyType` to `Habit`.
  - Added missing column `scheduledTime` to `Task`.
  - Updated `src/middleware.ts` to pass `unauthenticatedUrl` to `auth.protect()`, smoothly redirecting guests to `/sign-in`.
- **Validation**:
  - Ran automated query tests across all models (`Goal`, `Milestone`, `Habit`, `HabitLog`, `Task`, `SleepLog`, `SleepSetting`, `Note`). All succeeded.
  - Ran production `npm run build`: compiled cleanly with zero errors.

---

### Step 19: Habit & Milestone Timestamp Synchronization
- **Root Cause Identified**:
  - `Habit` and `Milestone` tables in Turso had `updatedAt DATETIME NOT NULL`, but `updatedAt` was omitted from `prisma/schema.prisma`.
  - Creating a habit (`prisma.habit.create`) resulted in `SQLITE_CONSTRAINT: NOT NULL constraint failed: Habit.updatedAt`.
  - When running `npx prisma generate`, a lingering `npm run dev` process held a file lock on `query_engine-windows.dll.node`, throwing `EPERM`.
- **Changes Applied**:
  - Added `updatedAt DateTime @updatedAt` to `model Habit` in `prisma/schema.prisma`.
  - Added `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` to `model Milestone` in `prisma/schema.prisma`.
  - Released process lock, generated fresh Prisma Client with `npx prisma generate`.
  - Verified creation and deletion of `Habit` and `Milestone` on Turso with live timestamps.
  - Full production build (`npm run build`) succeeded with 0 errors.

---

### Step 21: Homepage Redesign (Concept 7) & Seasons Sleep Integration
- **Objective**:
  - Implement the approved redesign in `design/design_concept_7_homepage_redesign.jpg`:
    - Remove top tab switcher (`[Journal] [Task] [Sleep]`) and manual review header buttons from dashboard.
    - Remove obsolete cards `HabitGrowthMatrix.tsx` and `WeeklyFlowCard.tsx`.
    - Establish a balanced 2x2 grid:
      1. `DailyIntentionsCard`: Strictly displays tasks where `dueDate === today`.
      2. `TodayRitualsCard`: Actionable checklist of today's habits with one-click toggling, category pills, and flame streaks.
      3. `LongTermVisionCard`: Botanical milestone track with active goal carousel navigation (`< Goal 1 of 3 >`).
      4. `SleepClockCard`: 24-hour radial SVG clock dial with bedtime $\rightarrow$ wake-time glowing sweep arc, metrics, and rest logging trigger.
    - Add calendar date beside greeting in header capsules (`Good morning, Alex · September 21, 2026`) and rest hours capsule.
  - Overhaul Seasons page (`src/app/seasons/SeasonsClient.tsx`):
    - Add 3-Way Lens Switcher (`[ Habits ] [ Tasks ] [ Sleep ]`).
    - Implement Monthly Sleep Matrix calendar with color-coded target adherence and monthly sleep metrics.
    - Implement the **Unified 3-in-1 Daily Inspector** modal allowing users to inspect Rest, Habits, and Tasks for any clicked day.
- **Changes Applied**:
  - `src/lib/actions.ts`:
    - Scoped `todayTasks = tasks.filter((t) => t.dueDate === today)`.
    - Added `activeGoals = await prisma.goal.findMany(...)` returning `activeGoals` alongside `activeGoal`.
    - Enriched habits with `isCompletedToday` and `currentStreak`.
    - Added `getSeasonsData()` returning `{ tasks, habits, sleepLogs, sleepSetting, today }`.
  - `src/app/seasons/page.tsx`: Updated to invoke `getSeasonsData()` and pass `sleepLogs` and `sleepSetting` to `<SeasonsClient />`.
  - `src/components/dashboard/TodayRitualsCard.tsx`: Created with optimistic toggle, flame streak counters, category pills, and real-time completion bar.
  - `src/components/dashboard/SleepClockCard.tsx`: Created with 24-hour radial SVG clock dial, bedtime $\rightarrow$ wake sweep arc, target comparison, quality badge, and quick log button.
  - `src/components/dashboard/DailyIntentionsCard.tsx`: Enhanced header with today focus count badge, due time display, and modal defaulting `dueDate: today`.
  - `src/components/dashboard/LongTermVisionCard.tsx`: Added carousel cycling (`< Goal 1 of 3 >`) and dynamic botanical milestone track.
  - `src/components/dashboard/DashboardMainView.tsx`: Refactored to 2x2 grid containing the four canonical cards, removing obsolete tab switcher and cards.
  - `src/components/layout/HeaderCapsules.tsx`: Added calendar date and rest duration capsule.
  - Deleted obsolete files: `HabitGrowthMatrix.tsx` and `WeeklyFlowCard.tsx`.
  - `src/app/seasons/SeasonsClient.tsx`: Added 3-Way Lens Switcher, Sleep Lens with monthly sleep matrix & metrics, and the Unified 3-in-1 Daily Inspector modal.
- **Validation**:
  - Production build (`npm run build`) completed with 0 errors across all routes.

---

### Step 22: In-Place Clickable Sleep Target in Morning Sleep Dialog
- **Objective**:
  - Allow users to set their daily sleep target directly inside `MorningSleepDialog.tsx` without adding an extra visual card or complicated section.
  - Make the target label (`Target: 8.0h`) in the Hero Calculation Card directly clickable.
  - Toggling inline edit switches to a sleek in-place mini stepper (`[−] [8.0]h [+] [✓]`), with 8.0h as the standard default.
  - Changes recalculate sleep fulfillment %, target marker lines, and surplus/deficit metrics in real-time.
  - Atomically persists to `SleepSetting` in Turso/SQLite via `updateSleepTarget` server action, auto-revalidating `/`, `/seasons`, and `/growth`.
- **Validation**:
  - Production build (`npm run build`) completed with 0 errors across all routes.

---

### Step 23: Dashboard Header Text Alignment & Single-Row Capsule Layout
- **Objective**:
  - Restructure the top header of the Rooted Dashboard into a clean 3-line editorial hierarchy:
    1. **Line 1**: Personalized greeting (`Good morning, Samama` — using user name with fallback to `"Samama"`).
    2. **Line 2**: Formatted calendar date (`September 21, 2026`).
    3. **Line 3**: Botanical grounding mantra (`Grounded intentions for a conscious, steady flow.`).
  - Align all 4 floating metric capsules (`Harmony`, `Rooted Days`, `Rest`, `Daily Intentions`) in a single horizontal row on the same line without breaking or wrapping:
    - Specifically placed `2 of 4 Intentions` directly beside `7.8h Rest`.
    - Applied `flex-nowrap`, `whitespace-nowrap`, `shrink-0`, and responsive padding to ensure no capsule wraps to a second row on any viewport.
- **Files Modified**:
  - `src/components/layout/HeaderCapsules.tsx`:
    - Updated layout to 3 discrete stacked lines with dedicated typography hierarchy (`text-3xl font-serif`, `text-lg font-serif text-[#7C9A86]`, and `text-xs font-sans text-[#586B60]`).
    - Added `whitespace-nowrap` to each capsule and configured the capsule container with `flex-nowrap shrink-0 overflow-x-auto [scrollbar-width:none]`.
    - Updated responsive breakpoint to `xl:flex-row xl:items-center` for balanced spacing.
  - `src/app/page.tsx`:
    - Formatted `data.today` into full date string (`September 21, 2026`).
    - Defaulted fallback username to `"Samama"`.
- **Validation**:
  - Full TypeScript verification (`npx tsc --noEmit`) succeeded with 0 errors.

---

### Step 24: Full Responsive Layout, Settings Page & Logout Button
- **Objective**:
  - Fix the zoom-out / horizontal overflow issue that occurs across all pages when the browser viewport is resized (scrolling causes the page to scale down instead of reflowing).
  - Create a new **Settings** page at `/settings`.
  - Add a **Settings** nav link in the sidebar above the "My Sanctuary" user profile card.
  - Add a **Logout / Sign Out** button in the sidebar below the "Mindful Rhythm" botanical quote.
- **Root Cause Analysis**:
  - The sidebar was hardcoded at `w-64` (256px) and always visible, even on small screens. The main content area had no `overflow-x-hidden`, allowing content to expand horizontally beyond the viewport, triggering browser zoom-out behavior.
  - No viewport meta tag was present to constrain `initial-scale` and disable user scaling.
- **Files Modified**:
  - `src/app/layout.tsx`:
    - Added a separate `export const viewport: Viewport = { ... }` with `width: "device-width"`, `initialScale: 1`, `maximumScale: 1`, `userScalable: false`.
    - Used the correct Next.js 14+ `Viewport` type (viewport must be a separate export, not nested inside `Metadata`).
  - `src/app/globals.css`:
    - Added `html, body { overflow-x: hidden; max-width: 100vw; }` to prevent any horizontal overflow across all pages.
    - Added `@keyframes slide-in-from-left` and `.animate-slide-in` for the mobile sidebar panel animation.
  - `src/components/layout/AppShell.tsx`:
    - Complete rewrite: sidebar is now hidden on mobile (`hidden lg:block`).
    - Added a sticky mobile top bar with hamburger `<Menu>` icon that opens a full-screen overlay sidebar.
    - Overlay backdrop with `bg-black/40 backdrop-blur-sm` and slide-in animation.
    - Main content area uses `overflow-x-hidden overflow-y-auto` to prevent horizontal scrolling.
    - Responsive padding: `px-4 py-6 sm:px-6 sm:py-8 md:px-10 lg:px-12 md:py-10`.
  - `src/components/layout/Sidebar.tsx`:
    - Added `Settings` navigation link (lucide `Settings` icon) positioned above the "My Sanctuary" user profile card.
    - Added a `Sign Out` button (lucide `LogOut` icon, styled in terracotta `bg-[#F9ECE6]` / `text-[#C87452]`) positioned below the "Mindful Rhythm" botanical inspiration badge.
    - Both elements are conditionally rendered based on Clerk `isSignedIn` state.
  - `src/app/settings/page.tsx` **[NEW]**:
    - Server component fetching user data from Clerk (`currentUser()`) and passing props to `SettingsClient`.
  - `src/app/settings/SettingsClient.tsx` **[NEW]**:
    - Full settings page with organized sections: Profile, Sleep & Rest, Notifications, Appearance, Goals & Tracking, Privacy & Data, About.
    - Each section uses a reusable `SettingsSection` component with forest green icon badges.
    - Interactive `ToggleSwitch` components for notifications and appearance toggles.
    - Sign Out button at the bottom using Clerk `signOut`.
    - Fully styled in the Rooted botanical aesthetic (warm cream, forest green, sage, terracotta).
- **Validation**:
  - Full TypeScript verification (`npx tsc --noEmit`) succeeded with 0 errors.

### Step 25: Comprehensive Fluid Responsiveness Overhaul (Across All Pages & Zoom Levels)
- **Objective**:
  - Resolve the issue where zooming with mouse scroll (Ctrl+scroll) or viewing on wide screens caused the content to stay pinned to the left edge at a rigid `max-w-7xl` (1280px), leaving a massive empty void on the right.
  - Eliminate any horizontal overflow triggers (such as `shrink-0` on horizontal flex containers and `max-width: 100vw` with vertical scrollbars) that caused mobile and desktop browsers to zoom out to fit overflowing content.
- **Root Cause Analysis**:
  1. `AppShell.tsx` had `max-w-7xl` without `w-full` or `mx-auto`, clamping all pages to 1280px aligned hard-left. On 1080p, 1440p, or when zooming out to 50%/75%, the content became a small box hugging the left with over 50% dead cream space on the right.
  2. `globals.css` used `max-width: 100vw`, which includes the vertical scrollbar width (typically 16px) on Windows browsers, generating a permanent 16px horizontal overflow.
  3. `HeaderCapsules.tsx` had a rigid `shrink-0` on the horizontal capsule row, forcing the `<header>` and page wider than 100% on smaller screens.
  4. `DashboardMainView.tsx` used `lg:grid-cols-2`, which attempted to place 2 cards side-by-side in ~680px of available space between 1024px and 1279px, resulting in card overflow in `SleepClockCard`.
- **Changes Applied**:
  - `src/app/globals.css`:
    - Replaced `max-width: 100vw` with `width: 100%; max-width: 100%; overflow-x: hidden;` on `html` and `body`.
  - `src/app/layout.tsx`:
    - Standardized `viewport` to `{ width: "device-width", initialScale: 1 }` to allow smooth native browser reflow.
  - `src/components/layout/AppShell.tsx`:
    - Changed main wrapper to `<main className="flex-1 min-w-0 w-full overflow-x-hidden overflow-y-auto">`.
    - Changed page container to `<div className="w-full max-w-[1600px] mx-auto min-w-0 px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 xl:px-12">`.
    - Stretches 100% across all displays while remaining centered and balanced up to 1600px on ultrawide monitors and zoom-outs.
  - `src/components/layout/Sidebar.tsx`:
    - Added `lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto` so the sidebar stays docked on desktop and scrolls smoothly if vertical height is constrained.
  - `src/components/layout/HeaderCapsules.tsx`:
    - Removed `shrink-0` from the capsule container and added `w-full` to `<header>` and `max-w-full min-w-0` to the capsules row.
  - `src/components/dashboard/DashboardMainView.tsx`:
    - Upgraded grid from `lg:grid-cols-2` to `grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-7 w-full`. Added `w-full` to all card wrappers.
  - `src/components/dashboard/SleepClockCard.tsx`:
    - Changed inner layout from `sm:grid-cols-2` to `md:grid-cols-2` for smooth stacking on narrow card viewports.
  - `src/app/settings/SettingsClient.tsx`:
    - Changed container to `w-full max-w-3xl mx-auto space-y-6`.
  - `src/app/page.tsx`, `src/app/tasks/TasksClient.tsx`, `src/app/habits/HabitsClient.tsx`, `src/app/notes/NotesClient.tsx`, `src/app/seasons/SeasonsClient.tsx`, `src/app/milestones/MilestonesClient.tsx`, `src/app/growth/GrowthClient.tsx`:
    - Added `w-full` to every page's root container.
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors. Dev server hot-reloaded cleanly.

### Step 26: Sidebar Responsive Refinement Across Zoom In & Zoom Out
- **Objective**:
  - Fix sidebar behavior during browser zooming (in and out) and viewport resizing so that items do not disconnect, overflow, or disappear unexpectedly.
- **Root Cause Analysis**:
  1. Desktop sidebar breakpoint was set to `hidden lg:block` (1024px). When zooming in (e.g. 110%–150%), effective viewport width dropped below 1024px, causing the desktop sidebar to abruptly vanish into a mobile hamburger menu.
  2. The sidebar used `flex-col justify-between` on an unconstrained container with excessive vertical gaps (`mb-12` = 48px, `space-y-3` = 12px per item). On zoom-out (tall viewport), the bottom section was pushed thousands of pixels down. On zoom-in (short viewport), items collided, and because the parent in `AppShell` lacked `sticky top-0 h-screen`, the sidebar stretched with the document rather than scrolling independently.
- **Changes Applied**:
  - `src/components/layout/AppShell.tsx`:
    - Updated desktop sidebar wrapper to `<div className="hidden md:block shrink-0 sticky top-0 h-screen z-30">`. Lowered collapse breakpoint from `lg` (1024px) to `md` (768px) so the desktop sidebar stays visible during normal desktop zoom-in.
    - Updated mobile overlay and top bar to `md:hidden`.
  - `src/components/layout/Sidebar.tsx`:
    - Changed root aside to `<aside className="w-64 h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden border-r border-[#EAE5D8]/80 bg-[#F7F4EB] px-5 py-6 sm:px-6 sm:py-7 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">`.
    - Compacted vertical spacing: reduced logo margin to `mb-6 sm:mb-8`, nav item spacing to `space-y-1.5`, and nav padding to `px-3 py-2 text-sm`.
    - Replaced disconnected bottom spacing with `<div className="pt-4 mt-auto space-y-2.5 border-t border-[#EAE5D8]/80">`. On tall/zoomed-out views, `mt-auto` keeps the account/settings section gracefully anchored with a clean divider; on short/zoomed-in views, it scrolls smoothly without clipping.
    - Adjusted quote card to `p-3 rounded-2xl` and sign-out button to `px-3.5 py-2` for proportional height conservation.
- **Validation**:
  - Full TypeScript check (`npx tsc --noEmit`) succeeded with 0 errors.

### Step 27: Growth & Analytics Page Redesign (`design_concept_8_growth_analytics.jpg`)
- **Objective**:
  - Replace the static Growth page with a dynamic, data-driven personal analytics engine (`/growth`) tracking execution across tasks, habits, and sleep recovery.
- **Implementation Details**:
  - `src/app/growth/page.tsx`:
    - Scoped queries to authenticated Clerk user (`getEffectiveUserId()`).
    - Fetched all user tasks, habits with 120-day historical logs, sleep logs (`prisma.sleepLog`), and user's sleep target hours (`prisma.sleepSetting`, defaulting to 8.0h).
  - `src/app/growth/GrowthClient.tsx`:
    - Rebuilt the layout matching `design/design_concept_8_growth_analytics.jpg`:
      - **Header**: Editorial title `Growth & Life Patterns` + dynamic horizon pill switcher (`This Week`, current month e.g. `September 2026`, previous month e.g. `August 2026`, `All Time`).
      - **Row 1 (Triad Scorecard)**:
        - `Task Execution`: Completed/total fraction, percentage badge, 3-color segmented bar (Sage green on-time, terracotta missed, warm sand pending), and legend.
        - `Habit Consistency`: Overall adherence percentage, total check-ins count, and longest best streak flame badge.
        - `Sleep Sanctuary`: Nightly average sleep duration, target comparison divider, and restful nights percentage badge.
      - **Row 2 (Deep Comparative Analysis)**:
        - `Task Velocity & Missed Analysis`: Full-width segmented distribution bar, large bold urgent priority callout, and breakdown table across Urgent, High, and Normal tiers.
        - `Habit Anchors & Friction Points`: Top anchor habits ($\ge 75\%$ consistency) with flame streaks; Needs attention friction habits ($< 75\%$) with automated pattern detection (e.g. weekend misses vs weekday misses).
      - **Row 3 (Day-of-Week Rhythm & Rest Correlation Banner)**:
        - Forest green container (`#1E3127`).
        - 7 vertical rounded bars for `Mon` through `Sun` reflecting daily execution rates.
        - Translucent rest correlation pill (`#24372D`) calculating the task execution lift following 8h+ sleep.
  - `notes/04_Features_and_Workflows.md`:
    - Updated Section 6 with complete documentation of the new Growth & Life Patterns engine.
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors.
  - HTTP `GET /growth` verified with status `200`.

---

### Step 28: Habit Anchors Flame Icon & Active Streak Audit
- **Root Cause & User Feedback**:
  - In `src/app/growth/GrowthClient.tsx`, the "Top anchor habits" card displayed a redundant flame icon immediately after the percentage badge (`{h.rate}% 🔥`).
  - Furthermore, `Database Management System` (DBMS) showed an active streak of `4` with a flame badge (`🔥 4`), even though the user had missed logging DBMS yesterday (Sept 20) and today (Sept 21).
  - The previous code had hardcoded `Math.max(streak, 4)` and evaluated streak from raw sorted log arrays without checking chronological continuity to today/yesterday.
- **Changes Applied**:
  - In `src/app/growth/GrowthClient.tsx`:
    - Removed the redundant `<Flame />` icon from after `{h.rate}%`.
    - Implemented calendar-aware active streak calculation:
      - If completed today, count backwards consecutive days.
      - If not completed today, check yesterday: if completed yesterday, count backwards consecutive days from yesterday (streak is active while today is ongoing).
      - If neither today nor yesterday was completed, the active streak is `0` (broken).
    - Conditioned the right-hand streak display:
      - When `streak > 0`: renders flame badge with streak count (`🔥 {streak}`).
      - When `streak === 0`: does not render any flame icon, cleanly displaying `0` in muted neutral text.
    - Updated `bestStreak` to compute the actual all-time longest streak from historical logs across all habits rather than relying on fallback mock values.
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors.
  - Verified `GET /growth` returns 200.
  - DBMS correctly renders with no flame icon and streak `0`. Coding / Paper renders with `🔥 4` and percentage without any trailing flame.

---

### Step 29: Minimum 2-Day Streak Threshold for Habit Fire Capsules
- **User Directive**:
  - The fire streak capsule on habit cards (`HabitsClient.tsx`) was displaying `0d Streak` with a flame icon when a streak was 0 (e.g., `[🔥 0d Streak]`).
  - Require that the fire capsule ONLY appears when a habit has at least a 2-day streak (`currentStreak >= 2`). If the streak is 0 or 1, do not render the capsule at all.
- **Changes Applied**:
  - `src/app/habits/HabitsClient.tsx`:
    - Grid card view: Conditioned the `{currentStreak}d Streak` capsule to render strictly when `currentStreak >= 2`.
    - Matrix list view: In the streak column, render the streak pill when `currentStreak >= 2`, otherwise display a neutral dash `—`.
  - `src/components/dashboard/TodayRitualsCard.tsx`:
    - Updated streak badge to only render when `streak >= 2`, removing `0` streak fire pills (`🔥 0`) from the dashboard checklist.
  - `src/app/growth/GrowthClient.tsx`:
    - Updated Top Anchor Habits streak flame badge to require `streak >= 2` for consistent behavior across all views.
- **Validation**:
  - Verified with `npx tsc --noEmit` (0 errors).
  - HTTP `GET /habits`, `GET /`, and `GET /growth` all verified with status `200`.
  - Habit cards and checklist items with 0 or 1 day streaks (e.g. DBMS, Coursera, Read a Book) no longer show any `0` fire capsule; only habits with 2+ consecutive days (e.g. Coding / Paper with 4d) display the flame streak badge.

---

### Step 30: Sidebar Navigation Typography & Icon Size Scaling
- **User Directive**:
  - Make the sidebar icon and text slightly more prominent and bigger for enhanced visual balance, presence, and effortless legibility.
- **Changes Applied**:
  - `src/components/layout/Sidebar.tsx`:
    - Scaled navigation item icon containers to `w-11 h-11` (44px) with organic `rounded-2xl` styling.
    - Scaled navigation and settings Lucide icons to `w-5.5 h-5.5` (22px) with crisp `stroke-[2]` definition.
    - Scaled navigation typography to `text-[16px]` (1rem) with balanced `px-3.5 py-2.5` touch padding and `gap-3.5`.
    - Elevated brand logo typography to `text-3xl sm:text-[34px]`.
    - Broadened desktop sidebar width to `w-68 sm:w-[17.5rem]` (280px) with generous `px-6 py-7` gutters on desktop viewports.
- **Validation**:
  - `npx tsc --noEmit` verified cleanly with 0 errors.

---

### Step 31: Field Notes Creation Date & Calendar Accuracy Audit
- **Root Cause & User Feedback**:
  - In `src/app/notes/NotesClient.tsx`, note cards displayed "Yesterday" for notes that were written several days prior (such as note "IDEA", created on September 19, 2026).
  - Two issues caused this:
    1. The card footer was displaying `{formatNoteDate(note.updatedAt)}` instead of `{formatNoteDate(note.createdAt)}` (the actual timestamp when the note was written).
    2. `formatNoteDate` previously computed a naive 24-hour millisecond difference (`Math.floor(diffMs / 86400000)`), which could inaccurately label multi-day-old notes as "Yesterday" without checking calendar day boundaries.
- **Changes Applied**:
  - `src/app/notes/NotesClient.tsx`:
    - Rewrote `formatNoteDate` to perform calendar-accurate day comparison (matching `getFullYear()`, `getMonth()`, and `getDate()`):
      - If created today: displays `Today`.
      - If created yesterday on the calendar: displays `Yesterday`.
      - If created prior to yesterday: displays the actual calendar date (e.g. `Sep 19` for current year, or `Sep 19, 2026`).
    - Updated note list cards (both pinned and regular) to pass `note.createdAt` instead of `note.updatedAt`.
    - Added detailed tooltip `title` (`Written on Sat, Sep 19, 2026`) on hover over the clock badge.
    - Updated active note editor footer info bar to display `Written {formatNoteDate(selectedNote.createdAt)}`.
- **Validation**:
  - TypeScript check (`npx tsc --noEmit`) succeeded with 0 errors.
  - HTTP `GET /notes` returned 200 OK.
  - Note "IDEA" written on September 19 now accurately displays `Sep 19` rather than `Yesterday`.

---

### Step 32: Cinematic Video Landing Page with Liquid Glass Effect
- **User Directive**:
  - Implement a single-page hero landing page with a fullscreen looping background video, glassmorphic navigation, and cinematic typography based on the provided design specification, faithfully integrated with the **Rooted®** brand theme.
- **Components & Features Implemented**:
  - `src/app/globals.css`:
    - Imported `Instrument Serif` (Google Font) and `Inter` at the top of the stylesheet.
    - Added the `.liquid-glass` styling with luminance blending, inner border glow, 4px backdrop blur, and pseudo-element gradient border with XOR mask composite.
    - Defined `@keyframes fade-rise` and classes `.animate-fade-rise`, `.animate-fade-rise-delay`, and `.animate-fade-rise-delay-2`.
  - `src/middleware.ts`:
    - Whitelisted `"/landing(.*)"` in `isPublicRoute` so the landing page is accessible publicly without requiring immediate authentication.
  - `src/components/layout/AppShell.tsx`:
    - Added `pathname?.startsWith("/landing")` to `isStandalonePage` to render the landing page without the application dashboard sidebar.
  - `src/app/landing/page.tsx`:
    - **Fullscreen Background Video**: `<video>` element with `autoPlay`, `loop`, `muted`, `playsInline`, `object-cover` positioned `absolute inset-0 z-0`.
    - **Navigation Bar**: `Rooted®` logo in `Instrument Serif`, navigation links (`Home`, `Habits`, `Seasons`, `Milestones`, `Growth`), and liquid-glass CTA button.
    - **Hero Section**:
      - H1: *"Where dreams rise through the silence."* with `Instrument Serif`, font size `text-5xl sm:text-7xl md:text-8xl`, negative letter spacing, and contrast `<em className="text-neutral-400">` styling.
      - Subtext: Dedicated copy for deep thinkers, bold creators, and quiet rebels.
      - Primary CTA Button: Large pill button with `.liquid-glass`, `animate-fade-rise-delay-2`, routing authenticated users to `/` ("Enter Sanctuary") and new visitors to `/sign-up` ("Begin Journey").
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors.
  - HTTP `GET /landing` verified with status `200`.
  - Core routes (`/`, `/habits`, `/notes`) all verified with status `200`.

---

### Step 34: Seamless Landing Route Elimination & Root Onboarding Flow
- **User Directive**:
  - The default URL `http://localhost:3000` must serve the landing page for any new/first-time visitors.
  - The URL `http://localhost:3000/landing` must NOT exist as a standalone route; visiting it must immediately redirect to `http://localhost:3000`.
- **Changes Applied**:
  - **Redirect Enforcement**:
    - `next.config.ts`: Configured `async redirects()` with a 308 permanent redirect rule from `/landing` $\rightarrow$ `/`.
    - `src/middleware.ts`: Intercepts `req.nextUrl.pathname === "/landing"` directly and issues a `NextResponse.redirect(new URL("/", req.url))` before route evaluation.
  - **Sign-Out Continuity**:
    - `src/components/layout/Sidebar.tsx` & `src/app/settings/SettingsClient.tsx`: Updated `signOut({ redirectUrl: "/" })` so logging out returns users directly to the Rooted landing page rather than a raw sign-in prompt.
  - **Root URL Experience**:
    - `http://localhost:3000` (unauthenticated/first-time visitor): Renders `<LandingView />` with full-screen looping video, liquid glass styling, and Instrument Serif typography without the dashboard sidebar.
    - `http://localhost:3000` (authenticated): Renders the personal Sanctuary dashboard with Header Capsules and the daily Journal/Task horizons.
    - `http://localhost:3000/landing`: Returns `HTTP 308 Permanent Redirect` pointing to `/`.
- **Validation**:
  - `curl -I http://localhost:3000/landing` verified: returns `HTTP/1.1 308 Permanent Redirect` with `Location: /`.
  - `curl -I http://localhost:3000/` verified: returns `HTTP/1.1 200 OK` serving the Landing Page when unauthenticated.
  - TypeScript check (`npx tsc --noEmit`) passes with 0 errors.

---

### Step 35: Animated Multi-Section Landing Page Integration (`like_style.html`)
- **User Directive**:
  - Implement the remaining sections of the landing page using the design, layout, and animations from `design/like_style.html`.
  - Preserve our existing fullscreen video hero section at the top.
  - Blend Rooted's theme (warm linen `#FAF7F0`, deep forest green `#1E3127`, terracotta `#D98A6C`, sage `#7C9A86`) and core project pillars (Daily Sanctuary, Habit Matrix & Graduation, Botanical Milestones, Seasons Rest) into the page.
  - Retain all interactive animations: smooth blur reveal, panel zoom, word-by-word reveal, drifting background forms, floating cursor preview, and video in-view autoplay.
- **Changes Applied**:
  - `src/app/globals.css`:
    - Defined `@keyframes drift1`, `drift2`, `drift3` with `.drift-a`, `.drift-b`, `.drift-c`.
    - Added `[data-reveal]` and `[data-reveal].is-in` (slide-up 48px + blur 10px transition using `cubic-bezier(.22, 1, .36, 1)`).
    - Added `[data-panel-img]` and `[data-panel-img].is-in` (subtle zoom & translateY transition).
    - Added `.word-reveal` and `.is-in .word-reveal` (word-by-word staggered reveal).
    - Added `@media (prefers-reduced-motion: reduce)` accessibility overrides.
  - `src/components/landing/useLandingAnimations.ts`:
    - Created modular React hook coordinating all client DOM interactions safely:
      - `wrapWords`: TreeWalker text tokenizer wrapping words in `.word-reveal` with progressive `transitionDelay`.
      - `IntersectionObserver`: Triggers `.is-in` on `[data-reveal]` and `[data-panel-img]`.
      - `Parallax`: Window scroll listener translating `[data-parallax]` elements on `requestAnimationFrame`.
      - `CursorPreview`: Attaches mouse listeners on `[data-preview]` elements, moving the `#cursor-preview` floating card to pointer coordinates (`clientX + 28px`, `clientY - 80px`).
      - `InViewVideo`: Video observer auto-playing/pausing videos as they scroll into/out of view.
  - `src/components/landing/LandingView.tsx`:
    - **Hero Section**: Preserved fullscreen looping background video with ambient drifting blurred forms, glassmorphic header, and Instrument Serif typography.
    - **Section 1: Selected Practice Reel (`#practice`)**:
      - *Panel 01*: Panoramic video card for Daily Sanctuary & Focus Dials.
      - *Panels 02 & 03*: Asymmetric staggered grid for Habit Matrix & Ritual Graduation and Botanical Milestones.
      - *Panel 04*: Full-bleed banner for Seasonal History & Sleep Recovery.
    - **Section 2: The Rooted Method (`#method`)**:
      - Soft sage tinted section (`#EBF1E8`) with 3-column philosophy cards (*Plan & Plant*, *Tend & Flow*, *Harvest & Master*) with image zoom on hover.
    - **Section 3: Sanctuary Capabilities with Cursor Follower (`#capabilities`)**:
      - Deep forest green (`#1E3127`) section with 6 numbered rows and floating cursor preview image.
    - **Section 4: Mindful Reflection (`#reflection`)**:
      - Editorial testimonial with grayscale-to-color portrait card and Lucide `Quote` icon.
    - **Section 5: Final CTA & Parallax Wordmark (`#contact`)**:
      - Huge cropped parallax outline text (`ROOTED IN RHYTHM`), editorial invitation, and liquid glass CTA button.
    - **Section 6: Editorial Footer**:
      - Botanical 9-dot glyph, anchor navigation, and copyright mark.
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors.
  - HTTP `GET /` verified with status 200 OK serving the full page.

---

### Step 36: Full-Bleed Banner Transformation (Panel 04 - Seasons & Rest)
- **User Directive**:
  - Make the "04 / SEASONS & REST — Seasonal History & Sleep Recovery" component take the full width of the screen instead of being constrained inside the standard max-width card container.
- **Changes Applied**:
  - `src/components/landing/LandingView.tsx`:
    - Removed the wrapping `<div className="max-w-7xl mx-auto px-6 sm:px-10">` and `rounded-3xl border border-[#EAE5D8]` from Panel 04.
    - Updated Panel 04 container to `relative w-full overflow-hidden aspect-[16/12] sm:aspect-[21/9]`, stretching edge-to-edge across 100% of the viewport.
    - Kept inner text content perfectly aligned with the rest of the page via `<div className="absolute bottom-0 left-0 w-full"><div className="max-w-7xl mx-auto px-6 sm:px-10 pb-8 sm:pb-12 ...">`.
    - Adjusted section `#practice` padding from `pb-16` to `pb-0` so the full-bleed banner seamlessly meets the subsequent `#method` section without an awkward background gap.
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors.
  - Confirmed edge-to-edge responsive layout across all breakpoints.

---

### Step 37: Animated ROOTED Parallax Manifesto Interlude
- **User Directive**:
  - Fill the large empty gap beneath the Evelyn Vance testimonial quote with an animated typographic section echoing the scroll animation of the hero's giant "ROOTED" wordmark.
  - Include relevant, inspiring copy reflecting the philosophy of the project.
- **Changes Applied**:
  - `src/components/landing/LandingView.tsx`:
    - Tightened `#reflection` section bottom padding from `pb-28 sm:pb-36` to `pb-16 sm:pb-20` to prevent awkward whitespace.
    - Inserted a dedicated **Animated Parallax Interlude Section**:
      - **Ambient Drifting Shapes**: Floating translucent bubbles (`.drift-a`, `.drift-b`, `.drift-c`) with subtle sage and terracotta borders and backdrop blur matching the hero.
      - **Giant Animated Parallax Wordmark ("ROOTED")**: Centered `text-[24vw] sm:text-[21vw]` in *Instrument Serif* with `data-parallax="0.32"`, styled with elegant text stroke (`-webkit-text-stroke: 1.5px rgba(30, 49, 39, 0.2)`) and translucent fill (`text-[#1E3127]/[0.08]`), smoothly gliding as the user scrolls.
      - **Foreground Editorial Manifesto**:
        - Pill capsule: *"The Rhythm of Life Architecture"*.
        - Dynamic heading with `[data-reveal-words="true"]`: *"Small daily seeds yield towering groves over seasons."*
        - Relevant copy: *"Every 20-minute intention planted today becomes the milestone you celebrate tomorrow. No frantic hustle. Just grounded, enduring progress."*
    - Streamlined the subsequent `#contact` section, removing the redundant faint spacer text to ensure balanced vertical rhythm.
  - `src/components/landing/useLandingAnimations.ts`:
    - Updated parallax scroll math to calculate vertical translation relative to the viewport center for mid-page elements (`(rect.top - window.innerHeight * 0.5) * speed`), ensuring fluid, non-wrapping parallax motion.
- **Validation**:
  - `npx tsc --noEmit` passed with 0 errors.
  - Verified seamless visual connection and scroll responsiveness on `http://localhost:3000`.

---

### Step 38: Remote MCP & AI Assistant Connectors (Gemini, Claude, Grok, ChatGPT)
- **Objective**:
  - Transform Rooted into an AI-connected productivity platform by exposing an open, standard Model Context Protocol (MCP) Remote Server.
  - Allow Gemini (Spark), Claude, Grok (xAI), and ChatGPT in the browser to directly query and manage the user's daily intentions, habits, rest rhythms, and thoughts.
- **Protocol & Backend Implementation**:
  - **Data Security & Multi-Tenancy**:
    - Added `ApiKey` model to `prisma/schema.prisma` (`id`, `name`, `keyHash`, `keyPrefix`, `userId`, `lastUsedAt`, `expiresAt`, `createdAt`, `updatedAt`).
    - Synced schema to Turso LibSQL cloud database with unique hash constraints and user indices.
    - Personal Access Tokens (PATs) use cryptographic random bytes (`rooted_pat_<48hex>`). Only SHA-256 hashes are persisted in the database; raw tokens are shown only once upon creation.
    - All database queries in the MCP tool dispatcher strictly filter by `where: { userId }`, guaranteeing total multi-tenant data isolation.
  - **Endpoints**:
    - `src/middleware.ts`: Whitelisted `"/api/mcp(.*)"` in Clerk's `isPublicRoute` so external AI cloud servers can authenticate via Bearer token or URL parameter without redirection.
    - `src/lib/mcp/sessionStore.ts`: In-memory SSE session manager mapping `sessionId` to user IDs and `ReadableStreamDefaultController`.
    - `src/lib/mcp/dispatcher.ts`: Standard JSON-RPC 2.0 dispatcher supporting `initialize`, `notifications/initialized`, `ping`, `tools/list`, and `tools/call`.
    - `src/app/api/mcp/sse/route.ts`: SSE handshake announcing message endpoint and providing 20s keep-alive heartbeats.
    - `src/app/api/mcp/messages/route.ts`: Session-bound JSON-RPC POST route with CORS.
    - `src/app/api/mcp/route.ts`: Universal root entry point supporting both SSE (`Accept: text/event-stream`) and direct HTTP POST JSON-RPC.
  - **Rooted Toolset (`src/lib/mcp/tools.ts`)**:
    1. `get_today_sanctuary`: Harmony Score (0-100), habit checklist, today's intentions, overdue counts, sleep recovery.
    2. `list_intentions`: Filter intentions by horizon (`TODAY`, `UPCOMING`, `ANYTIME`, `ALL`), status, or priority.
    3. `create_intention`: Plant tasks/intentions with title, category, priority, and optional due date.
    4. `complete_intention`: Mark intentions completed by ID or name matching.
    5. `reschedule_overdue_tasks`: Shift overdue tasks to today (Morning Reset).
    6. `list_habits`: All active habits, frequencies, streaks, and today's status.
    7. `log_habit`: Check off habits and automatically recalculate rolling streaks.
    8. `add_note`: Record thoughts and reflections in the Thought Garden.
- **Settings UI (`src/app/settings/SettingsClient.tsx`)**:
  - Added dedicated **AI Assistant Connectors (Remote MCP)** card with Rooted botanical aesthetic:
    - 1-Click "Generate Token" modal with single-view token display and copy feedback.
    - Interactive provider tabs for **Gemini Spark**, **Claude**, **Grok**, and **ChatGPT** showing exact configuration JSON and URLs.
    - Active API Keys table with key prefix preview, creation date, last used timestamp, and instant key revocation.
    - Local tunneling guide (`ngrok` / Cloudflare) for testing on `localhost`.
- **Knowledge & Documentation**:
  - Created [[10_AI_Connectors_and_Remote_MCP]] detailing protocol specs, Mermaid diagrams, and configuration workflows.
  - Indexed in [[00_Index]].
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors.
  - Automated integration test `scratch/test_mcp.ts` verified `initialize`, `tools/list` (8 tools), `tools/call` (`get_today_sanctuary`), and SSE stream connection. All tests passed with 100% success.

---

### Step 40: Enhanced Gemini Integration Settings & Spark UX
- **User Problem & Requirements**:
  - Users needed explicit, foolproof instructions for connecting Rooted to Google Gemini Web as a custom MCP app.
  - The instructions required exact navigation steps:
    1. Open Gemini in browser (`gemini.google.com`).
    2. Click `Settings (⚙) > Personal Intelligence > Connected Apps > Add Custom Apps`.
    3. Paste the key on the MCP Server URL and click on Next and Connect.
  - For Gemini usage, users required guidance on switching to the **Spark tab**, invoking with `@Rooted Sanctuary MCP Server`, clicking **Allow** for tool execution, and ready-to-use 1-click copy prompt templates.
- **Architectural Implementation (`src/app/settings/SettingsClient.tsx`)**:
  - **Persistent Platform Tabs**: Elevated the platform selector (`Gemini Spark`, `Claude`, `Grok`, `ChatGPT`) and Public Tunnel Host configuration to be always visible in the Settings view, so users can review instructions and copy prompt chips even when not in an active key-creation modal flow.
  - **Card 1: To Integrate Rooted to Gemini**:
    - Step 1: Open Gemini in the browser with clickable link to `gemini.google.com`.
    - Step 2: Styled breadcrumb path: `⚙ Settings` $\rightarrow$ `Personal Intelligence` $\rightarrow$ `Connected Apps` $\rightarrow$ `+ Add Custom Apps`.
    - Step 3: MCP URL input box with 1-click "Copy MCP URL" button, preloaded with active token or active key prefix.
    - Pro-Tips callout explicitly clarifying that `Client ID` & `Client secret` should remain empty, and server name is `Rooted Sanctuary MCP Server`.
  - **Card 2: To Use on Gemini**:
    - Step 1: Switch to the Spark tab in Gemini's left sidebar.
    - Step 2: Mention Rooted with `@` (`@Rooted Sanctuary MCP Server`).
    - Step 3: Click "Allow" on first tool execution.
    - Step 4: Manage sanctuary conversationally.
  - **Click-to-Copy Quick Prompts**:
    - Added 4 interactive cards with 1-click copy:
      - 📊 *Daily Sanctuary Briefing*
      - 🧹 *Reschedule Overdue Tasks*
      - 🌱 *Plant a New Intention*
      - ✅ *Check Off a Habit*
  - **Modal Flow**: Added `setIsModalOpen(false)` on successful key generation to smoothly close the creation modal and immediately display the generated key banner.
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors.
  - Dev server and Cloudflare tunnel running smoothly.

- **Collapsible AI Setup Guide & Refresh State**:
  - Encapsulated the entire AI platform guide container (Public Tunnel Host, 4 platform tabs, step-by-step instructions, and quick prompts) into a conditional container governed by `isGuideOpen || newlyCreatedKey`.
  - Configured state to default to `false` so on page load or refresh (`F5`), the settings screen remains compact and shrunk by default.
  - Eliminated distracting static toggle buttons from the initial state: the guide opens solely when the user clicks **"Generate Connector Key"**.
  - **Cancel Safety**: Clicking "Cancel" (or the backdrop / close button) in the New Connector Key modal immediately shrinks the guide back down and clears any stale state.
  - **Contextual Shrink Guide Controls**: When the guide is open, clearly visible "Shrink Guide" buttons appear in the section header, the top guide banner, and at the bottom of the instructions, allowing one-click collapsing back to the calm baseline view.
  - **Dedicated Quick Prompts Section**: Decoupled prompt cards from individual AI platform tabs into a standalone section below the tabs for all assistants.
  - Verified with `npx tsc --noEmit` (0 errors).

---

### Step 41: Vercel Production Deployment Preparation & Audit
- **Objective**:
  - Prepare the entire Rooted repository for zero-downtime, 1-click production deployment on **Vercel**.
  - Verify complete database connectivity to **Turso LibSQL** in the cloud.
  - Audit builds, scripts, environment templates, and secrets exclusion.
- **Audit & Implementation Results**:
  1. **Dual Database Verification (Turso LibSQL)**:
     - Ran automated connectivity tests against `TURSO_DATABASE_URL` (`libsql://rooted-db-samama-karim.aws-ap-south-1.turso.io`).
     - Verified all 8 tables and records are active in the cloud: 4 Goals, 7 Milestones, 5 Habits, 44 HabitLogs, 60 Tasks, 14 SleepLogs, 1 SleepSetting, 6 Notes, 4 ApiKeys.
  2. **Vercel Build Script Optimization**:
     - Configured `package.json` build command to `"build": "prisma generate && next build"` to ensure Prisma Client generates for the Vercel Linux container environment before static page rendering.
  3. **Local Production Build Verification**:
     - Executed full `next build` simulation: successfully compiled all static and dynamic routes (`/`, `/tasks`, `/habits`, `/seasons`, `/milestones`, `/growth`, `/notes`, `/settings`, and `/api/mcp` endpoints) with 0 errors.
  4. **Security & Repository Hygiene**:
     - Created `.env.example` documenting all 9 required production variables.
     - Added `/scratch` to `.gitignore` to prevent committing binary assets (such as local `cloudflared.exe`).
     - Verified `.env` and `.env.local` remain completely protected and untracked.
  5. **Documentation**:
     - Authored [[11_Vercel_and_Production_Deployment]] providing an exhaustive deployment runbook and checklist.
     - Updated [[00_Index]].















---

### Step 42: First Successful Live Vercel Production Deployment & Domain Verification
- **Objective**:
  - Deploy The Rooted Project live on Vercel under its official production domain 	he-rooted-project.vercel.app.
  - Diagnose the initial 404 deployment error and verify live status.
- **Root Cause & Diagnosis**:
  - Utilizing the newly configured Vercel MCP server, inspected project prj_sGm2VmTjfXFdn39ePZmAs5O41kwB.
  - Confirmed all 9 required production environment variables were correctly saved.
  - Discovered that the deployment list had 0 deployments (count: 0), as the initial Git import had created the project container without triggering a build.
- **Actions Taken**:
  - Invoked create_deployment via Vercel MCP with Git source SamamaKarim092/the-rooted-project on branch main targeting production.
  - Deployment dpl_GyYymVUuPgYBz2FCZnqWHywnze3s compiled successfully and transitioned to READY.
  - Bound aliases: 	he-rooted-project.vercel.app, 	he-rooted-project-samamakarim092s-projects.vercel.app.
- **Validation**:
  - Fetched live HTML from https://the-rooted-project.vercel.app/ with status 200 OK.
  - Verified full rendering of the video hero, liquid glass navigation, and all section pillars.

---

### Step 43: Sidebar Persistent Layout Fix & Universal Page Loading Skeletons
- **User Directive**:
  - Make sure the sidebar displays properly on the main page (`/`), matching standard web app design patterns.
  - Implement comprehensive, professional loading skeletons for all pages across the application.
- **Root Cause & Fix for Sidebar**:
  - `src/components/layout/AppShell.tsx`:
    - Previously evaluated `const isLandingOnRoot = pathname === "/" && (!isSignedIn || isLandingPreview);` using client-side `useAuth()`.
    - During initial hydration and client auth resolution, `isSignedIn` evaluated to `undefined`/`false`, inadvertently stripping both the desktop sidebar and mobile top bar from the authenticated dashboard on the root route.
    - Removed `isLandingOnRoot` condition from `AppShell`. The app layout now persistently mounts the sticky desktop sidebar (`md+`) and mobile hamburger bar across all application routes.
  - `src/components/landing/LandingView.tsx`:
    - Updated container to `fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#FAF7F0]` so that when rendered for unauthenticated guests, it seamlessly takes over the full viewport without layout shifting.
- **Universal Loading Skeletons Implemented**:
  - Authored tailored, organic botanical skeletons matching the design tokens (`#FAF7F0`, `#EAE5D8`, `#1E3127`, `#2A3F34`):
    1. `src/app/loading.tsx`: Dashboard skeleton with header capsule bar, dark forest Daily Intentions card, cream Today's Rituals card, Long-Term Vision ladder, and Rest Sanctuary sleep dial.
    2. `src/app/tasks/loading.tsx`: Horizon cards, category filter pills, priority indicators, and checkbox shimmers.
    3. `src/app/habits/loading.tsx`: Active habit cards, streak counters, and 7-day dot matrix consistency grids.
    4. `src/app/seasons/loading.tsx`: Month navigator header, monthly metrics summary, and calendar day grid.
    5. `src/app/milestones/loading.tsx`: Life Vision header, progress bars, and botanical stage stepper cards.
    6. `src/app/growth/loading.tsx`: Top metric cards and consistency chart bar shimmers.
    7. `src/app/notes/loading.tsx`: Master-detail note list and editor canvas.
    8. `src/app/settings/loading.tsx`: Profile avatar, AI connector keys, and preference rows.
- **Validation**:
  - TypeScript check (`npx tsc --noEmit`) verified with 0 errors.
  - Production build (`npm run build`) passed with 0 errors across all routes.

---

### Step 44: Final Polish & Full Feature Loop Completion
- **User Directive**:
  - Resolve all remaining gaps, incomplete stubs, and missing functionality to achieve 100% completion across the entire system.
- **Architectural Enhancements Implemented**:
  1. **Goal & Milestone Life Roadmap Editing**:
     - `src/lib/actions.ts`: Added `updateGoal` and `updateMilestone` server actions scoped to `userId` with multi-page cache revalidation (`/`, `/milestones`).
     - `src/app/milestones/MilestonesClient.tsx`:
       - Added **Edit Life Goal** button (`Pencil`) on all roadmap cards, opening a dedicated modal allowing in-place edits to Title, Vision Description, Category, and Target Completion Date.
       - Added **Edit Milestone Step** button (`Pencil`) on all milestone cards, opening an editorial modal to update step Title and botanical growth stage (`Seed 🌱`, `Sprout 🌿`, `Milestone 🌳`).
       - Implemented instant optimistic UI state updates (`setGoals`).
  2. **Sanctuary Data Privacy & Account Actions**:
     - `src/lib/actions.ts`:
       - `exportUserData()`: Compiles all user goals, milestones, habits, habit completion logs, tasks, sleep logs, sleep settings, and field notes into a structured JSON payload with timestamp and schema versioning.
       - `clearAllUserData()`: Executes an atomic `prisma.$transaction` deleting all user data across all tables, resetting sleep target to 8.0h, and revalidating all routes.
     - `src/app/settings/SettingsClient.tsx`:
       - **1-Click JSON Data Export**: Added client download mechanism triggering immediate browser download of `rooted-sanctuary-backup-YYYY-MM-DD.json`.
       - **Permanent Sanctuary Reset**: Added high-security confirmation modal with custom input validation requiring the user to type `RESET` before proceeding.
  3. **The Rooted Harmony Formula Modal**:
     - `src/app/settings/SettingsClient.tsx`:
       - Replaced empty stub with an organic editorial modal detailing the balanced equation:
         - **40% Ritual Growth (Habits)**: Adherence across today and the rolling 7-day window.
         - **40% Daily Intentions (Tasks)**: Fulfillment velocity strictly within today's conscious horizon.
         - **20% Rest Sanctuary (Sleep)**: Sleep duration relative to the configured 8.0h baseline target.
         - **Grounded Streaks Multiplier**: Active streaks fortifying overall daily rhythm stability.
  4. **Sanctuary Support & Community Modal**:
     - `src/app/settings/SettingsClient.tsx`: Added supportive modal providing direct contact email with 1-click copy and link to the official GitHub repository.
  5. **Notification Reminder Persistence & Browser Permission**:
     - `src/app/settings/SettingsClient.tsx`: Connected the "Morning Sleep Check-in" and "Daily Task Reminder" switches to `localStorage` and integrated standard `Notification.requestPermission()` prompt when enabled.
  6. **Custom Date Range Analytics**:
     - `src/app/growth/GrowthClient.tsx`:
       - Expanded `PeriodHorizon` to support `"CUSTOM"`.
       - Added an organic date range picker banner allowing users to select arbitrary `From:` and `To:` calendar dates.
       - Dynamically recalculated all Triad Scorecards, Task Velocity breakdown, Anchor Habits vs Friction Points pattern detection, 7-day rhythm distribution, and rest-productivity correlation.
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors across the entire codebase.
  - Production build and dev server running smoothly.

---

### Step 45: First-Time Visitor Root Flash Elimination
- **User Directive**:
  - When opening the deployed application for the first time in the browser, users briefly saw the project dashboard skeleton and sidebar before the landing page appeared.
  - Eliminate this flash so first-time visitors see a seamless, instant landing page experience with zero dashboard or sidebar leakage.
- **Root Cause Analysis**:
  1. `src/app/page.tsx` previously awaited `currentUser()` unconditionally on line 14 before determining if the visitor was authenticated. `currentUser()` executes an external HTTPS API round-trip to Clerk (`api.clerk.com`), causing a 400ms–800ms server delay.
  2. While `page.tsx` was awaiting Clerk's remote profile fetch, Next.js streaming immediately rendered the root fallback skeleton (`src/app/loading.tsx`), which was hardcoded to `DashboardLoading()` (capsule bar, daily intentions card, today's rituals card).
  3. `src/components/layout/AppShell.tsx` had no server-level awareness of authentication state on initial load, causing it to persistently mount the `<Sidebar />` and mobile header on `/` while awaiting client hydration.
  4. `src/components/landing/LandingView.tsx` previously used `fixed inset-0 z-50` to overlay on top of the mounted sidebar after loading.
- **Architectural Solution Implemented**:
  1. **Instant Server Auth Gate (`src/app/page.tsx`)**:
     - Switched to `const { userId } = await auth();`. Because `auth()` inspects the local request cookies rather than making an external API fetch to Clerk, unauthenticated visitors (`!userId`) are routed to `<LandingView user={null} />` in **0ms** on the very first chunk of the HTTP response.
     - `currentUser()` and `getDashboardData()` are only invoked if `userId` is present.
  2. **Server-Hydrated AppShell (`src/app/layout.tsx` & `src/components/layout/AppShell.tsx`)**:
     - `RootLayout` now calls `const { userId } = await auth();` and passes `initialSignedIn={Boolean(userId)}` directly to `<AppShell>`.
     - `AppShell` evaluates `isLandingOnRoot = pathname === "/" && (!initialSignedIn || isLandingPreview)`. For guests on `/`, `AppShell` immediately returns `<div className="min-h-screen w-full">{children}</div>`, preventing the desktop sidebar and mobile header from mounting in the HTML.
  3. **Context-Aware Root Loader (`src/app/loading.tsx`)**:
     - Evaluates `const { userId } = await auth();`. If unauthenticated, it returns a cinematic `#0A1118` dark loader with an emerald spinner and Instrument Serif *Rooted®* wordmark matching the landing page video hero, completely eliminating any exposure to the dashboard skeleton.
  4. **Natural Viewport Layout (`src/components/landing/LandingView.tsx`)**:
     - Replaced `fixed inset-0 z-50` with `relative min-h-screen w-full overflow-x-hidden`, allowing natural viewport scroll mechanics and parallax listeners.
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors.
  - Production build (`npx next build`) passed with exit code 0.

---

### Step 46: Periodic Rhythm Retrospective Loop Resolution
- **User Directive**:
  - The "Periodic Rhythm Retrospective" ("Week in Reflection") modal kept popping up repeatedly even after clicking **"Ground Myself & Continue"** multiple times.
  - Fix the dismissal mechanism permanently so the user is never stuck in a loop.
- **Root Cause Analysis**:
  1. `src/components/dashboard/PeriodicReviewModal.tsx` originally used an `if (mode === "WEEKLY") ... else ...` conditional inside `handleDismissAndSave()`.
  2. In `DashboardMainView.tsx`, the month check `dayOfMonth <= 5 && lastReviewedMonth !== currentMonthKey` triggered opening the modal during the first 5 days of the month.
  3. However, `PeriodicReviewModal` defaulted to `useState("WEEKLY")` on initial mount and did not synchronize when `initialMode` was changed to `"MONTHLY"`.
  4. When the user clicked "Ground Myself & Continue", because `mode` was `"WEEKLY"`, only `rooted_last_reviewed_week` was set in `localStorage`. `rooted_last_reviewed_month` was never recorded!
  5. As a result, the month guard remained satisfied on every render and reload, causing `DashboardMainView` to immediately reopen the modal over and over.
- **Architectural Solution Implemented**:
  1. **Prop Synchronization (`PeriodicReviewModal.tsx`)**: Added `useEffect` to synchronize internal `mode` state with `initialMode` whenever the modal opens.
  2. **Multi-Horizon Simultaneous Persistence (`PeriodicReviewModal.tsx` & `DashboardMainView.tsx`)**:
     - When clicking **"Ground Myself & Continue"**, the modal now simultaneously records:
       - `rooted_last_reviewed_week`: Current week identifier.
       - `rooted_last_reviewed_month`: Current year-month identifier.
       - `rooted_last_reviewed_date`: Server today date string.
       - `rooted_last_reviewed_date_client`: Client-side local ISO date string.
       - `sessionStorage.setItem("rooted_retrospective_dismissed", "true")`: Tab session guard.
  3. **Multi-Layer Auto-Prompt Guards (`DashboardMainView.tsx`)**:
     - Added an in-memory session flag (`let sessionRetrospectiveDismissed = true`).
     - Added `sessionStorage` guard.
     - Added double-date check (`lastReviewedDate === data.today || lastReviewedClientDate === clientToday`).
  4. **Enhanced UX Dismissal (`PeriodicReviewModal.tsx`)**:
     - Added Escape key listener to close cleanly.
     - Added outer backdrop click-to-dismiss handler.
     - Restricted the "Reset Triggers (Dev Only)" button to `process.env.NODE_ENV === "development"`, removing it from production views.
- **Validation**:
  - `npx tsc --noEmit` verified with 0 errors.
  - Production build passing.

---

### [Step 14] - Official Brand Logo Integration (Concept 3: Editorial Botanical Monogram 'R')
- **Design Selection**: Selected Concept 3—an elegant, bespoke editorial serif capital letter "R" intertwined with an organic living botanical leaf vine on a warm linen background (`#FAF7F0`).
- **Asset Placement**:
  - `public/brand/logo.jpg`: High-resolution 1024x1024 master brandmark.
  - `src/app/icon.jpg`: App Router favicon & web app icon.
  - `src/app/apple-icon.jpg`: Apple Touch home screen icon.
- **Component & Metadata Integration**:
  1. **Root Metadata (`src/app/layout.tsx`)**: Configured explicit `icons` (`icon`, `apple`) and `openGraph` card preview with the 1024x1024 brandmark.
  2. **Navigation Sidebar (`src/components/layout/Sidebar.tsx`)**: Upgraded brand header with a 10x10 rounded capsule featuring the emblem adjacent to the editorial title.
  3. **Mobile Header (`src/components/layout/AppShell.tsx`)**: Added the brandmark capsule into the mobile header bar.
  4. **Landing Page (`src/components/landing/LandingView.tsx`)**: Integrated the monogram mark into both the sticky glassmorphic navbar and editorial footer.
- **Verification**:
  - `npx tsc --noEmit` verified 0 errors across all routes.

---

### Step 47: Vector SVG Brand Architecture (Plant Emblem & Typography Wordmark)
- **User Directive**:
  - Replace the raster picture (`logo.jpg`) with vector SVGs created for the logo (`rooted-plant.svg`) and typography wordmark (`rooted-text.svg`).
  - Render the logo and typography in pure crisp white across the dark hero section.
- **Architectural Enhancements Implemented**:
  1. **SVG Assets Added (`public/brand/`)**:
     - `public/brand/rooted-plant.svg`: Botanical plant vector with organic roots, stem, and leaves in brand forest green.
     - `public/brand/rooted-plant-white.svg`: Botanical plant vector in pure white with subtle luminous gradient roots for dark surfaces.
     - `public/brand/rooted-text.svg`: High-precision vector typography wordmark ("ROOTED") in dark forest green.
     - `public/brand/rooted-text-white.svg`: High-precision vector typography wordmark ("ROOTED") in pure white.
  2. **Dedicated Brand Vector Component (`src/components/brand/RootedBrand.tsx`)**:
     - `RootedLogo`: Renders vector plant emblem in `"white"` or `"dark"` variants with custom dimensions.
     - `RootedWordmark`: Renders the vector typography wordmark with exact path mathematics in `"white"` or `"dark"`.
     - `RootedBrand`: Composite component combining emblem and wordmark with responsive scaling.
  3. **Hero Section Navbar & Wordmark (`src/components/landing/LandingView.tsx`)**:
     - Replaced raster image and generic HTML text with `RootedLogo variant="white"` enclosed in a glassmorphic container and `RootedWordmark variant="white"`.
     - Updated giant background parallax wordmark to use the vector `RootedWordmark variant="white"` with subtle opacity.
     - Updated editorial footer to use `RootedLogo variant="dark"` and `RootedWordmark variant="dark"`.
  4. **Sidebar & Mobile Top Bar (`src/components/layout/Sidebar.tsx` & `AppShell.tsx`)**:
     - Replaced raster images with vector `RootedLogo` and `RootedWordmark` for razor-sharp rendering on all display densities.
  5. **Root Metadata & Loading (`src/app/layout.tsx` & `src/app/loading.tsx`)**:
     - Configured SVG favicon and apple-touch-icon links.
     - Updated guest cinematic dark loading screen to render vector white emblem and wordmark.
- **Verification**:
  - TypeScript check (`npx tsc --noEmit`) verified 0 errors.
  - Production build passing.

---

### Step 48: Circular Botanical Favicon Integration (`cropped_circle.png`)
- **User Directive**:
  - Use `cropped_circle.png` as the application favicon.
- **Implementation**:
  1. **Root Cause Analysis for Persistent Vercel Triangle Favicon**:
     - `src/app/favicon.ico` was a remnant from `create-next-app` initialization containing the legacy black-and-white Vercel triangle.
     - Browsers unconditionally request `/favicon.ico` by default and cache it aggressively.
  2. **Multi-Size ICO & PNG Generation (`scripts/generate-favicons.js`)**:
     - Converted `public/brand/cropped_circle.png` using `sharp` into a binary ICO container with 16x16, 32x32, and 48x48 layers.
     - Overwrote `src/app/favicon.ico` with the botanical emblem ICO.
     - Created `public/favicon.ico` as the direct static edge fallback.
     - Created 16x16, 32x32, 180x180, 192x192, and 512x512 PNG assets.
     - Updated `src/app/icon.png` (32x32) and `src/app/apple-icon.png` (180x180).
  3. **Metadata Configuration (`src/app/layout.tsx`)**:
     - Configured `metadata.icons` with `icon`, `shortcut`, and `apple` references.
- **Verification**:
  - TypeScript compilation (`npx tsc --noEmit`) verified with 0 errors.
  - Next.js production build (`npx next build`) passed with exit code 0.

---

### Step 49: Editorial Footer Realignment & Bottom Anchoring
- **User Directive**:
  - Make the landing page footer rest flush at the very bottom of the document instead of floating high up with awkward blank space underneath.
- **Root Cause**:
  - The `<footer>` was previously nested inside `<section id="contact">`, which had an outer `py-20 sm:py-28` (112px bottom padding), and lacked `mt-auto` / document-level anchoring.
  - The top divider border was constrained to `max-w-7xl` rather than spanning the full browser width.
- **Implementation (`src/components/landing/LandingView.tsx`)**:
  1. Converted the root page container to `flex flex-col justify-between`.
  2. Extracted the `<footer>` from the preceding CTA section, making it an independent, full-width element (`w-full bg-[#FAF7F0] border-t border-[#EAE5D8] mt-auto`).
  3. Added responsive padding (`py-8 sm:py-10`) so the footer rests cleanly and flush at the bottom edge of the webpage.
- **Verification**:
  - Visual verification with `browser_subagent` confirmed the footer sits firmly at the bottom with no trailing blank gaps.
  - `npx tsc --noEmit` verified with 0 errors.




