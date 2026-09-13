"use client";

import { useState } from "react";
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
  CalendarDays
} from "lucide-react";

interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  title: string;
  category: string;
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

interface SeasonsClientProps {
  tasks: Task[];
  habits: Habit[];
  today: string;
}

export function SeasonsClient({ tasks, habits, today }: SeasonsClientProps) {
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [viewMode, setViewMode] = useState<"DAILY" | "MONTHLY">("DAILY");

  // Parse current view month
  const todayDateObj = new Date();
  const [currentMonth, setCurrentMonth] = useState(todayDateObj.getMonth()); // 8 is Sep, 7 is Aug
  const [currentYear, setCurrentYear] = useState(todayDateObj.getFullYear());

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
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const offset = (firstDayOfMonth + 6) % 7; // Align to Monday start

  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < offset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push(formatted);
  }

  // Monthly Calculations
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const currentMonthName = monthNames[currentMonth];

  // Tasks in this month
  const monthTasks = tasks.filter((t) => t.dueDate && t.dueDate.startsWith(monthPrefix));
  const monthCompletedTasks = monthTasks.filter((t) => t.status === "COMPLETED");
  const monthTaskRate = monthTasks.length > 0 
    ? Math.round((monthCompletedTasks.length / monthTasks.length) * 100) 
    : 100;

  // Habit stats in this month
  const daysInMonthCount = currentMonth === todayDateObj.getMonth() && currentYear === todayDateObj.getFullYear()
    ? todayDateObj.getDate()
    : daysInMonth;

  const monthHabitStats = habits.map((h) => {
    const logsInMonth = h.logs.filter((l) => l.date.startsWith(monthPrefix));
    const completedCount = logsInMonth.filter((l) => l.completed).length;
    const rate = Math.min(Math.round((completedCount / (daysInMonthCount || 1)) * 100), 100);
    return {
      id: h.id,
      title: h.title,
      category: h.category,
      completedCount,
      possibleDays: daysInMonthCount,
      rate,
    };
  }).sort((a, b) => b.rate - a.rate);

  const totalHabitCompletionsInMonth = monthHabitStats.reduce((acc, h) => acc + h.completedCount, 0);
  const avgHabitRate = Math.round(
    monthHabitStats.reduce((acc, h) => acc + h.rate, 0) / (monthHabitStats.length || 1)
  );
  const overallMonthlyHarmony = Math.round(
    monthTasks.length > 0 ? (avgHabitRate * 0.7 + monthTaskRate * 0.3) : avgHabitRate
  );

  const bestHabit = monthHabitStats[0];
  const weakestHabit = monthHabitStats[monthHabitStats.length - 1];

  // Daily Retrospective Data
  const dayHabits = habits.map((h) => {
    const log = h.logs.find((l) => l.date === selectedDate);
    return {
      id: h.id,
      title: h.title,
      category: h.category,
      isCompleted: log?.completed ?? false,
    };
  });

  const dayTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const completedHabits = dayHabits.filter((h) => h.isCompleted);
  const completedTasks = dayTasks.filter((t) => t.status === "COMPLETED");

  const totalPossible = dayHabits.length + (dayTasks.length || 1);
  const totalCompleted = completedHabits.length + completedTasks.length;
  const dayConsistency = Math.min(Math.round((totalCompleted / totalPossible) * 100), 100);

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const humanDateStr = selectedDateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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

  return (
    <div className="space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
            Seasons & Monthly Retrospectives
          </h2>
          <p className="text-sm text-[#586B60] mt-1 font-sans">
            Review your consistency across days, weeks, and full monthly seasons.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#EAE5D8] shadow-2xs self-start md:self-auto">
          <button
            onClick={() => setViewMode("DAILY")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === "DAILY"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                : "text-[#586B60] hover:text-[#1A241E]"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Day-by-Day Calendar</span>
          </button>
          <button
            onClick={() => setViewMode("MONTHLY")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === "MONTHLY"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                : "text-[#586B60] hover:text-[#1A241E]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Monthly Reflection ({currentMonthName})</span>
          </button>
        </div>
      </div>

      {/* Month Navigator Header Bar */}
      <div className="flex items-center justify-between p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-full bg-[#FAF8F2] hover:bg-[#EAE5D8] flex items-center justify-center transition-colors text-[#1A241E]"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1A241E] leading-tight">
              {currentMonthName} {currentYear}
            </h3>
            <span className="text-xs text-[#586B60]">
              {overallMonthlyHarmony}% Consistency across {monthTasks.length} tasks and {totalHabitCompletionsInMonth} habit check-ins
            </span>
          </div>
          <button
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-full bg-[#FAF8F2] hover:bg-[#EAE5D8] flex items-center justify-center transition-colors text-[#1A241E]"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Jump to August or September */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentMonth(7); // August
              setCurrentYear(2026);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              currentMonth === 7 && currentYear === 2026
                ? "bg-[#D4A373] text-white"
                : "bg-[#FAF8F2] text-[#586B60] hover:text-[#1A241E] border border-[#EAE5D8]"
            }`}
          >
            August 2026
          </button>
          <button
            onClick={() => {
              setCurrentMonth(8); // September
              setCurrentYear(2026);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              currentMonth === 8 && currentYear === 2026
                ? "bg-[#D4A373] text-white"
                : "bg-[#FAF8F2] text-[#586B60] hover:text-[#1A241E] border border-[#EAE5D8]"
            }`}
          >
            September 2026
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: DAY-BY-DAY CALENDAR */}
      {viewMode === "DAILY" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Calendar Grid (7 cols) */}
          <div className="lg:col-span-7 bg-[#FFFFFF] rounded-3xl p-7 md:p-8 border border-[#EAE5D8] shadow-xs">
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#8E9E94] mb-3">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dateStr, idx) => {
                if (!dateStr) return <div key={`empty-${idx}`} className="h-12" />;

                const dayNum = parseInt(dateStr.split("-")[2], 10);
                const isSelected = dateStr === selectedDate;
                const isTodayDate = dateStr === today;

                const doneCount = habits.filter((h) =>
                  h.logs.some((l) => l.date === dateStr && l.completed)
                ).length;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all ${
                      isSelected
                        ? "bg-[#1E3127] text-[#FAF7F0] shadow-sm scale-105"
                        : isTodayDate
                        ? "bg-[#FAF7F0] border border-[#D4A373] text-[#1A241E]"
                        : "hover:bg-[#FAF8F2] text-[#1A241E]"
                    }`}
                  >
                    <span className="text-sm font-semibold">{dayNum}</span>
                    {doneCount > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-[#D4A373]" : "bg-[#7C9A86]"
                          }`}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-4 border-t border-[#EAE5D8] flex items-center justify-between text-xs text-[#586B60]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C9A86]" />
                <span>Days with completed habits & tasks</span>
              </div>
              <button
                onClick={() => setViewMode("MONTHLY")}
                className="font-medium text-[#7C9A86] hover:text-[#1E3127] underline"
              >
                Switch to full {currentMonthName} summary →
              </button>
            </div>
          </div>

          {/* Day Retrospective (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAF7F0] rounded-3xl p-7 md:p-8 border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EAE5D8]">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#7C9A86]">
                    Day Retrospective
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#1A241E] mt-0.5">
                    {humanDateStr}
                  </h3>
                </div>

                <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-[#EFEAE0] border border-[#E4DDD0] shadow-2xs">
                  <span className="font-serif text-lg font-bold text-[#1A241E]">
                    {dayConsistency}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#586B60]">
                    Harmony
                  </span>
                </div>
              </div>

              {/* Habits */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#586B60] mb-3">
                  Habits ({completedHabits.length} / {dayHabits.length} completed)
                </h4>
                <div className="space-y-2">
                  {dayHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-sm ${
                        habit.isCompleted
                          ? "bg-[#FFFFFF] border-[#EAE5D8] text-[#1A241E]"
                          : "bg-[#F5EFE6]/60 border-[#EAE5D8] text-[#8E9E94]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            habit.isCompleted
                              ? "bg-[#7C9A86] text-white"
                              : "bg-[#EAE5D8] text-[#8E9E94]"
                          }`}
                        >
                          {habit.isCompleted ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <X className="w-3 h-3 stroke-[3]" />
                          )}
                        </div>
                        <span className={habit.isCompleted ? "font-medium" : ""}>
                          {habit.title}
                        </span>
                      </div>
                      <span className="text-xs text-[#586B60]">
                        {habit.isCompleted ? "Completed" : "Rest / Missed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#586B60] mb-3">
                  Tasks ({completedTasks.length} / {dayTasks.length || 0} completed)
                </h4>
                {dayTasks.length === 0 ? (
                  <p className="text-xs text-[#8E9E94] italic p-3 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8]">
                    No specific tasks were scheduled for this date.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              t.status === "COMPLETED"
                                ? "bg-[#7C9A86] text-white"
                                : "bg-[#EAE5D8] text-[#8E9E94]"
                            }`}
                          >
                            {t.status === "COMPLETED" ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <X className="w-3 h-3 stroke-[3]" />
                            )}
                          </div>
                          <span
                            className={
                              t.status === "COMPLETED"
                                ? "font-medium line-through text-[#8E9E94]"
                                : "font-medium text-[#1A241E]"
                            }
                          >
                            {t.title}
                          </span>
                        </div>
                        {t.dueTime && (
                          <span className="text-xs text-[#586B60]">{t.dueTime}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EAE5D8] text-xs text-[#586B60] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D98A6C]" />
              <span>&ldquo;Reviewing past seasons illuminates the path forward.&rdquo;</span>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: FULL MONTHLY RETROSPECTIVE & BREAKDOWN */
        <div className="space-y-7">
          {/* Monthly Metric Scoreboard */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            {/* Harmony Rate */}
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
              <div className="flex items-center justify-between text-[#7C9A86] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60]">
                  {currentMonthName} Harmony
                </span>
                <TrendingUp className="w-4 h-4 text-[#7C9A86]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {overallMonthlyHarmony}%
              </div>
              <p className="text-xs text-[#586B60] mt-1">Overall monthly consistency</p>
            </div>

            {/* Tasks Completed */}
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
              <div className="flex items-center justify-between text-[#D98A6C] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60]">
                  Tasks Finished
                </span>
                <Check className="w-4 h-4 text-[#D98A6C] stroke-[3]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {monthCompletedTasks.length} / {monthTasks.length}
              </div>
              <p className="text-xs text-[#586B60] mt-1">
                {monthTaskRate}% of monthly intentions
              </p>
            </div>

            {/* Habit Check-ins */}
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
              <div className="flex items-center justify-between text-[#D4A373] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60]">
                  Habit Check-Ins
                </span>
                <Flame className="w-4 h-4 text-[#D4A373] fill-[#D4A373]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#1A241E]">
                {totalHabitCompletionsInMonth}
              </div>
              <p className="text-xs text-[#586B60] mt-1">Total completed logs in {currentMonthName}</p>
            </div>

            {/* Top Habit */}
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
              <div className="flex items-center justify-between text-[#7C9A86] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60]">
                  Anchor Habit
                </span>
                <Trophy className="w-4 h-4 text-[#7C9A86]" />
              </div>
              <div className="font-serif text-lg font-bold text-[#1A241E] truncate">
                {bestHabit?.title || "Deep Work"}
              </div>
              <p className="text-xs text-[#5F7E6A] font-semibold mt-1">
                {bestHabit?.rate}% consistency
              </p>
            </div>
          </div>

          {/* Monthly Deep Dive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Left: Tasks Done in this Month (6 cols) */}
            <div className="lg:col-span-6 bg-[#FFFFFF] rounded-3xl p-7 md:p-8 border border-[#EAE5D8] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="font-serif text-2xl font-bold text-[#1A241E]">
                    Tasks Completed in {currentMonthName}
                  </h4>
                  <p className="text-xs text-[#586B60] mt-0.5">
                    What you accomplished and what remained pending in {currentMonthName} {currentYear}.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#EFEAE0] text-xs font-semibold text-[#1A241E]">
                  {monthCompletedTasks.length} / {monthTasks.length} Done
                </span>
              </div>

              {monthTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8E9E94]">
                  No tasks recorded for {currentMonthName} {currentYear}.
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {monthTasks.map((t) => {
                    const isDone = t.status === "COMPLETED";

                    return (
                      <div
                        key={t.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDone
                            ? "bg-[#FAF8F2] border-[#EAE5D8]"
                            : "bg-[#FFFFFF] border-[#D98A6C]/40 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                                isDone ? "bg-[#7C9A86] text-white" : "bg-[#FAF8F2] border border-[#D98A6C] text-[#D98A6C]"
                              }`}
                            >
                              {isDone ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                            </div>
                            <div>
                              <span
                                className={`text-sm font-medium ${
                                  isDone ? "text-[#586B60] line-through" : "text-[#1A241E]"
                                }`}
                              >
                                {t.title}
                              </span>
                              {t.description && (
                                <p className="text-xs text-[#8E9E94] mt-1 line-clamp-2">
                                  {t.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 gap-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryBadge(t.category)}`}>
                              {t.category}
                            </span>
                            <span className="text-[11px] text-[#8E9E94]">
                              {t.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Habit Consistency Breakdown for this Month (6 cols) */}
            <div className="lg:col-span-6 bg-[#1E3127] text-[#FAF7F0] rounded-3xl p-7 md:p-8 border border-[#2D4336] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h4 className="font-serif text-2xl font-bold text-[#FAF7F0]">
                      Habit Consistency ({currentMonthName})
                    </h4>
                    <p className="text-xs text-[#8FA697] mt-0.5">
                      Adherence rate for each habit throughout {currentMonthName}.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#2A3F34] text-xs font-semibold text-[#7C9A86]">
                    Avg: {avgHabitRate}%
                  </span>
                </div>

                <div className="space-y-4">
                  {monthHabitStats.map((h) => (
                    <div key={h.id} className="p-3.5 rounded-2xl bg-[#24372D] border border-[#354D40]/70">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-[#FAF7F0]">{h.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#8FA697]">
                            {h.completedCount} / {h.possibleDays} days
                          </span>
                          <span className="font-serif font-bold text-[#FAF7F0]">
                            {h.rate}%
                          </span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-2.5 bg-[#1E3127] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            h.rate >= 80
                              ? "bg-[#7C9A86]"
                              : h.rate >= 60
                              ? "bg-[#D4A373]"
                              : "bg-[#D98A6C]"
                          }`}
                          style={{ width: `${h.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Takeaway */}
              <div className="mt-6 pt-4 border-t border-[#2D4336] flex items-center justify-between text-xs text-[#8FA697]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>
                    Anchor: <strong className="text-[#FAF7F0]">{bestHabit?.title}</strong> ({bestHabit?.rate}%)
                  </span>
                </div>
                {weakestHabit && (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#D98A6C]" />
                    <span>
                      Focus: <strong className="text-[#FAF7F0]">{weakestHabit.title}</strong> ({weakestHabit.rate}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
