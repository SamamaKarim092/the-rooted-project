export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export function getYesterdayString(baseDateStr?: string): string {
  const ref = baseDateStr || getTodayString();
  const parts = ref.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }
  const dObj = new Date(ref + "T00:00:00");
  dObj.setDate(dObj.getDate() - 1);
  return dObj.toISOString().split("T")[0];
}

export function formatDayName(dateString: string): string {
  const d = new Date(dateString);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[d.getDay()] || "";
}

export function getWeekRange(dateStr: string): {
  startOfWeek: string;
  endOfWeek: string;
  weekDays: string[];
} {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMon = (day + 6) % 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - distanceToMon);

  const weekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(mon);
    cur.setDate(mon.getDate() + i);
    weekDays.push(cur.toISOString().split("T")[0]);
  }
  return {
    startOfWeek: weekDays[0],
    endOfWeek: weekDays[6],
    weekDays,
  };
}

export function formatMonthName(monthKey: string): string {
  // e.g. "2026-09" -> "September 2026"
  const [year, month] = monthKey.split("-");
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export interface TaskDateGroupMeta {
  heading: string;
  subheading?: string;
  diffDays: number;
  formattedDate: string;
  isToday: boolean;
  isTomorrow: boolean;
  isOverdue: boolean;
}

export function formatTaskDateHeading(
  dateStr: string | null,
  todayStr: string
): TaskDateGroupMeta {
  if (!dateStr) {
    return {
      heading: "Anytime Intentions",
      subheading: "Chores & aspirations with no fixed deadline",
      diffDays: 9999,
      formattedDate: "Anytime",
      isToday: false,
      isTomorrow: false,
      isOverdue: false,
    };
  }

  const target = new Date(dateStr + "T00:00:00");
  const today = new Date(todayStr + "T00:00:00");

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const weekdays = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
  ];

  const day = target.getDate();
  const month = months[target.getMonth()];
  const year2 = String(target.getFullYear()).slice(-2);
  const weekday = weekdays[target.getDay()];

  const shortDate = `${day} ${month} ${year2}`;

  if (diffDays === 0) {
    return {
      heading: `Today, ${shortDate}`,
      subheading: weekday,
      diffDays: 0,
      formattedDate: shortDate,
      isToday: true,
      isTomorrow: false,
      isOverdue: false,
    };
  } else if (diffDays === 1) {
    return {
      heading: `Tomorrow, ${shortDate}`,
      subheading: weekday,
      diffDays: 1,
      formattedDate: shortDate,
      isToday: false,
      isTomorrow: true,
      isOverdue: false,
    };
  } else if (diffDays === -1) {
    return {
      heading: `Yesterday, ${shortDate}`,
      subheading: weekday,
      diffDays: -1,
      formattedDate: shortDate,
      isToday: false,
      isTomorrow: false,
      isOverdue: true,
    };
  } else if (diffDays < -1) {
    return {
      heading: `${shortDate}`,
      subheading: `${Math.abs(diffDays)} days overdue • ${weekday}`,
      diffDays,
      formattedDate: shortDate,
      isToday: false,
      isTomorrow: false,
      isOverdue: true,
    };
  } else {
    return {
      heading: `${weekday}, ${shortDate}`,
      subheading: `In ${diffDays} days`,
      diffDays,
      formattedDate: shortDate,
      isToday: false,
      isTomorrow: false,
      isOverdue: false,
    };
  }
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const distanceToMon = (day + 6) % 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - distanceToMon);
  const y = mon.getFullYear();
  const m = String(mon.getMonth() + 1).padStart(2, "0");
  const dd = String(mon.getDate()).padStart(2, "0");
  return `${y}-W${m}-${dd}`;
}

export function getPreviousWeekRange(dateStr: string): {
  startOfWeek: string;
  endOfWeek: string;
  weekDays: string[];
  weekLabel: string;
} {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const distanceToMon = (day + 6) % 7;
  const thisMon = new Date(d);
  thisMon.setDate(d.getDate() - distanceToMon);

  const prevMon = new Date(thisMon);
  prevMon.setDate(thisMon.getDate() - 7);

  const weekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(prevMon);
    cur.setDate(prevMon.getDate() + i);
    weekDays.push(cur.toISOString().split("T")[0]);
  }

  const startOfWeek = weekDays[0];
  const endOfWeek = weekDays[6];
  const weekLabel = `${formatShortDate(startOfWeek)} – ${formatShortDate(endOfWeek)}`;

  return {
    startOfWeek,
    endOfWeek,
    weekDays,
    weekLabel,
  };
}

