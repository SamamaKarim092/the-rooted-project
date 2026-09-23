"use client";

import { useState, useMemo, useTransition } from "react";
import { 
  Moon, 
  Sun, 
  Sparkles, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Award, 
  Plus, 
  Edit3, 
  Sliders, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { 
  getTodayString, 
  formatShortDate, 
  getWeekRange, 
  formatMonthName, 
  evaluateSleepTarget, 
  calculateSleepDuration 
} from "@/lib/utils";
import { updateSleepTarget } from "@/lib/actions";

export interface SleepRecord {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes: number;
  quality: string | null;
  notes: string | null;
  createdAt?: string | Date;
}

interface SleepRhythmOverviewProps {
  today: string;
  initialTargetHours: number;
  todayLog: SleepRecord | null;
  allLogs: SleepRecord[];
  onOpenCheckIn: (dateToEdit?: string) => void;
}

export function SleepRhythmOverview({
  today,
  initialTargetHours = 8.0,
  todayLog,
  allLogs,
  onOpenCheckIn,
}: SleepRhythmOverviewProps) {
  const [targetHours, setTargetHours] = useState<number>(initialTargetHours);
  const [selectedMonth, setSelectedMonth] = useState<string>(today.slice(0, 7)); // "YYYY-MM"
  const [isPendingTarget, startTargetTransition] = useTransition();

  // Target update handler
  const handleTargetChange = (delta: number) => {
    const newTarget = Math.max(5.0, Math.min(12.0, Math.round((targetHours + delta) * 10) / 10));
    setTargetHours(newTarget);
    startTargetTransition(async () => {
      try {
        await updateSleepTarget(newTarget);
      } catch (err) {
        console.error("Failed to update sleep target:", err);
      }
    });
  };

  // 1. TODAY'S EVALUATION
  const todayEval = useMemo(() => {
    if (!todayLog) return null;
    return evaluateSleepTarget(todayLog.durationMinutes, targetHours);
  }, [todayLog, targetHours]);

  // 2. THIS WEEK'S SLEEP (Monday to Sunday window)
  const weekRange = useMemo(() => getWeekRange(today), [today]);
  
  const weekDaysData = useMemo(() => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return weekRange.weekDays.map((dateStr, idx) => {
      const log = allLogs.find((l) => l.date === dateStr);
      const isToday = dateStr === today;
      const durationHours = log ? log.durationMinutes / 60 : 0;
      const targetEval = log ? evaluateSleepTarget(log.durationMinutes, targetHours) : null;

      return {
        dayLabel: dayNames[idx],
        date: dateStr,
        isToday,
        log,
        durationHours,
        targetEval,
      };
    });
  }, [weekRange.weekDays, allLogs, today, targetHours]);

  // Weekly aggregate metrics
  const weeklyLoggedDays = weekDaysData.filter((d) => d.log !== undefined);
  const weeklyTotalMinutes = weeklyLoggedDays.reduce((acc, d) => acc + (d.log?.durationMinutes || 0), 0);
  const weeklyAvgMinutes = weeklyLoggedDays.length > 0 ? Math.round(weeklyTotalMinutes / weeklyLoggedDays.length) : 0;
  const weeklyAvgHours = (weeklyAvgMinutes / 60).toFixed(1);
  const weeklyTargetAdherence = weeklyLoggedDays.length > 0 
    ? Math.round((weeklyLoggedDays.filter((d) => d.targetEval?.status === "OPTIMAL" || (d.targetEval?.differenceMinutes || 0) >= 0).length / weeklyLoggedDays.length) * 100)
    : 0;
  const weeklyNetDiffMinutes = weeklyLoggedDays.reduce((acc, d) => acc + (d.targetEval?.differenceMinutes || 0), 0);

  // 3. MONTHLY HORIZON DATA
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    monthsSet.add(today.slice(0, 7));
    allLogs.forEach((l) => monthsSet.add(l.date.slice(0, 7)));
    return Array.from(monthsSet).sort().reverse();
  }, [today, allLogs]);

  const monthLogs = useMemo(() => {
    return allLogs.filter((l) => l.date.startsWith(selectedMonth));
  }, [allLogs, selectedMonth]);

  const monthlyTotalMinutes = monthLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const monthlyAvgMinutes = monthLogs.length > 0 ? Math.round(monthlyTotalMinutes / monthLogs.length) : 0;
  const monthlyAvgHours = (monthlyAvgMinutes / 60).toFixed(1);
  const monthlyTargetAdherence = monthLogs.length > 0
    ? Math.round((monthLogs.filter((l) => evaluateSleepTarget(l.durationMinutes, targetHours).status === "OPTIMAL" || evaluateSleepTarget(l.durationMinutes, targetHours).differenceMinutes >= 0).length / monthLogs.length) * 100)
    : 0;

  const qualityIcons: Record<string, string> = {
    RESTFUL: "🌿",
    BALANCED: "✨",
    RESTLESS: "⚡",
    GROGGY: "😴",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header & Quick Log Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-3xl border border-[#EAE5D8] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1E3127] text-[#D4A373] flex items-center justify-center shadow-xs">
            <Moon className="w-6 h-6 fill-[#D4A373]/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-2xl font-bold text-[#1A241E]">
                Rest Sanctuary & Sleep Rhythms
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF0EC] text-[#3B664B] border border-[#7C9A86]/30">
                Pillar: Body & Mind
              </span>
            </div>
            <p className="text-xs text-[#586B60] mt-1">
              Balanced sleep is the foundation of energy, focus, and intentional living.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenCheckIn()}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1E3127] hover:bg-[#2A3F34] text-[#FAF7F0] text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Moon className="w-4 h-4 text-[#D4A373]" />
          <span>{todayLog ? "Edit Today's Rest" : "Check In Morning Rest"}</span>
        </button>
      </div>

      {/* Tri-Card Overview: Today's Rest | Target Setting | Weekly Consistency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Today's Rest Card */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#586B60] uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-[#D98A6C]" />
                <span>Today's Rest ({formatShortDate(today)})</span>
              </span>
              {todayEval && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  todayEval.status === "OPTIMAL"
                    ? "bg-[#EAF0EC] text-[#3B664B]"
                    : todayEval.status === "OVERSLEPT"
                    ? "bg-[#FDF6ED] text-[#B87A38]"
                    : "bg-[#F9ECE6] text-[#C87452]"
                }`}>
                  {todayEval.diffLabel}
                </span>
              )}
            </div>

            {todayLog ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-[#1A241E]">
                    {Math.floor(todayLog.durationMinutes / 60)}h {todayLog.durationMinutes % 60}m
                  </span>
                  <span className="text-xs text-[#8E9E94]">
                    ({todayEval?.percentage}% of {targetHours}h target)
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#586B60] pt-1 border-t border-[#F0EBE1]">
                  <span>Bed: <strong className="text-[#1A241E]">{todayLog.bedtime}</strong></span>
                  <span>•</span>
                  <span>Wake: <strong className="text-[#1A241E]">{todayLog.wakeTime}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>{qualityIcons[todayLog.quality || "BALANCED"] || "✨"}</span>
                    <span className="capitalize">{todayLog.quality?.toLowerCase() || "Balanced"}</span>
                  </span>
                </div>

                {todayLog.notes && (
                  <p className="text-xs text-[#8E9E94] italic bg-[#FAF8F2] p-2 rounded-xl border border-[#EAE5D8]/70">
                    &ldquo;{todayLog.notes}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <p className="text-xs text-[#8E9E94]">
                  No sleep log recorded for today yet.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenCheckIn()}
                  className="px-4 py-2 rounded-xl bg-[#FAF6EE] hover:bg-[#F2E7D5] text-[#C87452] text-xs font-semibold transition-colors cursor-pointer"
                >
                  + Log Last Night's Sleep
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#F0EBE1] text-[11px] text-[#8E9E94] flex items-center justify-between">
            <span>Target: {targetHours}h 0m</span>
            <span>{todayLog ? "✓ Recorded" : "Pending Check-in"}</span>
          </div>
        </div>

        {/* CARD 2: Target Sleep Customizer */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#586B60] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#7C9A86]" />
                <span>Daily Rest Target</span>
              </span>
              <span className="text-[11px] text-[#7C9A86] font-medium">Configurable</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl font-bold text-[#1A241E]">
                  {targetHours.toFixed(1)} Hours
                </span>
                <span className="text-xs text-[#8E9E94]">
                  {Math.round(targetHours * 60)} minutes / night
                </span>
              </div>

              {/* Adjust Target Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTargetChange(-0.5)}
                  disabled={targetHours <= 5.0 || isPendingTarget}
                  className="flex-1 py-2 rounded-xl bg-[#FAF6EE] hover:bg-[#F0E6D5] text-[#1E3127] text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                  title="Decrease target by 30 mins"
                >
                  - 0.5h
                </button>
                <div className="px-3 py-2 rounded-xl bg-[#1E3127] text-[#FAF7F0] text-xs font-bold text-center min-w-[70px]">
                  {targetHours}h
                </div>
                <button
                  type="button"
                  onClick={() => handleTargetChange(0.5)}
                  disabled={targetHours >= 12.0 || isPendingTarget}
                  className="flex-1 py-2 rounded-xl bg-[#FAF6EE] hover:bg-[#F0E6D5] text-[#1E3127] text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                  title="Increase target by 30 mins"
                >
                  + 0.5h
                </button>
              </div>

              <p className="text-xs text-[#586B60] leading-relaxed">
                Adjusting your target recalibrates your daily sleep deficit and surplus metrics automatically.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0EBE1] text-[11px] text-[#8E9E94] flex items-center justify-between">
            <span>Optimal Range: 7.0h – 9.0h</span>
            <span>{isPendingTarget ? "Saving..." : "Saved to Profile"}</span>
          </div>
        </div>

        {/* CARD 3: Weekly Consistency Score */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#586B60] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>This Week's Velocity</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF0EC] text-[#3B664B]">
                {weeklyTargetAdherence}% Met
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl font-bold text-[#1A241E]">
                  {weeklyAvgHours}h
                </span>
                <span className="text-xs text-[#8E9E94]">
                  nightly average ({weeklyLoggedDays.length} of 7 days)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8]/70 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#586B60]">Net Rest Balance:</span>
                  <span className={`font-semibold ${
                    weeklyNetDiffMinutes >= 0 ? "text-[#3B664B]" : "text-[#C87452]"
                  }`}>
                    {weeklyNetDiffMinutes >= 0 
                      ? `+${Math.floor(weeklyNetDiffMinutes / 60)}h ${Math.abs(weeklyNetDiffMinutes % 60)}m Surplus`
                      : `-${Math.floor(Math.abs(weeklyNetDiffMinutes) / 60)}h ${Math.abs(weeklyNetDiffMinutes % 60)}m Debt`}
                  </span>
                </div>
                <div className="w-full bg-[#EAE5D8] h-1.5 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-[#7C9A86] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, weeklyTargetAdherence)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0EBE1] text-[11px] text-[#8E9E94] flex items-center justify-between">
            <span>Window: {weekRange.startOfWeek} – {weekRange.endOfWeek}</span>
            <span>Steady Flow</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: This Week's 7-Day Sleep Rhythm Wave */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE1] pb-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-[#1A241E] flex items-center gap-2">
              <span>This Week's Rest Rhythm (Monday – Sunday)</span>
              <Sparkles className="w-4 h-4 text-[#D98A6C]" />
            </h4>
            <p className="text-xs text-[#586B60]">
              Visualizing nightly duration against your {targetHours}h baseline target.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#586B60]">
              <span className="w-3 h-3 rounded-md bg-[#7C9A86]" />
              <span>Target Met / Restful</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#586B60]">
              <span className="w-3 h-3 rounded-md bg-[#D4A373]" />
              <span>Overslept</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#586B60]">
              <span className="w-3 h-3 rounded-md bg-[#D98A6C]" />
              <span>Sleep Debt</span>
            </span>
          </div>
        </div>

        {/* 7-Day Bar Chart */}
        <div className="relative pt-6 pb-2">
          {/* Target Line Guide */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-[#1E3127]/30 z-10 flex items-center justify-end pr-2"
            style={{ 
              // Scale max 12 hours
              bottom: `${(targetHours / 12) * 200 + 40}px` 
            }}
          >
            <span className="bg-[#1E3127] text-[#FAF7F0] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              Target: {targetHours}h
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 h-[220px] items-end">
            {weekDaysData.map((d) => {
              const maxScale = 12;
              const barHeightPercent = Math.min(100, Math.max(8, (d.durationHours / maxScale) * 100));

              return (
                <div 
                  key={d.date} 
                  className="flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  onClick={() => onOpenCheckIn(d.date)}
                  title={`${d.date}: ${d.log ? `${d.durationHours.toFixed(1)}h (${d.targetEval?.diffLabel})` : "Click to log rest"}`}
                >
                  {/* Floating tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-[#1E3127] text-[#FAF7F0] text-[11px] font-medium px-2 py-1 rounded-lg shadow-md whitespace-nowrap pointer-events-none z-20">
                    {d.log ? `${d.durationHours.toFixed(1)}h • ${d.targetEval?.diffLabel}` : "Click to log"}
                  </div>

                  {/* Top value badge */}
                  <span className="text-[11px] font-bold text-[#1A241E] mb-1.5">
                    {d.log ? `${d.durationHours.toFixed(1)}h` : "—"}
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[42px] bg-[#EFEAE0] rounded-2xl h-[170px] flex items-end p-1 overflow-hidden transition-all group-hover:ring-2 group-hover:ring-[#7C9A86]/50">
                    {d.log ? (
                      <div 
                        className={`w-full rounded-xl transition-all duration-500 ${
                          d.targetEval?.status === "OPTIMAL"
                            ? "bg-gradient-to-t from-[#5F7E6A] to-[#7C9A86]"
                            : d.targetEval?.status === "OVERSLEPT"
                            ? "bg-gradient-to-t from-[#C87452] via-[#D4A373] to-[#E5A88B]"
                            : "bg-gradient-to-t from-[#C87452] to-[#D98A6C]"
                        }`}
                        style={{ height: `${barHeightPercent}%` }}
                      />
                    ) : (
                      <div className="w-full h-2 rounded-full bg-[#D4DDD6]/40" />
                    )}
                  </div>

                  {/* Day Label */}
                  <div className="mt-2 text-center">
                    <span className={`block text-xs font-bold ${
                      d.isToday ? "text-[#C87452] underline decoration-2 decoration-[#D98A6C]" : "text-[#1A241E]"
                    }`}>
                      {d.dayLabel}
                    </span>
                    <span className="block text-[10px] text-[#8E9E94]">
                      {d.date.slice(8)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: Monthly Sleep Horizon & History Archive */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EBE1] pb-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-[#1A241E] flex items-center gap-2">
              <span>Monthly Sleep Horizon & Retrospectives</span>
              <Calendar className="w-4 h-4 text-[#7C9A86]" />
            </h4>
            <p className="text-xs text-[#586B60]">
              Review multi-week sleep patterns, total restorative hours, and habit consistency.
            </p>
          </div>

          {/* Month Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#586B60]">Season:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] text-xs font-semibold text-[#1A241E] focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86] cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Monthly Scoreboard Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8]">
          <div>
            <span className="text-[11px] text-[#8E9E94] uppercase tracking-wider block">Average Rest</span>
            <span className="font-serif text-xl font-bold text-[#1A241E] mt-0.5 block">
              {monthlyAvgHours}h / night
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#8E9E94] uppercase tracking-wider block">Target Adherence</span>
            <span className="font-serif text-xl font-bold text-[#3B664B] mt-0.5 block">
              {monthlyTargetAdherence}%
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#8E9E94] uppercase tracking-wider block">Total Hours</span>
            <span className="font-serif text-xl font-bold text-[#1A241E] mt-0.5 block">
              {Math.round(monthlyTotalMinutes / 60)} Hours
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#8E9E94] uppercase tracking-wider block">Nights Logged</span>
            <span className="font-serif text-xl font-bold text-[#C87452] mt-0.5 block">
              {monthLogs.length} Nights
            </span>
          </div>
        </div>

        {/* Scrollable Month Log Table */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-2 text-xs font-semibold text-[#586B60]">
            <span>Night / Date</span>
            <span>Sleep & Wake Times</span>
            <span>Duration vs Target</span>
            <span>Action</span>
          </div>

          <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
            {monthLogs.length > 0 ? (
              monthLogs.map((log) => {
                const targetEval = evaluateSleepTarget(log.durationMinutes, targetHours);

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFFFFF] hover:bg-[#FAF8F2] border border-[#EAE5D8] transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {qualityIcons[log.quality || "BALANCED"] || "✨"}
                      </span>
                      <div>
                        <span className="font-semibold text-xs text-[#1A241E] block">
                          {formatShortDate(log.date)}
                        </span>
                        <span className="text-[10px] text-[#8E9E94]">
                          {log.quality?.toLowerCase() || "balanced rest"}
                          {log.notes ? ` • "${log.notes}"` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-[#586B60] hidden sm:block">
                      <span>{log.bedtime}</span>
                      <span className="mx-1 text-[#8E9E94]">→</span>
                      <span>{log.wakeTime}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-bold text-[#1A241E]">
                        {Math.floor(log.durationMinutes / 60)}h {log.durationMinutes % 60}m
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        targetEval.status === "OPTIMAL"
                          ? "bg-[#EAF0EC] text-[#3B664B]"
                          : targetEval.status === "OVERSLEPT"
                          ? "bg-[#FDF6ED] text-[#B87A38]"
                          : "bg-[#F9ECE6] text-[#C87452]"
                      }`}>
                        {targetEval.diffLabel}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenCheckIn(log.date)}
                      className="p-1.5 rounded-xl text-[#8E9E94] hover:text-[#1E3127] hover:bg-[#EFEAE0] transition-colors cursor-pointer"
                      title="Edit this sleep record"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#8E9E94]">
                No sleep records found for {formatMonthName(selectedMonth)}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
