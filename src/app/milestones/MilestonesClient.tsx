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
  Trash2,
  Compass,
  Star,
  X,
  Target,
  ArrowRight
} from "lucide-react";
import { 
  toggleMilestone, 
  createGoal, 
  createMilestone, 
  deleteMilestone, 
  deleteGoal, 
  setActiveGoal 
} from "@/lib/actions";

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

const CATEGORIES = [
  { id: "Study", label: "Study", color: "bg-[#EBF1F5] text-[#3D637E]" },
  { id: "Career", label: "Career", color: "bg-[#F4F5EB] text-[#636E39]" },
  { id: "Craft", label: "Craft", color: "bg-[#F5E8DC] text-[#93593B]" },
  { id: "Body", label: "Body", color: "bg-[#F9ECE6] text-[#C87452]" },
  { id: "Mind", label: "Mind", color: "bg-[#EAF0EC] text-[#5F7E6A]" },
  { id: "Spirit", label: "Spirit", color: "bg-[#F0EDF5] text-[#6E6482]" },
];

export function MilestonesClient({ initialGoals }: MilestonesClientProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
  const [addMilestoneGoalId, setAddMilestoneGoalId] = useState<string | null>(null);

  // New Goal Form State
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Study");
  const [newGoalTargetDate, setNewGoalTargetDate] = useState("");
  const [initialMilestoneInputs, setInitialMilestoneInputs] = useState<
    { title: string; stage: string }[]
  >([
    { title: "", stage: "Seed" },
    { title: "", stage: "Sprout" },
    { title: "", stage: "Milestone" },
  ]);

  // Single Milestone Add Form State
  const [singleMilestoneTitle, setSingleMilestoneTitle] = useState("");
  const [singleMilestoneStage, setSingleMilestoneStage] = useState("Milestone");

  // Toggle Milestone completion
  const handleMilestoneToggle = (milestoneId: string, goalId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updatedMilestones = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.isCompleted).length;
        const progressPercentage = updatedMilestones.length > 0
          ? Math.round((completedCount / updatedMilestones.length) * 100)
          : 0;
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

  // Create Goal
  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    startTransition(async () => {
      const created = await createGoal({
        title: newGoalTitle,
        description: newGoalDescription.trim() || undefined,
        category: newGoalCategory,
        targetDate: newGoalTargetDate || undefined,
        initialMilestones: initialMilestoneInputs.filter((m) => m.title.trim()),
      });

      if (created) {
        setGoals((prev) => [created as unknown as Goal, ...prev]);
        setIsCreateGoalModalOpen(false);
        // Reset form
        setNewGoalTitle("");
        setNewGoalDescription("");
        setNewGoalCategory("Study");
        setNewGoalTargetDate("");
        setInitialMilestoneInputs([
          { title: "", stage: "Seed" },
          { title: "", stage: "Sprout" },
          { title: "", stage: "Milestone" },
        ]);
      }
    });
  };

  // Add Milestone to an existing Goal
  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMilestoneGoalId || !singleMilestoneTitle.trim()) return;

    const goalId = addMilestoneGoalId;
    const title = singleMilestoneTitle.trim();
    const stage = singleMilestoneStage;

    startTransition(async () => {
      const created = await createMilestone({
        goalId,
        title,
        stage,
      });

      if (created) {
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id !== goalId) return g;
            const updated = [...g.milestones, created];
            const completedCount = updated.filter((m) => m.isCompleted).length;
            return {
              ...g,
              milestones: updated,
              progressPercentage: Math.round((completedCount / updated.length) * 100),
            };
          })
        );
        setAddMilestoneGoalId(null);
        setSingleMilestoneTitle("");
        setSingleMilestoneStage("Milestone");
      }
    });
  };

  // Delete Milestone
  const handleDeleteMilestone = (milestoneId: string, goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this milestone step?")) return;

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updated = g.milestones.filter((m) => m.id !== milestoneId);
        const completedCount = updated.filter((m) => m.isCompleted).length;
        const progressPercentage =
          updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
        return {
          ...g,
          milestones: updated,
          progressPercentage,
        };
      })
    );

    startTransition(async () => {
      await deleteMilestone(milestoneId);
    });
  };

  // Delete Goal
  const handleDeleteGoal = (goalId: string) => {
    if (!confirm("Delete this life goal and all its milestones?")) return;

    setGoals((prev) => prev.filter((g) => g.id !== goalId));

    startTransition(async () => {
      await deleteGoal(goalId);
    });
  };

  // Set Active Goal for Dashboard
  const handleSetActiveGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        status: g.id === goalId ? "ACTIVE" : "PAUSED",
      }))
    );

    startTransition(async () => {
      await setActiveGoal(goalId);
    });
  };

  const getStageIcon = (stage: string, isCompleted: boolean) => {
    if (stage.toLowerCase() === "seed") {
      return <Sprout className={`w-3.5 h-3.5 ${isCompleted ? "text-[#D4A373]" : "text-[#8E9E94]"}`} />;
    }
    return <Leaf className={`w-3.5 h-3.5 ${isCompleted ? "text-[#7C9A86]" : "text-[#8E9E94]"}`} />;
  };

  return (
    <div className="space-y-8 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#7C9A86]">
              Life Architecture
            </span>
            <span className="text-[#8E9E94]">•</span>
            <span className="text-xs text-[#586B60]">
              Long-Term Vision & Roadmaps
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
            Milestones & Life Goals
          </h2>
          <p className="text-sm text-[#586B60] mt-1 font-sans">
            Break grand life visions down into tangible seeds, sprouts, and milestones.
          </p>
        </div>

        {/* Action Button: Create Goal */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] text-xs font-semibold text-[#1A241E] shadow-2xs">
            <Trophy className="w-4 h-4 text-[#D98A6C]" />
            <span>{goals.length} Life Roadmaps</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateGoalModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1E3127] hover:bg-[#2A3F34] text-[#FAF7F0] text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#D4A373]" />
            <span>Add Life Goal</span>
          </button>
        </div>
      </div>

      {/* Goal Cards List */}
      {goals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8] text-[#D98A6C] flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1A241E]">
            No Active Roadmaps Yet
          </h3>
          <p className="text-xs text-[#586B60] max-w-md mx-auto">
            Create your first life roadmap (e.g. Master Machine Learning, Clear Semester, Research Paper) and break it into actionable milestones.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateGoalModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E3127] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A3F34] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4A373]" />
            <span>Create Your First Roadmap</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {goals.map((goal) => {
            const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;
            const isActiveDashboardGoal = goal.status === "ACTIVE";

            return (
              <div
                key={goal.id}
                className="bg-[#1E3127] text-[#FAF7F0] rounded-3xl p-6 sm:p-8 md:p-9 border border-[#2D4336] shadow-sm flex flex-col justify-between relative group"
              >
                <div>
                  {/* Header: Title, Category, Target Date & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
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

                        {isActiveDashboardGoal ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#D4A373] bg-[#2A3F34] px-2.5 py-0.5 rounded-full border border-[#D4A373]/40">
                            <Star className="w-3 h-3 fill-[#D4A373]" />
                            <span>Primary Dashboard Vision</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetActiveGoal(goal.id)}
                            className="text-[11px] text-[#8FA697] hover:text-[#FAF7F0] bg-[#24372D] hover:bg-[#2A3F34] px-2 py-0.5 rounded-full border border-[#3E5C4B]/50 transition-colors cursor-pointer"
                            title="Make this the active goal featured on your Home Dashboard"
                          >
                            Set as Dashboard Focus
                          </button>
                        )}
                      </div>

                      <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#FAF7F0]">
                        {goal.title}
                      </h3>

                      {goal.description && (
                        <p className="text-sm text-[#8FA697] max-w-2xl leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    {/* Right side: Percentage & Actions */}
                    <div className="flex flex-col items-start sm:items-end shrink-0 gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-3xl md:text-4xl font-bold text-[#FAF7F0]">
                          {goal.progressPercentage}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="opacity-60 hover:opacity-100 p-1.5 rounded-lg text-[#D98A6C] hover:bg-[#2A3F34] transition-all cursor-pointer"
                          title="Delete Life Goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs text-[#8FA697]">
                        {completedMilestones} of {goal.milestones.length} milestones honored
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3.5 bg-[#2A3F34] rounded-full overflow-hidden mb-7">
                    <div
                      className="h-full bg-[#7C9A86] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${goal.progressPercentage}%` }}
                    />
                  </div>

                  {/* Milestones Checklist Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#8FA697]">
                        Milestone Path ({goal.milestones.length} steps)
                      </h4>

                      <button
                        type="button"
                        onClick={() => setAddMilestoneGoalId(goal.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#D4A373] hover:text-[#FAF7F0] bg-[#2A3F34] hover:bg-[#354D40] px-3 py-1 rounded-xl transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Milestone</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {goal.milestones.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-2.5 relative group/item ${
                            m.isCompleted
                              ? "bg-[#24372D] border-[#7C9A86]/50 text-[#FAF7F0]"
                              : "bg-[#23372D]/60 border-[#2D4336] text-[#8FA697] hover:border-[#8FA697]/50"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleMilestoneToggle(m.id, goal.id)}
                            disabled={isPending}
                            className="flex items-start gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border mt-0.5 shrink-0 transition-colors ${
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

                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wide text-[#D4A373] block">
                                {m.stage}
                              </span>
                              <span
                                className={`text-sm font-medium mt-0.5 block leading-tight ${
                                  m.isCompleted ? "line-through opacity-85" : "text-[#FAF7F0]"
                                }`}
                              >
                                {m.title}
                              </span>
                            </div>
                          </button>

                          {/* Delete Milestone Button */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteMilestone(m.id, goal.id, e)}
                            className="opacity-0 group-hover/item:opacity-100 p-1 text-[#8FA697] hover:text-[#D98A6C] rounded-md transition-opacity cursor-pointer shrink-0"
                            title="Remove milestone step"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* In-Grid Add Milestone Button */}
                      <button
                        type="button"
                        onClick={() => setAddMilestoneGoalId(goal.id)}
                        className="p-3.5 rounded-2xl border border-dashed border-[#3E5C4B] hover:border-[#7C9A86] bg-[#23372D]/30 hover:bg-[#23372D]/60 text-[#8FA697] hover:text-[#FAF7F0] flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[64px]"
                      >
                        <Plus className="w-4 h-4 text-[#D4A373]" />
                        <span className="text-xs font-semibold">Add Milestone Step</span>
                      </button>
                    </div>
                  </div>

                  {/* Linked Daily Habits & Tasks */}
                  {(goal.habits.length > 0 || goal.tasks.length > 0) && (
                    <div className="mt-8 pt-5 border-t border-[#2D4336] flex flex-wrap items-center gap-6 text-xs text-[#8FA697]">
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
                          <span>{goal.tasks.length} active tasks linked</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD LIFE GOAL                                                    */}
      {/* ========================================================================= */}
      {isCreateGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E3127]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-[#FAF7F0] rounded-3xl border border-[#EAE5D8] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#1E3127] text-[#FAF7F0] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2A3F34] flex items-center justify-center text-[#D4A373]">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold tracking-tight text-[#FAF7F0]">
                    Create Life Roadmap
                  </h3>
                  <p className="text-xs text-[#8FA697] mt-0.5">
                    Define a high-level aspiration and break it into steps.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateGoalModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8FA697] hover:text-[#FAF7F0] hover:bg-[#2A3F34] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateGoalSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A241E] uppercase tracking-wider block">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Deep Learning & AI"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EAE5D8] text-sm font-semibold text-[#1A241E] focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]"
                />
              </div>

              {/* Category & Target Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A241E] uppercase tracking-wider block">
                    Category
                  </label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EAE5D8] text-xs font-semibold text-[#1A241E] focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A241E] uppercase tracking-wider block">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={newGoalTargetDate}
                    onChange={(e) => setNewGoalTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EAE5D8] text-xs text-[#1A241E] focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#586B60] uppercase tracking-wider block">
                  Vision / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Why does this goal matter to your life?"
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#EAE5D8] text-xs text-[#1A241E] focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]"
                />
              </div>

              {/* Initial Milestone Steps */}
              <div className="space-y-2 pt-2 border-t border-[#EAE5D8]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A241E] uppercase tracking-wider block">
                    Initial Milestone Steps
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setInitialMilestoneInputs((prev) => [
                        ...prev,
                        { title: "", stage: "Milestone" },
                      ])
                    }
                    className="text-xs font-semibold text-[#7C9A86] hover:text-[#1E3127] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {initialMilestoneInputs.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={step.stage}
                        onChange={(e) => {
                          const updated = [...initialMilestoneInputs];
                          updated[idx].stage = e.target.value;
                          setInitialMilestoneInputs(updated);
                        }}
                        className="px-2.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EAE5D8] text-xs font-semibold text-[#586B60] shrink-0"
                      >
                        <option value="Seed">🌱 Seed</option>
                        <option value="Sprout">🌿 Sprout</option>
                        <option value="Milestone">🌳 Milestone</option>
                      </select>

                      <input
                        type="text"
                        placeholder={`Step ${idx + 1} (e.g. Finish foundational coursework)`}
                        value={step.title}
                        onChange={(e) => {
                          const updated = [...initialMilestoneInputs];
                          updated[idx].title = e.target.value;
                          setInitialMilestoneInputs(updated);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EAE5D8] text-xs text-[#1A241E] focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]"
                      />

                      {initialMilestoneInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setInitialMilestoneInputs((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                          className="p-1.5 text-[#8E9E94] hover:text-[#D98A6C] rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#586B60] hover:text-[#1A241E] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newGoalTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#1E3127] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A3F34] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isPending ? "Creating..." : "Save Life Roadmap"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK ADD MILESTONE TO SPECIFIC GOAL                            */}
      {/* ========================================================================= */}
      {addMilestoneGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E3127]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-[#FAF7F0] rounded-3xl border border-[#EAE5D8] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1E3127] text-[#FAF7F0] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[#D4A373]" />
                <h3 className="font-serif text-lg font-bold text-[#FAF7F0]">
                  Add Milestone Step
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddMilestoneGoalId(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#8FA697] hover:text-[#FAF7F0] hover:bg-[#2A3F34] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMilestoneSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A241E] uppercase tracking-wider block">
                  Milestone Step Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Publish first draft, Train final model..."
                  value={singleMilestoneTitle}
                  onChange={(e) => setSingleMilestoneTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EAE5D8] text-sm font-semibold text-[#1A241E] focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A241E] uppercase tracking-wider block">
                  Botanical Stage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Seed", label: "🌱 Seed", desc: "First initial sprout" },
                    { id: "Sprout", label: "🌿 Sprout", desc: "Core growth phase" },
                    { id: "Milestone", label: "🌳 Milestone", desc: "Major chapter completion" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSingleMilestoneStage(s.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        singleMilestoneStage === s.id
                          ? "bg-[#1E3127] border-[#1E3127] text-[#FAF7F0] shadow-xs"
                          : "bg-[#FFFFFF] border-[#EAE5D8] text-[#586B60] hover:bg-[#FAF8F2]"
                      }`}
                    >
                      <span className="text-xs font-bold block">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddMilestoneGoalId(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#586B60] hover:text-[#1A241E] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !singleMilestoneTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-[#1E3127] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A3F34] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isPending ? "Adding..." : "Add Milestone Step"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
