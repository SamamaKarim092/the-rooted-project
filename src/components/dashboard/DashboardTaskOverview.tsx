"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Check, 
  ChevronDown, 
  ArrowRight,
  Sparkles,
  Layers,
  Flame
} from "lucide-react";
import { getWeekRange, formatMonthName } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  priority: string;
  dueDate: string | null;
  dueTime: string | null;
}

interface DashboardTaskOverviewProps {
  allTasks: Task[];
  today: string;
}

export function DashboardTaskOverview({ allTasks, today }: DashboardTaskOverviewProps) {
  // 1. THIS WEEK'S METRICS (Monday to Sunday)
  const weekRange = useMemo(() => getWeekRange(today), [today]);
  const weekTasks = useMemo(() => {
    return allTasks.filter((t) => t.dueDate && t.dueDate >= weekRange.startOfWeek && t.dueDate <= weekRange.endOfWeek);
  }, [allTasks, weekRange]);

  const completedWeek = useMemo(() => weekTasks.filter((t) => t.status === "COMPLETED").length, [weekTasks]);
  const remainingWeek = weekTasks.length - completedWeek;
  const weekRate = weekTasks.length > 0 ? Math.round((completedWeek / weekTasks.length) * 100) : 0;

  const weekDaysLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDayCompletions = useMemo(() => {
    return weekRange.weekDays.map((dateStr) => {
      const dayTasks = allTasks.filter((t) => t.dueDate === dateStr);
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
  }, [allTasks, weekRange, today]);

  // 2. MONTHLY METRICS
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const currentMonthKey = today.slice(0, 7);
    set.add(currentMonthKey);
    allTasks.forEach((t) => {
      if (t.dueDate) set.add(t.dueDate.slice(0, 7));
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [allTasks, today]);

  const [selectedMonth, setSelectedMonth] = useState<string>(today.slice(0, 7));

  const monthTasks = useMemo(() => {
    return allTasks.filter((t) => t.dueDate && t.dueDate.startsWith(selectedMonth));
  }, [allTasks, selectedMonth]);

  const completedMonth = useMemo(() => monthTasks.filter((t) => t.status === "COMPLETED").length, [monthTasks]);
  const remainingMonth = monthTasks.length - completedMonth;
  const monthRate = monthTasks.length > 0 ? Math.round((completedMonth / monthTasks.length) * 100) : 0;

  // Category counts for selected month
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    monthTasks.forEach((t) => {
      if (t.status === "COMPLETED") {
        map.set(t.category, (map.get(t.category) || 0) + 1);
      }
    });
    return Array.from(map.entries());
  }, [monthTasks]);

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
    <div className="space-y-7">
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#1A241E]">
            Tasks Overview & Velocity
          </h3>
          <p className="text-xs text-[#586B60] mt-0.5">
            Real-time multi-horizon tracking across weekly rhythms and full monthly horizons.
          </p>
        </div>

        <Link
          href="/tasks"
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-2xl bg-[#1E3127] text-[#FAF7F0] hover:bg-[#2A3F34] transition-colors self-start sm:self-auto"
        >
          <span>Open Full Task Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid: 2 Columns for Weekly Flow & Monthly Horizon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* 🗓️ LEFT COLUMN: THIS WEEK'S TASK FLOW */}
        <div className="p-7 md:p-8 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EAF0EC] text-[#5F7E6A] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-2xl font-bold text-[#1A241E]">
                    This Week&apos;s Flow
                  </h4>
                  <span className="text-xs text-[#586B60]">
                    Monday to Sunday rhythm window
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#EAF0EC] text-xs font-semibold text-[#5F7E6A] border border-[#7C9A86]/30">
                {weekRate}% Velocity
              </span>
            </div>

            {/* Weekly Metrics Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8] mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Completed
                </span>
                <div className="font-serif text-3xl font-bold text-[#1A241E] mt-0.5">
                  {completedWeek}
                </div>
                <span className="text-xs text-[#5F7E6A] font-medium">Tasks achieved</span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Remaining / Left
                </span>
                <div className="font-serif text-3xl font-bold text-[#D98A6C] mt-0.5">
                  {remainingWeek}
                </div>
                <span className="text-xs text-[#586B60]">Out of {weekTasks.length} total</span>
              </div>
            </div>

            {/* 7-Segment Weekday Rhythm Bars */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-[#586B60] mb-2 font-medium">
                <span>Daily Weekday Distribution</span>
                <span>Active Target</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                {weekDayCompletions.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className={`w-full h-3 rounded-full transition-all ${
                        day.isDone
                          ? "bg-[#7C9A86]"
                          : day.hasTasks
                          ? "bg-[#D98A6C]"
                          : "bg-[#EFEAE0]"
                      } ${day.isCurrentDay ? "ring-2 ring-[#1A241E]/30" : ""}`}
                      title={`${day.dateStr}: ${day.count} tasks`}
                    />
                    <span className="text-[11px] font-semibold text-[#8E9E94]">
                      {weekDaysLabels[idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks in this Week */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#586B60] mb-3">
                Scheduled for this week ({weekTasks.length})
              </h5>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {weekTasks.length === 0 ? (
                  <p className="text-xs text-[#8E9E94] italic py-4 text-center">
                    No tasks scheduled in this week.
                  </p>
                ) : (
                  weekTasks.map((t) => {
                    const isDone = t.status === "COMPLETED";
                    return (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-sm ${
                          isDone
                            ? "bg-[#FAF8F2] border-[#EAE5D8] opacity-80"
                            : "bg-[#FFFFFF] border-[#EAE5D8]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                              isDone ? "bg-[#7C9A86] text-white" : "border border-[#8E9E94]"
                            }`}
                          >
                            {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`truncate ${
                              isDone ? "line-through text-[#8E9E94]" : "font-medium text-[#1A241E]"
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8E9E94] shrink-0 ml-2">
                          {t.dueDate}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE5D8] flex items-center justify-between text-xs text-[#586B60]">
            <span>Weekly progress indicator</span>
            <span className="font-semibold text-[#1A241E]">
              {completedWeek} of {weekTasks.length} accomplished
            </span>
          </div>
        </div>

        {/* 📆 RIGHT COLUMN: MONTHLY HORIZON */}
        <div className="p-7 md:p-8 rounded-3xl bg-[#FAF7F0] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EFEAE0] text-[#D98A6C] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-2xl font-bold text-[#1A241E]">
                    Monthly Horizon
                  </h4>
                  <span className="text-xs text-[#586B60]">
                    Month-by-month task tracking
                  </span>
                </div>
              </div>

              {/* Month Dropdown Switcher */}
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none bg-[#FFFFFF] border border-[#EAE5D8] text-[#1A241E] text-xs font-semibold px-3 py-1.5 pr-8 rounded-2xl cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#7C9A86] shadow-2xs"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {formatMonthName(m)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#586B60] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Monthly Metrics Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Completed in {formatMonthName(selectedMonth).split(" ")[0]}
                </span>
                <div className="font-serif text-3xl font-bold text-[#1A241E] mt-0.5">
                  {completedMonth}
                </div>
                <span className="text-xs text-[#5F7E6A] font-semibold">{monthRate}% success rate</span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Incomplete / Left
                </span>
                <div className="font-serif text-3xl font-bold text-[#D98A6C] mt-0.5">
                  {remainingMonth}
                </div>
                <span className="text-xs text-[#586B60]">Out of {monthTasks.length} total</span>
              </div>
            </div>

            {/* Monthly Progress Bar */}
            <div className="mb-5">
              <div className="w-full h-3 bg-[#EFEAE0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7C9A86] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${monthRate}%` }}
                />
              </div>
            </div>

            {/* Category Distribution Pills */}
            {categoryCounts.length > 0 && (
              <div className="mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B60] block mb-2">
                  Completed by Category
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {categoryCounts.map(([cat, count]) => (
                    <span
                      key={cat}
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getCategoryBadge(cat)}`}
                    >
                      {cat}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Month Tasks List */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#586B60] mb-3">
                {formatMonthName(selectedMonth)} Tasks ({monthTasks.length})
              </h5>
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {monthTasks.length === 0 ? (
                  <p className="text-xs text-[#8E9E94] italic py-4 text-center">
                    No tasks scheduled in {formatMonthName(selectedMonth)}.
                  </p>
                ) : (
                  monthTasks.map((t) => {
                    const isDone = t.status === "COMPLETED";
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-sm ${
                        isDone
                          ? "bg-[#FFFFFF] border-[#EAE5D8] opacity-80"
                          : "bg-[#FFFFFF] border-[#D98A6C]/30 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isDone ? "bg-[#7C9A86] text-white" : "border border-[#D98A6C] text-[#D98A6C]"
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          ) : (
                            <Clock className="w-2.5 h-2.5" />
                          )}
                        </div>
                        <span
                          className={`truncate ${
                            isDone ? "line-through text-[#8E9E94]" : "font-medium text-[#1A241E]"
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8E9E94] shrink-0 ml-2">
                        {t.dueDate}
                      </span>
                    </div>
                  );
                })
              )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE5D8] flex items-center justify-between text-xs text-[#586B60]">
            <span>{formatMonthName(selectedMonth)} Achievement</span>
            <span className="font-semibold text-[#1A241E]">
              {completedMonth} of {monthTasks.length} Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
