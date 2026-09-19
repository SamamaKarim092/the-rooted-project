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

### 2. Sleep Sanctuary Tab (`DashboardMainView.tsx` & `SleepRhythmOverview.tsx`)
A dedicated **`[Sleep]`** tab on the main dashboard provides a 3-horizon rest cockpit:
* **Today's Rest Card**:
  * Real-time duration ratio, target fulfillment percentage, bedtime, wake time, rest quality pill, and reflection note.
* **Target Sleep Customizer**:
  * Interactive `- 0.5h` and `+ 0.5h` adjustment controls (ranging between 5.0h and 12.0h) that persist atomically to SQLite via `updateSleepTarget`.
* **Weekly 7-Day Rhythm Wave (Monday – Sunday)**:
  * Vertical day bars with a horizontal dashed target guide line at 8h.
  * Color-coded bars: Sage for target reached, Terracotta for sleep debt, Sand for overslept.
  * Weekly velocity score, nightly average, and net sleep balance (+surplus or -debt).
  * Direct clicking on any day bar opens the editor for that specific date.
* **Monthly Horizon & History Archive**:
  * Multi-month selector (September 2026, August 2026).
  * Monthly scoreboard: Average rest per night, Target Adherence %, Total Restorative Hours, and Nights Logged.
  * Complete scrollable log of all nights with one-click pencil edit buttons.
