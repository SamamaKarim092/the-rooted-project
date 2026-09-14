"use client";

import { useMemo } from "react";
import { Clock, Sparkles } from "lucide-react";

interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  title: string;
  logs: HabitLog[];
}

interface TodayHabitDialProps {
  habits: Habit[];
  today: string;
}

export function TodayHabitDial({ habits, today }: TodayHabitDialProps) {
  const total = habits.length;
  const completed = useMemo(() => {
    return habits.filter((h) => h.logs.some((l) => l.date === today && l.completed)).length;
  }, [habits, today]);

  const remaining = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // SVG circular geometry
  const size = 76;
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // 12 clock hour ticks/dots coordinates
  const ticks = useMemo(() => {
    const points = [];
    const center = size / 2;
    const tickRadius = radius - 7;
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const x = Math.round((center + tickRadius * Math.sin(angle)) * 100) / 100;
      const y = Math.round((center - tickRadius * Math.cos(angle)) * 100) / 100;
      const isCompletedTick = total > 0 && i < Math.round((completed / total) * 12);
      points.push({ x, y, isCompletedTick, isMain: i % 3 === 0 });
    }
    return points;
  }, [size, radius, total, completed]);

  return (
    <div className="flex items-center gap-3.5 bg-[#FFFFFF] border border-[#EAE5D8] pl-3 pr-4 py-2 rounded-3xl shadow-xs hover:border-[#7C9A86]/50 transition-all select-none">
      {/* Clock Dial Circle */}
      <div className="relative w-[76px] h-[76px] shrink-0 flex items-center justify-center">
        {/* SVG Dial */}
        <svg width={size} height={size} className="overflow-visible -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EFEAE0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={total > 0 && percentage === 100 ? "#7C9A86" : "#D4A373"}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* 12 Clock Hour Dots */}
          {ticks.map((tick, idx) => (
            <circle
              key={idx}
              cx={tick.x}
              cy={tick.y}
              r={tick.isMain ? 1.8 : 1.2}
              fill={tick.isCompletedTick ? "#7C9A86" : "#D1C9BD"}
              className="transition-colors duration-500"
            />
          ))}
        </svg>

        {/* Center Digital / Ratio Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-serif text-sm font-bold text-[#1A241E] leading-none">
            {completed}/{total}
          </span>
          <span className="text-[9px] font-semibold text-[#8E9E94] uppercase tracking-wider mt-0.5">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Textual Rhythm Label */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
          <Clock className="w-3 h-3 text-[#D98A6C]" />
          <span>Today&apos;s Rituals</span>
        </div>
        <span className="font-serif text-base font-bold text-[#1A241E] leading-snug">
          {completed} of {total} Rooted
        </span>
        <span className="text-[11px] text-[#8E9E94]">
          {total === 0
            ? "No rituals scheduled"
            : remaining === 0
            ? "✨ All rituals completed!"
            : `${remaining} ritual${remaining === 1 ? "" : "s"} left`}
        </span>
      </div>
    </div>
  );
}
