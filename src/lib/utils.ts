export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export function formatDayName(dateString: string): string {
  const d = new Date(dateString);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[d.getDay()] || "";
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
      heading: "Unscheduled Intentions",
      subheading: "Pending assignment",
      diffDays: 9999,
      formattedDate: "No Date",
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
