"use client";

import { Flame } from "lucide-react";

interface HeaderCapsulesProps {
  greeting?: string;
  userName?: string;
  dateStr?: string;
  harmonyScore?: number;
  rootedDays?: number;
  completedIntentions?: number;
  totalIntentions?: number;
  restHours?: number | null;
}

export function HeaderCapsules({
  greeting = "Good morning",
  userName = "Samama",
  dateStr,
  harmonyScore = 91,
  rootedDays = 24,
  completedIntentions = 2,
  totalIntentions = 4,
  restHours,
}: HeaderCapsulesProps) {
  // Format today's date if not passed
  const formattedDate = dateStr || new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 pb-6 border-b border-[#EAE5D8] w-full">
      {/* Editorial 3-Line Header: Greeting, Date, and Mantra */}
      <div className="space-y-0.5">
        {/* Line 1: Greeting & Name */}
        <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
          {greeting}, {userName}
        </h2>

        {/* Line 2: Calendar Date */}
        <p className="font-serif text-base md:text-lg font-medium text-[#7C9A86]">
          {formattedDate}
        </p>

        {/* Line 3: Grounding Mantra */}
        <p className="text-xs md:text-sm text-[#586B60] pt-0.5 font-sans">
          Grounded intentions for a conscious, steady flow.
        </p>
      </div>

      {/* Floating Organic Metric Capsules - Single Horizontal Row (Fluid & Scrollable on small screens) */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap overflow-x-auto max-w-full min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
        {/* Capsule 1: Harmony */}
        <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-[#EFEAE0] border border-[#E4DDD0] shadow-2xs shrink-0 whitespace-nowrap">
          <span className="font-serif text-base sm:text-lg font-bold text-[#1A241E] leading-tight">
            {harmonyScore}%
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-[#586B60] tracking-wide">
            Harmony
          </span>
        </div>

        {/* Capsule 2: Rooted Days */}
        <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-[#EFEAE0] border border-[#E4DDD0] shadow-2xs shrink-0 whitespace-nowrap">
          <span className="font-serif text-base sm:text-lg font-bold text-[#1A241E] leading-tight">
            {rootedDays} Days
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-[#586B60] tracking-wide">
            Rooted
          </span>
          <Flame className="w-3.5 h-3.5 text-[#D98A6C] fill-[#D98A6C]/80 shrink-0" />
        </div>

        {/* Capsule 3: Rest */}
        {restHours !== undefined && restHours !== null ? (
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-[#EFEAE0] border border-[#E4DDD0] shadow-2xs shrink-0 whitespace-nowrap">
            <span className="font-serif text-base sm:text-lg font-bold text-[#1A241E] leading-tight">
              {restHours.toFixed(1)}h
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-[#586B60] tracking-wide">
              Rest
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-[#EFEAE0] border border-[#E4DDD0] shadow-2xs shrink-0 whitespace-nowrap">
            <span className="font-serif text-base sm:text-lg font-bold text-[#1A241E] leading-tight">
              8.0h
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-[#586B60] tracking-wide">
              Target Rest
            </span>
          </div>
        )}

        {/* Capsule 4: Daily Intentions - Placed beside 7.8h Rest in the exact same row */}
        <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-[#EFEAE0] border border-[#E4DDD0] shadow-2xs shrink-0 whitespace-nowrap">
          <span className="font-serif text-base sm:text-lg font-bold text-[#1A241E] leading-tight">
            {completedIntentions} of {totalIntentions}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-[#586B60] tracking-wide">
            Intentions
          </span>
        </div>
      </div>
    </header>
  );
}