export function getPreviousMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split("-");
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10) - 1;
  if (m === 0) {
    m = 12;
    y -= 1;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

// ==========================================
// 🌙 SLEEP & REST RHYTHM UTILITIES
// ==========================================

export interface SleepDurationResult {
  durationMinutes: number;
  formattedHours: string;
  hoursDecimal: number;
  hours: number;
  minutes: number;
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().toUpperCase();

  // Check 12-hour format: e.g. "11:30 PM", "7:00 AM", "11:30PM"
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3];
    if (period === "AM" && h === 12) h = 0;
    if (period === "PM" && h !== 12) h += 12;
    return h * 60 + m;
  }

  // Check 24-hour format: e.g. "23:30", "07:00"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    return h * 60 + m;
  }

  return 0;
}

export function calculateSleepDuration(bedtime: string, wakeTime: string): SleepDurationResult {
  const bedMins = parseTimeToMinutes(bedtime);
  const wakeMins = parseTimeToMinutes(wakeTime);

  let durationMinutes = 0;
  if (wakeMins >= bedMins) {
    // Slept and woke on the same calendar day (e.g. 01:00 to 09:00)
    durationMinutes = wakeMins - bedMins;
  } else {
    // Overnight sleep crossing midnight (e.g. 23:00 to 07:30)
    durationMinutes = (1440 - bedMins) + wakeMins;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const hoursDecimal = Math.round((durationMinutes / 60) * 10) / 10;
  const formattedHours = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h 0m`;

  return {
    durationMinutes,
    formattedHours,
    hoursDecimal,
    hours,
    minutes,
  };
}

export interface SleepTargetEvaluation {
  targetMinutes: number;
  actualMinutes: number;
  differenceMinutes: number;
  status: "OPTIMAL" | "DEFICIT" | "OVERSLEPT";
  statusLabel: string;
  diffLabel: string;
  percentage: number;
}

export function evaluateSleepTarget(
  durationMinutes: number,
  targetHours: number = 8.0
): SleepTargetEvaluation {
  const targetMinutes = Math.round(targetHours * 60);
  const diff = durationMinutes - targetMinutes;
  const absDiff = Math.abs(diff);
  const diffH = Math.floor(absDiff / 60);
  const diffM = absDiff % 60;
  const formattedDiff = diffH > 0 ? `${diffH}h ${diffM}m` : `${diffM}m`;

  const percentage = targetMinutes > 0 ? Math.round((durationMinutes / targetMinutes) * 100) : 100;

  if (absDiff <= 15) {
    return {
      targetMinutes,
      actualMinutes: durationMinutes,
      differenceMinutes: diff,
      status: "OPTIMAL",
      statusLabel: "Optimal Rest",
      diffLabel: "Target Met",
      percentage,
    };
  } else if (diff > 15) {
    return {
      targetMinutes,
      actualMinutes: durationMinutes,
      differenceMinutes: diff,
      status: "OVERSLEPT",
      statusLabel: "Overslept",
      diffLabel: `+${formattedDiff} Overslept`,
      percentage,
    };
  } else {
    return {
      targetMinutes,
      actualMinutes: durationMinutes,
      differenceMinutes: diff,
      status: "DEFICIT",
      statusLabel: "Sleep Debt",
      diffLabel: `-${formattedDiff} Deficit`,
      percentage,
    };
  }
}

export function formatMinutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h 0m`;
}

export function formatMinutesTo12Hour(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  let h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  const formattedMinutes = String(m).padStart(2, "0");
  return `${h}:${formattedMinutes} ${period}`;
}

export function stepTimeString(currentTime: string, deltaMinutes: number): string {
  let mins = parseTimeToMinutes(currentTime);
  if (isNaN(mins)) mins = 0;
  return formatMinutesTo12Hour(mins + deltaMinutes);
}

/**
 * Calculates current consecutive streak up to 60 days back.
 * If today is not yet checked off, checks from yesterday backwards without breaking.
 */
export function calculateStreak(logs: { date: string; completed?: boolean }[]): number {
  let currentStreak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const log = logs.find((l) => l.date === dateStr);
    if (log?.completed) {
      currentStreak++;
    } else {
      if (i === 0) continue; // Today not checked off yet, check yesterday
      break;
    }
  }
  return currentStreak;
}


