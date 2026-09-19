# 06. Monthly Tracking & Retrospective Reviews

Parent: [[00_Index]] | Previous: [[04_Features_and_Workflows]] | Next: [[05_Implementation_Log]]

---

## 📅 Why Monthly Tracking Matters

While daily tracking keeps you focused on today's execution, **monthly tracking provides the perspective needed for true self-improvement**. 

As outlined in the Rooted philosophy:
$$\text{Plan} \longrightarrow \text{Act} \longrightarrow \text{Track} \longrightarrow \mathbf{Review} \longrightarrow \text{Improve}$$

A single missed day is just noise; a whole month reveals **actual habits, consistency rates, and behavioral patterns**.

---

## 🔍 How Monthly Tracking is Implemented in Rooted

Monthly tracking is integrated directly across the app:

### 0. Main Dashboard (`/` - `Task` Tab)
Right from the home screen, users can click the **`Task`** tab to access the **Monthly Horizon**:
- Switchable between active and previous months (e.g. `September 2026`, `August 2026`).
- Real-time monthly achievement progress bar and completion rate.
- Category breakdown pills showing completed count per category (`Mind`, `Body`, `Craft`, `Spirit`, `Study`, `Career`).
- Scrollable list of all tasks scheduled in the selected month.

### 1. Seasons (`/seasons` - Calendar & Panoramic Retrospective Observatory)
The **Seasons** view functions as a **strict read-only retrospective lens** (no creation or deletion) for viewing long-term progress across months and quarters. It provides two specialized lenses:

- **`Habit Consistency Lens` (Habit Row & Tick/Cross Calendar)**:
  - **Habit Constellation Row**: Displays all active habits entered in the system in responsive cards showing their title, category pill, check-in count, and monthly adherence rate.
  - **Click-to-Inspect Drilldown**: Clicking any habit immediately updates the dedicated monthly calendar view for that specific habit.
  - **Tick & Cross Daily Calendar**:
    - **✓ (Tick / Sage Green)**: Days where the habit was successfully completed.
    - **✗ (Cross / Terracotta Clay)**: Past days where the habit was missed or not logged.
    - **Today Indicator**: Golden halo with real-time pending or completed status.
    - **— (Upcoming)**: Neutral indicator for future days without penalty.
  - **Habit Scorecard**: Real-time adherence %, total honored days (✓), and missed days (✗).

- **`Task Execution Lens` (Seasonal Scoreboard & Weekly Accomplishment Log)**:
  - **Monthly Execution Velocity Scoreboard**:
    - Monthly Intentions count.
    - Overall Execution Velocity (% completed).
    - Critical High & Urgent priority execution rate.
    - Carried over / pending count.
  - **Weekly Accomplishment Breakdown**:
    - Tasks grouped by weeks: **Week 1 (Days 1–7)**, **Week 2 (Days 8–14)**, **Week 3 (Days 15–21)**, and **Week 4 & Beyond (Days 22–End)**.
    - Each week card highlights its completion rate (e.g. `86%`) and lists tasks with priority badges, categories, scheduled times, and completed checkmarks vs pending badges.
  - **Search & Filtering**: Search bar, status filters (`All`, `Completed`, `Pending`), and category pills (`Mind`, `Body`, `Craft`, etc.).
  - **Unified Month Navigator**: Previous/next month stepping, quick jump shortcuts (e.g. `August 2026`, `September 2026`, and `Back to Current Month`).

---

### 2. Growth (`/growth` - Analytics & Month-over-Month Trajectory)
The **Growth** view provides a high-level analytical breakdown with quick period selectors:
- **`September 2026 (Current Season)`**: Current month-to-date metrics and sprint consistency.
- **`August 2026 (Previous Month)`**: Full retrospective of the previous month.
- **`Rolling 60 Days`**: Multi-month aggregate view.

#### Month-Over-Month Pattern Insights
Rooted highlights how your habits evolve from one month to the next:
- **Trajectory Shift**: e.g., *"August (82%) → September (91%): An overall rhythm increase of +9% entering September, powered by Morning Deep Work."*
- **Lessons Learned**: e.g., *"In August, Movement was frequently missed on weekends. Moving workouts earlier in the day lifted September completion to 80%."*
- **High-Priority Velocity**: Tracks adherence specifically on Urgent and High-priority daily intentions.

---

## 🗄️ Database & Query Strategy

Tasks and habit logs store standard date strings in `YYYY-MM-DD` format:
- To extract all records for August 2026:
  ```ts
  const augustTasks = tasks.filter((t) => t.dueDate?.startsWith("2026-08"));
  const augustLogs = habit.logs.filter((l) => l.date.startsWith("2026-08"));
  ```
- This guarantees instant, zero-latency monthly aggregation without complex SQL date-truncation logic, preserving SQLite's lightweight speed and portability.
