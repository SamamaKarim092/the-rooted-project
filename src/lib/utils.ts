export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
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
