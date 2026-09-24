"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
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
  CalendarClock,
  CalendarPlus,
  AlertCircle,
  Sun,
  Sunrise,
  CheckCircle2,
  Pencil,
  SlidersHorizontal,
  RotateCcw,
  X,
  ArrowDownUp,
  ArrowRight
} from "lucide-react";
import { 
  toggleTaskStatus, 
  createTask, 
  updateTask, 
  deleteTask, 
  reorderTasks, 
  rescheduleTask, 
  rescheduleYesterdayTasks,
  rescheduleAllOverdueTasks 
} from "@/lib/actions";
import { formatTaskDateHeading, getYesterdayString, TaskDateGroupMeta } from "@/lib/utils";
import { TodayClockDial } from "@/components/tasks/TodayClockDial";

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
  order?: number;
  createdAt?: Date | string;
}

interface TasksClientProps {
  initialTasks: Task[];
  goals: Goal[];
  today: string;
}

export function TasksClient({ initialTasks, goals, today }: TasksClientProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTab, setActiveTab] = useState<"ALL" | "TODAY" | "UPCOMING" | "ANYTIME" | "COMPLETED" | "OVERDUE">("TODAY");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync state when props change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Tab Count Calculations
  const todayCount = useMemo(
    () => tasks.filter((t) => t.dueDate === today && t.status !== "COMPLETED").length,
    [tasks, today]
  );
  const upcomingCount = useMemo(
    () => tasks.filter((t) => Boolean(t.dueDate && t.dueDate > today) && t.status !== "COMPLETED").length,
    [tasks, today]
  );
  const anytimeCount = useMemo(
    () => tasks.filter((t) => !t.dueDate && t.status !== "COMPLETED").length,
    [tasks]
  );
  const overdueCount = useMemo(
    () => tasks.filter((t) => Boolean(t.dueDate && t.dueDate < today) && t.status !== "COMPLETED").length,
    [tasks, today]
  );

  // Create Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("Craft");
  const [dueDate, setDueDate] = useState(today);
  const [isAnytime, setIsAnytime] = useState(false);
  const [goalId, setGoalId] = useState("");

  // Edit Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editCategory, setEditCategory] = useState("Craft");
  const [editDueDate, setEditDueDate] = useState(today);
  const [editIsAnytime, setEditIsAnytime] = useState(false);
  const [editGoalId, setEditGoalId] = useState("");

  // Filter & Sort States
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<"CUSTOM" | "NEWEST" | "OLDEST" | "PRIORITY_DESC" | "DATE_ASC">("CUSTOM");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [goalFilter, setGoalFilter] = useState<"ALL" | "WITH_GOAL" | "INDEPENDENT">("ALL");

  const isFilterActive = sortBy !== "CUSTOM" || priorityFilter !== "ALL" || goalFilter !== "ALL" || selectedCategory !== "ALL";

  const handleResetFilters = () => {
    setSortBy("CUSTOM");
    setPriorityFilter("ALL");
    setGoalFilter("ALL");
    setSelectedCategory("ALL");
  };

  // Inline Quick-Add State
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineCategory, setInlineCategory] = useState("Craft");
  const [inlinePriority, setInlinePriority] = useState("MEDIUM");

  // Morning Reset State: persists dismissal for the calendar day in localStorage
  const [dismissedOverdueBanner, setDismissedOverdueBanner] = useState(false);

  useEffect(() => {
    try {
      const dismissedDate = localStorage.getItem("rooted_dismissed_morning_reset_date");
      if (dismissedDate === today) {
        setDismissedOverdueBanner(true);
      }
    } catch {
      // Ignore if localStorage is unavailable
    }
  }, [today]);

  const handleDismissMorningReset = () => {
    setDismissedOverdueBanner(true);
    try {
      localStorage.setItem("rooted_dismissed_morning_reset_date", today);
    } catch {
      // Ignore
    }
  };

  // Helper for tomorrow date
  const getTomorrowDate = (baseDateStr?: string | null) => {
    const ref = baseDateStr || today;
    const parts = ref.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      const d = new Date(year, month - 1, day);
      d.setDate(d.getDate() + 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const yesterday = useMemo(() => getYesterdayString(today), [today]);

  const yesterdayTasks = useMemo(() => {
    return tasks.filter((t) => t.status === "PENDING" && t.dueDate === yesterday);
  }, [tasks, yesterday]);

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === today);
  }, [tasks, today]);

  const allTodayCompleted = todayTasks.length > 0 && todayTasks.every((t) => t.status === "COMPLETED");

  // Completion ripple animation tracking
  const [completedRippleId, setCompletedRippleId] = useState<string | null>(null);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverTaskId !== taskId) {
      setDragOverTaskId(taskId);
    }
  };

  const handleDragEnter = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    if (dragOverTaskId !== taskId) {
      setDragOverTaskId(taskId);
    }
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };


  const handleToggle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const willBeCompleted = task?.status !== "COMPLETED";

    if (willBeCompleted) {
      setCompletedRippleId(taskId);
      setTimeout(() => {
        setCompletedRippleId((curr) => (curr === taskId ? null : curr));
      }, 1600);
    } else {
      setCompletedRippleId(null);
    }

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

  const handleDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    startTransition(async () => {
      await deleteTask(taskId);
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
        dueDate: isAnytime ? null : dueDate,
        goalId: goalId || undefined,
      });

      if (newTask) {
        setTasks((prev) => [newTask as Task, ...prev]);
      }
      setShowAddModal(false);
      setTitle("");
      setDescription("");
      setIsAnytime(false);
    });
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "MEDIUM");
    setEditCategory(task.category || "Craft");
    setEditIsAnytime(!task.dueDate);
    setEditDueDate(task.dueDate || today);
    setEditGoalId(task.goalId || "");
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    const taskId = editingTask.id;
    const updatedData = {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      category: editCategory,
      dueDate: editIsAnytime ? null : (editDueDate || null),
      goalId: editGoalId || null,
    };

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              title: updatedData.title,
              description: updatedData.description || null,
              priority: updatedData.priority,
              category: updatedData.category,
              dueDate: updatedData.dueDate,
              goalId: updatedData.goalId,
            }
          : t
      )
    );

    setShowEditModal(false);
    setEditingTask(null);

    startTransition(async () => {
      await updateTask(taskId, updatedData as any);
    });
  };

  const handleInlineCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;

    const titleToPlant = inlineTitle.trim();
    const catToPlant = inlineCategory;
    const prioToPlant = inlinePriority;
    const targetDueDate = activeTab === "ANYTIME" ? null : today;
    setInlineTitle("");

    startTransition(async () => {
      const newTask = await createTask({
        title: titleToPlant,
        category: catToPlant,
        priority: prioToPlant,
        dueDate: targetDueDate,
      });

      if (newTask) {
        setTasks((prev) => [newTask as Task, ...prev]);
      }
    });
  };

  const handlePostponeToTomorrow = (taskId: string, currentDueDate?: string | null) => {
    const tomorrow = getTomorrowDate(currentDueDate);
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: tomorrow } : t))
    );

    startTransition(async () => {
      await rescheduleTask(taskId, tomorrow);
    });
  };

  const handleMoveToToday = (taskId: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: today } : t))
    );

    startTransition(async () => {
      await rescheduleTask(taskId, today);
    });
  };

  const handleMoveToAnytime = (taskId: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: null } : t))
    );

    startTransition(async () => {
      await rescheduleTask(taskId, null);
    });
  };

  const handleRescheduleAllOverdue = () => {
    try {
      localStorage.setItem("rooted_dismissed_morning_reset_date", today);
    } catch {
      // Ignore
    }
    // Optimistic update: only reschedule tasks from yesterday
    setTasks((prev) =>
      prev.map((t) =>
        t.status === "PENDING" && t.dueDate === yesterday
          ? { ...t, dueDate: today }
          : t
      )
    );

    startTransition(async () => {
      await rescheduleYesterdayTasks(today, yesterday);
    });
  };

  const priorityWeight = (p: string) => {
    switch (p?.toUpperCase()) {
      case "URGENT":
        return 4;
      case "HIGH":
        return 3;
      case "MEDIUM":
        return 2;
      case "LOW":
        return 1;
      default:
        return 0;
    }
  };

  // 1. Filter tasks according to active tab, category, priority, and goal alignment
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const isToday = task.dueDate === today;
      const isCompleted = task.status === "COMPLETED";
      const isOverdue = !isCompleted && Boolean(task.dueDate && task.dueDate < today);
      const isUpcoming = !isCompleted && Boolean(task.dueDate && task.dueDate > today);
      const isAnytime = !isCompleted && !task.dueDate;

      // Tab filter
      if (activeTab === "TODAY" && !isToday) return false;
      if (activeTab === "UPCOMING" && !isUpcoming) return false;
      if (activeTab === "ANYTIME" && !isAnytime) return false;
      if (activeTab === "COMPLETED" && !isCompleted) return false;
      if (activeTab === "OVERDUE" && !isOverdue) return false;

      // Category filter
      if (selectedCategory !== "ALL" && task.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "ALL" && task.priority.toUpperCase() !== priorityFilter.toUpperCase()) {
        return false;
      }

      // Goal filter
      if (goalFilter === "WITH_GOAL" && !task.goalId) return false;
      if (goalFilter === "INDEPENDENT" && task.goalId) return false;

      return true;
    });
  }, [tasks, activeTab, selectedCategory, priorityFilter, goalFilter, today]);

  // 2. Group filtered tasks by Date to build prominent date headings
  const groupedTasks = useMemo(() => {
    const groups: {
      dateKey: string;
      meta: TaskDateGroupMeta;
      items: Task[];
    }[] = [];

    // Comparator based on sortBy
    const compareWithinGroup = (a: Task, b: Task) => {
      if (sortBy === "NEWEST") {
        // Last entered on top (Top - Bottom)
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === "OLDEST") {
        // Last entered on bottom (Bottom - Top)
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      }
      if (sortBy === "PRIORITY_DESC") {
        return priorityWeight(b.priority) - priorityWeight(a.priority);
      }
      if (sortBy === "DATE_ASC") {
        const dateA = a.dueDate || "9999-99-99";
        const dateB = b.dueDate || "9999-99-99";
        return dateA.localeCompare(dateB);
      }
      // Default / CUSTOM order (from drag-to-shuffle)
      return (a.order ?? 0) - (b.order ?? 0);
    };

    // Sort order based on tab
    const sorted = [...filteredTasks].sort((a, b) => {
      const dateA = a.dueDate || "9999-99-99";
      const dateB = b.dueDate || "9999-99-99";
      // If dates differ:
      if (dateA !== dateB) {
        if (activeTab === "COMPLETED" || activeTab === "OVERDUE") {
          return dateB.localeCompare(dateA);
        }
        return dateA.localeCompare(dateB);
      }
      // If same date: apply the sorting comparator!
      return compareWithinGroup(a, b);
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
    } else if (activeTab === "ANYTIME" && groups.length === 0) {
      groups.push({
        dateKey: "unscheduled",
        meta: formatTaskDateHeading(null, today),
        items: [],
      });
    }

    return groups;
  }, [filteredTasks, activeTab, sortBy, today]);

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    const sourceTaskId = e.dataTransfer.getData("text/plain") || draggedTaskId;

    setDraggedTaskId(null);
    setDragOverTaskId(null);

    if (!sourceTaskId || sourceTaskId === targetTaskId) {
      return;
    }

    const currentVisualOrder = groupedTasks.flatMap((g) => g.items);
    const sourceIdx = currentVisualOrder.findIndex((t) => t.id === sourceTaskId);
    const targetIdx = currentVisualOrder.findIndex((t) => t.id === targetTaskId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const newVisualOrder = [...currentVisualOrder];
    const [moved] = newVisualOrder.splice(sourceIdx, 1);
    newVisualOrder.splice(targetIdx, 0, moved);

    // Keep hidden tasks (e.g. from other tabs or filtered out) in order
    const visibleIdSet = new Set(newVisualOrder.map((t) => t.id));
    const hiddenTasks = tasks.filter((t) => !visibleIdSet.has(t.id));

    const combined = [...newVisualOrder, ...hiddenTasks];
    const reordered = combined.map((t, idx) => ({ ...t, order: idx }));

    // Switch to CUSTOM so the dropped arrangement stays visually fixed and active
    setSortBy("CUSTOM");
    setTasks(reordered);

    // Persist to database
    startTransition(async () => {
      await reorderTasks(reordered.map((t) => t.id));
    });
  };

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
    if (meta.diffDays === 9999) {
      return <Sparkles className="w-5 h-5 text-[#D4A373]" />;
    }
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
    <div className="space-y-8 w-full">
      {/* Morning Reset: Reschedule Yesterday's Intentions to Today Banner (At very top of the page) */}
      {yesterdayTasks.length > 0 && !dismissedOverdueBanner && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-[#FAF6EE] border border-[#EADFC7] shadow-xs text-xs text-[#1A241E] animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#EFE3D3] border border-[#E2D2BC] flex items-center justify-center shrink-0 text-[#C87452]">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-semibold text-[#1A241E]">
                Morning Reset: {yesterdayTasks.length} {yesterdayTasks.length === 1 ? "intention" : "intentions"} left from yesterday
              </p>
              <p className="text-[11px] text-[#586B60] mt-0.5">
                Bring unfinished intentions directly into today&apos;s focus with one click.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleRescheduleAllOverdue}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E3127] text-[#FAF7F0] font-semibold text-xs hover:bg-[#2A3F34] transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reschedule to Today</span>
            </button>
            <button
              type="button"
              onClick={handleDismissMorningReset}
              title="Dismiss for today"
              className="p-1.5 rounded-xl text-[#8E9E94] hover:text-[#1A241E] hover:bg-[#EAE5D8]/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
            Daily Intentions & Tasks
          </h2>
          <p className="text-sm text-[#586B60] mt-1 font-sans">
            Grounded execution connecting daily responsibilities with long-term aspirations.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap self-start lg:self-auto">
          {/* Clock-type Organic Counter for Today */}
          <TodayClockDial tasks={tasks} today={today} />

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1E3127] hover:bg-[#2A3F34] text-[#FAF7F0] font-medium text-sm transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Intention</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE5D8] pb-4">
        {/* Main Status Tabs (Scrollbar hidden) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
          {(["TODAY", "UPCOMING", "ANYTIME", "COMPLETED", "OVERDUE", "ALL"] as const).map((tab) => {
            let count: number | null = null;
            if (tab === "TODAY") count = todayCount;
            else if (tab === "UPCOMING") count = upcomingCount;
            else if (tab === "ANYTIME") count = anytimeCount;
            else if (tab === "OVERDUE") count = overdueCount;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#1E3127] text-[#FAF7F0] shadow-2xs"
                    : "bg-[#FFFFFF] text-[#586B60] hover:text-[#1A241E] border border-[#EAE5D8]"
                }`}
              >
                <span>{tab.toLowerCase()}</span>
                {count !== null && count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                      activeTab === tab
                        ? "bg-[#2A3F34] text-[#FAF7F0]"
                        : "bg-[#EFEAE0] text-[#586B60]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right side: Filter & Order Popover Button */}
        <div className="relative shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setShowFilterMenu((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold tracking-wide transition-all shadow-2xs cursor-pointer ${
              isFilterActive
                ? "bg-[#1E3127] text-[#FAF7F0] border-[#1E3127]"
                : "bg-[#FFFFFF] text-[#586B60] hover:text-[#1A241E] border-[#EAE5D8] hover:border-[#7C9A86]/50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter &amp; Order</span>
            {selectedCategory !== "ALL" && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4A373] text-white">
                {selectedCategory}
              </span>
            )}
            {isFilterActive && selectedCategory === "ALL" && (
              <span className="w-2 h-2 rounded-full bg-[#D98A6C] animate-pulse" />
            )}
          </button>

          {/* Minimal, Clean Filter & Order Dropdown Modal */}
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 z-40 bg-[#FAF7F0] border border-[#EAE5D8] rounded-3xl p-4 sm:p-5 shadow-xl text-[#1A241E] space-y-4 animate-in fade-in duration-150">
              {/* Popover Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D8]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#7C9A86]" />
                  <span className="font-serif text-base font-bold text-[#1A241E]">
                    Filter &amp; Order
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isFilterActive && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#C87452] hover:text-[#D98A6C] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu(false)}
                    className="p-1 rounded-full text-[#8E9E94] hover:text-[#1A241E] hover:bg-[#EAE5D8]/50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section 1: Categories */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Category
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["ALL", "Mind", "Body", "Craft", "Spirit", "Study", "Career"].map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#D4A373] text-white shadow-2xs"
                            : "bg-white text-[#586B60] border border-[#EAE5D8] hover:border-[#7C9A86]/50"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Sort Order */}
              <div className="space-y-2 pt-2 border-t border-[#EAE5D8]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  <ArrowDownUp className="w-3 h-3 text-[#D4A373]" />
                  <span>Sort Order</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { key: "CUSTOM", label: "Custom Rhythm" },
                    { key: "NEWEST", label: "Newest First" },
                    { key: "OLDEST", label: "Oldest First" },
                    { key: "PRIORITY_DESC", label: "Priority" },
                    { key: "DATE_ASC", label: "Due Date" },
                  ].map((opt) => {
                    const isSelected = sortBy === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setSortBy(opt.key as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#1E3127] text-[#FAF7F0] shadow-2xs"
                            : "bg-white text-[#586B60] border border-[#EAE5D8] hover:border-[#7C9A86]/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Priority Filter */}
              <div className="space-y-2 pt-2 border-t border-[#EAE5D8]">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                  Priority
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => {
                    const isSelected = priorityFilter === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriorityFilter(p)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#7C9A86] text-white shadow-2xs"
                            : "bg-white text-[#586B60] border border-[#EAE5D8] hover:border-[#7C9A86]/50"
                        }`}
                      >
                        {p.toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Goal Alignment Filter */}
              {goals.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#EAE5D8]">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#586B60]">
                    Goal Alignment
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { key: "ALL", label: "All" },
                      { key: "WITH_GOAL", label: "Linked to Goal" },
                      { key: "INDEPENDENT", label: "Independent" },
                    ].map((g) => {
                      const isSelected = goalFilter === g.key;
                      return (
                        <button
                          key={g.key}
                          type="button"
                          onClick={() => setGoalFilter(g.key as any)}
                          className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#1E3127] text-[#FAF7F0] shadow-2xs"
                              : "bg-white text-[#586B60] border border-[#EAE5D8] hover:border-[#7C9A86]/50"
                          }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popover Footer */}
              <div className="pt-3 border-t border-[#EAE5D8] flex items-center justify-between">
                <span className="text-[11px] text-[#8E9E94]">
                  {isFilterActive ? "Custom filter active" : "Default view"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFilterMenu(false)}
                  className="px-4 py-1.5 rounded-xl bg-[#1E3127] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A3F34] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Inline Quick-Add Intention Input (Speed of Capture) */}
      <form
        onSubmit={handleInlineCreate}
        className="group bg-white border border-[#EAE5D8] focus-within:border-[#7C9A86] focus-within:ring-2 focus-within:ring-[#7C9A86]/20 rounded-3xl p-2.5 sm:p-3 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#EAE5D8] flex items-center justify-center text-[#7C9A86] shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={inlineTitle}
            onChange={(e) => setInlineTitle(e.target.value)}
            placeholder={
              activeTab === "ANYTIME"
                ? "Capture an intention for anytime... (No fixed deadline, press Enter)"
                : "Plant an intention for today... (Press Enter to save)"
            }
            className="w-full bg-transparent border-none outline-none text-sm text-[#1A241E] placeholder:text-[#8E9E94] font-medium"
          />
        </div>

        {/* Quick Selectors: Category & Priority + Submit button */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Category selector */}
          <select
            value={inlineCategory}
            onChange={(e) => setInlineCategory(e.target.value)}
            title="Category"
            className="bg-[#FAF7F0] border border-[#EAE5D8] text-[11px] font-semibold text-[#586B60] rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:border-[#7C9A86]/50 transition-colors"
          >
            {["Craft", "Mind", "Body", "Spirit", "Study", "Career"].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Priority selector */}
          <select
            value={inlinePriority}
            onChange={(e) => setInlinePriority(e.target.value)}
            title="Priority"
            className="bg-[#FAF7F0] border border-[#EAE5D8] text-[11px] font-semibold text-[#586B60] rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:border-[#7C9A86]/50 transition-colors"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!inlineTitle.trim()}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#1E3127] text-[#FAF7F0] font-medium text-xs hover:bg-[#2A3F34] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
          >
            <span>Plant</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Anytime Guidance Card */}
      {activeTab === "ANYTIME" && (
        <div className="p-4 rounded-3xl bg-[#FAF8F2] border border-[#EAE5D8] shadow-2xs flex items-center justify-between gap-3 text-xs text-[#586B60]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-[#EFEAE0] text-[#7C9A86] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
            </div>
            <div>
              <span className="font-semibold text-[#1A241E] block text-xs">
                Anytime Intentions (No Fixed Deadline)
              </span>
              <span className="text-[11px] text-[#586B60]">
                Chores, reading list, and ideas to tackle whenever time allows. Click &ldquo;Do Today&rdquo; to promote any intention into today&apos;s queue.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* All Intentions Met Evening Tranquility Card */}
      {activeTab === "TODAY" && allTodayCompleted && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FAF8F2] via-[#F4F9F5] to-[#EAF2ED] border border-[#7C9A86]/30 shadow-xs text-center space-y-2 animate-in fade-in duration-500">
          <div className="w-10 h-10 rounded-full bg-[#7C9A86]/20 border border-[#7C9A86]/40 flex items-center justify-center mx-auto text-[#1E3127]">
            <Sparkles className="w-5 h-5 text-[#7C9A86]" />
          </div>
          <h4 className="font-serif text-lg font-semibold text-[#1E3127]">
            All Daily Intentions Fulfilled
          </h4>
          <p className="text-xs text-[#586B60] max-w-md mx-auto">
            Take a deep breath, ground yourself, and enjoy the stillness. Your roots grow deeper with each mindful day.
          </p>
        </div>
      )}

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
                        const isRippling = completedRippleId === task.id;

                        return (
                          <div
                            key={task.id}
                            onDragOver={(e) => handleDragOver(e, task.id)}
                            onDragEnter={(e) => handleDragEnter(e, task.id)}
                            onDrop={(e) => handleDrop(e, task.id)}
                            className={`group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                              draggedTaskId === task.id
                                ? "opacity-35 scale-[0.98] border-dashed border-[#7C9A86] bg-[#FAF8F2]"
                                : dragOverTaskId === task.id
                                ? "border-t-2 border-t-[#7C9A86] ring-2 ring-[#7C9A86]/20 bg-[#FAF8F2]"
                                : isRippling
                                ? "bg-[#EBF5EE] border-[#7C9A86] ring-2 ring-[#7C9A86]/50 shadow-[0_4px_24px_rgba(124,154,134,0.35)] scale-[1.015]"
                                : isCompleted
                                ? "bg-[#F7FAF8] border-[#DCE8E0] opacity-80"
                                : "bg-[#FFFFFF] border-[#EAE5D8] hover:border-[#7C9A86]/50 shadow-2xs"
                            }`}
                          >
                            {/* Organic botanical ripple glow */}
                            {isRippling && (
                              <span className="absolute -left-6 -top-6 w-36 h-36 bg-[#7C9A86]/30 rounded-full blur-xl pointer-events-none animate-ping" />
                            )}

                            {/* Left: Drag Handle & Tactile Up/Down Shuffle + Check trigger + Info */}
                            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                              {/* 3 Horizontal Lines Drag Grip Handle */}
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                onDragEnd={handleDragEnd}
                                title="Drag to shuffle order"
                                className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 text-[#8E9E94] hover:text-[#1A241E] hover:bg-[#FAF8F2] rounded-lg transition-colors flex flex-col gap-[3px] items-center justify-center shrink-0 select-none"
                              >
                                <span className="w-3.5 h-[2px] bg-current rounded-full" />
                                <span className="w-3.5 h-[2px] bg-current rounded-full" />
                                <span className="w-3.5 h-[2px] bg-current rounded-full" />
                              </div>

                              <button
                                onClick={() => handleToggle(task.id)}
                                className={`relative w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 mt-0.5 sm:mt-0 shrink-0 cursor-pointer ${
                                  isCompleted
                                    ? "bg-[#7C9A86] border-[#7C9A86] text-white scale-110 shadow-xs"
                                    : "border-[#8E9E94] hover:border-[#1E3127]"
                                }`}
                              >
                                {/* Circular ripple wave rings */}
                                {isRippling && (
                                  <>
                                    <span className="absolute -inset-1 rounded-full bg-[#7C9A86]/40 animate-ping pointer-events-none" />
                                    <span className="absolute -inset-2.5 rounded-full border-2 border-[#7C9A86]/70 animate-pulse pointer-events-none" />
                                  </>
                                )}
                                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3] transition-transform duration-200 scale-100" />}
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

                                  {/* Celebratory Rooted badge during completion ripple */}
                                  {isRippling && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#20402E] bg-[#CEE6D7] px-2.5 py-0.5 rounded-full animate-bounce shadow-2xs">
                                      <span>🌿</span>
                                      <span>Grounded!</span>
                                    </span>
                                  )}

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

                            {/* Right: Date pill & Edit / Delete Action Buttons */}
                            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto text-xs text-[#586B60]">
                              {task.dueDate ? (
                                <span className="flex items-center gap-1 bg-[#FAF8F2] px-3 py-1 rounded-xl border border-[#EAE5D8]">
                                  <CalendarIcon className="w-3.5 h-3.5 text-[#7C9A86]" />
                                  <span>{group.meta.formattedDate}</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 bg-[#FAF8F2] px-2.5 py-1 rounded-xl border border-[#EAE5D8] text-[11px] text-[#7C9A86] font-medium">
                                  <Sparkles className="w-3 h-3 text-[#D4A373]" />
                                  <span>Anytime</span>
                                </span>
                              )}

                              {/* Action buttons: Do Today, Postpone (Tomorrow), Edit (Pencil) & Delete (Trash) */}
                              <div className="flex items-center gap-1">
                                {!isCompleted && !task.dueDate && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveToToday(task.id);
                                    }}
                                    title="Schedule to Today"
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#EAF0EC] hover:bg-[#1E3127] text-[#3B664B] hover:text-[#FAF7F0] border border-[#7C9A86]/30 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                                  >
                                    <CalendarIcon className="w-3 h-3" />
                                    <span>Do Today</span>
                                  </button>
                                )}

                                {!isCompleted && task.dueDate && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePostponeToTomorrow(task.id, task.dueDate);
                                    }}
                                    title="Postpone to Tomorrow (+1 day)"
                                    className="p-1.5 rounded-xl text-[#8E9E94] hover:text-[#C87452] hover:bg-[#F9ECE6] transition-all cursor-pointer"
                                  >
                                    <CalendarPlus className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(task);
                                  }}
                                  title="Edit intention"
                                  className="p-1.5 rounded-xl text-[#8E9E94] hover:text-[#1E3127] hover:bg-[#EAF0EC] transition-all cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(task.id);
                                  }}
                                  title="Delete intention"
                                  className="p-1.5 rounded-xl text-[#8E9E94] hover:text-[#D98A6C] hover:bg-[#F9ECE6] transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <option value="Study">Study</option>
                    <option value="Career">Career</option>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#586B60] uppercase tracking-wider">
                      Due Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAnytime(!isAnytime)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                        isAnytime
                          ? "bg-[#7C9A86] text-white"
                          : "bg-[#EFEAE0] text-[#586B60] hover:text-[#1A241E]"
                      }`}
                    >
                      {isAnytime ? "Anytime ✓" : "Anytime?"}
                    </button>
                  </div>
                  {isAnytime ? (
                    <div className="w-full px-3 py-1.5 rounded-2xl border border-dashed border-[#7C9A86]/60 bg-[#FAFDFB] text-xs text-[#5F7E6A] flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>Anytime (No fixed date)</span>
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                    />
                  )}
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

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] text-[#1A241E] rounded-3xl p-6 md:p-8 max-w-lg w-full border border-[#EAE5D8] shadow-xl">
            <h4 className="font-serif text-2xl font-bold mb-4">Edit Daily Intention</h4>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Focus Programming Session"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7C9A86]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  >
                    <option value="Mind">Mind</option>
                    <option value="Body">Body</option>
                    <option value="Craft">Craft</option>
                    <option value="Spirit">Spirit</option>
                    <option value="Study">Study</option>
                    <option value="Career">Career</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#586B60] uppercase tracking-wider">
                      Due Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditIsAnytime(!editIsAnytime)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                        editIsAnytime
                          ? "bg-[#7C9A86] text-white"
                          : "bg-[#EFEAE0] text-[#586B60] hover:text-[#1A241E]"
                      }`}
                    >
                      {editIsAnytime ? "Anytime ✓" : "Anytime?"}
                    </button>
                  </div>
                  {editIsAnytime ? (
                    <div className="w-full px-3 py-1.5 rounded-2xl border border-dashed border-[#7C9A86]/60 bg-[#FAFDFB] text-xs text-[#5F7E6A] flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>Anytime (No fixed date)</span>
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                    />
                  )}
                </div>
              </div>

              {goals.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Align with Long-Term Goal
                  </label>
                  <select
                    value={editGoalId}
                    onChange={(e) => setEditGoalId(e.target.value)}
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
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#586B60] hover:text-[#1A241E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-2xl bg-[#1E3127] text-[#FAF7F0] font-medium text-sm hover:bg-[#2A3F34] transition-colors"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
