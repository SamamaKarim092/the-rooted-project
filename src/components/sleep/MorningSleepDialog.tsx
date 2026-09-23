"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { 
  Moon, 
  Sun, 
  Sparkles, 
  X, 
  Check, 
  ChevronUp, 
  ChevronDown,
  Edit3
} from "lucide-react";
import { 
  calculateSleepDuration, 
  evaluateSleepTarget, 
  getTodayString, 
  stepTimeString 
} from "@/lib/utils";
import { logSleep, updateSleepTarget } from "@/lib/actions";

interface MorningSleepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  today?: string;
  initialBedtime?: string;
  initialWakeTime?: string;
  yesterdayBedtime?: string;
  yesterdayWakeTime?: string;
  targetHours?: number;
  onSuccess?: (loggedRecord: any) => void;
}

const QUALITY_OPTIONS = [
  { id: "RESTFUL", label: "Restful & Deep", icon: "🌿", desc: "Woke up energized and refreshed" },
  { id: "BALANCED", label: "Balanced", icon: "✨", desc: "Good steady rest, ready for the day" },
  { id: "RESTLESS", label: "Restless", icon: "⚡", desc: "Woke up multiple times or tossed" },
  { id: "GROGGY", label: "Groggy / Heavy", icon: "😴", desc: "Slow to wake, needing extra time" },
];

