"use client";

import { useState, useEffect } from "react";
import { BookOpen, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { DailyIntentionsCard } from "./DailyIntentionsCard";
import { HabitGrowthMatrix } from "./HabitGrowthMatrix";
import { LongTermVisionCard } from "./LongTermVisionCard";
import { WeeklyFlowCard } from "./WeeklyFlowCard";
import { DashboardTaskOverview } from "./DashboardTaskOverview";
import { PeriodicReviewModal } from "./PeriodicReviewModal";
import { getWeekKey } from "@/lib/utils";

interface DashboardMainViewProps {
  data: {
    today: string;
    tasks: any[];
    allTasks: any[];
    habits: any[];
    habitMatrix: any[];
    activeGoal: any;
    metrics: {
      harmonyScore: number;
      rootedDays: number;
      completedIntentions: number;
      totalIntentions: number;
    };
    weeklyFlow: any[];
  };
}

export function DashboardMainView({ data }: DashboardMainViewProps) {
  const [activeTab, setActiveTab] = useState<"JOURNAL" | "TASK">("JOURNAL");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewMode, setReviewMode] = useState<"WEEKLY" | "MONTHLY">("WEEKLY");

  // Automatic periodic retrospective detection on session open
  useEffect(() => {
    try {
      const currentWeekKey = getWeekKey(data.today);
      const currentMonthKey = data.today.slice(0, 7);
      const lastReviewedWeek = localStorage.getItem("rooted_last_reviewed_week");
      const lastReviewedMonth = localStorage.getItem("rooted_last_reviewed_month");

      // Check if entering a new month (e.g. 1st - 5th of month)
      const dayOfMonth = parseInt(data.today.split("-")[2], 10);
      if (dayOfMonth <= 5 && lastReviewedMonth !== currentMonthKey) {
        setReviewMode("MONTHLY");
        setShowReviewModal(true);
        return;
      }

      // Check if entering a new week (e.g. Monday or first time opened in week)
      if (lastReviewedWeek !== currentWeekKey) {
        setReviewMode("WEEKLY");
        setShowReviewModal(true);
        return;
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, [data.today]);

  return (
    <div className="space-y-7">
      {/* Dashboard View Tab Switcher & Retrospective Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5D8] pb-4">
        <div className="flex items-center gap-2 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#EAE5D8] shadow-2xs">
          <button
            onClick={() => setActiveTab("JOURNAL")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === "JOURNAL"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                : "text-[#586B60] hover:text-[#1A241E]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Journal</span>
          </button>

          <button
            onClick={() => setActiveTab("TASK")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === "TASK"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                : "text-[#586B60] hover:text-[#1A241E]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Task</span>
          </button>
        </div>

        {/* Right side: Manual Retrospective Trigger & View Label */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setReviewMode("WEEKLY");
              setShowReviewModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF6EE] border border-[#EADFC7] text-[#C87452] hover:bg-[#F2E7D5] hover:text-[#1E3127] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Open Weekly & Monthly Retrospective Analysis"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Rhythm Review</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs text-[#586B60]">
            <span>
              {activeTab === "JOURNAL"
                ? "Daily Intentions & Habit Flow"
                : "Weekly & Monthly Task Tracking"}
            </span>
          </div>
        </div>
      </div>

      {/* VIEW 1: JOURNAL (CANONICAL DESIGN CONCEPT 6 GRID) */}
      {activeTab === "JOURNAL" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {/* Top-Left: Daily Intentions (Dark Forest Green) */}
          <div className="min-h-[380px]">
            <DailyIntentionsCard tasks={data.tasks} />
          </div>

          {/* Top-Right: Habit Growth (Light Cream) */}
          <div className="min-h-[380px]">
            <HabitGrowthMatrix habits={data.habitMatrix} />
          </div>

          {/* Bottom-Left: Long-Term Vision (Dark Forest Green) */}
          <div className="min-h-[300px]">
            <LongTermVisionCard goal={data.activeGoal} />
          </div>

          {/* Bottom-Right: Weekly Flow (Light Cream) */}
          <div className="min-h-[300px]">
            <WeeklyFlowCard
              weeklyFlow={data.weeklyFlow}
              harmonyGauge={data.metrics.harmonyScore}
            />
          </div>
        </div>
      ) : (
        /* VIEW 2: TASK (WEEKLY & MONTHLY TASK OVERVIEW) */
        <DashboardTaskOverview allTasks={data.allTasks} today={data.today} />
      )}

      {/* Periodic Weekly & Monthly Retrospective Dialog */}
      <PeriodicReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        today={data.today}
        allTasks={data.allTasks}
        habits={data.habits}
        activeGoal={data.activeGoal}
        initialMode={reviewMode}
      />
    </div>
  );
}
