"use client";

import { useState, useTransition } from "react";
import { Check, MoreHorizontal, Plus, Clock } from "lucide-react";
import { toggleTaskStatus, createTask } from "@/lib/actions";

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  category: string;
  dueTime: string | null;
  dueDate: string | null;
}

interface DailyIntentionsCardProps {
  tasks: Task[];
}

export function DailyIntentionsCard({ tasks }: DailyIntentionsCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Craft");
  const [newTime, setNewTime] = useState("6:00 PM");

  const handleToggle = (taskId: string) => {
    startTransition(async () => {
      await toggleTaskStatus(taskId);
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    startTransition(async () => {
      await createTask({
        title: newTitle.trim(),
        category: newCategory,
        dueTime: newTime,
      });
      setNewTitle("");
      setShowAddModal(false);
    });
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "mind":
        return "bg-[#2D4337] text-[#A3BEAD] border border-[#3E5C4B]/50";
      case "body":
        return "bg-[#6E5343] text-[#F5C7B6] border border-[#8C6B57]/50";
      case "spirit":
        return "bg-[#453B52] text-[#D8D0E6] border border-[#645677]/50";
      case "study":
        return "bg-[#233B4C] text-[#B8D5EB] border border-[#395B73]/50";
      case "career":
        return "bg-[#3D472B] text-[#E0EAB9] border border-[#58663E]/50";
      case "craft":
      default:
        return "bg-[#C87452] text-[#FAF7F0] border border-[#D98A6C]/50";
    }
  };

  return (
    <div className="bg-[#1E3127] text-[#FAF7F0] rounded-3xl p-7 md:p-8 border border-[#2D4336] shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#FAF7F0]">
            Daily Intentions
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 rounded-full bg-[#2A3F34] hover:bg-[#354D40] text-[#E0DAD0] flex items-center justify-center transition-colors"
            title="Add Intention"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Task Items Checklist */}
        <div className="space-y-4">
          {tasks.map((task) => {
            const isCompleted = task.status === "COMPLETED";

            return (
              <div
                key={task.id}
                onClick={() => handleToggle(task.id)}
                className="group flex items-center justify-between gap-4 py-2 border-b border-[#2D4336]/60 cursor-pointer select-none transition-opacity hover:opacity-95"
              >
                {/* Left: Check trigger + Title + Pill tags */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 shrink-0 ${
                      isCompleted
                        ? "bg-[#D4A373] border-[#D4A373] text-[#1E3127]"
                        : "border-[#8FA697] group-hover:border-[#FAF7F0]"
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <span
                    className={`text-base font-normal tracking-wide truncate transition-all ${
                      isCompleted
                        ? "line-through text-[#8FA697]"
                        : "text-[#FAF7F0]"
                    }`}
                  >
                    {task.title}
                  </span>

                  {/* Category Pill Tag */}
                  {task.category && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium tracking-wide shrink-0 ${getCategoryBadge(
                        task.category
                      )}`}
                    >
                      {task.category}
                    </span>
                  )}
                </div>

                {/* Right: Time Stamp Capsule */}
                {task.dueTime && (
                  <div className="shrink-0 px-3.5 py-1 rounded-2xl bg-[#EFEAE0] text-[#1A241E] font-medium text-xs shadow-2xs">
                    {task.dueTime}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Intention Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] text-[#1A241E] rounded-3xl p-6 md:p-8 max-w-md w-full border border-[#EAE5D8] shadow-xl">
            <h4 className="font-serif text-2xl font-bold mb-4">New Daily Intention</h4>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Deep focus writing session"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EAE5D8] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-sm"
                  >
                    <option value="Mind">Mind</option>
                    <option value="Body">Body</option>
                    <option value="Craft">Craft</option>
                    <option value="Spirit">Spirit</option>
                    <option value="Study">Study (Education)</option>
                    <option value="Career">Career (Job)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 6:00 PM"
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#586B60] hover:text-[#1A241E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-2xl bg-[#1E3127] text-[#FAF7F0] font-medium text-sm hover:bg-[#2A3F34] transition-colors"
                >
                  {isPending ? "Adding..." : "Add Intention"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
