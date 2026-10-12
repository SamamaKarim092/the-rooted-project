"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  RotateCcw, 
  X, 
  Layers, 
  Flame, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Award,
  Leaf,
  CalendarDays
} from "lucide-react";
import { 
  getPreviousWeekRange, 
  getPreviousMonthKey, 
  formatMonthName, 
  getWeekKey 
} from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  priority: string;
  dueDate: string | null;
  dueTime: string | null;
  completedAt?: string | Date | null;
}

interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
  notes: string | null;
}

interface Habit {
  id: string;
  title: string;
  category: string;
  color: string;
  logs: HabitLog[];
}

interface PeriodicReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  today: string;
  allTasks: Task[];
  habits: Habit[];
  activeGoal?: any;
  initialMode?: "WEEKLY" | "MONTHLY";
}

export function PeriodicReviewModal({
  isOpen,
  onClose,
  today,
  allTasks,
  habits,
  activeGoal,
  initialMode = "WEEKLY",
}: PeriodicReviewModalProps) {
  const [mode, setMode] = useState<"WEEKLY" | "MONTHLY">(initialMode);
  const [showTaskList, setShowTaskList] = useState(false);

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // 1. PREVIOUS WEEK METRICS
  const prevWeekRange = useMemo(() => getPreviousWeekRange(today), [today]);
  
  const prevWeekTasks = useMemo(() => {
    return allTasks.filter(
      (t) => t.dueDate && t.dueDate >= prevWeekRange.startOfWeek && t.dueDate <= prevWeekRange.endOfWeek
    );
  }, [allTasks, prevWeekRange]);

  const completedWeekTasks = useMemo(
    () => prevWeekTasks.filter((t) => t.status === "COMPLETED"),
    [prevWeekTasks]
  );
  const pendingWeekTasks = useMemo(
    () => prevWeekTasks.filter((t) => t.status !== "COMPLETED"),
    [prevWeekTasks]
  );
  const weekCompletionRate = prevWeekTasks.length > 0 
    ? Math.round((completedWeekTasks.length / prevWeekTasks.length) * 100) 
    : 100;

  // Category breakdown for previous week
  const weekCategoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    completedWeekTasks.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [completedWeekTasks]);

  // Habit consistency for previous week
  const weekHabitStats = useMemo(() => {
    let totalLogs = 0;
    let completedLogs = 0;
    prevWeekRange.weekDays.forEach((dateStr) => {
      habits.forEach((h) => {
        totalLogs++;
        const log = h.logs.find((l) => l.date === dateStr);
        if (log?.completed) completedLogs++;
      });
    });
    const rate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;
    return { totalLogs, completedLogs, rate };
  }, [habits, prevWeekRange]);


  // 2. PREVIOUS MONTH METRICS
  const currentMonthKey = today.slice(0, 7);
  const prevMonthKey = useMemo(() => getPreviousMonthKey(currentMonthKey), [currentMonthKey]);
  const prevMonthName = useMemo(() => formatMonthName(prevMonthKey), [prevMonthKey]);

  const prevMonthTasks = useMemo(() => {
    return allTasks.filter((t) => t.dueDate && t.dueDate.startsWith(prevMonthKey));
  }, [allTasks, prevMonthKey]);

  const completedMonthTasks = useMemo(
    () => prevMonthTasks.filter((t) => t.status === "COMPLETED"),
    [prevMonthTasks]
  );
  const pendingMonthTasks = useMemo(
    () => prevMonthTasks.filter((t) => t.status !== "COMPLETED"),
    [prevMonthTasks]
  );
  const monthCompletionRate = prevMonthTasks.length > 0
    ? Math.round((completedMonthTasks.length / prevMonthTasks.length) * 100)
    : 100;

  // Category breakdown for previous month
  const monthCategoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    completedMonthTasks.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [completedMonthTasks]);

  // Habit consistency for previous month
  const monthHabitStats = useMemo(() => {
    let completedLogs = 0;
    let totalActiveHabitDays = 0;
    // Count days in prevMonth
    const [yStr, mStr] = prevMonthKey.split("-");
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const daysInMonth = new Date(y, m, 0).getDate();
    totalActiveHabitDays = habits.length * daysInMonth;

    habits.forEach((h) => {
      h.logs.forEach((l) => {
        if (l.date.startsWith(prevMonthKey) && l.completed) {
          completedLogs++;
        }
      });
    });
    const rate = totalActiveHabitDays > 0 ? Math.round((completedLogs / totalActiveHabitDays) * 100) : 0;
    return { completedLogs, rate, daysInMonth };
  }, [habits, prevMonthKey]);

  // Category badge styling helper
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "mind":
        return "bg-[#EAF0EC] text-[#5F7E6A] border border-[#7C9A86]/30";
      case "body":
        return "bg-[#F9ECE6] text-[#C87452] border border-[#D98A6C]/30";
      case "craft":
        return "bg-[#FAF0E6] text-[#A26D3F] border border-[#D4A373]/30";
      case "spirit":
        return "bg-[#F3EBF4] text-[#865E87] border border-[#B08EB3]/30";
      case "study":
        return "bg-[#E6EEF5] text-[#4A7298] border border-[#799FBE]/30";
      case "career":
        return "bg-[#EBF2EC] text-[#4B785A] border border-[#78A887]/30";
      default:
        return "bg-[#F7F4EB] text-[#586B60] border border-[#EAE5D8]";
    }
  };

  const currentTasks = mode === "WEEKLY" ? prevWeekTasks : prevMonthTasks;
  const currentCompleted = mode === "WEEKLY" ? completedWeekTasks : completedMonthTasks;
  const currentRate = mode === "WEEKLY" ? weekCompletionRate : monthCompletionRate;
  const currentHabitRate = mode === "WEEKLY" ? weekHabitStats.rate : monthHabitStats.rate;
  const currentCategories = mode === "WEEKLY" ? weekCategoryCounts : monthCategoryCounts;

  const handleDismissAndSave = () => {
    try {
      const currentWeekKey = getWeekKey(today);
      const currentMonthKey = today.slice(0, 7);
      const clientToday = new Date().toISOString().split("T")[0];

      // Mark both weekly and monthly cycles as reviewed, and mark today's date so it never loops
      localStorage.setItem("rooted_last_reviewed_week", currentWeekKey);
      localStorage.setItem("rooted_last_reviewed_month", currentMonthKey);
      localStorage.setItem("rooted_last_reviewed_date", today);
      localStorage.setItem("rooted_last_reviewed_date_client", clientToday);
      try {
        sessionStorage.setItem("rooted_retrospective_dismissed", "true");
      } catch {}
    } catch {
      // ignore
    }
    onClose();
  };

  // Close when pressing Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismissAndSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, today]);

  const handleResetTriggersForTesting = () => {
    try {
      localStorage.removeItem("rooted_last_reviewed_week");
      localStorage.removeItem("rooted_last_reviewed_month");
      localStorage.removeItem("rooted_last_reviewed_date");
      localStorage.removeItem("rooted_last_reviewed_date_client");
      try {
        sessionStorage.removeItem("rooted_retrospective_dismissed");
      } catch {}
      alert("Retrospective triggers reset! Next page reload will automatically prompt the retrospective dialog.");
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDismissAndSave();
        }
      }}
    >
      <div className="relative bg-[#FAF7F0] text-[#1A241E] rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-[#EAE5D8] shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismissAndSave}
          className="absolute top-6 right-6 p-2 rounded-2xl text-[#8E9E94] hover:text-[#1A241E] hover:bg-[#EAE5D8]/50 transition-colors cursor-pointer"
          title="Close review"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Botanical Badge & Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#1E3127] text-[#FAF7F0] flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#7C9A86]">
            Periodic Rhythm Retrospective
          </span>
        </div>

        <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1A241E] mb-4">
          {mode === "WEEKLY" ? "Week in Reflection" : "Seasonal Month in Review"}
        </h3>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-[#EAE5D8] pb-4 mb-6">
          <div className="flex items-center gap-2 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#EAE5D8] shadow-2xs">
            <button
              type="button"
              onClick={() => setMode("WEEKLY")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                mode === "WEEKLY"
                  ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                  : "text-[#586B60] hover:text-[#1A241E]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>🌿 Past Week</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("MONTHLY")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                mode === "MONTHLY"
                  ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                  : "text-[#586B60] hover:text-[#1A241E]"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>🌙 Past Month</span>
            </button>
          </div>

          <div className="text-right text-xs font-medium text-[#586B60]">
            <p className="font-serif font-bold text-sm text-[#1A241E]">
              {mode === "WEEKLY" ? prevWeekRange.weekLabel : prevMonthName}
            </p>
            <p className="text-[10px] text-[#8E9E94]">
              {mode === "WEEKLY" ? "Monday – Sunday Cycle" : "Full Calendar Horizon"}
            </p>
          </div>
        </div>

        {/* Main Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          {/* Card 1: Task Completion Velocity */}
          <div className="bg-[#FFFFFF] border border-[#EAE5D8] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#7C9A86] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E9E94]">
                Task Velocity
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#7C9A86]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-3xl font-bold text-[#1A241E]">
                  {currentRate}%
                </span>
                <span className="text-xs text-[#586B60]">fulfilled</span>
              </div>
              <p className="text-[11px] text-[#586B60] mt-1">
                {currentCompleted.length} of {currentTasks.length} intentions completed
              </p>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-[#FAF7F0] rounded-full h-2 mt-3 overflow-hidden border border-[#EAE5D8]">
              <div
                className="bg-gradient-to-r from-[#7C9A86] to-[#5E7E6B] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(currentRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 2: Habit Consistency */}
          <div className="bg-[#FFFFFF] border border-[#EAE5D8] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#D98A6C] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E9E94]">
                Habit Rhythm
              </span>
              <Flame className="w-4 h-4 text-[#D98A6C]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-3xl font-bold text-[#1A241E]">
                  {currentHabitRate}%
                </span>
                <span className="text-xs text-[#586B60]">consistency</span>
              </div>
              <p className="text-[11px] text-[#586B60] mt-1">
                {mode === "WEEKLY"
                  ? `${weekHabitStats.completedLogs} ritual logs in 7 days`
                  : `${monthHabitStats.completedLogs} total ritual sessions`}
              </p>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-[#FAF7F0] rounded-full h-2 mt-3 overflow-hidden border border-[#EAE5D8]">
              <div
                className="bg-gradient-to-r from-[#D98A6C] to-[#C87452] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(currentHabitRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 3: Horizon Assessment */}
          <div className="bg-[#FAF6EE] border border-[#EADFC7] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#C87452] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E9E94]">
                Rooted Status
              </span>
              <Leaf className="w-4 h-4 text-[#7C9A86]" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-[#1A241E] leading-tight">
                {currentRate >= 80 ? "Flourishing" : currentRate >= 50 ? "Steady Growth" : "Grounding"}
              </p>
              <p className="text-[11px] text-[#586B60] mt-1 leading-relaxed">
                {currentRate >= 80
                  ? "Harmonious execution across tasks & habits."
                  : currentRate >= 50
                  ? "Solid consistency. Core routines held strong."
                  : "Gentle reminder: Rest and reset for the new cycle."}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium text-[#7C9A86] mt-2">
              <Sparkles className="w-3 h-3 text-[#D4A373]" />
              <span>{habits.length} active rituals tracked</span>
            </div>
          </div>
        </div>

        {/* Due Date & Task Audit Strip */}
        <div className="bg-[#FFFFFF] border border-[#EAE5D8] rounded-2xl p-4 mb-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#586B60]" />
              <span className="text-xs font-bold text-[#1A241E] uppercase tracking-wider">
                Due Date & Completion Audit
              </span>
            </div>
            <span className="text-xs text-[#586B60]">
              {mode === "WEEKLY" ? "Week of " + prevWeekRange.weekLabel : prevMonthName}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#FAF7F0] rounded-xl border border-[#EAE5D8]/80 mb-3">
            <div>
              <p className="text-base font-serif font-bold text-[#1E3127]">
                {currentCompleted.length}
              </p>
              <p className="text-[10px] text-[#586B60] font-medium">Completed</p>
            </div>
            <div className="border-x border-[#EAE5D8]">
              <p className="text-base font-serif font-bold text-[#C87452]">
                {currentTasks.length - currentCompleted.length}
              </p>
              <p className="text-[10px] text-[#586B60] font-medium">Deferred / Overdue</p>
            </div>
            <div>
              <p className="text-base font-serif font-bold text-[#1A241E]">
                {currentTasks.length}
              </p>
              <p className="text-[10px] text-[#586B60] font-medium">Total Scheduled</p>
            </div>
          </div>

          {/* Category Distribution Balance */}
          {currentCategories.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E9E94] mb-2">
                Pillar Balance (Completed Intentions)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentCategories.map(([cat, count]) => (
                  <span
                    key={cat}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${getCategoryBadgeClass(cat)}`}
                  >
                    <span>{cat}</span>
                    <span className="px-1.5 py-0.2 bg-white/70 rounded-md text-[10px] font-bold">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#8E9E94] italic text-center py-1">
              No tasks were scheduled during this specific horizon.
            </p>
          )}
        </div>

        {/* Expandable Task Detail Accordion */}
        <div className="border border-[#EAE5D8] rounded-2xl bg-[#FFFFFF] overflow-hidden mb-6">
          <button
            type="button"
            onClick={() => setShowTaskList(!showTaskList)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-[#1A241E] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#7C9A86]" />
              <span>Inspect Detailed Intentions List ({currentTasks.length} items)</span>
            </div>
            {showTaskList ? (
              <ChevronUp className="w-4 h-4 text-[#8E9E94]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8E9E94]" />
            )}
          </button>

          {showTaskList && (
            <div className="px-4 pb-4 max-h-56 overflow-y-auto space-y-2 border-t border-[#EAE5D8] pt-3">
              {currentTasks.length > 0 ? (
                currentTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F0] border border-[#EAE5D8]/70 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          t.status === "COMPLETED"
                            ? "bg-[#7C9A86] text-white"
                            : "border border-[#C87452] text-transparent"
                        }`}
                      >
                        {t.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span
                        className={`truncate font-medium ${
                          t.status === "COMPLETED" ? "line-through text-[#8E9E94]" : "text-[#1A241E]"
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold ${getCategoryBadgeClass(t.category)}`}>
                        {t.category}
                      </span>
                      <span className="text-[10px] text-[#8E9E94] font-mono">
                        {t.dueDate || "No Date"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8E9E94] italic text-center py-2">
                  No intentions found for this period.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Mindful Seasonal Synthesis Quote */}
        <div className="p-3.5 rounded-2xl bg-[#F7F4EB] border border-[#EAE5D8] mb-6 flex items-start gap-3">
          <Leaf className="w-4 h-4 text-[#7C9A86] shrink-0 mt-0.5" />
          <p className="text-xs text-[#586B60] italic leading-relaxed">
            &ldquo;Roots grow deepest in quiet persistence. Take this reflection as a seed for your next cycle of intentions.&rdquo;
          </p>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#EAE5D8]">
          {process.env.NODE_ENV === "development" ? (
            <button
              type="button"
              onClick={handleResetTriggersForTesting}
              title="Clears localStorage flags so the retrospective will trigger again on next reload"
              className="text-[11px] text-[#8E9E94] hover:text-[#C87452] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Reset Triggers (Dev Only)
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDismissAndSave}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#1E3127] text-[#FAF7F0] font-semibold text-xs hover:bg-[#2A3F34] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ground Myself & Continue</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
