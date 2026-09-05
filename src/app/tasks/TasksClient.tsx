"use client";

import { useState, useTransition, useMemo } from "react";
import { 
  Check, 
  Plus, 
  Clock, 
  Calendar as CalendarIcon, 
  Flame, 
  Trash2, 
  Filter,
  Sparkles,
  CalendarDays,
  AlertCircle,
  Sun,
  Sunrise,
  CheckCircle2
} from "lucide-react";
import { toggleTaskStatus, createTask } from "@/lib/actions";
import { formatTaskDateHeading, TaskDateGroupMeta } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  dueTime: string | null;
  category: string;
  goalId: string | null;
  goal?: Goal | null;
}

interface TasksClientProps {
  initialTasks: Task[];
  goals: Goal[];
  today: string;
}

export function TasksClient({ initialTasks, goals, today }: TasksClientProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTab, setActiveTab] = useState<"ALL" | "TODAY" | "UPCOMING" | "COMPLETED" | "OVERDUE">("TODAY");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("Craft");
  const [dueDate, setDueDate] = useState(today);
  const [dueTime, setDueTime] = useState("6:00 PM");
  const [goalId, setGoalId] = useState("");

  const handleToggle = (taskId: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === "COMPLETED" ? "PENDING" : "COMPLETED" }
          : t
      )
    );

    startTransition(async () => {
      await toggleTaskStatus(taskId);
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      const newTask = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate,
        dueTime,
        goalId: goalId || undefined,
      });

      if (newTask) {
        setTasks((prev) => [newTask as Task, ...prev]);
      }
      setShowAddModal(false);
      setTitle("");
      setDescription("");
    });
  };

  // 1. Filter tasks according to active tab and category
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const isToday = task.dueDate === today;
      const isCompleted = task.status === "COMPLETED";
      const isOverdue = !isCompleted && task.dueDate && task.dueDate < today;
      const isUpcoming = !isCompleted && task.dueDate && task.dueDate > today;

      // Tab filter
      if (activeTab === "TODAY" && !isToday) return false;
      if (activeTab === "UPCOMING" && !isUpcoming) return false;
      if (activeTab === "COMPLETED" && !isCompleted) return false;
      if (activeTab === "OVERDUE" && !isOverdue) return false;

      // Category filter
      if (selectedCategory !== "ALL" && task.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [tasks, activeTab, selectedCategory, today]);

  // 2. Group filtered tasks by Date to build prominent date headings
  const groupedTasks = useMemo(() => {
    const groups: {
      dateKey: string;
      meta: TaskDateGroupMeta;
      items: Task[];
    }[] = [];

    // Sort order based on tab
    const sorted = [...filteredTasks].sort((a, b) => {
      const dateA = a.dueDate || "9999-99-99";
      const dateB = b.dueDate || "9999-99-99";
      // Completed and Overdue: show most recent first
      if (activeTab === "COMPLETED" || activeTab === "OVERDUE") {
        return dateB.localeCompare(dateA);
      }
      // Upcoming and All: chronological ascending
      return dateA.localeCompare(dateB);
    });

    // Grouping
    const map = new Map<string, Task[]>();
    for (const t of sorted) {
      const key = t.dueDate || "unscheduled";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }

    map.forEach((items, dateKey) => {
      const meta = formatTaskDateHeading(dateKey === "unscheduled" ? null : dateKey, today);
      groups.push({
        dateKey,
        meta,
        items,
      });
    });

    // If TODAY tab and no tasks exist yet, still show the Today date heading so user sees "Today, 5 Sep 26"
    if (activeTab === "TODAY" && groups.length === 0) {
      groups.push({
        dateKey: today,
        meta: formatTaskDateHeading(today, today),
        items: [],
      });
    }

    return groups;
  }, [filteredTasks, activeTab, today]);

  const getPriorityStyle = (p: string) => {
    switch (p.toUpperCase()) {
      case "URGENT":
        return "bg-[#D98A6C] text-white";
      case "HIGH":
        return "bg-[#E5A88B] text-[#1E3127]";
      case "MEDIUM":
        return "bg-[#7C9A86] text-white";
      case "LOW":
      default:
        return "bg-[#EFEAE0] text-[#586B60]";
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "mind":
        return "bg-[#EAF0EC] text-[#5F7E6A] border border-[#7C9A86]/30";
      case "body":
        return "bg-[#F9ECE6] text-[#C87452] border border-[#D98A6C]/30";
      case "spirit":
        return "bg-[#F0EDF5] text-[#6E6482] border border-[#968AA8]/30";
      case "study":
        return "bg-[#EBF1F5] text-[#3D637E] border border-[#6B90AB]/30";
      case "career":
        return "bg-[#F4F5EB] text-[#636E39] border border-[#8F9C59]/30";
      case "craft":
      default:
        return "bg-[#F5E8DC] text-[#93593B] border border-[#D4A373]/30";
    }
  };

  const getDateHeaderIcon = (meta: TaskDateGroupMeta) => {
    if (meta.isToday) {
      return <Sun className="w-5 h-5 text-[#D4A373]" />;
    } else if (meta.isTomorrow) {
      return <Sunrise className="w-5 h-5 text-[#7C9A86]" />;
    } else if (meta.isOverdue) {
      return <AlertCircle className="w-5 h-5 text-[#D98A6C]" />;
    } else {
      return <CalendarDays className="w-5 h-5 text-[#586B60]" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
            Daily Intentions & Tasks
          </h2>
          <p className="text-sm text-[#586B60] mt-1 font-sans">
            Grounded execution connecting daily responsibilities with long-term aspirations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E3127] hover:bg-[#2A3F34] text-[#FAF7F0] font-medium text-sm transition-all shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Intention</span>
        </button>
      </div>

      {/* Filter Tabs & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE5D8] pb-4">
        {/* Main Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(["TODAY", "UPCOMING", "COMPLETED", "OVERDUE", "ALL"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-[#1E3127] text-[#FAF7F0] shadow-2xs"
                  : "bg-[#FFFFFF] text-[#586B60] hover:text-[#1A241E] border border-[#EAE5D8]"
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "Mind", "Body", "Craft", "Spirit", "Study", "Career"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[#D4A373] text-white"
                  : "bg-[#EFEAE0] text-[#586B60] hover:text-[#1A241E]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Date-Grouped Tasks Container */}
      <div className="space-y-7">
        {groupedTasks.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-3xl p-16 border border-[#EAE5D8] shadow-xs text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center mx-auto mb-3 text-[#7C9A86]">
              <Sparkles className="w-6 h-6 text-[#D98A6C]" />
            </div>
            <h4 className="font-serif text-xl font-semibold text-[#1A241E]">
              No intentions found
            </h4>
            <p className="text-xs text-[#586B60] mt-1">
              Your queue is clear for this view.
            </p>
          </div>
        ) : (
          groupedTasks.map((group) => {
            const hasItems = group.items.length > 0;

            return (
              <section key={group.dateKey} className="space-y-3">
                {/* PROMINENT DATE SECTION HEADING */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 pb-1 border-b border-[#EAE5D8]/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#EFEAE0] border border-[#E4DDD0] flex items-center justify-center shrink-0 shadow-2xs">
                      {getDateHeaderIcon(group.meta)}
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#1A241E]">
                        {group.meta.heading}
                      </h3>
                      {group.meta.subheading && (
                        <span className="text-xs font-medium text-[#586B60]">
                          {group.meta.subheading}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task Count Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {group.meta.isOverdue && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F9ECE6] text-[#C87452] border border-[#D98A6C]/30 text-xs font-semibold">
                        Needs Attention
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-[#FAF8F2] border border-[#EAE5D8] text-xs font-semibold text-[#586B60]">
                      {group.items.length} {group.items.length === 1 ? "intention" : "intentions"}
                    </span>
                  </div>
                </div>

                {/* Task Items under this Date */}
                <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-7 border border-[#EAE5D8] shadow-xs">
                  {!hasItems ? (
                    <div className="py-8 text-center text-xs text-[#8E9E94]">
                      No intentions scheduled for {group.meta.heading.toLowerCase()}. Relax or cultivate one above.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {group.items.map((task) => {
                        const isCompleted = task.status === "COMPLETED";

                        return (
                          <div
                            key={task.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                              isCompleted
                                ? "bg-[#FAF8F2] border-[#EAE5D8] opacity-75"
                                : "bg-[#FFFFFF] border-[#EAE5D8] hover:border-[#7C9A86]/50 shadow-2xs"
                            }`}
                          >
                            {/* Left: Check trigger + Info */}
                            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                              <button
                                onClick={() => handleToggle(task.id)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all mt-0.5 sm:mt-0 shrink-0 ${
                                  isCompleted
                                    ? "bg-[#7C9A86] border-[#7C9A86] text-white"
                                    : "border-[#8E9E94] hover:border-[#1E3127]"
                                }`}
                              >
                                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-base font-medium tracking-normal transition-all ${
                                      isCompleted
                                        ? "line-through text-[#8E9E94]"
                                        : "text-[#1A241E]"
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  {/* Priority Badge */}
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${getPriorityStyle(
                                      task.priority
                                    )}`}
                                  >
                                    {task.priority}
                                  </span>

                                  {/* Category Badge */}
                                  <span
                                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getCategoryBadge(
                                      task.category
                                    )}`}
                                  >
                                    {task.category}
                                  </span>
                                </div>

                                {task.description && (
                                  <p className="text-xs text-[#586B60] mt-1 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: Date pill & Scheduled time */}
                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs text-[#586B60]">
                              {task.dueTime && (
                                <span className="flex items-center gap-1 bg-[#FAF8F2] px-3 py-1 rounded-xl border border-[#EAE5D8]">
                                  <Clock className="w-3.5 h-3.5 text-[#D98A6C]" />
                                  <span>{task.dueTime}</span>
                                </span>
                              )}

                              {task.dueDate && (
                                <span className="flex items-center gap-1 bg-[#FAF8F2] px-3 py-1 rounded-xl border border-[#EAE5D8]">
                                  <CalendarIcon className="w-3.5 h-3.5 text-[#7C9A86]" />
                                  <span>{group.meta.formattedDate}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] text-[#1A241E] rounded-3xl p-6 md:p-8 max-w-lg w-full border border-[#EAE5D8] shadow-xl">
            <h4 className="font-serif text-2xl font-bold mb-4">Create Daily Intention</h4>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Focus Programming Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EAE5D8] bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Details, sub-intentions, or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
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
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Time
                  </label>
                  <input
                    type="text"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    placeholder="e.g. 6:00 PM"
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  />
                </div>
              </div>

              {goals.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Align with Long-Term Goal
                  </label>
                  <select
                    value={goalId}
                    onChange={(e) => setGoalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  >
                    <option value="">None (Independent Intention)</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE5D8]">
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
                  {isPending ? "Creating..." : "Save Intention"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
