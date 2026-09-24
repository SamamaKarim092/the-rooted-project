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
  goal?: Goal | null;
  goals?: Goal[];
}

export function LongTermVisionCard({ goal, goals }: LongTermVisionCardProps) {
  const [isPending, startTransition] = useTransition();
  const [currentIndex, setCurrentIndex] = useState(0);

  const goalList: Goal[] = goals && goals.length > 0 ? goals : goal ? [goal] : [];
  const currentGoal: Goal | null = goalList[currentIndex] || goal || null;

  const defaultGoalTitle = currentGoal?.title || "Master Creative Engineering";
  const progress = currentGoal?.progressPercentage ?? 76;
  const milestones = currentGoal?.milestones && currentGoal.milestones.length > 0
    ? currentGoal.milestones
    : [
        { id: "m1", title: "Foundational Architecture", stage: "Milestone", isCompleted: true, order: 1 },
        { id: "m2", title: "Interactive Sensory UI", stage: "Seed", isCompleted: true, order: 2 },
        { id: "m3", title: "Full Production Scaling", stage: "Milestone", isCompleted: false, order: 3 },
      ];

  const completedCount = milestones.filter((m) => m.isCompleted).length;

  const handlePrevGoal = () => {
    if (goalList.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : goalList.length - 1));
  };

  const handleNextGoal = () => {
    if (goalList.length <= 1) return;
    setCurrentIndex((prev) => (prev < goalList.length - 1 ? prev + 1 : 0));
  };

  const handleToggle = (milestoneId: string) => {
    startTransition(async () => {
      await toggleMilestone(milestoneId);
    });
  };

  const getStageIcon = (stage: string, isCompleted: boolean) => {
    const s = stage.toUpperCase();
    if (s.includes("SEED")) {
      return <Sprout className={`w-3.5 h-3.5 ${isCompleted ? "text-[#D4A373]" : "text-[#8FA697]"}`} />;
    }
    return <Leaf className={`w-3.5 h-3.5 ${isCompleted ? "text-[#7C9A86]" : "text-[#8FA697]"}`} />;
  };

  return (
    <div className="bg-[#1E3127] text-[#FAF7F0] rounded-3xl p-7 md:p-8 border border-[#2D4336] shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#FAF7F0]">
              Long-Term Vision
            </h3>
            {goalList.length > 1 && (
              <div className="flex items-center gap-1.5 bg-[#2A3F34] px-2.5 py-0.5 rounded-full border border-[#3E5C4B]/60 text-xs text-[#FAF7F0]">
                <button
                  type="button"
                  onClick={handlePrevGoal}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer px-1 font-mono"
                  title="Previous goal"
                >
                  ‹
                </button>
                <span className="font-medium text-[11px] text-[#A3BEAD]">
                  Goal {currentIndex + 1} of {goalList.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextGoal}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer px-1 font-mono"
                  title="Next goal"
                >
                  ›
                </button>
              </div>
            )}
          </div>
          <Link
            href="/milestones"
            className="text-[#8FA697] hover:text-[#FAF7F0] transition-colors p-1 cursor-pointer"
            title="View all goals & milestones"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Link>
        </div>

        {/* Goal Title & Progress Metric */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base md:text-lg font-medium tracking-normal text-[#FAF7F0] truncate">
              {defaultGoalTitle}
            </span>
            {currentGoal?.category && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#2A3F34] text-[#A3BEAD] border border-[#3E5C4B]/60 font-medium shrink-0">
                {currentGoal.category}
              </span>
            )}
          </div>
          <span className="font-serif text-xl md:text-2xl font-bold text-[#FAF7F0] shrink-0">
            {progress}%
          </span>
        </div>

        {/* Botanical Milestone Progress Track */}
        <div className="relative pt-6 pb-8">
          {/* Track background */}
          <div className="w-full h-3.5 bg-[#2A3F34] rounded-full overflow-hidden">
            {/* Filled Progress */}
            <div
              className="h-full bg-[#7C9A86] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(Math.max(progress, 4), 100)}%` }}
            />
          </div>

          {/* Dynamic Node Pins */}
          <div className="absolute top-2.5 w-full flex justify-between px-4 sm:px-8 pointer-events-none">
            {milestones.slice(0, 4).map((m, idx) => {
              const isSeed = (m.stage || "").toUpperCase().includes("SEED");
              return (
                <div
                  key={m.id || idx}
                  onClick={() => handleToggle(m.id)}
                  className="flex flex-col items-center pointer-events-auto cursor-pointer group max-w-[90px] text-center"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                      m.isCompleted
                        ? isSeed
                          ? "bg-[#354D40] border-2 border-[#D4A373]"
                          : "bg-[#354D40] border-2 border-[#7C9A86]"
                        : "bg-[#2A3F34] border-2 border-[#586B60]"
                    }`}
                  >
                    {getStageIcon(m.stage || "Milestone", m.isCompleted)}
                  </div>
                  <span
                    className={`text-[11px] font-medium mt-1.5 tracking-tight truncate max-w-[80px] transition-colors ${
                      m.isCompleted
                        ? isSeed
                          ? "text-[#D4A373] group-hover:text-[#FAF7F0]"
                          : "text-[#7C9A86] group-hover:text-[#FAF7F0]"
                        : "text-[#8FA697] group-hover:text-[#FAF7F0]"
                    }`}
                    title={m.title}
                  >
                    {m.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Milestone Quick Checklist Trigger */}
      <div className="pt-4 border-t border-[#2D4336]/70 flex items-center justify-between mt-4">
        <span className="text-xs text-[#8FA697]">
          {completedCount} of {milestones.length} milestones achieved
        </span>
        <Link
          href="/milestones"
          className="flex items-center gap-1 text-xs font-medium text-[#D4A373] hover:text-[#FAF7F0] transition-colors cursor-pointer"
        >
          <span>Explore Roadmap</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
