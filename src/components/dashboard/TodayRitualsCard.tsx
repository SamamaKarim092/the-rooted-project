"use client";

import { useState, useTransition } from "react";
import { Check, Flame, Plus, Sparkles } from "lucide-react";
import { toggleHabitLog } from "@/lib/actions";
import Link from "next/link";

interface Habit {
  id: string;
  title: string;
  category: string;
  color?: string;
  targetDaysPerWeek?: number;
  isCompletedToday?: boolean;
  currentStreak?: number;
}

interface TodayRitualsCardProps {
  habits: Habit[];
  today: string;
}

export function TodayRitualsCard({ habits: initialHabits, today }: TodayRitualsCardProps) {
  const [isPending, startTransition] = useTransition();
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  // Sync with prop updates
  const handleToggle = (habitId: string) => {
    // Optimistic toggle
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const nextCompleted = !h.isCompletedToday;
        const nextStreak = nextCompleted
          ? (h.currentStreak ?? 0) + 1
          : Math.max(0, (h.currentStreak ?? 1) - 1);
        return {
          ...h,
          isCompletedToday: nextCompleted,
          currentStreak: nextStreak,
        };
      })
    );

    startTransition(async () => {
      await toggleHabitLog(habitId, today);
    });
  };

  const getCategoryBadge = (category: string) => {
    switch (category?.toLowerCase()) {
      case "mind":
        return "bg-[#EAF0EC] text-[#5F7E6A] border-[#7C9A86]/30";
      case "body":
        return "bg-[#F9ECE6] text-[#C87452] border-[#D98A6C]/30";
      case "spirit":
        return "bg-[#F0EDF5] text-[#6E6482] border-[#968AA8]/30";
      case "study":
        return "bg-[#EBF1F5] text-[#3D637E] border-[#6B90AB]/30";
      case "career":
        return "bg-[#F4F6E9] text-[#6B7540] border-[#8C9B50]/30";
      case "craft":
      default:
        return "bg-[#FAF3EB] text-[#A66838] border-[#D4A373]/30";
    }
  };

  const completedCount = habits.filter((h) => h.isCompletedToday).length;

  return (
    <div className="bg-[#FFFFFF] text-[#1A241E] rounded-3xl p-7 md:p-8 border border-[#EAE5D8] shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header matching design concept 7 */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#1A241E]">
            Today&apos;s Rituals
          </h3>
          <Link
            href="/habits"
            className="w-9 h-9 rounded-full bg-[#FAF7F0] hover:bg-[#EAE5D8] text-[#586B60] hover:text-[#1A241E] flex items-center justify-center transition-colors border border-[#EAE5D8]"
            title="Manage all habits"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-xs text-[#586B60] mb-6 font-sans">
          Clean checklist of today&apos;s habits {habits.length > 0 && `(${completedCount} of ${habits.length} fulfilled)`}
        </p>

        {/* Ritual Checklist Rows */}
        <div className="space-y-3.5">
          {habits.length === 0 ? (
            <div className="py-12 text-center text-[#8E9E94]">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#D4A373]" />
              <p className="text-sm font-medium text-[#1A241E]">No rituals planted yet.</p>
              <p className="text-xs text-[#586B60] mt-1">
                Visit Habits to plant your first daily ritual.
              </p>
              <Link
                href="/habits"
                className="inline-block mt-3 px-4 py-1.5 rounded-xl bg-[#1E3127] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A3F34] transition-colors"
              >
                + Plant First Ritual
              </Link>
            </div>
          ) : (
            habits.map((habit) => {
              const isCompleted = Boolean(habit.isCompletedToday);
              const streak = habit.currentStreak ?? 0;
              const targetDays = habit.targetDaysPerWeek ?? 7;

              return (
                <div
                  key={habit.id}
                  onClick={() => handleToggle(habit.id)}
                  className="group flex items-center justify-between gap-3 py-2.5 px-3 rounded-2xl hover:bg-[#FAF8F2] cursor-pointer select-none transition-all duration-200 border border-transparent hover:border-[#EAE5D8]"
                >
                  {/* Left: Check trigger + Title */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 shrink-0 ${
                        isCompleted
                          ? "bg-[#D98A6C] border-[#D98A6C] text-[#FFFFFF] shadow-2xs scale-105"
                          : "border-[#D4CDC3] group-hover:border-[#7C9A86] bg-[#FAF8F2]"
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>

                    <span
                      className={`text-sm md:text-base font-normal tracking-normal truncate transition-all ${
                        isCompleted
                          ? "line-through text-[#8E9E94]"
                          : "text-[#1A241E] font-medium"
                      }`}
                    >
                      {habit.title}
                    </span>
                  </div>

                  {/* Right: Category Pill + Flame Streak Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    {habit.category && (
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium tracking-wide border ${getCategoryBadge(
                          habit.category
                        )}`}
                      >
                        {habit.category}
                      </span>
                    )}

                    {streak >= 2 && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium tracking-tight border transition-colors ${
                          isCompleted
                            ? "bg-[#FDF3EE] text-[#C87452] border-[#D98A6C]/40"
                            : "bg-[#FAF7F0] text-[#7C9A86] border-[#EAE5D8]"
                        }`}
                        title={`${streak} day consistency streak (${targetDays}d target)`}
                      >
                        <Flame className="w-3.5 h-3.5 text-[#D98A6C] fill-[#D98A6C]/80" />
                        <span>{streak}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
