"use client";

import { useState, useTransition } from "react";
import { 
  Trophy, 
  Plus, 
  Leaf, 
  Sprout, 
  Check, 
  Calendar, 
  Heart, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { toggleMilestone } from "@/lib/actions";

interface Milestone {
  id: string;
  title: string;
  stage: string;
  isCompleted: boolean;
  order: number;
}

interface Habit {
  id: string;
  title: string;
}

interface Task {
  id: string;
  title: string;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  targetDate: Date | null;
  progressPercentage: number;
  status: string;
  milestones: Milestone[];
  habits: Habit[];
  tasks: Task[];
}

interface MilestonesClientProps {
  initialGoals: Goal[];
}

export function MilestonesClient({ initialGoals }: MilestonesClientProps) {
  const [goals, setGoals] = useState(initialGoals);
  const [isPending, startTransition] = useTransition();

  const handleMilestoneToggle = (milestoneId: string, goalId: string) => {
    // Optimistic toggle
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updatedMilestones = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.isCompleted).length;
        const progressPercentage = Math.round(
          (completedCount / updatedMilestones.length) * 100
        );
        return {
          ...g,
          milestones: updatedMilestones,
          progressPercentage,
        };
      })
    );

    startTransition(async () => {
      await toggleMilestone(milestoneId);
    });
  };

  const getStageIcon = (stage: string, isCompleted: boolean) => {
    if (stage.toLowerCase() === "seed") {
      return <Sprout className={`w-3.5 h-3.5 ${isCompleted ? "text-[#D4A373]" : "text-[#8E9E94]"}`} />;
    }
    return <Leaf className={`w-3.5 h-3.5 ${isCompleted ? "text-[#7C9A86]" : "text-[#8E9E94]"}`} />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
            Long-Term Goals & Milestones
          </h2>
          <p className="text-sm text-[#586B60] mt-1 font-sans">
            Break grand life visions down into tangible seeds, sprouts, and milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#EFEAE0] border border-[#E4DDD0] text-xs font-semibold text-[#1A241E]">
          <Trophy className="w-4 h-4 text-[#D98A6C]" />
          <span>{goals.length} Active Life Roadmaps</span>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="space-y-8">
        {goals.map((goal) => {
          const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;

          return (
            <div
              key={goal.id}
              className="bg-[#1E3127] text-[#FAF7F0] rounded-3xl p-7 md:p-9 border border-[#2D4336] shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Header: Title, Category & Progress */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs px-3 py-0.5 rounded-full font-semibold bg-[#2A3F34] text-[#7C9A86] border border-[#3E5C4B]/50">
                        {goal.category}
                      </span>
                      {goal.targetDate && (
                        <span className="text-xs text-[#8FA697] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
                          <span>
                            Target: {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#FAF7F0]">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-sm text-[#8FA697] mt-2 max-w-2xl leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Percentage Metric */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-serif text-3xl font-bold text-[#FAF7F0]">
                      {goal.progressPercentage}%
                    </span>
                    <span className="text-xs text-[#8FA697]">
                      {completedMilestones} of {goal.milestones.length} milestones
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3.5 bg-[#2A3F34] rounded-full overflow-hidden mb-8">
                  <div
                    className="h-full bg-[#7C9A86] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${goal.progressPercentage}%` }}
                  />
                </div>

                {/* Milestones Checklist */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8FA697] mb-4">
                    Milestone Path
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {goal.milestones.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleMilestoneToggle(m.id, goal.id)}
                        disabled={isPending}
                        className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3 select-none ${
                          m.isCompleted
                            ? "bg-[#24372D] border-[#7C9A86]/50 text-[#FAF7F0]"
                            : "bg-[#23372D]/50 border-[#2D4336] text-[#8FA697] hover:border-[#8FA697]"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border mt-0.5 shrink-0 ${
                            m.isCompleted
                              ? "bg-[#7C9A86] border-[#7C9A86] text-[#1E3127]"
                              : "border-[#8FA697]"
                          }`}
                        >
                          {m.isCompleted ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            getStageIcon(m.stage, false)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold uppercase text-[#D4A373]">
                              {m.stage}
                            </span>
                          </div>
                          <span
                            className={`text-sm font-medium mt-0.5 block ${
                              m.isCompleted ? "line-through opacity-85" : "text-[#FAF7F0]"
                            }`}
                          >
                            {m.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Linked Daily Habits & Tasks */}
                {(goal.habits.length > 0 || goal.tasks.length > 0) && (
                  <div className="mt-8 pt-6 border-t border-[#2D4336] flex flex-wrap items-center gap-6 text-xs text-[#8FA697]">
                    {goal.habits.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-[#D98A6C]" />
                        <span>
                          Cultivating {goal.habits.length} daily habits (
                          {goal.habits.map((h) => h.title).join(", ")})
                        </span>
                      </div>
                    )}
                    {goal.tasks.length > 0 && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#7C9A86]" />
                        <span>{goal.tasks.length} active tasks associated</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
