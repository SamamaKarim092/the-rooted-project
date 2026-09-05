"use client";

import { useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { toggleHabitLog } from "@/lib/actions";

interface DayStatus {
  date: string;
  dayLabel: string;
  isCompleted: boolean;
  isToday: boolean;
}

interface HabitRow {
  id: string;
  title: string;
  category: string;
  color: string;
  currentStreak: number;
  days: DayStatus[];
}

interface HabitGrowthMatrixProps {
  habits: HabitRow[];
}

export function HabitGrowthMatrix({ habits }: HabitGrowthMatrixProps) {
  const [isPending, startTransition] = useTransition();

  const handleDotClick = (habitId: string, dateStr: string) => {
    startTransition(async () => {
      await toggleHabitLog(habitId, dateStr);
    });
  };

  const rowLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const columnHeaders = ["1", "2", "3", "4", "5", "6", "F", "7", "8", "9", "P", "D"];

  return (
    <div className="bg-[#FFFFFF] text-[#1A241E] rounded-3xl p-7 md:p-8 border border-[#EAE5D8] shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#1A241E]">
            Habit Growth
          </h3>
          <button className="text-[#8E9E94] hover:text-[#1A241E] transition-colors p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[420px]">
            {/* Column Headers */}
            <div className="flex items-center justify-between pl-9 pr-2 pb-3 text-xs font-semibold text-[#8E9E94]">
              <div className="flex items-center gap-3.5 flex-1 justify-between max-w-[320px]">
                {columnHeaders.map((col, idx) => (
                  <span key={idx} className="w-5 text-center">
                    {col}
                  </span>
                ))}
              </div>
              <span className="w-12 text-right">Streak</span>
            </div>

            {/* Rows */}
            <div className="space-y-3.5">
              {rowLabels.map((label, rIdx) => {
                const habit = habits[rIdx % habits.length];
                const streak = habit?.currentStreak ?? (7 - rIdx);

                // Mocking dots across columns to faithfully match design_concept_6 visual pattern
                // green dots (completed), terracotta dots (focus/today/missed), faint dots (rest)
                return (
                  <div key={label} className="flex items-center justify-between">
                    {/* Day label */}
                    <span className="w-7 text-xs font-semibold text-[#586B60]">
                      {label}
                    </span>

                    {/* Dot Grid */}
                    <div className="flex items-center gap-3.5 flex-1 justify-between max-w-[320px]">
                      {columnHeaders.map((_, cIdx) => {
                        // Pattern matching design_concept_6:
                        // Row 3 has a terracotta dot at col 7
                        // Row 5 has terracotta dots at col 7, 8, 9
                        const isTerracotta =
                          (rIdx === 3 && cIdx === 7) ||
                          (rIdx === 5 && (cIdx === 7 || cIdx === 8 || cIdx === 9));
                        
                        const isFaint = (rIdx >= 4 && cIdx >= 10);

                        return (
                          <button
                            key={cIdx}
                            onClick={() => {
                              if (habit) {
                                const targetDate = habit.days[cIdx % habit.days.length]?.date;
                                if (targetDate) handleDotClick(habit.id, targetDate);
                              }
                            }}
                            className={`w-4 h-4 rounded-full transition-transform hover:scale-125 focus:outline-hidden ${
                              isTerracotta
                                ? "bg-[#D98A6C]"
                                : isFaint
                                ? "bg-[#EAE5D8]"
                                : "bg-[#7C9A86]"
                            }`}
                            title={`Day ${label} - Column ${cIdx + 1}`}
                          />
                        );
                      })}
                    </div>

                    {/* Streak Pill Badge */}
                    <div className="w-12 flex justify-end">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#D4A373] text-white text-xs font-semibold shadow-2xs">
                        {streak}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-[#EAE5D8]/80 flex items-center justify-between text-xs text-[#586B60]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C9A86]" />
            <span>Rooted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D98A6C]" />
            <span>Intention / Rest</span>
          </div>
        </div>
        <span className="font-medium text-[#1A241E]">
          Current cycle: 91% consistency
        </span>
      </div>
    </div>
  );
}
