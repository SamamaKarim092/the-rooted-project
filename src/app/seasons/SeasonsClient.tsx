"use client";

import { useState, useMemo, useTransition } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Sparkles, 
  Clock, 
  Compass, 
  BarChart3, 
  Flame, 
  Trophy, 
  TrendingUp, 
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ListFilter,
  Search,
  CheckSquare,
  Tag,
  CircleDot,
  RotateCcw,
  Moon,
  Sun,
  BedDouble,
  Edit3,
  Plus
} from "lucide-react";
import { toggleHabitLog, toggleTaskStatus } from "@/lib/actions";
import { MorningSleepDialog } from "@/components/sleep/MorningSleepDialog";

interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  targetDaysPerWeek?: number;
  logs: HabitLog[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  dueDate: string | null;
  dueTime: string | null;
}

interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes?: number;
  durationHours?: number;
  quality: string | null;
  notes?: string | null;
}

function getSleepDuration(log?: SleepLog | null): number {
  if (!log) return 0;
  if (log.durationMinutes !== undefined && log.durationMinutes !== null) {
    return Number((log.durationMinutes / 60).toFixed(1));
  }
  return log.durationHours ?? 0;
}

interface SleepSetting {
  id?: string;
  targetHours: number;
  bedtimeTarget?: string;
  wakeTimeTarget?: string;
}

interface SeasonsClientProps {
  tasks: Task[];
  habits: Habit[];
  sleepLogs?: SleepLog[];
  sleepSetting?: SleepSetting | null;
  today: string;
}

