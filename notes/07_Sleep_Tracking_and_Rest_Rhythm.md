# 07. Sleep Tracking & Rest Rhythms

Parent: [[00_Index]] | Previous: [[06_Monthly_Tracking_and_Reviews]] | Next: [[05_Implementation_Log]]

---

## 🌙 The Philosophy of Mindful Rest in Rooted

In conventional productivity systems, output is often disconnected from human physiology, creating unsustainable hustle and burnout. **Rooted** treats rest and sleep not as downtime, but as the foundational pillar of conscious energy, cognitive clarity, and emotional equilibrium.

$$\mathbf{Restful\ Sleep} \longrightarrow \mathbf{Mental\ Presence} \longrightarrow \mathbf{Intentional\ Action} \longrightarrow \mathbf{Harmony}$$

When sleep is tracked alongside daily intentions and habit rituals, users uncover direct correlations between how well they rested and their consistency across Craft, Mind, Body, Spirit, Study, and Career.

---

## 🏗️ Architecture & Data Model

### 1. Database Schema (`prisma/schema.prisma`)

```prisma
model SleepLog {
  id              String   @id @default(cuid())
  date            String   // "YYYY-MM-DD" representing morning / wake-up day
  bedtime         String   // e.g. "23:00" or "11:00 PM"
  wakeTime        String   // e.g. "07:30" or "07:30 AM"
  durationMinutes Int      // Total minutes slept (e.g. 510 = 8h 30m)
  quality         String?  // "RESTFUL", "BALANCED", "LIGHT", "RESTLESS"
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([date])
}

model SleepSetting {
  id          String   @id @default("default")
  targetHours Float    @default(8.0) // Target sleep duration in hours (e.g. 8.0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 2. Time Parsing & Overnight Arithmetic (`src/lib/utils.ts`)

Because bedtime typically occurs before midnight (e.g. `23:15` or `11:15 PM`) and wake-up occurs the following morning (e.g. `07:30` or `7:30 AM`), the duration arithmetic intelligently handles the midnight boundary:

```ts
if (wakeMinutes >= bedMinutes) {
  // Same calendar day
  durationMinutes = wakeMinutes - bedMinutes;
} else {
  // Crossing midnight
  durationMinutes = (1440 - bedMinutes) + wakeMinutes;
}
```

### 3. Target Evaluation & Deficit/Surplus Logic

A customizable target (defaulting to **8.0 hours / 480 minutes**) establishes the baseline:
* **Optimal Rest ($\pm 15$ mins)**: e.g. 7h 45m to 8h 15m. Displayed in serene sage green (`Target Met`).
* **Sleep Debt (Deficit $< -15$ mins)**: e.g. 6h 30m is marked as `-1h 30m Deficit` in terracotta warning tokens.
* **Overslept (Surplus $> +15$ mins)**: e.g. 9h 30m is marked as `+1h 30m Overslept` in warm sand/gold tokens.

---

## 🖥️ Screen Workflows & Interactions

### 1. Morning Auto-Popup Check-in Dialog (`MorningSleepDialog.tsx`)
* **Trigger Condition**:
  * Evaluated on session open when loading the Dashboard.
  * If no sleep log exists for today (`!data.sleep.todayLog`) and the user has not dismissed it today (`localStorage.getItem("rooted_sleep_dismissed_date") !== today`), the dialog opens automatically.
* **Interactive Minimal Time Controls**:
  * **Defaulted from Yesterday**: On fresh check-ins, the dialog automatically defaults to yesterday's recorded bedtime and wake time (with a 1-tap "Yesterday: ..." badge to restore if edited).
  * **Clickable In-Place Sleep Target**:
    * No separate section or visual clutter: the target hours label (`Target: 8.0h ✎`) inside the calculation hero card is directly clickable.
    * Clicking toggles an in-place mini stepper (`[−] [8.0]h [+] [✓]`) allowing the user to type or step their target duration right there.
    * Immediately updates calculation bar, target marker line, and percentage in real-time.
    * Persists atomically to `SleepSetting` in Turso/SQLite via `updateSleepTarget` server action, auto-revalidating `/`, `/seasons`, and `/growth`.
  * **Left-Aligned Time & Right-Hand Stepper**:
    * Time value displayed in large editorial serif font (`font-serif text-2xl md:text-3xl font-bold text-[#1A241E]`), **left-aligned** within the input box.
    * **Right-hand side Up (▲) and Down (▼) arrow buttons** cleanly integrated within the container for quick $\pm 15$ minute adjustments.
    * Keyboard **ArrowUp (↑)** and **ArrowDown (↓)** keys (with Shift for 1h jump) supported directly on the input.
  * **No Scrollbar**: Container optimized with hidden scrollbars (`overflow-x-hidden` and `scrollbar-none`) and proportional vertical rhythm, eliminating the horizontal scrollbar above the footer.
  * Real-time live calculation bar with dynamic progress bar and target tick indicator.
  * Rest quality selector: `🌿 Restful & Deep`, `✨ Balanced`, `⚡ Restless`, `😴 Groggy`.
  * Optional reflection note field.
  * Single-tap "Save Rest Record" with optimistic UI updates.
  * "Remind Me Later" dismissal that preserves peaceful focus for the day.

### 2. Dashboard Rest Sanctuary Radial Clock (`SleepClockCard.tsx`)
Positioned on the main dashboard in the bottom-right quadrant of the canonical 2x2 grid:
* **24-Hour Radial SVG Clock Dial**:
  * Visualizes the bedtime-to-wake-time duration as a glowing sweep arc along a 24-hour circular perimeter.
  * Clock center displays duration (`7.8h`) and status ("Logged" or "Preview").
  * Perimeter hour markers: `12a`, `3a`, `6a`, `9a`, `12p`, `3p`, `6p`, `9p`.
  * Distinct endpoint glowing pins for Bedtime (`Moon` / `#D98A6C`) and Wake time (`Sun` / `#7C9A86`).
* **Left-Hand Metrics Panel**:
  * Duration metric in large editorial serif font (`7.8 hrs`).
  * Target comparison chip (`+0.3h surplus` in sage green, or `-0.8h deficit` in terracotta).
  * Rest quality badge (`Restful & Deep`, `Balanced Rest`, `Restless Night`, `Heavy / Groggy`).
  * Bedtime and wake-time capsule chips.
  * Quick "Adjust / Log Rest" button that immediately opens `MorningSleepDialog`.

### 3. Seasons Sleep Sanctuary Lens (`src/app/seasons/SeasonsClient.tsx`)
Accessible via the 3-Way Lens Switcher (`[ Habits ] [ Tasks ] [ Sleep ]`):
* **Monthly Rest Scoreboard**:
  * Average rest per night (`7.6h avg`).
  * Cumulative rhythm balance (+surplus or -debt vs target).
  * Restful nights count (e.g. `18 / 24 logged`).
  * Check-in adherence rate across the calendar month.
* **Monthly Sleep Matrix Calendar**:
  * 7 columns (Monday – Sunday) mapping all dates of the month.
  * Cells display duration, bedtime $\rightarrow$ wake-time arc, and quality badge.
  * Color-coded background based on sleep vs target:
    * Sage green (`bg-[#F4F8F5] border-[#D3E3D7]`): Target met ($\ge$ target - 0.5h).
    * Warm sand (`bg-[#FAF7F0] border-[#D4A373]/40`): Mild deficit (target - 1.5h to target - 0.5h).
    * Soft terracotta (`bg-[#FDF6F3] border-[#F0D5CA]`): Deep deficit (< target - 1.5h).
* **Unified 3-in-1 Daily Inspector**:
  * Clicking any calendar date across the app opens a unified modal inspecting Rest, Habits, and Tasks for that day with one-click toggles and sleep edit triggers.
