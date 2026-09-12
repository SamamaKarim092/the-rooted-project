"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Flame, 
  Trophy, 
  Lightbulb, 
  CheckCircle2, 
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Check,
  Clock
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
  status: string;
  category: string;
  dueDate: string | null;
}

interface GrowthClientProps {
  habits: Habit[];
  tasks: Task[];
  today: string;
}

type PeriodFilter = "SEP_2026" | "AUG_2026" | "ALL_TIME";

export function GrowthClient({ habits, tasks, today }: GrowthClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("SEP_2026");

  const getFilteredData = () => {
    if (selectedPeriod === "AUG_2026") {
      const monthPrefix = "2026-08";
      const periodTasks = tasks.filter((t) => t.dueDate && t.dueDate.startsWith(monthPrefix));
      const periodHabits = habits.map((h) => ({
        ...h,
        logs: h.logs.filter((l) => l.date.startsWith(monthPrefix)),
      }));
      return {
        label: "August 2026 (Full Month)",
        sublabel: "Historical review of August consistency and task milestones",
        prefix: monthPrefix,
        tasks: periodTasks,
        habits: periodHabits,
        harmonyScore: 82,
        trend: "+5% vs July baseline",
      };
    } else if (selectedPeriod === "SEP_2026") {
      const monthPrefix = "2026-09";
      const periodTasks = tasks.filter((t) => t.dueDate && t.dueDate.startsWith(monthPrefix));
      const periodHabits = habits.map((h) => ({
        ...h,
        logs: h.logs.filter((l) => l.date.startsWith(monthPrefix)),
      }));
      return {
        label: "September 2026 (Current Season)",
        sublabel: "Active trajectory and sprint consistency for September",
        prefix: monthPrefix,
        tasks: periodTasks,
        habits: periodHabits,
        harmonyScore: 91,
        trend: "+9% improvement over August",
      };
    } else {
      return {
        label: "Rolling 60 Days",
        sublabel: "Aggregate view covering August and September rhythms",
        prefix: "",
        tasks,
        habits,
        harmonyScore: 86,
        trend: "Strong positive momentum",
      };
    }
  };

  const currentData = getFilteredData();

  // Calculate habit stats for the active period
  const habitStats = currentData.habits.map((h) => {
    const completedCount = h.logs.filter((l) => l.completed).length;
    const totalLogged = h.logs.length || 1;
    const rate = Math.min(Math.round((completedCount / totalLogged) * 100), 100);
    return {
      id: h.id,
      title: h.title,
      category: h.category,
      rate,
      completedCount,
    };
  }).sort((a, b) => b.rate - a.rate);

  const completedTasks = currentData.tasks.filter((t) => t.status === "COMPLETED").length;
  const totalHabitCompletions = currentData.habits.reduce(
    (acc, h) => acc + h.logs.filter((l) => l.completed).length,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header & Period Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
            Growth & Monthly Patterns
          </h2>
          <p className="text-sm text-[#586B60] mt-1 font-sans">
            Review your progress month by month, understand your consistency, and track improvement over time.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#EAE5D8] shadow-2xs self-start md:self-auto">
          <button
            onClick={() => setSelectedPeriod("SEP_2026")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedPeriod === "SEP_2026"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                : "text-[#586B60] hover:text-[#1A241E]"
            }`}
          >
            September 2026
          </button>
          <button
            onClick={() => setSelectedPeriod("AUG_2026")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedPeriod === "AUG_2026"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                : "text-[#586B60] hover:text-[#1A241E]"
            }`}
          >
            August 2026
          </button>
          <button
            onClick={() => setSelectedPeriod("ALL_TIME")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedPeriod === "ALL_TIME"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                : "text-[#586B60] hover:text-[#1A241E]"
            }`}
          >
            Rolling 60 Days
          </button>
        </div>
      </div>

      {/* Period Banner */}
      <div className="p-5 rounded-3xl bg-[#FAF7F0] border border-[#EAE5D8] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFEAE0] flex items-center justify-center text-[#7C9A86]">
            <Calendar className="w-5 h-5 text-[#D98A6C]" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1A241E]">
              {currentData.label}
            </h3>
            <p className="text-xs text-[#586B60]">
              {currentData.sublabel}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EFEAE0] text-[#1A241E]">
          {currentData.trend}
        </span>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-7 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
          <div className="flex items-center justify-between text-[#7C9A86] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60]">
              Consistency Score
            </span>
            <TrendingUp className="w-5 h-5 text-[#7C9A86]" />
          </div>
          <div className="font-serif text-4xl font-bold text-[#1A241E]">
            {currentData.harmonyScore}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#586B60] mt-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#7C9A86]" />
            <span className="text-[#5F7E6A] font-semibold">{currentData.trend}</span>
          </div>
        </div>

        <div className="p-7 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
          <div className="flex items-center justify-between text-[#D98A6C] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60]">
              Tasks Completed
            </span>
            <CheckCircle2 className="w-5 h-5 text-[#D98A6C]" />
          </div>
          <div className="font-serif text-4xl font-bold text-[#1A241E]">
            {completedTasks} / {currentData.tasks.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#586B60] mt-2">
            <span>
              {currentData.tasks.length > 0
                ? `${Math.round((completedTasks / currentData.tasks.length) * 100)}% task completion rate`
                : "No tasks in this period"}
            </span>
          </div>
        </div>

        <div className="p-7 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs">
          <div className="flex items-center justify-between text-[#D4A373] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60]">
              Habit Check-Ins
            </span>
            <ShieldCheck className="w-5 h-5 text-[#D4A373]" />
          </div>
          <div className="font-serif text-4xl font-bold text-[#1A241E]">
            {totalHabitCompletions}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#586B60] mt-2">
            <span>Logged across 6 foundational habits</span>
          </div>
        </div>
      </div>

      {/* Month-over-Month Growth Trajectory Card */}
      <div className="bg-[#1E3127] text-[#FAF7F0] rounded-3xl p-7 md:p-8 border border-[#2D4336] shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <Lightbulb className="w-5 h-5 text-[#D4A373]" />
          <h3 className="font-serif text-2xl font-semibold tracking-tight text-[#FAF7F0]">
            Month-Over-Month Pattern Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#24372D] border border-[#354D40]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4A373] block mb-1">
              Trajectory Shift
            </span>
            <h4 className="font-serif text-lg font-semibold text-[#FAF7F0]">
              August (82%) → September (91%)
            </h4>
            <p className="text-xs text-[#8FA697] mt-1.5 leading-relaxed">
              Your overall rhythm grew by 9% entering September. The primary driver was cementing Morning Deep Work as an unbreakable morning anchor.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#24372D] border border-[#354D40]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D98A6C] block mb-1">
              August Lessons
            </span>
            <h4 className="font-serif text-lg font-semibold text-[#FAF7F0]">
              Physical Movement Resilience
            </h4>
            <p className="text-xs text-[#8FA697] mt-1.5 leading-relaxed">
              In August, Movement was your most missed habit (68%). In September, moving sessions to earlier in the day lifted completion to 80%.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#24372D] border border-[#354D40]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C9A86] block mb-1">
              Task Velocity
            </span>
            <h4 className="font-serif text-lg font-semibold text-[#FAF7F0]">
              88% Execution on High Priority
            </h4>
            <p className="text-xs text-[#8FA697] mt-1.5 leading-relaxed">
              Both August and September demonstrated near-flawless completion on Urgent and High-priority daily intentions.
            </p>
          </div>
        </div>
      </div>

      {/* Habit Consistency Ranking for Selected Period */}
      <div className="bg-[#FFFFFF] rounded-3xl p-7 md:p-8 border border-[#EAE5D8] shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-2xl font-semibold text-[#1A241E]">
            Habit Consistency Leaderboard ({currentData.label})
          </h3>
          <span className="text-xs text-[#586B60]">
            Ranked by completion rate
          </span>
        </div>

        <div className="space-y-4">
          {habitStats.map((habit) => (
            <div key={habit.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#1A241E]">{habit.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF8F2] text-[#586B60] border border-[#EAE5D8]">
                    {habit.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#586B60]">
                    {habit.completedCount} check-ins
                  </span>
                  <span className="font-serif font-bold text-[#1A241E]">
                    {habit.rate}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-[#FAF8F2] rounded-full overflow-hidden border border-[#EAE5D8]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    habit.rate >= 80 ? "bg-[#7C9A86]" : habit.rate >= 60 ? "bg-[#D4A373]" : "bg-[#D98A6C]"
                  }`}
                  style={{ width: `${habit.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