export function MorningSleepDialog({
  isOpen,
  onClose,
  today: propToday,
  initialBedtime,
  initialWakeTime,
  yesterdayBedtime,
  yesterdayWakeTime,
  targetHours = 8.0,
  onSuccess,
}: MorningSleepDialogProps) {
  const today = propToday || getTodayString();
  const [date, setDate] = useState<string>(today);

  // Default to yesterday's times if no specific initial time is provided
  const defaultBedtime = initialBedtime || yesterdayBedtime || "11:00 PM";
  const defaultWakeTime = initialWakeTime || yesterdayWakeTime || "07:30 AM";

  const [bedtime, setBedtime] = useState<string>(defaultBedtime);
  const [wakeTime, setWakeTime] = useState<string>(defaultWakeTime);
  const [target, setTarget] = useState<number>(targetHours ?? 8.0);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [quality, setQuality] = useState<string>("RESTFUL");
  const [notes, setNotes] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Synchronize state when the dialog opens or props update
  useEffect(() => {
    if (isOpen) {
      setDate(propToday || getTodayString());
      setBedtime(initialBedtime || yesterdayBedtime || "11:00 PM");
      setWakeTime(initialWakeTime || yesterdayWakeTime || "07:30 AM");
      setTarget(targetHours ?? 8.0);
      setIsEditingTarget(false);
    }
  }, [isOpen, propToday, initialBedtime, initialWakeTime, yesterdayBedtime, yesterdayWakeTime, targetHours]);

  // Stepper handlers using Up & Down arrows (15 min per step, 60 min if Shift key held)
  const handleStepBedtime = (deltaMinutes: number) => {
    setBedtime((prev) => stepTimeString(prev, deltaMinutes));
  };

  const handleStepWakeTime = (deltaMinutes: number) => {
    setWakeTime((prev) => stepTimeString(prev, deltaMinutes));
  };

  // Direct Target update handler
  const handleUpdateTarget = (newTarget: number) => {
    const clamped = Math.max(4.0, Math.min(14.0, Number(newTarget.toFixed(1))));
    setTarget(clamped);
    startTransition(async () => {
      try {
        await updateSleepTarget(clamped);
      } catch (e) {
        console.error("Could not update sleep target:", e);
      }
    });
  };

  // Dynamic Sleep Calculation
  const duration = useMemo(() => {
    return calculateSleepDuration(bedtime, wakeTime);
  }, [bedtime, wakeTime]);

  const targetEval = useMemo(() => {
    return evaluateSleepTarget(duration.durationMinutes, target);
  }, [duration.durationMinutes, target]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem("rooted_sleep_dismissed_date", today);
    } catch {
      // Ignore if localStorage unavailable
    }
    onClose();
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateSleepTarget(target);
        const record = await logSleep({
          date,
          bedtime,
          wakeTime,
          quality,
          notes: notes.trim() || undefined,
        });
        try {
          localStorage.setItem("rooted_sleep_dismissed_date", today);
        } catch {}
        if (onSuccess) onSuccess(record);
        onClose();
      } catch (err) {
        console.error("Error logging sleep:", err);
      }
    });
  };

  // Calculate target bar width percentages (max scale: 12 hours)
  const maxScaleHours = 12;
  const targetPercent = Math.min(100, Math.round((target / maxScaleHours) * 100));
  const actualPercent = Math.min(100, Math.round((duration.hoursDecimal / maxScaleHours) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E3127]/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-hidden">
      <div 
        className="bg-[#FAF7F0] rounded-3xl border border-[#EAE5D8] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="bg-[#1E3127] text-[#FAF7F0] px-6 py-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#2A3F34] flex items-center justify-center text-[#D4A373] shadow-xs shrink-0">
              <Moon className="w-4 h-4 fill-[#D4A373]/20" />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold tracking-tight text-[#FAF7F0] flex items-center gap-2">
                <span>Morning Sleep Check-in</span>
                <Sparkles className="w-3.5 h-3.5 text-[#D98A6C]" />
              </h2>
              <p className="text-[11px] text-[#8FA697] mt-0.5">
                Record your rest to cultivate daily harmony and mental clarity.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8FA697] hover:text-[#FAF7F0] hover:bg-[#2A3F34] transition-colors cursor-pointer"
            title="Remind me later"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body - Scrollbar completely hidden and zero horizontal overflow */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1">
          {/* Target Comparison & Calculation Hero Card */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#586B60] uppercase tracking-wider">
                Calculated Rest Duration
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                targetEval.status === "OPTIMAL"
                  ? "bg-[#EAF0EC] text-[#3B664B] border border-[#7C9A86]/30"
                  : targetEval.status === "OVERSLEPT"
                  ? "bg-[#FDF6ED] text-[#B87A38] border border-[#D4A373]/40"
                  : "bg-[#F9ECE6] text-[#C87452] border border-[#D98A6C]/30"
              }`}>
                {targetEval.diffLabel}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="font-serif text-3xl font-bold text-[#1A241E]">
                  {duration.formattedHours}
                </span>
                <span className="text-xs text-[#8E9E94] truncate">
                  slept ({targetEval.percentage}% of {target.toFixed(1)}h target)
                </span>
              </div>

              {/* Clickable Inline Target Setting */}
              <div className="text-right shrink-0">
                {isEditingTarget ? (
                  <div className="inline-flex items-center gap-1 bg-[#FAF8F2] border-2 border-[#7C9A86] rounded-xl px-2 py-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTarget(target - 0.5);
                      }}
                      className="w-5 h-5 rounded-md bg-white hover:bg-[#1E3127] text-[#1E3127] hover:text-[#FAF7F0] flex items-center justify-center font-bold text-xs border border-[#EAE5D8] transition-colors cursor-pointer"
                      title="Decrease 30 mins"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      min="4"
                      max="14"
                      value={target}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) handleUpdateTarget(val);
                      }}
                      className="w-11 text-center font-serif text-sm font-bold text-[#1E3127] bg-transparent outline-hidden"
                      autoFocus
                    />
                    <span className="text-[11px] font-medium text-[#586B60]">h</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTarget(target + 0.5);
                      }}
                      className="w-5 h-5 rounded-md bg-white hover:bg-[#1E3127] text-[#1E3127] hover:text-[#FAF7F0] flex items-center justify-center font-bold text-xs border border-[#EAE5D8] transition-colors cursor-pointer"
                      title="Increase 30 mins"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingTarget(false)}
                      className="w-5 h-5 rounded-md bg-[#1E3127] text-[#FAF7F0] hover:bg-[#2A3F34] flex items-center justify-center font-bold text-xs transition-colors ml-0.5 cursor-pointer"
                      title="Done"
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingTarget(true)}
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF8F2] hover:bg-[#F2ECE0] border border-[#EAE5D8] hover:border-[#D4A373] text-xs font-medium text-[#586B60] transition-all cursor-pointer shadow-2xs"
                    title="Click to set your sleep target (Default: 8.0h)"
                  >
                    <span>Target:</span>
                    <strong className="text-[#1E3127] font-serif font-bold group-hover:underline">
                      {target.toFixed(1)}h
                    </strong>
                    <Edit3 className="w-3 h-3 text-[#D4A373] opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>

            {/* Visual Sleep Bar vs Target Marker */}
            <div className="space-y-1 pt-1">
              <div className="relative w-full h-3 bg-[#EFEAE0] rounded-full overflow-hidden">
                {/* Actual Sleep Bar */}
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    targetEval.status === "OPTIMAL"
                      ? "bg-gradient-to-r from-[#7C9A86] to-[#5F7E6A]"
                      : targetEval.status === "OVERSLEPT"
                      ? "bg-gradient-to-r from-[#7C9A86] via-[#D4A373] to-[#C87452]"
                      : "bg-gradient-to-r from-[#D98A6C] to-[#C87452]"
                  }`}
                  style={{ width: `${actualPercent}%` }}
                />
                {/* Target Marker Line */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-[#1E3127] shadow-xs z-10 transition-all duration-300"
                  style={{ left: `${targetPercent}%` }}
                  title={`Target: ${target.toFixed(1)}h`}
                />
              </div>

              {/* Progress scale labels */}
              <div className="flex items-center justify-between text-[10px] text-[#8E9E94] px-0.5">
                <span>0h</span>
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(true)}
                  className="font-semibold text-[#1E3127] hover:text-[#D4A373] hover:underline cursor-pointer transition-colors"
                  title="Click to set your sleep target"
                >
                  🎯 Target: {target.toFixed(1)}h
                </button>
                <span>12h+</span>
              </div>
            </div>
          </div>

          {/* Minimal Time Entry Section with Left-Aligned Time & Right-Hand Up/Down Arrows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Bedtime Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-semibold text-[#1A241E] flex items-center gap-1.5 min-w-0">
                  <Moon className="w-3.5 h-3.5 text-[#7C9A86] shrink-0" />
                  <span className="truncate">Went to Sleep (Bedtime)</span>
                </label>
                {yesterdayBedtime && (
                  <button
                    type="button"
                    onClick={() => setBedtime(yesterdayBedtime)}
                    className="text-[10px] text-[#8E9E94] hover:text-[#1E3127] bg-[#FAF8F2] hover:bg-[#EFEAE0] px-1.5 py-0.5 rounded-md border border-[#EAE5D8] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    title="Click to reset to yesterday's bedtime"
                  >
                    <span>Yesterday:</span>
                    <strong className="text-[#586B60]">{yesterdayBedtime}</strong>
                  </button>
                )}
              </div>

              {/* Left-Aligned Time Input with Up/Down Stepper on Right */}
              <div className="relative flex items-center justify-between bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-[#7C9A86] focus-within:border-[#7C9A86] transition-all shadow-2xs">
                <input
                  type="text"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      handleStepBedtime(e.shiftKey ? 60 : 15);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      handleStepBedtime(e.shiftKey ? -60 : -15);
                    }
                  }}
                  placeholder="11:00 PM"
                  className="w-full bg-transparent font-serif text-2xl md:text-3xl font-bold text-[#1A241E] text-left outline-hidden tracking-tight min-w-0 pr-2"
                />

                {/* Right-hand side Up & Down Arrow icons/buttons */}
                <div className="flex flex-col items-center gap-0.5 shrink-0 pl-2 border-l border-[#EAE5D8]">
                  <button
                    type="button"
                    onClick={() => handleStepBedtime(15)}
                    className="w-6 h-4.5 rounded-sm hover:bg-[#1E3127] text-[#8E9E94] hover:text-[#FAF7F0] flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                    title="Advance 15 mins (or press keyboard ↑)"
                    aria-label="Advance bedtime by 15 minutes"
                  >
                    <ChevronUp className="w-4 h-4 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepBedtime(-15)}
                    className="w-6 h-4.5 rounded-sm hover:bg-[#1E3127] text-[#8E9E94] hover:text-[#FAF7F0] flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                    title="Rewind 15 mins (or press keyboard ↓)"
                    aria-label="Rewind bedtime by 15 minutes"
                  >
                    <ChevronDown className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#8E9E94] px-0.5">
                <span>Click arrows or press ↑ / ↓</span>
                <span>±15m</span>
              </div>
            </div>

            {/* Wake Time Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-semibold text-[#1A241E] flex items-center gap-1.5 min-w-0">
                  <Sun className="w-3.5 h-3.5 text-[#D98A6C] shrink-0" />
                  <span className="truncate">Woke Up (Wake Time)</span>
                </label>
                {yesterdayWakeTime && (
                  <button
                    type="button"
                    onClick={() => setWakeTime(yesterdayWakeTime)}
                    className="text-[10px] text-[#8E9E94] hover:text-[#1E3127] bg-[#FAF8F2] hover:bg-[#EFEAE0] px-1.5 py-0.5 rounded-md border border-[#EAE5D8] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    title="Click to reset to yesterday's wake time"
                  >
                    <span>Yesterday:</span>
                    <strong className="text-[#586B60]">{yesterdayWakeTime}</strong>
                  </button>
                )}
              </div>

              {/* Left-Aligned Time Input with Up/Down Stepper on Right */}
              <div className="relative flex items-center justify-between bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-[#7C9A86] focus-within:border-[#7C9A86] transition-all shadow-2xs">
                <input
                  type="text"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      handleStepWakeTime(e.shiftKey ? 60 : 15);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      handleStepWakeTime(e.shiftKey ? -60 : -15);
                    }
                  }}
                  placeholder="07:30 AM"
                  className="w-full bg-transparent font-serif text-2xl md:text-3xl font-bold text-[#1A241E] text-left outline-hidden tracking-tight min-w-0 pr-2"
                />

                {/* Right-hand side Up & Down Arrow icons/buttons */}
                <div className="flex flex-col items-center gap-0.5 shrink-0 pl-2 border-l border-[#EAE5D8]">
                  <button
                    type="button"
                    onClick={() => handleStepWakeTime(15)}
                    className="w-6 h-4.5 rounded-sm hover:bg-[#1E3127] text-[#8E9E94] hover:text-[#FAF7F0] flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                    title="Advance 15 mins (or press keyboard ↑)"
                    aria-label="Advance wake time by 15 minutes"
                  >
                    <ChevronUp className="w-4 h-4 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepWakeTime(-15)}
                    className="w-6 h-4.5 rounded-sm hover:bg-[#1E3127] text-[#8E9E94] hover:text-[#FAF7F0] flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                    title="Rewind 15 mins (or press keyboard ↓)"
                    aria-label="Rewind wake time by 15 minutes"
                  >
                    <ChevronDown className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#8E9E94] px-0.5">
                <span>Click arrows or press ↑ / ↓</span>
                <span>±15m</span>
              </div>
            </div>
          </div>

          {/* Rest Quality */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1A241E] block">
              How Restful Did You Feel?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUALITY_OPTIONS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuality(q.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    quality === q.id
                      ? "bg-[#1E3127] border-[#1E3127] text-[#FAF7F0] shadow-xs"
                      : "bg-[#FFFFFF] border-[#EAE5D8] text-[#1A241E] hover:bg-[#F5EFE6]"
                  }`}
                >
                  <span className="text-lg">{q.icon}</span>
                  <span className="text-xs font-semibold mt-1 leading-tight">{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Reflection Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#586B60] block">
              Rest Note / Factors (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Chamomile tea, screen-free evening, slept with open window"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EAE5D8] text-xs text-[#1A241E] focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]"
            />
          </div>
        </div>

        {/* Footer Actions - Clean and flush, no scrollbar above */}
        <div className="px-6 py-3.5 bg-[#F2EDE2] border-t border-[#EAE5D8] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#586B60] hover:text-[#1A241E] transition-colors cursor-pointer"
          >
            Remind Me Later
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E3127] hover:bg-[#2A3F34] text-[#FAF7F0] text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <span>Saving Rest...</span>
            ) : (
              <>
                <Check className="w-4 h-4 text-[#7C9A86]" />
                <span>Save Rest Record</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
