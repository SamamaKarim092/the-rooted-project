"use client";

import { useState, useEffect } from "react";
import { DailyIntentionsCard } from "./DailyIntentionsCard";
import { TodayRitualsCard } from "./TodayRitualsCard";
import { LongTermVisionCard } from "./LongTermVisionCard";
import { SleepClockCard } from "./SleepClockCard";
import { PeriodicReviewModal } from "./PeriodicReviewModal";
import { MorningSleepDialog } from "@/components/sleep/MorningSleepDialog";
import { getWeekKey } from "@/lib/utils";

interface DashboardMainViewProps {
  data: {
    today: string;
    tasks: any[];
    allTasks: any[];
    habits: any[];
    habitMatrix: any[];
    activeGoals?: any[];
    activeGoal: any;
    metrics: {
      harmonyScore: number;
      rootedDays: number;
      completedIntentions: number;
      totalIntentions: number;
    };
    weeklyFlow: any[];
    sleep?: {
      targetHours: number;
      todayLog: any | null;
      allLogs: any[];
    };
  };
}

// In-memory guard to prevent repeated prompts in the same session
let sessionRetrospectiveDismissed = false;

export function DashboardMainView({ data }: DashboardMainViewProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewMode, setReviewMode] = useState<"WEEKLY" | "MONTHLY">("WEEKLY");

  // Sleep Dialog State
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepDateToEdit, setSleepDateToEdit] = useState<string | undefined>(undefined);

  // Automatic Morning Sleep Check-in Detection & Periodic Retrospective Detection
  useEffect(() => {
    try {
      // 1. Morning Sleep Check-in Auto-Popup
      // If no sleep log exists for today, and user hasn't dismissed it today:
      const dismissedSleepDate = localStorage.getItem("rooted_sleep_dismissed_date");
      const hasTodaySleep = Boolean(data.sleep?.todayLog);

      if (!hasTodaySleep && dismissedSleepDate !== data.today) {
        setShowSleepModal(true);
        return; // Prioritize morning sleep check-in
      }

      // Guard 1: In-memory session dismissal
      if (sessionRetrospectiveDismissed) {
        return;
      }

      // Guard 2: Session storage dismissal
      try {
        if (sessionStorage.getItem("rooted_retrospective_dismissed") === "true") {
          return;
        }
      } catch {}

      // 2. Periodic Review Detection (if sleep already settled)
      const currentWeekKey = getWeekKey(data.today);
      const currentMonthKey = data.today.slice(0, 7);
      const lastReviewedWeek = localStorage.getItem("rooted_last_reviewed_week");
      const lastReviewedMonth = localStorage.getItem("rooted_last_reviewed_month");
      const lastReviewedDate = localStorage.getItem("rooted_last_reviewed_date");
      const clientToday = new Date().toISOString().split("T")[0];
      const lastReviewedClientDate = localStorage.getItem("rooted_last_reviewed_date_client");

      // Guard 3: If reviewed or dismissed today, never auto-prompt again today
      if (lastReviewedDate === data.today || lastReviewedClientDate === clientToday) {
        return;
      }

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
  }, [data.today, data.sleep?.todayLog]);

  const targetHours = data.sleep?.targetHours ?? 8.0;

  // Calculate yesterday's date & log for reference
  const yesterdayDateStr = (() => {
    const dObj = new Date(data.today + "T00:00:00");
    dObj.setDate(dObj.getDate() - 1);
    return dObj.toISOString().split("T")[0];
  })();

  const yesterdayLog =
    data.sleep?.allLogs?.find((l: any) => l.date === yesterdayDateStr) ||
    data.sleep?.allLogs?.find((l: any) => l.date < data.today) ||
    null;

  return (
    <div className="space-y-7 w-full">
      {/* 2x2 Canonical Dashboard Grid matching design concept 7 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-7 w-full">
        {/* Top-Left: Daily Intentions (Dark Forest Green #1E3127) */}
        <div className="min-h-[380px] w-full">
          <DailyIntentionsCard tasks={data.tasks} />
        </div>

        {/* Top-Right: Today's Rituals (Off-White #FFFFFF) */}
        <div className="min-h-[380px] w-full">
          <TodayRitualsCard habits={data.habits} today={data.today} />
        </div>

        {/* Bottom-Left: Long-Term Vision (Dark Forest Green #1E3127) */}
        <div className="min-h-[320px] w-full">
          <LongTermVisionCard
            goal={data.activeGoal}
            goals={data.activeGoals || (data.activeGoal ? [data.activeGoal] : [])}
          />
        </div>

        {/* Bottom-Right: Rest Sanctuary Clock (Off-White #FFFFFF) */}
        <div className="min-h-[320px] w-full">
          <SleepClockCard
            todayLog={data.sleep?.todayLog ?? null}
            targetHours={targetHours}
            yesterdayLog={yesterdayLog}
            onOpenSleepDialog={(dateToEdit) => {
              setSleepDateToEdit(dateToEdit || data.today);
              setShowSleepModal(true);
            }}
          />
        </div>
      </div>

      {/* Periodic Weekly & Monthly Retrospective Dialog */}
      <PeriodicReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          sessionRetrospectiveDismissed = true;
          try {
            const currentWeekKey = getWeekKey(data.today);
            const currentMonthKey = data.today.slice(0, 7);
            const clientToday = new Date().toISOString().split("T")[0];
            localStorage.setItem("rooted_last_reviewed_week", currentWeekKey);
            localStorage.setItem("rooted_last_reviewed_month", currentMonthKey);
            localStorage.setItem("rooted_last_reviewed_date", data.today);
            localStorage.setItem("rooted_last_reviewed_date_client", clientToday);
            try {
              sessionStorage.setItem("rooted_retrospective_dismissed", "true");
            } catch {}
          } catch {}
        }}
        today={data.today}
        allTasks={data.allTasks}
        habits={data.habits}
        activeGoal={data.activeGoal}
        initialMode={reviewMode}
      />

      {/* Morning Sleep Check-in Modal */}
      {(() => {
        const activeCheckinDate = sleepDateToEdit || data.today;
        const dObj = new Date(activeCheckinDate + "T00:00:00");
        dObj.setDate(dObj.getDate() - 1);
        const checkinYesterdayDate = dObj.toISOString().split("T")[0];

        const refYesterdayLog =
          data.sleep?.allLogs?.find((l: any) => l.date === checkinYesterdayDate) ||
          data.sleep?.allLogs?.find((l: any) => l.date < activeCheckinDate);

        const yesterdayBedtime = refYesterdayLog?.bedtime || "11:00 PM";
        const yesterdayWakeTime = refYesterdayLog?.wakeTime || "07:30 AM";

        const existingDateLog =
          sleepDateToEdit && sleepDateToEdit !== data.today
            ? data.sleep?.allLogs?.find((l: any) => l.date === sleepDateToEdit)
            : data.sleep?.todayLog;

        const initialBedtime = existingDateLog?.bedtime || yesterdayBedtime;
        const initialWakeTime = existingDateLog?.wakeTime || yesterdayWakeTime;

        return (
          <MorningSleepDialog
            isOpen={showSleepModal}
            onClose={() => {
              setShowSleepModal(false);
              setSleepDateToEdit(undefined);
            }}
            today={activeCheckinDate}
            initialBedtime={initialBedtime}
            initialWakeTime={initialWakeTime}
            yesterdayBedtime={yesterdayBedtime}
            yesterdayWakeTime={yesterdayWakeTime}
            targetHours={targetHours}
          />
        );
      })()}
    </div>
  );
}