export function SeasonsClient({ 
  tasks, 
  habits, 
  sleepLogs = [], 
  sleepSetting, 
  today 
}: SeasonsClientProps) {
  const [isPending, startTransition] = useTransition();

  // 3-Way Lens Switcher: "HABITS" | "TASKS" | "SLEEP"
  const [activeLens, setActiveLens] = useState<"HABITS" | "TASKS" | "SLEEP">("HABITS");

  // Selected Habit for the calendar view (defaults to first habit)
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    habits.length > 0 ? habits[0].id : ""
  );

  // Daily Inspector state (clicked calendar date)
  const [inspectedDate, setInspectedDate] = useState<string | null>(null);

  // Sleep Dialog state for logging/adjusting rest from Seasons
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepModalDate, setSleepModalDate] = useState<string | undefined>(undefined);

  // Month navigation
  const [todayYear, todayMonth] = useMemo(() => {
    const parts = today.split("-");
    if (parts.length >= 2) {
      return [parseInt(parts[0], 10), parseInt(parts[1], 10) - 1];
    }
    const d = new Date();
    return [d.getFullYear(), d.getMonth()];
  }, [today]);

  const [currentMonth, setCurrentMonth] = useState<number>(todayMonth);
  const [currentYear, setCurrentYear] = useState<number>(todayYear);

  // Task Lens filters
  const [taskStatusFilter, setTaskStatusFilter] = useState<"ALL" | "COMPLETED" | "PENDING">("ALL");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>("ALL");
  const [taskSearchQuery, setTaskSearchQuery] = useState<string>("");
  const [selectedDateForTasks, setSelectedDateForTasks] = useState<string | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDateForTasks(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDateForTasks(null);
  };

  const handleJumpToTodayMonth = () => {
    setCurrentMonth(todayMonth);
    setCurrentYear(todayYear);
    setSelectedDateForTasks(null);
  };

  // Calendar Geometry for Current Month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const offset = (firstDayOfMonth + 6) % 7; // Monday = 0

  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < offset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push(formatted);
  }

  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const currentMonthName = monthNames[currentMonth];

  // Currently Selected Habit
  const selectedHabit = useMemo(() => {
    return habits.find((h) => h.id === selectedHabitId) || habits[0] || null;
  }, [habits, selectedHabitId]);

  // Habit metrics calculation for the chosen habit in this month
  const selectedHabitStats = useMemo(() => {
    if (!selectedHabit) {
      return {
        completedDays: 0,
        missedDays: 0,
        upcomingDays: 0,
        eligibleDays: 0,
        consistencyRate: 0,
      };
    }

    let completed = 0;
    let missed = 0;
    let upcoming = 0;
    let eligible = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const log = selectedHabit.logs.find((l) => l.date === dateStr);
      const isCompleted = log?.completed === true;

      if (isCompleted) {
        completed++;
        if (dateStr <= today) eligible++;
      } else if (dateStr < today) {
        missed++;
        eligible++;
      } else if (dateStr === today) {
        missed++;
        eligible++;
      } else {
        upcoming++;
      }
    }

    const consistencyRate = eligible > 0 ? Math.round((completed / eligible) * 100) : 0;

    return {
      completedDays: completed,
      missedDays: missed,
      upcomingDays: upcoming,
      eligibleDays: eligible,
      consistencyRate,
    };
  }, [selectedHabit, currentYear, currentMonth, daysInMonth, today]);

  // Overall Month Stats (All habits + tasks)
  const monthAllHabitsStats = useMemo(() => {
    return habits.map((h) => {
      const monthLogs = h.logs.filter((l) => l.date.startsWith(monthPrefix));
      const completed = monthLogs.filter((l) => l.completed).length;
      
      const isCurrentMonthView = currentYear === todayYear && currentMonth === todayMonth;
      const todayDateNum = parseInt(today.split("-")[2] || "1", 10);
      const possibleDays = isCurrentMonthView 
        ? Math.min(todayDateNum, daysInMonth)
        : (currentYear < todayYear || (currentYear === todayYear && currentMonth < todayMonth) ? daysInMonth : 0);

      const rate = possibleDays > 0 ? Math.min(Math.round((completed / possibleDays) * 100), 100) : (completed > 0 ? 100 : 0);

      return {
        id: h.id,
        title: h.title,
        category: h.category,
        completedCount: completed,
        rate,
      };
    });
  }, [habits, monthPrefix, currentYear, currentMonth, todayYear, todayMonth, today, daysInMonth]);

  const totalMonthlyHabitLogs = monthAllHabitsStats.reduce((acc, h) => acc + h.completedCount, 0);

  // Month Tasks
  const monthTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate && t.dueDate.startsWith(monthPrefix));
  }, [tasks, monthPrefix]);

  const monthCompletedTasks = useMemo(() => {
    return monthTasks.filter((t) => t.status === "COMPLETED");
  }, [monthTasks]);

  const monthTaskRate = monthTasks.length > 0 
    ? Math.round((monthCompletedTasks.length / monthTasks.length) * 100) 
    : 100;

  // Month Sleep Metrics
  const targetSleepHours = sleepSetting?.targetHours ?? 8.0;

  const monthSleepLogs = useMemo(() => {
    return (sleepLogs || []).filter((l) => l.date.startsWith(monthPrefix));
  }, [sleepLogs, monthPrefix]);

  const sleepStats = useMemo(() => {
    if (monthSleepLogs.length === 0) {
      return {
        avgDuration: 0,
        totalDuration: 0,
        loggedDaysCount: 0,
        surplusDeficit: 0,
        restfulCount: 0,
      };
    }
    const totalDuration = monthSleepLogs.reduce((acc, l) => acc + getSleepDuration(l), 0);
    const avgDuration = Number((totalDuration / monthSleepLogs.length).toFixed(1));
    const expectedTotal = monthSleepLogs.length * targetSleepHours;
    const surplusDeficit = Number((totalDuration - expectedTotal).toFixed(1));
    const restfulCount = monthSleepLogs.filter((l) => l.quality === "RESTFUL" || l.quality === "BALANCED").length;

    return {
      avgDuration,
      totalDuration,
      loggedDaysCount: monthSleepLogs.length,
      surplusDeficit,
      restfulCount,
    };
  }, [monthSleepLogs, targetSleepHours]);

  // Filtered Tasks for the Tasks Lens
  const filteredTasks = useMemo(() => {
    return monthTasks.filter((t) => {
      if (taskStatusFilter === "COMPLETED" && t.status !== "COMPLETED") return false;
      if (taskStatusFilter === "PENDING" && t.status === "COMPLETED") return false;

      if (taskCategoryFilter !== "ALL" && t.category.toLowerCase() !== taskCategoryFilter.toLowerCase()) {
        return false;
      }

      if (selectedDateForTasks && t.dueDate !== selectedDateForTasks) return false;

      if (taskSearchQuery.trim()) {
        const query = taskSearchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [monthTasks, taskStatusFilter, taskCategoryFilter, selectedDateForTasks, taskSearchQuery]);

  // Group filtered tasks into weekly intervals
  const weeklyTaskGroups = useMemo(() => {
    const groups: {
      weekKey: string;
      title: string;
      dateRange: string;
      tasks: Task[];
      completedCount: number;
    }[] = [
      {
        weekKey: "w1",
        title: "Week 1",
        dateRange: `${currentMonthName} 01 – 07`,
        tasks: [],
        completedCount: 0,
      },
      {
        weekKey: "w2",
        title: "Week 2",
        dateRange: `${currentMonthName} 08 – 14`,
        tasks: [],
        completedCount: 0,
      },
      {
        weekKey: "w3",
        title: "Week 3",
        dateRange: `${currentMonthName} 15 – 21`,
        tasks: [],
        completedCount: 0,
      },
      {
        weekKey: "w4",
        title: "Week 4 & Beyond",
        dateRange: `${currentMonthName} 22 – ${daysInMonth}`,
        tasks: [],
        completedCount: 0,
      },
    ];

    filteredTasks.forEach((t) => {
      if (!t.dueDate) return;
      const dayNum = parseInt(t.dueDate.split("-")[2], 10);
      let targetGroupIdx = 3;
      if (dayNum <= 7) targetGroupIdx = 0;
      else if (dayNum <= 14) targetGroupIdx = 1;
      else if (dayNum <= 21) targetGroupIdx = 2;

      groups[targetGroupIdx].tasks.push(t);
      if (t.status === "COMPLETED") {
        groups[targetGroupIdx].completedCount++;
      }
    });

    return groups;
  }, [filteredTasks, currentMonthName, daysInMonth]);

  // Category Badge Helper
  const getCategoryBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "mind":
        return "bg-[#EAF0EC] text-[#5F7E6A] border border-[#7C9A86]/30";
      case "body":
        return "bg-[#F9ECE6] text-[#C87452] border border-[#D98A6C]/30";
      case "spirit":
        return "bg-[#F0EDF5] text-[#6E6482] border border-[#968AA8]/30";
      case "study":
        return "bg-[#EBF1F5] text-[#3D637E] border border-[#6B90AB]/30";
      case "career":
        return "bg-[#F4F5EB] text-[#636E39] border border-[#8F9C59]/30";
      case "craft":
      default:
        return "bg-[#F5E8DC] text-[#93593B] border border-[#D4A373]/30";
    }
  };

  // Priority Badge Helper
  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "URGENT":
        return "bg-[#FBE8E8] text-[#B83A3A] border border-[#E89E9E]";
      case "HIGH":
        return "bg-[#FDF0E7] text-[#C87452] border border-[#E9BBA6]";
      case "MEDIUM":
        return "bg-[#FAF8F2] text-[#8C7A5E] border border-[#DED7C8]";
      case "LOW":
      default:
        return "bg-[#F2F4F2] text-[#6D7D72] border border-[#D1D9D3]";
    }
  };

  // Helper for toggling habit from 3-in-1 Daily Inspector
  const handleInspectorHabitToggle = (habitId: string) => {
    if (!inspectedDate) return;
    startTransition(async () => {
      await toggleHabitLog(habitId, inspectedDate);
    });
  };

  // Helper for toggling task from 3-in-1 Daily Inspector
  const handleInspectorTaskToggle = (taskId: string) => {
    startTransition(async () => {
      await toggleTaskStatus(taskId);
    });
  };

  // Data for currently inspected date
  const inspectedData = useMemo(() => {
    if (!inspectedDate) return null;
    const sleep = (sleepLogs || []).find((l) => l.date === inspectedDate) || null;
    const dayTasks = tasks.filter((t) => t.dueDate === inspectedDate);
    const dayHabitsStatus = habits.map((h) => {
      const log = h.logs.find((l) => l.date === inspectedDate);
      return {
        ...h,
        isCompleted: log?.completed === true,
      };
    });

    const dObj = new Date(inspectedDate + "T00:00:00");
    const formattedTitle = dObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return {
      date: inspectedDate,
      formattedTitle,
      sleep,
      dayTasks,
      dayHabitsStatus,
    };
  }, [inspectedDate, sleepLogs, tasks, habits]);

  const isCurrentViewingMonth = currentYear === todayYear && currentMonth === todayMonth;

  return (
    <div className="space-y-7 pb-12 w-full">
      {/* 1. Page Header & 3-Way Lens Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#7C9A86]">
              Seasonal Observatory
            </span>
            <span className="text-[#8E9E94]">•</span>
            <span className="text-xs text-[#586B60]">
              Retrospective & Progress Lens
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
            Seasons & Progress View
          </h2>
          <p className="text-xs md:text-sm text-[#586B60] mt-1 font-sans max-w-2xl">
            A panoramic calendar observatory. Inspect habits consistency, seasonal task accomplishments, and sleep recovery rhythms across time.
          </p>
        </div>

        {/* 3-Way Lens Switcher (Habits vs Tasks vs Sleep) */}
        <div className="flex items-center gap-1.5 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#EAE5D8] shadow-2xs self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setActiveLens("HABITS")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeLens === "HABITS"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                : "text-[#586B60] hover:text-[#1A241E] hover:bg-[#FAF8F2]"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${activeLens === "HABITS" ? "text-[#D4A373]" : "text-[#7C9A86]"}`} />
            <span>Habits</span>
          </button>
          <button
            onClick={() => setActiveLens("TASKS")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeLens === "TASKS"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                : "text-[#586B60] hover:text-[#1A241E] hover:bg-[#FAF8F2]"
            }`}
          >
            <CheckSquare className={`w-3.5 h-3.5 ${activeLens === "TASKS" ? "text-[#D4A373]" : "text-[#7C9A86]"}`} />
            <span>Tasks</span>
          </button>
          <button
            onClick={() => setActiveLens("SLEEP")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeLens === "SLEEP"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                : "text-[#586B60] hover:text-[#1A241E] hover:bg-[#FAF8F2]"
            }`}
          >
            <Moon className={`w-3.5 h-3.5 ${activeLens === "SLEEP" ? "text-[#D4A373]" : "text-[#7C9A86]"}`} />
            <span>Sleep</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Month Navigator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-full bg-[#FAF8F2] hover:bg-[#EAE5D8] flex items-center justify-center transition-colors text-[#1A241E] border border-[#EAE5D8] cursor-pointer"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1A241E] leading-tight">
                {currentMonthName} {currentYear}
              </h3>
              {isCurrentViewingMonth && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF0EC] text-[#5F7E6A] border border-[#7C9A86]/40">
                  Current Season
                </span>
              )}
            </div>
            <p className="text-xs text-[#586B60] mt-0.5">
              {totalMonthlyHabitLogs} habit check-ins • {monthCompletedTasks.length} of {monthTasks.length} intentions achieved ({monthTaskRate}%) • {sleepStats.loggedDaysCount} sleep logs ({sleepStats.avgDuration}h avg)
            </p>
          </div>

          <button
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-full bg-[#FAF8F2] hover:bg-[#EAE5D8] flex items-center justify-center transition-colors text-[#1A241E] border border-[#EAE5D8] cursor-pointer"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Month Shortcuts */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {!isCurrentViewingMonth && (
            <button
              onClick={handleJumpToTodayMonth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F0] hover:bg-[#EAE5D8] text-[#1E3127] border border-[#D4A373]/50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Back to Current Month</span>
            </button>
          )}

          <button
            onClick={() => {
              setCurrentMonth(7); // August
              setCurrentYear(2026);
              setSelectedDateForTasks(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              currentMonth === 7 && currentYear === 2026
                ? "bg-[#1E3127] text-[#FAF7F0]"
                : "bg-[#FAF8F2] text-[#586B60] hover:text-[#1A241E] border border-[#EAE5D8]"
            }`}
          >
            August 2026
          </button>

          <button
            onClick={() => {
              setCurrentMonth(8); // September
              setCurrentYear(2026);
              setSelectedDateForTasks(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              currentMonth === 8 && currentYear === 2026
                ? "bg-[#1E3127] text-[#FAF7F0]"
                : "bg-[#FAF8F2] text-[#586B60] hover:text-[#1A241E] border border-[#EAE5D8]"
            }`}
          >
            September 2026
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LENS 1: HABIT CONSISTENCY LENS                                            */}
      {/* ========================================================================= */}
      {activeLens === "HABITS" && (
        <div className="space-y-6">
          {/* Habits Row / Selector */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#586B60]">
                  Your Habit Constellation
                </span>
                <span className="text-[11px] text-[#8E9E94]">
                  (Click any habit to inspect its monthly calendar, or click dates to inspect all 3 pillars)
                </span>
              </div>
              <span className="text-xs font-medium text-[#7C9A86]">
                {habits.length} Active Habits
              </span>
            </div>

            {habits.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] text-center">
                <Flame className="w-8 h-8 text-[#D98A6C] mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-[#1A241E]">No habits found</p>
                <p className="text-xs text-[#8E9E94] mt-1">
                  Create habits in the Habits page to review their seasonal calendar trajectory here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {habits.map((habit) => {
                  const isSelected = habit.id === (selectedHabit?.id || "");
                  const stat = monthAllHabitsStats.find((s) => s.id === habit.id);

                  return (
                    <button
                      key={habit.id}
                      onClick={() => setSelectedHabitId(habit.id)}
                      className={`text-left p-4 rounded-2xl transition-all duration-200 relative border flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#1E3127] text-[#FAF7F0] border-[#1E3127] shadow-md ring-2 ring-[#D4A373]/60 scale-[1.01]"
                          : "bg-[#FFFFFF] hover:bg-[#FAF8F2] text-[#1A241E] border-[#EAE5D8] shadow-2xs hover:border-[#D4A373]/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isSelected
                              ? "bg-[#2D4336] text-[#FAF7F0] border border-[#3E5C4B]"
                              : getCategoryBadge(habit.category)
                          }`}
                        >
                          {habit.category}
                        </span>

                        {isSelected && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#D4A373] bg-[#2D4336] px-2 py-0.5 rounded-full">
                            <CircleDot className="w-3 h-3 text-[#D4A373] fill-[#D4A373]" />
                            <span>Viewing</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h4
                          className={`font-serif text-base font-semibold leading-tight line-clamp-1 ${
                            isSelected ? "text-[#FAF7F0]" : "text-[#1A241E]"
                          }`}
                        >
                          {habit.title}
                        </h4>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-[#EAE5D8]/40">
                          <span
                            className={`text-xs ${
                              isSelected ? "text-[#C1D1C7]" : "text-[#586B60]"
                            }`}
                          >
                            {stat?.completedCount || 0} Check-ins
                          </span>
                          <span
                            className={`font-serif text-sm font-bold ${
                              isSelected ? "text-[#D4A373]" : "text-[#7C9A86]"
                            }`}
                          >
                            {stat?.rate || 0}%
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dedicated Calendar View for Selected Habit */}
          {selectedHabit && (
            <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border border-[#EAE5D8] shadow-xs space-y-6">
              {/* Calendar Title & Adherence Metrics */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EAE5D8]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7C9A86]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#586B60]">
                      Monthly Ritual Calendar
                    </span>
                    <span className="text-[#8E9E94]">•</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getCategoryBadge(selectedHabit.category)}`}>
                      {selectedHabit.category}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1A241E]">
                    {selectedHabit.title}
                  </h3>

                  {selectedHabit.description && (
                    <p className="text-xs text-[#586B60] italic">
                      &ldquo;{selectedHabit.description}&rdquo;
                    </p>
                  )}
                </div>

                {/* Stat Badges for this Habit */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Consistency Capsule */}
                  <div className="px-4 py-2 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8] text-center">
                    <span className="block font-serif text-xl font-bold text-[#1A241E]">
                      {selectedHabitStats.consistencyRate}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#586B60]">
                      Adherence
                    </span>
                  </div>

                  {/* Completed Days Capsule */}
                  <div className="px-4 py-2 rounded-2xl bg-[#EAF0EC] border border-[#7C9A86]/30 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Check className="w-4 h-4 text-[#2E604A] stroke-[3]" />
                      <span className="font-serif text-xl font-bold text-[#2E604A]">
                        {selectedHabitStats.completedDays}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#2E604A]">
                      Honored (✓)
                    </span>
                  </div>

                  {/* Missed Days Capsule */}
                  <div className="px-4 py-2 rounded-2xl bg-[#F9ECE6] border border-[#D98A6C]/30 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <X className="w-4 h-4 text-[#C87452] stroke-[3]" />
                      <span className="font-serif text-xl font-bold text-[#C87452]">
                        {selectedHabitStats.missedDays}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#C87452]">
                      Missed (✗)
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekday Names Header */}
              <div className="grid grid-cols-7 text-center text-xs font-bold uppercase tracking-wider text-[#8E9E94]">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* The Calendar Matrix */}
              <div className="grid grid-cols-7 gap-2 md:gap-3">
                {calendarDays.map((dateStr, idx) => {
                  if (!dateStr) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="h-20 md:h-24 rounded-2xl bg-[#FAF8F2]/30 border border-transparent"
                      />
                    );
                  }

                  const dayNum = parseInt(dateStr.split("-")[2], 10);
                  const isTodayDate = dateStr === today;
                  const isPastDate = dateStr < today;
                  const isFutureDate = dateStr > today;

                  const log = selectedHabit.logs.find((l) => l.date === dateStr);
                  const isCompleted = log?.completed === true;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setInspectedDate(dateStr)}
                      className={`h-20 md:h-24 rounded-2xl p-2 md:p-2.5 flex flex-col justify-between transition-all relative border cursor-pointer hover:scale-[1.02] hover:shadow-xs ${
                        isTodayDate
                          ? "ring-2 ring-[#D4A373] bg-[#FAF7F0] border-[#D4A373]/50 shadow-xs"
                          : isCompleted
                          ? "bg-[#F4F8F5] border-[#D3E3D7]"
                          : isPastDate
                          ? "bg-[#FDF6F3] border-[#F0D5CA]"
                          : "bg-[#FAF8F2]/60 border-[#EAE5D8]"
                      }`}
                      title={`Click to inspect details for ${dateStr}`}
                    >
                      {/* Day Number and Today Badge */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs md:text-sm font-semibold ${
                            isTodayDate
                              ? "text-[#1E3127] font-bold"
                              : isPastDate || isCompleted
                              ? "text-[#1A241E]"
                              : "text-[#8E9E94]"
                          }`}
                        >
                          {dayNum}
                        </span>

                        {isTodayDate && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wide bg-[#D4A373] text-white px-1.5 py-0.2 rounded-md">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Status Icon */}
                      <div className="flex flex-col items-center justify-center my-auto">
                        {isCompleted ? (
                          <div
                            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#EAF0EC] border border-[#7C9A86]/50 text-[#2E604A] flex items-center justify-center shadow-2xs"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : isPastDate ? (
                          <div
                            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#F9ECE6] border border-[#D98A6C]/50 text-[#C87452] flex items-center justify-center shadow-2xs"
                          >
                            <X className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : isTodayDate ? (
                          <div
                            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#FAF7F0] border-2 border-dashed border-[#D4A373] text-[#C87452] flex items-center justify-center"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[#B0BDB5]">
                            <span className="text-xs font-bold text-[#8E9E94]">—</span>
                          </div>
                        )}

                        <span
                          className={`text-[9px] font-semibold mt-1 hidden md:block ${
                            isCompleted
                              ? "text-[#2E604A]"
                              : isPastDate
                              ? "text-[#C87452]"
                              : isTodayDate
                              ? "text-[#8C7A5E]"
                              : "text-[#8E9E94]"
                          }`}
                        >
                          {isCompleted
                            ? "Done"
                            : isPastDate
                            ? "Missed"
                            : isTodayDate
                            ? "Pending"
                            : "Upcoming"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calendar Legend & Wisdom */}
              <div className="pt-5 border-t border-[#EAE5D8] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-5 text-xs text-[#586B60] flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#EAF0EC] border border-[#7C9A86]/50 text-[#2E604A] flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>
                      <strong className="text-[#1A241E]">✓ Completed</strong> ({selectedHabitStats.completedDays} days)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#F9ECE6] border border-[#D98A6C]/50 text-[#C87452] flex items-center justify-center">
                      <X className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>
                      <strong className="text-[#1A241E]">✗ Missed</strong> ({selectedHabitStats.missedDays} days)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#FAF8F2] border border-[#EAE5D8] text-[#8E9E94] flex items-center justify-center text-[10px] font-bold">
                      —
                    </div>
                    <span>
                      <strong className="text-[#1A241E]">Upcoming</strong> ({selectedHabitStats.upcomingDays} days)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#586B60] italic">
                  <Compass className="w-4 h-4 text-[#D98A6C] shrink-0" />
                  <span>&ldquo;Consistency is not perfection; it is returning to the root.&rdquo;</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LENS 2: TASK EXECUTION LENS                                               */}
      {/* ========================================================================= */}
      {activeLens === "TASKS" && (
        <div className="space-y-6">
          {/* Monthly Task Metric Scoreboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs">
              <div className="flex items-center justify-between text-[#7C9A86] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Monthly Intentions
                </span>
                <CalendarDays className="w-4 h-4 text-[#7C9A86]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {monthTasks.length}
              </div>
              <p className="text-xs text-[#586B60] mt-1">
                Tasks scheduled in {currentMonthName} {currentYear}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs">
              <div className="flex items-center justify-between text-[#2E604A] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Execution Velocity
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#2E604A]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {monthTaskRate}%
              </div>
              <p className="text-xs text-[#586B60] mt-1">
                {monthCompletedTasks.length} of {monthTasks.length} intentions honored
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs">
              <div className="flex items-center justify-between text-[#C87452] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  High Priority Achieved
                </span>
                <Trophy className="w-4 h-4 text-[#D98A6C]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {monthTasks.filter((t) => (t.priority === "HIGH" || t.priority === "URGENT") && t.status === "COMPLETED").length}
                <span className="text-sm font-sans font-normal text-[#8E9E94] ml-1.5">
                  / {monthTasks.filter((t) => t.priority === "HIGH" || t.priority === "URGENT").length || 0}
                </span>
              </div>
              <p className="text-xs text-[#586B60] mt-1">
                Critical priority focus completion
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs">
              <div className="flex items-center justify-between text-[#8C7A5E] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Carried Over / Pending
                </span>
                <Clock className="w-4 h-4 text-[#D4A373]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {monthTasks.filter((t) => t.status !== "COMPLETED").length}
              </div>
              <p className="text-xs text-[#586B60] mt-1">
                Intentions awaiting completion
              </p>
            </div>
          </div>

          {/* Search, Filter & Date Selector Bar */}
          <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#8E9E94] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search accomplishments..."
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#FAF8F2] border border-[#EAE5D8] text-[#1A241E] focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]/40 transition-all placeholder:text-[#8E9E94]"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAF8F2] p-1 rounded-xl border border-[#EAE5D8]">
                <button
                  onClick={() => setTaskStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    taskStatusFilter === "ALL"
                      ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                      : "text-[#586B60] hover:text-[#1A241E]"
                  }`}
                >
                  All ({monthTasks.length})
                </button>
                <button
                  onClick={() => setTaskStatusFilter("COMPLETED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    taskStatusFilter === "COMPLETED"
                      ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                      : "text-[#586B60] hover:text-[#1A241E]"
                  }`}
                >
                  Completed ({monthCompletedTasks.length})
                </button>
                <button
                  onClick={() => setTaskStatusFilter("PENDING")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    taskStatusFilter === "PENDING"
                      ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                      : "text-[#586B60] hover:text-[#1A241E]"
                  }`}
                >
                  Pending ({monthTasks.length - monthCompletedTasks.length})
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-[#EAE5D8]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-[#586B60] mr-1">Category:</span>
                {["ALL", "Mind", "Body", "Craft", "Spirit", "Study", "Career"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTaskCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      taskCategoryFilter.toLowerCase() === cat.toLowerCase()
                        ? "bg-[#7C9A86] text-white"
                        : "bg-[#FAF8F2] text-[#586B60] hover:bg-[#EAE5D8] border border-[#EAE5D8]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {selectedDateForTasks && (
                <div className="flex items-center gap-2 text-xs text-[#586B60]">
                  <span>Filtering by date: <strong className="text-[#1A241E]">{selectedDateForTasks}</strong></span>
                  <button
                    onClick={() => setSelectedDateForTasks(null)}
                    className="text-[#C87452] underline font-semibold hover:text-[#1E3127] cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Seasonal Accomplishment Log Grouped by Weeks */}
          <div className="space-y-6">
            {filteredTasks.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] text-center">
                <Clock className="w-8 h-8 text-[#8E9E94] mx-auto mb-2 opacity-50" />
                <h4 className="font-serif text-lg font-semibold text-[#1A241E]">
                  No intentions matching this filter
                </h4>
                <p className="text-xs text-[#8E9E94] mt-1">
                  Try adjusting your search query, status, or category filters.
                </p>
              </div>
            ) : (
              weeklyTaskGroups
                .filter((grp) => grp.tasks.length > 0)
                .map((grp) => {
                  const completionRate = grp.tasks.length > 0
                    ? Math.round((grp.completedCount / grp.tasks.length) * 100)
                    : 100;

                  return (
                    <div
                      key={grp.weekKey}
                      className="bg-[#FFFFFF] rounded-3xl p-6 md:p-7 border border-[#EAE5D8] shadow-xs space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D8]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1E3127] text-[#FAF7F0] flex items-center justify-center font-serif font-bold text-xs">
                            {grp.title.replace("Week ", "W")}
                          </div>
                          <div>
                            <h4 className="font-serif text-xl font-bold text-[#1A241E]">
                              {grp.title}
                            </h4>
                            <span className="text-xs text-[#586B60]">
                              {grp.dateRange}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#586B60]">
                            {grp.completedCount} of {grp.tasks.length} Completed
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              completionRate >= 80
                                ? "bg-[#EAF0EC] text-[#2E604A] border border-[#7C9A86]/40"
                                : "bg-[#FAF7F0] text-[#8C7A5E] border border-[#D4A373]/40"
                            }`}
                          >
                            {completionRate}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {grp.tasks.map((task) => {
                          const isDone = task.status === "COMPLETED";

                          return (
                            <div
                              key={task.id}
                              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                                isDone
                                  ? "bg-[#FAF8F2] border-[#EAE5D8]"
                                  : "bg-[#FFFFFF] border-[#D98A6C]/40 shadow-2xs"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                      isDone
                                        ? "bg-[#EAF0EC] border border-[#7C9A86]/50 text-[#2E604A]"
                                        : "bg-[#F9ECE6] border border-[#D98A6C]/50 text-[#C87452]"
                                    }`}
                                  >
                                    {isDone ? (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    ) : (
                                      <Clock className="w-3.5 h-3.5" />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <h5
                                      className={`text-sm font-semibold leading-tight ${
                                        isDone
                                          ? "text-[#586B60] line-through decoration-[#8E9E94]/60"
                                          : "text-[#1A241E]"
                                      }`}
                                    >
                                      {task.title}
                                    </h5>

                                    {task.description && (
                                      <p className="text-xs text-[#8E9E94] mt-1 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${getCategoryBadge(
                                    task.category
                                  )}`}
                                >
                                  {task.category}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-[#EAE5D8] text-[11px] text-[#8E9E94]">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.2 rounded-md font-semibold text-[9px] ${getPriorityBadge(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  {task.dueTime && (
                                    <span className="text-[#586B60] font-medium">
                                      {task.dueTime}
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() => {
                                    if (task.dueDate) setInspectedDate(task.dueDate);
                                  }}
                                  className="text-[11px] text-[#586B60] hover:text-[#1A241E] hover:underline cursor-pointer"
                                  title="Inspect day's full retrospective"
                                >
                                  {task.dueDate} ↗
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LENS 3: SLEEP SANCTUARY LENS (Monthly Rest Calendar & Sleep Metrics)      */}
      {/* ========================================================================= */}
      {activeLens === "SLEEP" && (
        <div className="space-y-6">
          {/* Monthly Sleep Scoreboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Sleep Duration */}
            <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs">
              <div className="flex items-center justify-between text-[#7C9A86] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Avg Rest
                </span>
                <Moon className="w-4 h-4 text-[#7C9A86]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {sleepStats.avgDuration > 0 ? `${sleepStats.avgDuration}h` : "—"}
              </div>
              <p className="text-xs text-[#586B60] mt-1">
                Target: {targetSleepHours.toFixed(1)}h per night
              </p>
            </div>

            {/* Sleep Debt / Surplus */}
            <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs">
              <div className="flex items-center justify-between text-[#2E604A] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Cumulative Rhythm
                </span>
                <TrendingUp className="w-4 h-4 text-[#2E604A]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {sleepStats.loggedDaysCount > 0 ? (
                  <span className={sleepStats.surplusDeficit >= 0 ? "text-[#2E604A]" : "text-[#C87452]"}>
                    {sleepStats.surplusDeficit >= 0 ? `+${sleepStats.surplusDeficit}h` : `${sleepStats.surplusDeficit}h`}
                  </span>
                ) : (
                  "—"
                )}
              </div>
              <p className="text-xs text-[#586B60] mt-1">
                {sleepStats.surplusDeficit >= 0 ? "Sleep surplus achieved" : "Cumulative sleep debt"}
              </p>
            </div>

            {/* Restful Nights Count */}
            <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs">
              <div className="flex items-center justify-between text-[#D98A6C] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Restful Nights
                </span>
                <Sparkles className="w-4 h-4 text-[#D98A6C]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {sleepStats.restfulCount}
                <span className="text-sm font-sans font-normal text-[#8E9E94] ml-1.5">
                  / {sleepStats.loggedDaysCount} logged
                </span>
              </div>
              <p className="text-xs text-[#586B60] mt-1">
                Deep, restorative recovery rate
              </p>
            </div>

            {/* Logged Nights / Consistency */}
            <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs">
              <div className="flex items-center justify-between text-[#8C7A5E] mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Check-in Adherence
                </span>
                <BedDouble className="w-4 h-4 text-[#D4A373]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {sleepStats.loggedDaysCount}
                <span className="text-sm font-sans font-normal text-[#8E9E94] ml-1.5">
                  / {daysInMonth} days
                </span>
              </div>
              <p className="text-xs text-[#586B60] mt-1">
                Morning rest logs recorded
              </p>
            </div>
          </div>

          {/* Monthly Sleep Calendar Grid */}
          <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border border-[#EAE5D8] shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EAE5D8]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C9A86]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#586B60]">
                    Monthly Sleep Matrix
                  </span>
                  <span className="text-[#8E9E94]">•</span>
                  <span className="text-xs text-[#7C9A86] font-medium">
                    {currentMonthName} {currentYear}
                  </span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1A241E]">
                  Rest Rhythm Observatory
                </h3>
                <p className="text-xs text-[#586B60] mt-0.5">
                  Click any calendar day to inspect full rest details, habits, and tasks.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSleepModalDate(today);
                  setShowSleepModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1E3127] text-[#FAF7F0] hover:bg-[#2A3F34] text-xs font-semibold shadow-xs transition-colors self-start md:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Log Today&apos;s Rest</span>
              </button>
            </div>

            {/* Weekday Names Header */}
            <div className="grid grid-cols-7 text-center text-xs font-bold uppercase tracking-wider text-[#8E9E94]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {calendarDays.map((dateStr, idx) => {
                if (!dateStr) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="h-24 md:h-28 rounded-2xl bg-[#FAF8F2]/30 border border-transparent"
                    />
                  );
                }

                const dayNum = parseInt(dateStr.split("-")[2], 10);
                const isTodayDate = dateStr === today;
                const isPastDate = dateStr < today;
                const isFutureDate = dateStr > today;

                const log = (sleepLogs || []).find((l) => l.date === dateStr);
                const duration = log ? getSleepDuration(log) : null;
                const diff = duration !== null ? duration - targetSleepHours : null;

                // Color coding based on duration vs target
                let cellBg = "bg-[#FAF8F2]/60 border-[#EAE5D8]";
                if (isTodayDate) {
                  cellBg = "ring-2 ring-[#D4A373] bg-[#FAF7F0] border-[#D4A373]/50 shadow-xs";
                } else if (duration !== null) {
                  if (diff !== null && diff >= -0.5) {
                    cellBg = "bg-[#F4F8F5] border-[#D3E3D7]";
                  } else if (diff !== null && diff >= -1.5) {
                    cellBg = "bg-[#FAF7F0] border-[#D4A373]/40";
                  } else {
                    cellBg = "bg-[#FDF6F3] border-[#F0D5CA]";
                  }
                } else if (isPastDate) {
                  cellBg = "bg-[#FAF8F2]/80 border-[#EAE5D8]/80";
                }

                return (
                  <div
                    key={dateStr}
                    onClick={() => setInspectedDate(dateStr)}
                    className={`h-24 md:h-28 rounded-2xl p-2 md:p-2.5 flex flex-col justify-between transition-all relative border cursor-pointer hover:scale-[1.02] hover:shadow-xs ${cellBg}`}
                    title={`Click to inspect 3-in-1 details for ${dateStr}`}
                  >
                    {/* Day Number and Today Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs md:text-sm font-semibold ${
                          isTodayDate
                            ? "text-[#1E3127] font-bold"
                            : isPastDate || duration !== null
                            ? "text-[#1A241E]"
                            : "text-[#8E9E94]"
                        }`}
                      >
                        {dayNum}
                      </span>

                      {isTodayDate && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wide bg-[#D4A373] text-white px-1.5 py-0.2 rounded-md">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Sleep Duration & Arc */}
                    <div className="flex flex-col items-center justify-center my-auto">
                      {duration !== null ? (
                        <>
                          <div className="flex items-baseline gap-0.5">
                            <span className="font-serif text-base md:text-lg font-bold text-[#1E3127]">
                              {duration.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-[#586B60]">h</span>
                          </div>
                          <span className="text-[9px] text-[#8E9E94] font-mono mt-0.5 truncate max-w-full">
                            {log?.bedtime?.split(" ")[0]} → {log?.wakeTime?.split(" ")[0]}
                          </span>
                        </>
                      ) : isPastDate ? (
                        <span className="text-xs text-[#8E9E94] font-mono">—</span>
                      ) : isTodayDate ? (
                        <span className="text-[10px] text-[#D98A6C] font-semibold">Pending</span>
                      ) : (
                        <span className="text-xs text-[#B0BDB5] font-mono">—</span>
                      )}
                    </div>

                    {/* Footer Quality / Status Tag */}
                    <div className="text-center">
                      {log?.quality ? (
                        <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-md bg-[#FAF7F0] border border-[#EAE5D8] text-[#586B60] truncate block">
                          {log.quality === "RESTFUL" ? "Restful 🌿" : log.quality === "BALANCED" ? "Balanced ✨" : log.quality}
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#8E9E94] block">
                          {isPastDate ? "Unlogged" : isTodayDate ? "Check in" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sleep Matrix Legend */}
            <div className="pt-5 border-t border-[#EAE5D8] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-5 text-xs text-[#586B60] flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-[#F4F8F5] border border-[#D3E3D7]" />
                  <span>
                    <strong className="text-[#1A241E]">Target Met</strong> (≥ {targetSleepHours - 0.5}h)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-[#FAF7F0] border border-[#D4A373]/40" />
                  <span>
                    <strong className="text-[#1A241E]">Mild Deficit</strong> ({targetSleepHours - 1.5}h – {targetSleepHours - 0.5}h)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-[#FDF6F3] border border-[#F0D5CA]" />
                  <span>
                    <strong className="text-[#1A241E]">Deep Deficit</strong> (&lt; {targetSleepHours - 1.5}h)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#586B60] italic">
                <Compass className="w-4 h-4 text-[#D98A6C] shrink-0" />
                <span>&ldquo;Sleep is the anchor in the storm of daily action.&rdquo;</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. UNIFIED 3-IN-1 DAILY INSPECTOR MODAL                                   */}
      {/* ========================================================================= */}
      {inspectedData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] text-[#1A241E] rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-[#EAE5D8] shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EAE5D8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7C9A86] block mb-1">
                  Daily Inspector • 3 Pillars
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1A241E]">
                  {inspectedData.formattedTitle}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setInspectedDate(null)}
                className="w-8 h-8 rounded-full bg-[#EAE5D8] hover:bg-[#DDD7C8] flex items-center justify-center transition-colors text-[#1A241E] cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Rest Sanctuary (Sleep) */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-[#D98A6C]" />
                  <h4 className="font-serif text-lg font-bold text-[#1A241E]">
                    Rest Sanctuary
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSleepModalDate(inspectedData.date);
                    setShowSleepModal(true);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-[#D98A6C] hover:text-[#1E3127] cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{inspectedData.sleep ? "Adjust Sleep" : "Log Sleep"}</span>
                </button>
              </div>

              {inspectedData.sleep ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#EAE5D8]">
                    <span className="text-[10px] uppercase font-bold text-[#586B60] block">Duration</span>
                    <span className="font-serif text-xl font-bold text-[#1E3127]">
                      {getSleepDuration(inspectedData.sleep).toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#EAE5D8]">
                    <span className="text-[10px] uppercase font-bold text-[#586B60] block">Rhythm</span>
                    <span className="text-xs font-semibold text-[#1E3127]">
                      {inspectedData.sleep.bedtime} → {inspectedData.sleep.wakeTime}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#EAE5D8]">
                    <span className="text-[10px] uppercase font-bold text-[#586B60] block">Quality</span>
                    <span className="text-xs font-semibold text-[#7C9A86]">
                      {inspectedData.sleep.quality}
                    </span>
                  </div>
                  {inspectedData.sleep.notes && (
                    <div className="sm:col-span-3 text-xs text-[#586B60] italic pt-1">
                      &ldquo;{inspectedData.sleep.notes}&rdquo;
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-3 text-center text-xs text-[#8E9E94]">
                  No sleep log recorded for this date.
                </div>
              )}
            </div>

            {/* Section 2: Habit Rituals Honored */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#D98A6C]" />
                  <h4 className="font-serif text-lg font-bold text-[#1A241E]">
                    Habit Rituals
                  </h4>
                </div>
                <span className="text-xs text-[#586B60]">
                  {inspectedData.dayHabitsStatus.filter((h) => h.isCompleted).length} of {inspectedData.dayHabitsStatus.length} honored
                </span>
              </div>

              {inspectedData.dayHabitsStatus.length === 0 ? (
                <p className="text-xs text-[#8E9E94] text-center py-2">No habits configured.</p>
              ) : (
                <div className="space-y-2">
                  {inspectedData.dayHabitsStatus.map((habit) => (
                    <div
                      key={habit.id}
                      onClick={() => handleInspectorHabitToggle(habit.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F2] border border-[#EAE5D8] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            habit.isCompleted
                              ? "bg-[#7C9A86] border-[#7C9A86] text-white"
                              : "border-[#8E9E94]"
                          }`}
                        >
                          {habit.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-sm font-medium ${habit.isCompleted ? "line-through text-[#8E9E94]" : "text-[#1A241E]"}`}>
                          {habit.title}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getCategoryBadge(habit.category)}`}>
                        {habit.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Tasks & Intentions */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#7C9A86]" />
                  <h4 className="font-serif text-lg font-bold text-[#1A241E]">
                    Daily Intentions
                  </h4>
                </div>
                <span className="text-xs text-[#586B60]">
                  {inspectedData.dayTasks.filter((t) => t.status === "COMPLETED").length} of {inspectedData.dayTasks.length} achieved
                </span>
              </div>

              {inspectedData.dayTasks.length === 0 ? (
                <p className="text-xs text-[#8E9E94] text-center py-2">
                  No intentions scheduled for this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {inspectedData.dayTasks.map((task) => {
                    const isDone = task.status === "COMPLETED";
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleInspectorTaskToggle(task.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F2] border border-[#EAE5D8] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                              isDone
                                ? "bg-[#D4A373] border-[#D4A373] text-[#1E3127]"
                                : "border-[#8E9E94]"
                            }`}
                          >
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={`text-sm font-medium ${isDone ? "line-through text-[#8E9E94]" : "text-[#1A241E]"}`}>
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.dueTime && (
                            <span className="text-xs font-mono text-[#8E9E94]">{task.dueTime}</span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getCategoryBadge(task.category)}`}>
                            {task.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#EAE5D8] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInspectedDate(null)}
                className="px-5 py-2 rounded-2xl bg-[#1E3127] text-[#FAF7F0] font-medium text-xs hover:bg-[#2A3F34] transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Morning Sleep Dialog Modal */}
      {showSleepModal && (
        <MorningSleepDialog
          isOpen={showSleepModal}
          onClose={() => {
            setShowSleepModal(false);
            setSleepModalDate(undefined);
          }}
          today={sleepModalDate || today}
          targetHours={targetSleepHours}
        />
      )}
    </div>
  );
}
