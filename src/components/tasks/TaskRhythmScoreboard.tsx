"use client";

import { useState, useMemo } from "react";
import { 
  Sun, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ChevronDown, 
  Flame,
  Layers
} from "lucide-react";
import { getWeekRange, formatMonthName } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: string;
  category: string;
  dueDate: string | null;
}

interface TaskRhythmScoreboardProps {
  tasks: Task[];
  today: string;
}

export function TaskRhythmScoreboard({ tasks, today }: TaskRhythmScoreboardProps) {
  // 1. TODAY'S METRICS
  const todayTasks = useMemo(() => tasks.filter((t) => t.dueDate === today), [tasks, today]);
  const completedToday = useMemo(() => todayTasks.filter((t) => t.status === "COMPLETED").length, [todayTasks]);
  const remainingToday = todayTasks.length - completedToday;
  const todayRate = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 100;

  // 2. THIS WEEK'S METRICS (Monday to Sunday)
  const weekRange = useMemo(() => getWeekRange(today), [today]);
  const weekTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate && t.dueDate >= weekRange.startOfWeek && t.dueDate <= weekRange.endOfWeek);
  }, [tasks, weekRange]);

  const completedWeek = useMemo(() => weekTasks.filter((t) => t.status === "COMPLETED").length, [weekTasks]);
  const remainingWeek = weekTasks.length - completedWeek;
  const weekRate = weekTasks.length > 0 ? Math.round((completedWeek / weekTasks.length) * 100) : 100;

  // Weekly day segments
  const weekDaysLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const weekDayCompletions = useMemo(() => {
    return weekRange.weekDays.map((dateStr) => {
      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
      const isDone = dayTasks.length > 0 && dayTasks.every((t) => t.status === "COMPLETED");
      const hasTasks = dayTasks.length > 0;
      const isCurrentDay = dateStr === today;
      return {
        dateStr,
        hasTasks,
        isDone,
        isCurrentDay,
        count: dayTasks.length,
      };
    });
  }, [tasks, weekRange, today]);

  // 3. MONTHLY METRICS
  // Extract all available months from tasks
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    // Always include current month
    const currentMonthKey = today.slice(0, 7);
    set.add(currentMonthKey);

    tasks.forEach((t) => {
      if (t.dueDate) {
        set.add(t.dueDate.slice(0, 7));
      }
    });

    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [tasks, today]);

  const [selectedMonth, setSelectedMonth] = useState<string>(today.slice(0, 7));

  const monthTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate && t.dueDate.startsWith(selectedMonth));
  }, [tasks, selectedMonth]);

  const completedMonth = useMemo(() => monthTasks.filter((t) => t.status === "COMPLETED").length, [monthTasks]);
  const remainingMonth = monthTasks.length - completedMonth;
  const monthRate = monthTasks.length > 0 ? Math.round((completedMonth / monthTasks.length) * 100) : 100;

  // Monthly category breakdown
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    monthTasks.forEach((t) => {
      if (t.status === "COMPLETED") {
        map.set(t.category, (map.get(t.category) || 0) + 1);
      }
    });
    return Array.from(map.entries());
  }, [monthTasks]);

  // SVG Ring calculation for Today
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todayRate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* ☀️ CARD 1: TODAY'S INTENTIONS */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60] flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Today&apos;s Pulse</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF8F2] border border-[#EAE5D8] text-[#1A241E]">
              {todayRate}% Done
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 mt-2">
            <div>
              <div className="font-serif text-3xl font-bold text-[#1A241E] leading-tight">
                {completedToday} Done
              </div>
              <div className="text-xs text-[#586B60] mt-1 flex items-center gap-1.5">
                <span className="font-semibold text-[#D98A6C]">{remainingToday} remaining</span>
                <span>• {todayTasks.length} scheduled</span>
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  stroke="#EFEAE0"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  stroke="#7C9A86"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-[#1A241E]">
                {completedToday}/{todayTasks.length}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EAE5D8]/80 text-[11px] text-[#586B60] flex items-center justify-between">
          <span>Daily execution target</span>
          <span className="font-medium text-[#1A241E]">
            {remainingToday === 0 && todayTasks.length > 0 ? "✨ All clear!" : `${remainingToday} to complete`}
          </span>
        </div>
      </div>

      {/* 🗓️ CARD 2: THIS WEEK'S VELOCITY */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#7C9A86]" />
              <span>This Week&apos;s Flow</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF0EC] text-[#5F7E6A] border border-[#7C9A86]/30">
              {weekRate}% Velocity
            </span>
          </div>

          <div className="mt-2">
            <div className="font-serif text-3xl font-bold text-[#1A241E] leading-tight">
              {completedWeek} Done
            </div>
            <div className="text-xs text-[#586B60] mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-[#D98A6C]">{remainingWeek} left/missed</span>
              <span>• {weekTasks.length} scheduled</span>
            </div>
          </div>

          {/* 7-Segment Weekday Rhythm Bars */}
          <div className="mt-4 flex items-center justify-between gap-1.5">
            {weekDayCompletions.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full h-2 rounded-full transition-all ${
                    day.isDone
                      ? "bg-[#7C9A86]"
                      : day.hasTasks
                      ? "bg-[#D98A6C]"
                      : "bg-[#EFEAE0]"
                  } ${day.isCurrentDay ? "ring-2 ring-[#1A241E]/20" : ""}`}
                  title={`${day.dateStr}: ${day.count} tasks`}
                />
                <span className="text-[10px] font-medium text-[#8E9E94]">
                  {weekDaysLabels[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EAE5D8]/80 text-[11px] text-[#586B60] flex items-center justify-between">
          <span>Weekly target window</span>
          <span className="font-medium text-[#1A241E]">
            {completedWeek} of {weekTasks.length} achieved
          </span>
        </div>
      </div>

      {/* 📆 CARD 3: MONTH-BY-MONTH TRACKING */}
      <div className="p-6 rounded-3xl bg-[#FAF7F0] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
        <div>
          {/* Header with Month Selector Dropdown */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#D98A6C]" />
              <span>Monthly Horizon</span>
            </span>

            {/* Month Switcher Dropdown */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-[#FFFFFF] border border-[#EAE5D8] text-[#1A241E] text-xs font-semibold px-3 py-1 pr-7 rounded-xl cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#7C9A86] shadow-2xs"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthName(m)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#586B60] absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <div className="font-serif text-3xl font-bold text-[#1A241E] leading-tight">
                {completedMonth} Done
              </div>
              <span className="font-serif text-lg font-bold text-[#7C9A86]">
                {monthRate}%
              </span>
            </div>
            <div className="text-xs text-[#586B60] mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-[#D98A6C]">{remainingMonth} left/missed</span>
              <span>• {monthTasks.length} in {formatMonthName(selectedMonth).split(" ")[0]}</span>
            </div>
          </div>

          {/* Month Progress Bar */}
          <div className="mt-3.5 w-full h-2.5 bg-[#EFEAE0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7C9A86] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${monthRate}%` }}
            />
          </div>

          {/* Category badges for completed tasks */}
          {categoryCounts.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              {categoryCounts.slice(0, 3).map(([cat, count]) => (
                <span
                  key={cat}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFFFFF] border border-[#EAE5D8] text-[#586B60] font-medium"
                >
                  {cat}: {count}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#EAE5D8]/80 text-[11px] text-[#586B60] flex items-center justify-between">
          <span>{formatMonthName(selectedMonth)} status</span>
          <span className="font-semibold text-[#1A241E]">
            {completedMonth} completed • {remainingMonth} incomplete
          </span>
        </div>
      </div>
    </div>
  );
}
