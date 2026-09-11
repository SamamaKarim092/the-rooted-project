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

### 1. Seasons (`/seasons` - Calendar & Monthly Retrospectives)
The **Seasons** view now features two dedicated modes:
- **`Day-by-Day Calendar`**:
  - Month calendar grid with activity dots.
  - Clicking any specific date allows inspecting exact tasks and habits completed vs missed on that day.
- **`Monthly Reflection & Archive`**:
  - When viewing any month (e.g., **August 2026** or **September 2026**), Rooted calculates a complete monthly scoreboard:
    - **Monthly Harmony Rate**: An aggregate consistency score (e.g. `82%` in August, `91%` in September) combining habit consistency (70% weight) and task completion (30% weight).
    - **Tasks Finished**: Total tasks completed vs scheduled for that month (e.g., `8 of 10 tasks completed • 80%`).
    - **Habit Check-Ins**: Total successful habit check-ins recorded in that month (e.g. `148 check-ins`).
    - **Anchor Habit**: The top-performing habit of that month (e.g. Morning Deep Work at `96%`).
    - **Growth Focus**: The habit needing attention (e.g. Movement & Stretching at `68%`).
  - **Full Monthly Tasks Log**:
    - A dedicated scrollable archive of every task due in that month with its status (Completed vs Pending), category pill, and scheduled due date.
  - **Monthly Habit Adherence Ladder**:
    - Progress bars showing exact completion percentages for all 6 habits across that calendar month.

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
