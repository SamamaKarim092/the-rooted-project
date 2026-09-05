"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Leaf, Sprout, CheckCircle2, ChevronRight } from "lucide-react";
import { toggleMilestone } from "@/lib/actions";
import Link from "next/link";

interface Milestone {
  id: string;
  title: string;
  stage: string;
  isCompleted: boolean;
  order: number;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  progressPercentage: number;
  milestones: Milestone[];
}

interface LongTermVisionCardProps {
  goal: Goal | null;
}

export function LongTermVisionCard({ goal }: LongTermVisionCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showDetails, setShowDetails] = useState(false);

  const defaultGoalTitle = goal?.title || "Master Creative Engineering";
  const progress = goal?.progressPercentage ?? 76;
  const milestones = goal?.milestones || [
    { id: "m1", title: "Foundational Architecture", stage: "Milestone", isCompleted: true, order: 1 },
    { id: "m2", title: "Interactive Sensory UI", stage: "Seed", isCompleted: true, order: 2 },
    { id: "m3", title: "Full Production Scaling", stage: "Milestone", isCompleted: false, order: 3 },
  ];

  const handleToggle = (milestoneId: string) => {
    startTransition(async () => {
      await toggleMilestone(milestoneId);
    });
  };

  return (
    <div className="bg-[#1E3127] text-[#FAF7F0] rounded-3xl p-7 md:p-8 border border-[#2D4336] shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#FAF7F0]">
            Long-Term Vision
          </h3>
          <Link
            href="/milestones"
            className="text-[#8FA697] hover:text-[#FAF7F0] transition-colors p-1"
            title="View all goals & milestones"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Link>
        </div>

        {/* Goal Title & Progress Metric */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <span className="text-base md:text-lg font-medium tracking-normal text-[#FAF7F0]">
            {defaultGoalTitle}
          </span>
          <span className="font-serif text-xl md:text-2xl font-bold text-[#FAF7F0]">
            {progress}%
          </span>
        </div>

        {/* Botanical Milestone Progress Track */}
        <div className="relative pt-6 pb-8">
          {/* Track background */}
          <div className="w-full h-4 bg-[#2A3F34] rounded-full overflow-hidden">
            {/* Filled Progress */}
            <div
              className="h-full bg-[#7C9A86] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Node Pins matching design_concept_6 */}
          <div className="absolute top-3 w-full flex justify-between px-16 pointer-events-none">
            {/* Milestone Node 1 */}
            <div className="flex flex-col items-center pointer-events-auto cursor-pointer group">
              <div className="w-6 h-6 rounded-full bg-[#354D40] border-2 border-[#7C9A86] flex items-center justify-center text-[#FAF7F0] group-hover:scale-110 transition-transform">
                <Leaf className="w-3 h-3 text-[#7C9A86]" />
              </div>
              <span className="text-xs text-[#8FA697] font-medium mt-2 tracking-wide group-hover:text-[#FAF7F0]">
                Milestone
              </span>
            </div>

            {/* Seed Node 2 */}
            <div className="flex flex-col items-center pointer-events-auto cursor-pointer group">
              <div className="w-6 h-6 rounded-full bg-[#354D40] border-2 border-[#D4A373] flex items-center justify-center text-[#FAF7F0] group-hover:scale-110 transition-transform">
                <Sprout className="w-3 h-3 text-[#D4A373]" />
              </div>
              <span className="text-xs text-[#D4A373] font-medium mt-2 tracking-wide group-hover:text-[#FAF7F0]">
                Seed
              </span>
            </div>

            {/* Milestone Node 3 */}
            <div className="flex flex-col items-center pointer-events-auto cursor-pointer group">
              <div className="w-6 h-6 rounded-full bg-[#2A3F34] border-2 border-[#8FA697] flex items-center justify-center text-[#FAF7F0] group-hover:scale-110 transition-transform">
                <Leaf className="w-3 h-3 text-[#8FA697]" />
              </div>
              <span className="text-xs text-[#8FA697] font-medium mt-2 tracking-wide group-hover:text-[#FAF7F0]">
                Milestone
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Milestone Quick Checklist Trigger */}
      <div className="pt-4 border-t border-[#2D4336]/70 flex items-center justify-between">
        <span className="text-xs text-[#8FA697]">
          2 of 3 milestones achieved
        </span>
        <Link
          href="/milestones"
          className="flex items-center gap-1 text-xs font-medium text-[#D4A373] hover:text-[#FAF7F0] transition-colors"
        >
          <span>Explore Roadmap</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
