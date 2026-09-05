"use client";

import { Flame } from "lucide-react";

interface HeaderCapsulesProps {
  greeting?: string;
  userName?: string;
  harmonyScore?: number;
  rootedDays?: number;
  completedIntentions?: number;
  totalIntentions?: number;
}

export function HeaderCapsules({
  greeting = "Good morning",
  userName = "Alex",
  harmonyScore = 91,
  rootedDays = 24,
  completedIntentions = 5,
  totalIntentions = 7,
}: HeaderCapsulesProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
      {/* Editorial Greeting */}
      <div>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
          {greeting}, {userName}
        </h2>
        <p className="text-sm text-[#586B60] mt-1 font-sans">
          Grounded intentions for a conscious, steady flow.
        </p>
      </div>

      {/* Floating Organic Metric Capsules */}
      <div className="flex items-center gap-3.5 flex-wrap">
        {/* Capsule 1: Harmony */}
        <div className="flex flex-col items-center justify-center px-6 py-2.5 rounded-3xl bg-[#EFEAE0] border border-[#E4DDD0] shadow-2xs min-w-[110px]">
          <span className="font-serif text-lg font-bold text-[#1A241E] leading-tight">
            {harmonyScore}%
          </span>
          <span className="text-xs font-medium text-[#586B60] tracking-wide">
            Harmony
          </span>
        </div>

        {/* Capsule 2: Rooted Days */}
        <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-3xl bg-[#EFEAE0] border border-[#E4DDD0] shadow-2xs min-w-[130px]">
          <div className="flex flex-col items-start justify-center">
            <span className="font-serif text-lg font-bold text-[#1A241E] leading-tight">
              {rootedDays} Days
            </span>
            <span className="text-xs font-medium text-[#586B60] tracking-wide">
              Rooted
            </span>
          </div>
          <Flame className="w-5 h-5 text-[#D98A6C] fill-[#D98A6C]/80 shrink-0" />
        </div>

        {/* Capsule 3: Daily Intentions */}
        <div className="flex flex-col items-center justify-center px-6 py-2.5 rounded-3xl bg-[#EFEAE0] border border-[#E4DDD0] shadow-2xs min-w-[130px]">
          <span className="font-serif text-lg font-bold text-[#1A241E] leading-tight">
            {completedIntentions} of {totalIntentions}
          </span>
          <span className="text-xs font-medium text-[#586B60] tracking-wide">
            Daily Intentions
          </span>
        </div>
      </div>
    </header>
  );
}
