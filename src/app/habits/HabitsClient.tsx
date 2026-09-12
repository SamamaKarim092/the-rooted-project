"use client";

import { useState, useTransition, useMemo } from "react";
import { 
  Check, 
  Plus, 
  Flame, 
  Repeat, 
  Sparkles, 
  Activity,
  Trash2,
  LayoutGrid,
  CalendarDays,
  Target,
  Pencil,
  CheckCircle2,
  Clock,
  GraduationCap,
  RotateCcw,
  ArrowRight,
  X
} from "lucide-react";
import { 
  toggleHabitLog, 
  createHabit, 
  updateHabit, 
  deleteHabit, 
  graduateHabit, 
  reopenHabit 
} from "@/lib/actions";
import { TodayHabitDial } from "@/components/habits/TodayHabitDial";
import { getWeekRange } from "@/lib/utils";

interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
  value: number;
}

interface Goal {
  id: string;
  title: string;
}

interface Habit {
  id: string;
  title: string;
  description: string | null;
  category: string;
  frequencyType: string;
  targetDaysPerWeek: number;
  targetValue: number;
  unit: string;
  color: string;
  status?: string;
  completedAt?: Date | string | null;
  completionNote?: string | null;
  createdAt?: Date | string;
  goalId?: string | null;
  goal?: Goal | null;
  logs: HabitLog[];
}

interface HabitsClientProps {
  initialHabits: Habit[];
  goals: Goal[];
  today: string;
}

export function HabitsClient({ initialHabits, goals, today }: HabitsClientProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [habitsTab, setHabitsTab] = useState<"ACTIVE" | "GRADUATED">("ACTIVE");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLETED" | "PENDING">("ALL");
  const [viewMode, setViewMode] = useState<"CARDS" | "MATRIX">("CARDS");
  const [isPending, startTransition] = useTransition();

  // Create Habit Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Mind");
  const [targetValue, setTargetValue] = useState(20);
  const [unit, setUnit] = useState("mins");
  const [frequencyType, setFrequencyType] = useState("DAILY");
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(7);
  const [goalId, setGoalId] = useState("");

  // Edit Habit Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Mind");
  const [editTargetValue, setEditTargetValue] = useState(20);
  const [editUnit, setEditUnit] = useState("mins");
  const [editFrequencyType, setEditFrequencyType] = useState("DAILY");
  const [editTargetDaysPerWeek, setEditTargetDaysPerWeek] = useState(7);
  const [editGoalId, setEditGoalId] = useState("");

  // Graduation & Completion State
  const [showGraduateModal, setShowGraduateModal] = useState(false);
  const [graduatingHabit, setGraduatingHabit] = useState<Habit | null>(null);
  const [graduationNote, setGraduationNote] = useState("");
  const [graduatedSuccessHabit, setGraduatedSuccessHabit] = useState<Habit | null>(null);

  // Active vs Graduated Habits Partition
  const activeHabits = useMemo(() => habits.filter((h) => h.status !== "COMPLETED"), [habits]);
  const graduatedHabits = useMemo(() => habits.filter((h) => h.status === "COMPLETED"), [habits]);

  // Week range for tracking weekly cadence
  const weekInfo = useMemo(() => getWeekRange(today), [today]);

  // Lifetime graduation stats helper
  const getHabitGraduationStats = (habit: Habit) => {
    const started = habit.createdAt ? new Date(habit.createdAt) : new Date();
    const completed = habit.completedAt ? new Date(habit.completedAt) : new Date();
    const diffDays = Math.max(
      Math.ceil((completed.getTime() - started.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      1
    );
    const totalSessions = habit.logs.filter((l) => l.completed).length;
    const consistencyRate = Math.min(Math.round((totalSessions / diffDays) * 100), 100);
    return {
      started,
      completed,
      diffDays,
      totalSessions,
      consistencyRate,
    };
  };

  // Handle checking off habit for a specific date (defaults to today)
  const handleToggle = (habitId: string, targetDate: string = today) => {
    // Optimistic toggle
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const existingIndex = h.logs.findIndex((l) => l.date === targetDate);
        let updatedLogs = [...h.logs];
        if (existingIndex >= 0) {
          updatedLogs[existingIndex] = {
            ...updatedLogs[existingIndex],
            completed: !updatedLogs[existingIndex].completed,
          };
        } else {
          updatedLogs.unshift({
            id: `temp-${Date.now()}`,
            date: targetDate,
            completed: true,
            value: h.targetValue,
          });
        }
        return { ...h, logs: updatedLogs };
      })
    );

    startTransition(async () => {
      await toggleHabitLog(habitId, targetDate);
    });
  };

  const handleDelete = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    startTransition(async () => {
      await deleteHabit(habitId);
    });
  };

  const handleOpenGraduate = (habit: Habit) => {
    setGraduatingHabit(habit);
    setGraduationNote("");
    setShowGraduateModal(true);
  };

  const handleConfirmGraduate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!graduatingHabit) return;
    const targetId = graduatingHabit.id;
    const note = graduationNote.trim();
    const now = new Date();

    setHabits((prev) =>
      prev.map((h) =>
        h.id === targetId
          ? { ...h, status: "COMPLETED", completedAt: now, completionNote: note || null }
          : h
      )
    );

    const graduatedInstance: Habit = {
      ...graduatingHabit,
      status: "COMPLETED",
      completedAt: now,
      completionNote: note || null,
    };
    setGraduatedSuccessHabit(graduatedInstance);
    setShowGraduateModal(false);
    setGraduatingHabit(null);
    setGraduationNote("");

    startTransition(async () => {
      await graduateHabit(targetId, note || undefined);
    });
  };

  const handleReopen = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, status: "ACTIVE", completedAt: null, completionNote: null }
          : h
      )
    );
    startTransition(async () => {
      await reopenHabit(habitId);
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      const newHabit = await createHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        targetDaysPerWeek: frequencyType === "DAILY" ? 7 : Number(targetDaysPerWeek),
        targetValue: Number(targetValue),
        unit: unit.trim() || "times",
        goalId: goalId || undefined,
      });

      if (newHabit) {
        setHabits((prev) => [
          {
            id: newHabit.id,
            title: newHabit.title,
            description: newHabit.description,
            category: newHabit.category,
            frequencyType: newHabit.frequencyType,
            targetDaysPerWeek: newHabit.targetDaysPerWeek,
            targetValue: newHabit.targetValue,
            unit: newHabit.unit,
            color: newHabit.color,
            status: "ACTIVE",
            createdAt: new Date(),
            goalId: newHabit.goalId,
            goal: goals.find((g) => g.id === newHabit.goalId) || null,
            logs: [],
          },
          ...prev,
        ]);
      }
      setShowAddModal(false);
      setTitle("");
      setDescription("");
      setGoalId("");
    });
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditTitle(habit.title);
    setEditDescription(habit.description || "");
    setEditCategory(habit.category);
    setEditTargetValue(habit.targetValue);
    setEditUnit(habit.unit);
    setEditFrequencyType(habit.frequencyType);
    setEditTargetDaysPerWeek(habit.targetDaysPerWeek);
    setEditGoalId(habit.goalId || "");
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editTitle.trim()) return;

    const habitId = editingHabit.id;
    const updatedPayload = {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      category: editCategory,
      targetDaysPerWeek: editFrequencyType === "DAILY" ? 7 : Number(editTargetDaysPerWeek),
      targetValue: Number(editTargetValue),
      unit: editUnit.trim() || "times",
      goalId: editGoalId || null,
    };

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          title: updatedPayload.title,
          description: updatedPayload.description || null,
          category: updatedPayload.category,
          targetDaysPerWeek: updatedPayload.targetDaysPerWeek,
          targetValue: updatedPayload.targetValue,
          unit: updatedPayload.unit,
          goalId: updatedPayload.goalId,
          goal: goals.find((g) => g.id === updatedPayload.goalId) || null,
        };
      })
    );

    setShowEditModal(false);
    setEditingHabit(null);

    startTransition(async () => {
      await updateHabit(habitId, updatedPayload);
    });
  };

  const prefillModal = (presetTitle: string, presetCategory: string, presetTarget: number, presetUnit: string, presetDesc: string) => {
    setTitle(presetTitle);
    setCategory(presetCategory);
    setTargetValue(presetTarget);
    setUnit(presetUnit);
    setDescription(presetDesc);
    setShowAddModal(true);
  };

  // Calculate dynamic streaks, 7-day logs & weekly metrics for ACTIVE habits
  const habitStats = useMemo(() => {
    return activeHabits.map((habit) => {
      // Current streak calculation (up to 30 days retrospective)
      let currentStreak = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const log = habit.logs.find((l) => l.date === dateStr);
        if (log?.completed) {
          currentStreak++;
        } else {
          if (i === 0) continue;
          break;
        }
      }

      // Past 7 days status: from 6 days ago to today
      const past7Days = [];
      const dayLetters = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const log = habit.logs.find((l) => l.date === dateStr);
        past7Days.push({
          date: dateStr,
          dayLabel: dayLetters[d.getDay()],
          completed: log?.completed ?? false,
          isToday: i === 0,
        });
      }

      const totalCompletions = habit.logs.filter((l) => l.completed).length;
      const isTodayDone = habit.logs.some((l) => l.date === today && l.completed);

      // Weekly completions (anchor to current week Mon-Sun)
      const thisWeekCompletions = habit.logs.filter(
        (l) => weekInfo.weekDays.includes(l.date) && l.completed
      ).length;
      const targetDaysThisWeek = habit.frequencyType === "DAILY" ? 7 : habit.targetDaysPerWeek;
      const weeklyProgressRate = Math.min(
        Math.round((thisWeekCompletions / targetDaysThisWeek) * 100),
        100
      );

      return {
        habit,
        currentStreak,
        past7Days,
        totalCompletions,
        isTodayDone,
        thisWeekCompletions,
        targetDaysThisWeek,
        weeklyProgressRate,
      };
    });
  }, [activeHabits, today, weekInfo]);

  // Overall Scoreboard Calculations
  const completedTodayCount = useMemo(() => {
    return habitStats.filter((h) => h.isTodayDone).length;
  }, [habitStats]);

  const pendingTodayCount = useMemo(() => {
    return habitStats.length - completedTodayCount;
  }, [habitStats, completedTodayCount]);

  const topStreakData = useMemo(() => {
    if (habitStats.length === 0) return { streak: 0, title: "No active habits" };
    let best = habitStats[0];
    for (const h of habitStats) {
      if (h.currentStreak > best.currentStreak) best = h;
    }
    return {
      streak: best.currentStreak,
      title: best.currentStreak > 0 ? best.habit.title : "Cultivate a habit to start",
    };
  }, [habitStats]);

  const rolling7DayRate = useMemo(() => {
    if (habitStats.length === 0) return 0;
    let totalPossible = habitStats.length * 7;
    let completed = 0;
    habitStats.forEach((h) => {
      completed += h.past7Days.filter((d) => d.completed).length;
    });
    return Math.round((completed / totalPossible) * 100);
  }, [habitStats]);

  // Filtered habits by Category & Completion Status
  const filteredStats = useMemo(() => {
    return habitStats.filter((h) => {
      const matchesCategory =
        activeCategory === "ALL" ||
        h.habit.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "COMPLETED" && h.isTodayDone) ||
        (statusFilter === "PENDING" && !h.isTodayDone);
      return matchesCategory && matchesStatus;
    });
  }, [habitStats, activeCategory, statusFilter]);

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

  // Weekday column headers for matrix view
  const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-8">
      {/* 1. Header with Editorial Title & Today Habit Dial */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
            Habit Growth & Streaks
          </h2>
          <p className="text-sm text-[#586B60] mt-1 font-sans">
            Cultivate rhythmic consistency across mind, body, craft, and stillness.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap self-start lg:self-auto">
          {/* Circular Dial Counter for Today's Habits */}
          <TodayHabitDial habits={activeHabits} today={today} />

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1E3127] hover:bg-[#2A3F34] text-[#FAF7F0] font-medium text-sm transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cultivate Habit</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic Metric Scoreboard Capsules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Grove */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7C9A86] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60]">
              Active Grove
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EAF0EC] text-[#5F7E6A] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl font-bold text-[#1A241E]">
              {activeHabits.length}
            </div>
            <p className="text-xs text-[#586B60] mt-1 font-medium">
              {activeHabits.length === 1 ? "1 active habit ritual" : `${activeHabits.length} active rituals cultivated`}
            </p>
          </div>
        </div>

        {/* Top Active Streak */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#D98A6C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60]">
              Top Active Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F5E8DC] text-[#93593B] flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#D98A6C] fill-[#D98A6C]" />
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl font-bold text-[#1A241E]">
              {topStreakData.streak} <span className="text-base font-normal text-[#586B60]">days</span>
            </div>
            <p className="text-xs text-[#586B60] mt-1 font-medium truncate" title={topStreakData.title}>
              {topStreakData.title}
            </p>
          </div>
        </div>

        {/* 7-Day Consistency Rate */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#EAE5D8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7C9A86] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#586B60]">
              Rolling 7-Day Rhythm
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EAF0EC] text-[#5F7E6A] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl font-bold text-[#1A241E]">
              {rolling7DayRate}%
            </div>
            <p className="text-xs text-[#586B60] mt-1 font-medium">
              Rolling 7-day consistency average
            </p>
          </div>
        </div>
      </div>

      {/* 2.5 Horizon View Tabs: Active Rituals vs Graduated & Mastered Archive */}
      <div className="flex items-center justify-between border-b border-[#EAE5D8] pb-1 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHabitsTab("ACTIVE")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all ${
              habitsTab === "ACTIVE"
                ? "bg-[#1E3127] text-[#FAF7F0] shadow-2xs"
                : "bg-transparent text-[#586B60] hover:text-[#1A241E] hover:bg-[#FAF8F2]"
            }`}
          >
            <span>Active Rituals</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                habitsTab === "ACTIVE"
                  ? "bg-[#2A3F34] text-[#FAF7F0]"
                  : "bg-[#EFEAE0] text-[#586B60]"
              }`}
            >
              {activeHabits.length}
            </span>
          </button>

          <button
            onClick={() => setHabitsTab("GRADUATED")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all ${
              habitsTab === "GRADUATED"
                ? "bg-[#7C9A86] text-white shadow-2xs"
                : "bg-transparent text-[#586B60] hover:text-[#1A241E] hover:bg-[#FAF8F2]"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Graduated &amp; Mastered</span>
            {graduatedHabits.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  habitsTab === "GRADUATED"
                    ? "bg-[#5F7E6A] text-white"
                    : "bg-[#EAF0EC] text-[#5F7E6A]"
                }`}
              >
                {graduatedHabits.length}
              </span>
            )}
          </button>
        </div>

        {habitsTab === "ACTIVE" && activeHabits.length > 0 && (
          <div className="text-xs text-[#7C9A86] font-medium hidden sm:block">
            Cultivate consistency daily • Graduate when mastered
          </div>
        )}
      </div>

      {/* 2.6 Graduation Celebration Banner */}
      {graduatedSuccessHabit && (
        <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-[#FAF8F2] via-[#F4EFE6] to-[#EAF0EC] border border-[#7C9A86]/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7C9A86] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-serif text-lg font-bold text-[#1A241E]">
                  Ritual Mastered: &ldquo;{graduatedSuccessHabit.title}&rdquo;
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF0EC] text-[#3B664B] border border-[#7C9A86]/30">
                  Enshrined in Archive 🎓
                </span>
              </div>
              <p className="text-xs text-[#586B60] mt-1">
                Congratulations on completing your practice! What new skill or ritual will you cultivate next?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={() => {
                prefillModal(
                  "",
                  graduatedSuccessHabit.category,
                  graduatedSuccessHabit.targetValue,
                  graduatedSuccessHabit.unit,
                  `Follow-up ritual inspired by mastering ${graduatedSuccessHabit.title}`
                );
                setGraduatedSuccessHabit(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1E3127] text-[#FAF7F0] hover:bg-[#2A3F34] text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Plant Next Ritual</span>
            </button>

            <button
              onClick={() => setGraduatedSuccessHabit(null)}
              className="p-2 rounded-xl text-[#8E9E94] hover:text-[#1A241E] hover:bg-black/5 transition-all"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {habitsTab === "GRADUATED" ? (
        /* GRADUATED & MASTERED RITUALS ARCHIVE VIEW */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-6 rounded-3xl border border-[#EAE5D8] shadow-xs">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1A241E] flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-[#7C9A86]" />
                <span>Mastered Rituals Archive</span>
              </h3>
              <p className="text-xs text-[#586B60] mt-1 font-sans">
                A permanent retrospective of learning sprints, completed challenges, and mastered life habits.
              </p>
            </div>

            <button
              onClick={() => {
                prefillModal("", "Career", 30, "mins", "Next learning sprint or life ritual");
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1E3127] text-[#FAF7F0] hover:bg-[#2A3F34] text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Plant Next Ritual</span>
            </button>
          </div>

          {graduatedHabits.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-3xl p-10 md:p-14 border border-[#EAE5D8] shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center mx-auto text-[#7C9A86] shadow-2xs">
                <GraduationCap className="w-7 h-7 text-[#7C9A86]" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-serif text-xl font-bold text-[#1A241E]">
                  No Mastered Rituals Yet
                </h4>
                <p className="text-xs text-[#586B60] leading-relaxed">
                  When you complete a finite habit or learning sprint (e.g. &ldquo;Learning DBMS&rdquo; or a 30-day coding challenge), click the graduation cap icon 🎓 on the habit card to graduate it into this permanent archive.
                </p>
              </div>
              <button
                onClick={() => setHabitsTab("ACTIVE")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1E3127] text-[#FAF7F0] text-xs font-semibold shadow-xs hover:bg-[#2A3F34] transition-all"
              >
                <span>View Active Rituals</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {graduatedHabits.map((habit) => {
                const stats = getHabitGraduationStats(habit);
                return (
                  <div
                    key={habit.id}
                    className="p-7 rounded-3xl bg-[#FFFFFF] border border-[#7C9A86]/35 shadow-xs flex flex-col justify-between group hover:border-[#7C9A86] transition-all"
                  >
                    <div>
                      {/* Top Row: Category + Mastered Badge + Reopen */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getCategoryBadge(
                              habit.category
                            )}`}
                          >
                            {habit.category}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF0EC] text-[#3B664B] border border-[#7C9A86]/40 text-xs font-semibold shadow-2xs">
                            <GraduationCap className="w-3.5 h-3.5 text-[#5F7E6A]" />
                            <span>Mastered</span>
                          </span>
                        </div>

                        {/* Reopen Action Button */}
                        <button
                          onClick={() => handleReopen(habit.id)}
                          title="Re-open ritual back into active grove"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium text-[#586B60] hover:text-[#1E3127] hover:bg-[#FAF8F2] border border-[#EAE5D8] transition-all"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reopen</span>
                        </button>
                      </div>

                      {/* Title & Description */}
                      <h4 className="font-serif text-2xl font-bold text-[#1A241E] flex items-center gap-2">
                        <span>{habit.title}</span>
                        <CheckCircle2 className="w-5 h-5 text-[#5F7E6A] shrink-0" />
                      </h4>
                      {habit.description && (
                        <p className="text-xs text-[#586B60] mt-1 leading-relaxed line-clamp-2">
                          {habit.description}
                        </p>
                      )}

                      {/* Learning Milestones & Metrics Strip */}
                      <div className="mt-4 p-4 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8] space-y-2.5">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-xl bg-white border border-[#EAE5D8]/80 shadow-2xs">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E9E94] block">
                              Duration
                            </span>
                            <span className="font-serif text-sm font-bold text-[#1A241E]">
                              {stats.diffDays} {stats.diffDays === 1 ? "day" : "days"}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-white border border-[#EAE5D8]/80 shadow-2xs">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E9E94] block">
                              Sessions
                            </span>
                            <span className="font-serif text-sm font-bold text-[#3B664B]">
                              {stats.totalSessions} logged
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-white border border-[#EAE5D8]/80 shadow-2xs">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E9E94] block">
                              Consistency
                            </span>
                            <span className="font-serif text-sm font-bold text-[#D98A6C]">
                              {stats.consistencyRate}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#586B60] pt-1 px-1">
                          <span>
                            Started: {stats.started.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span>
                            Graduated: {stats.completed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Reflection Note (if present) */}
                      {habit.completionNote && (
                        <div className="mt-3.5 p-3.5 rounded-2xl bg-[#FAFDFB] border border-[#7C9A86]/25 text-xs text-[#2D4537] italic font-serif leading-relaxed">
                          &ldquo;{habit.completionNote}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Cultivate Next Step */}
                    <div className="mt-5 pt-3 border-t border-[#EAE5D8] flex items-center justify-between">
                      <span className="text-[11px] text-[#8E9E94] font-medium">
                        Completed learning practice
                      </span>
                      <button
                        onClick={() =>
                          prefillModal(
                            "",
                            habit.category,
                            habit.targetValue,
                            habit.unit,
                            `Next progression following ${habit.title}`
                          )
                        }
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#1E3127] text-[#1A241E] hover:text-[#FAF7F0] border border-[#EAE5D8] text-xs font-semibold transition-all shadow-2xs"
                      >
                        <span>Plant Next Habit</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 3. Filter Bar: Categories + Completion Status + View Mode Switcher */}
          <div className="space-y-3 border-b border-[#EAE5D8] pb-4">
            {/* Row 1: Category Pills */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "Mind", "Body", "Craft", "Spirit", "Study", "Career"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-[#1E3127] text-[#FAF7F0] shadow-2xs"
                        : "bg-[#FFFFFF] text-[#586B60] hover:text-[#1A241E] border border-[#EAE5D8]"
                    }`}
                  >
                    {cat.toLowerCase()}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle: Cards vs Weekly Matrix */}
              <div className="flex items-center gap-1.5 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#EAE5D8] shadow-2xs">
                <button
                  onClick={() => setViewMode("CARDS")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    viewMode === "CARDS"
                      ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                      : "text-[#586B60] hover:text-[#1A241E]"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>

                <button
                  onClick={() => setViewMode("MATRIX")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    viewMode === "MATRIX"
                      ? "bg-[#1E3127] text-[#FAF7F0] shadow-xs"
                      : "text-[#586B60] hover:text-[#1A241E]"
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Weekly Matrix</span>
                </button>
              </div>
            </div>

            {/* Row 2: Completion Status Quick-Filter */}
            {activeHabits.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8E9E94] mr-1">
                  Filter:
                </span>
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === "ALL"
                      ? "bg-[#1E3127] text-[#FAF7F0] shadow-2xs"
                      : "bg-[#FFFFFF] text-[#586B60] hover:text-[#1A241E] border border-[#EAE5D8]"
                  }`}
                >
                  All Active ({activeHabits.length})
                </button>

                <button
                  onClick={() => setStatusFilter("COMPLETED")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === "COMPLETED"
                      ? "bg-[#7C9A86] text-white shadow-2xs"
                      : "bg-[#FFFFFF] text-[#586B60] hover:text-[#1A241E] border border-[#EAE5D8]"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5F7E6A] group-hover:text-white" />
                  <span>Completed Today ({completedTodayCount})</span>
                </button>

                <button
                  onClick={() => setStatusFilter("PENDING")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === "PENDING"
                      ? "bg-[#D98A6C] text-white shadow-2xs"
                      : "bg-[#FFFFFF] text-[#586B60] hover:text-[#1A241E] border border-[#EAE5D8]"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Pending Today ({pendingTodayCount})</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. MAIN CONTENT AREA */}
          {activeHabits.length === 0 ? (
        /* Botanical Empty State when 0 habits */
        <div className="bg-[#FFFFFF] rounded-3xl p-10 md:p-14 border border-[#EAE5D8] shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center mx-auto text-[#7C9A86] shadow-2xs">
            <Sparkles className="w-8 h-8 text-[#D4A373]" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1A241E]">
              Your Habit Grove is Ready to Sprout
            </h3>
            <p className="text-sm text-[#586B60] leading-relaxed">
              Habits are the quiet compound interest of self-improvement. Plant your first daily ritual to start tracking consistency, streaks, and weekly harmony.
            </p>
          </div>

          {/* Quick Starter Templates */}
          <div className="pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9E94] block mb-3">
              Or pick an intentional starter ritual:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-xl mx-auto">
              <button
                onClick={() => prefillModal("Morning Deep Work", "Craft", 60, "mins", "Uninterrupted creative and engineering focus session.")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF8F2] hover:bg-[#F2ECE1] text-[#1A241E] text-xs font-semibold border border-[#EAE5D8] transition-all hover:scale-[1.02]"
              >
                <span>✍️ Morning Deep Work</span>
                <span className="text-[10px] text-[#586B60]">Craft • 60m</span>
              </button>

              <button
                onClick={() => prefillModal("Movement & Breathwork", "Body", 30, "mins", "Daily mobility, calisthenics, or endurance run.")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF8F2] hover:bg-[#F2ECE1] text-[#1A241E] text-xs font-semibold border border-[#EAE5D8] transition-all hover:scale-[1.02]"
              >
                <span>🏃 Movement & Breathwork</span>
                <span className="text-[10px] text-[#586B60]">Body • 30m</span>
              </button>

              <button
                onClick={() => prefillModal("Reflective Reading", "Study", 20, "pages", "Absorb deep books or technical research papers.")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF8F2] hover:bg-[#F2ECE1] text-[#1A241E] text-xs font-semibold border border-[#EAE5D8] transition-all hover:scale-[1.02]"
              >
                <span>📚 Reflective Reading</span>
                <span className="text-[10px] text-[#586B60]">Study • 20p</span>
              </button>

              <button
                onClick={() => prefillModal("Stillness & Meditation", "Mind", 15, "mins", "Silent breath meditation or tea ritual.")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF8F2] hover:bg-[#F2ECE1] text-[#1A241E] text-xs font-semibold border border-[#EAE5D8] transition-all hover:scale-[1.02]"
              >
                <span>🧘 Stillness & Meditation</span>
                <span className="text-[10px] text-[#586B60]">Mind • 15m</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1E3127] text-[#FAF7F0] font-medium text-sm hover:bg-[#2A3F34] transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Cultivate Custom Habit</span>
          </button>
        </div>
      ) : filteredStats.length === 0 ? (
        /* Empty state when active filter yields 0 */
        <div className="bg-[#FFFFFF] rounded-3xl p-10 border border-[#EAE5D8] shadow-xs text-center space-y-4">
          <p className="text-sm text-[#586B60]">
            No habit rituals found matching this filter criteria.
          </p>
          <button
            onClick={() => {
              setActiveCategory("ALL");
              setStatusFilter("ALL");
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E3127] text-[#FAF7F0]"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "CARDS" ? (
        /* VIEW 1: RICH EDITORIAL CARDS WITH COMPLETION & TRACKING */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStats.map(({ 
            habit, 
            currentStreak, 
            past7Days, 
            isTodayDone, 
            totalCompletions, 
            thisWeekCompletions, 
            targetDaysThisWeek, 
            weeklyProgressRate 
          }) => (
            <div
              key={habit.id}
              className={`p-7 rounded-3xl border transition-all flex flex-col justify-between group ${
                isTodayDone
                  ? "bg-gradient-to-br from-[#FFFFFF] via-[#FAFDFB] to-[#F1F7F3] border-[#7C9A86]/60 shadow-xs"
                  : "bg-[#FFFFFF] border-[#EAE5D8] shadow-xs hover:border-[#7C9A86]/40"
              }`}
            >
              <div>
                {/* Top Row: Category Pill + Streak Badge + Completion Badge + Actions */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getCategoryBadge(
                        habit.category
                      )}`}
                    >
                      {habit.category}
                    </span>

                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5E8DC] text-[#93593B] text-xs font-semibold">
                      <Flame className="w-3.5 h-3.5 text-[#D98A6C] fill-[#D98A6C]" />
                      <span>{currentStreak}d Streak</span>
                    </div>

                    {/* Completion Status Badge on Card */}
                    {isTodayDone ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF0EC] text-[#3B664B] border border-[#7C9A86]/40 text-xs font-semibold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5F7E6A]" />
                        <span>Completed Today</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF8F2] text-[#8E7E6A] border border-[#EAE5D8] text-xs font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                        <span>Pending Today</span>
                      </span>
                    )}
                  </div>

                  {/* Top-Right Action Controls: Graduate, Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenGraduate(habit)}
                      title="Graduate & master this habit"
                      className="p-1.5 rounded-xl text-[#7C9A86] hover:text-[#5F7E6A] hover:bg-[#EAF0EC] border border-transparent hover:border-[#7C9A86]/30 transition-all"
                    >
                      <GraduationCap className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(habit)}
                      title="Edit habit details"
                      className="p-1.5 rounded-xl text-[#586B60] hover:text-[#1E3127] hover:bg-[#FAF8F2] border border-transparent hover:border-[#EAE5D8] transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(habit.id)}
                      title="Delete habit"
                      className="p-1.5 rounded-xl text-[#8E9E94] hover:text-[#D98A6C] hover:bg-[#FAF8F2] border border-transparent hover:border-[#EAE5D8] transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Habit Title & Description */}
                <h3 className="font-serif text-2xl font-bold text-[#1A241E] flex items-center gap-2">
                  <span>{habit.title}</span>
                  {isTodayDone && (
                    <span title="Completed for today" className="w-5 h-5 rounded-full bg-[#EAF0EC] text-[#5F7E6A] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#586B60] mt-1 leading-relaxed line-clamp-2">
                  {habit.description || "A consistent daily practice."}
                </p>

                {/* Tracking & Cadence Strip: Track habits completed */}
                <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#1A241E] font-semibold">
                      <Target className="w-3.5 h-3.5 text-[#7C9A86]" />
                      <span>Weekly Consistency</span>
                    </div>
                    <span className="font-bold text-[#1A241E]">
                      {thisWeekCompletions} of {targetDaysThisWeek} days ({weeklyProgressRate}%)
                    </span>
                  </div>

                  {/* Weekly Progress Bar */}
                  <div className="w-full h-2 bg-[#EFEAE0] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        weeklyProgressRate >= 100 ? "bg-[#5F7E6A]" : "bg-[#7C9A86]"
                      }`} 
                      style={{ width: `${weeklyProgressRate}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#586B60] pt-1 flex-wrap gap-2">
                    <span className="flex items-center gap-1">
                      <Repeat className="w-3 h-3 text-[#7C9A86]" />
                      Target: {habit.targetValue} {habit.unit} • {habit.frequencyType === "DAILY" ? "Daily" : `${habit.targetDaysPerWeek}x/wk`}
                    </span>
                    <span className="font-semibold text-[#5F7E6A] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D4A373]" />
                      {totalCompletions} total completed
                    </span>
                  </div>

                  {habit.goal && (
                    <div className="pt-1.5 border-t border-[#EAE5D8]/80 flex items-center gap-1.5 text-[11px] text-[#586B60]">
                      <Target className="w-3 h-3 text-[#D4A373] shrink-0" />
                      <span className="truncate">Aligned with: <strong>{habit.goal.title}</strong></span>
                    </div>
                  )}
                </div>

                {/* Interactive 7-Day Rolling Rhythm Track */}
                <div className="mt-4 pt-3 border-t border-[#EAE5D8]">
                  <div className="flex items-center justify-between text-[11px] text-[#8E9E94] mb-2 font-medium">
                    <span>Past 7 Days History (Click any day to log)</span>
                    <span className="font-semibold text-[#1A241E]">Today</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    {past7Days.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleToggle(habit.id, day.date)}
                        className={`flex-1 flex flex-col items-center gap-1 p-1 rounded-xl transition-all hover:bg-[#FAF8F2] ${
                          day.isToday ? "ring-1 ring-[#1E3127]/25 bg-[#FAF8F2]/60" : ""
                        }`}
                        title={`${day.date}: ${day.completed ? "Completed ✓ (Click to toggle)" : "Incomplete (Click to check off)"}`}
                      >
                        <div
                          className={`w-full h-3.5 rounded-full flex items-center justify-center transition-all ${
                            day.completed
                              ? "bg-[#7C9A86] text-white"
                              : day.isToday
                              ? "bg-[#D98A6C]"
                              : "bg-[#EFEAE0]"
                          }`}
                        >
                          {day.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="text-[10px] font-semibold text-[#8E9E94]">
                          {day.dayLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-5 pt-3 border-t border-[#EAE5D8] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {isTodayDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#5F7E6A]" />
                      <span className="text-[#3B664B] font-semibold">Rooted for today</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-[#D4A373]" />
                      <span className="text-[#586B60]">Ready for today&apos;s check-in</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleToggle(habit.id, today)}
                  disabled={isPending}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all shadow-xs ${
                    isTodayDone
                      ? "bg-[#EAF0EC] text-[#3B664B] hover:bg-[#D8E6DC] border border-[#7C9A86]/40 shadow-2xs"
                      : "bg-[#1E3127] text-[#FAF7F0] hover:bg-[#2A3F34]"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isTodayDone ? "Completed ✓" : "Mark Completed"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VIEW 2: FULL WEEKLY MATRIX VIEW */
        <div className="bg-[#FFFFFF] rounded-3xl p-7 md:p-8 border border-[#EAE5D8] shadow-xs overflow-x-auto">
          <div className="min-w-[650px]">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 pb-4 border-b border-[#EAE5D8] text-xs font-semibold text-[#8E9E94]">
              <span className="col-span-4 uppercase tracking-wider">Habit Ritual</span>
              <span className="col-span-2 uppercase tracking-wider">Category</span>
              <div className="col-span-4 grid grid-cols-7 gap-1.5 text-center">
                {weekDayLabels.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <span className="col-span-1 text-center uppercase tracking-wider">Streak</span>
              <span className="col-span-1 text-right uppercase tracking-wider">Actions</span>
            </div>

            {/* Habit Rows */}
            <div className="divide-y divide-[#EAE5D8]">
              {filteredStats.map(({ habit, currentStreak, past7Days, isTodayDone }) => (
                <div
                  key={habit.id}
                  className={`grid grid-cols-12 gap-3 py-4 items-center group transition-colors ${
                    isTodayDone ? "bg-[#FAFDFB]/60" : ""
                  }`}
                >
                  {/* Habit title & target */}
                  <div className="col-span-4 pr-2">
                    <h4 className="font-serif text-base font-bold text-[#1A241E] truncate flex items-center gap-1.5">
                      <span>{habit.title}</span>
                      {isTodayDone && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5F7E6A] shrink-0" />
                      )}
                    </h4>
                    <span className="text-[11px] text-[#586B60] block truncate">
                      {habit.targetValue} {habit.unit} • {habit.frequencyType === "DAILY" ? "Daily" : `${habit.targetDaysPerWeek}x/wk`}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getCategoryBadge(
                        habit.category
                      )}`}
                    >
                      {habit.category}
                    </span>
                  </div>

                  {/* 7-Day Matrix Dots */}
                  <div className="col-span-4 grid grid-cols-7 gap-1.5">
                    {past7Days.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleToggle(habit.id, day.date)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center mx-auto transition-transform hover:scale-110 ${
                          day.completed
                            ? "bg-[#7C9A86] text-white"
                            : day.isToday
                            ? "bg-[#F9ECE6] text-[#C87452] border border-[#D98A6C]"
                            : "bg-[#EFEAE0]"
                        }`}
                        title={`${day.date}: ${day.completed ? "Done" : "Pending"}`}
                      >
                        {day.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>

                  {/* Streak */}
                  <div className="col-span-1 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#F5E8DC] text-[#93593B] text-xs font-bold shadow-2xs">
                      {currentStreak}d
                    </span>
                  </div>

                  {/* Action Controls: Graduate + Edit + Delete */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenGraduate(habit)}
                      title="Graduate habit"
                      className="p-1.5 rounded-xl text-[#7C9A86] hover:text-[#5F7E6A] hover:bg-[#EAF0EC] transition-all"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(habit)}
                      title="Edit habit"
                      className="p-1.5 rounded-xl text-[#586B60] hover:text-[#1E3127] hover:bg-[#FAF8F2] transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      title="Delete habit"
                      className="p-1.5 rounded-xl text-[#8E9E94] hover:text-[#D98A6C] hover:bg-[#FAF8F2] transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )}

      {/* 5. CULTIVATE NEW HABIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] text-[#1A241E] rounded-3xl p-6 md:p-8 max-w-lg w-full border border-[#EAE5D8] shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h4 className="font-serif text-2xl font-bold mb-4">Cultivate New Habit</h4>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep Work Session"
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A86]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Intention or motivation behind this ritual..."
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A86]/50"
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
                    Target
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="mins, pages, times"
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Frequency
                  </label>
                  <select
                    value={frequencyType}
                    onChange={(e) => setFrequencyType(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  >
                    <option value="DAILY">Every Day (Daily)</option>
                    <option value="TIMES_PER_WEEK">Times per week</option>
                  </select>
                </div>

                {frequencyType === "TIMES_PER_WEEK" ? (
                  <div>
                    <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                      Days Per Week
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={targetDaysPerWeek}
                      onChange={(e) => setTargetDaysPerWeek(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                    />
                  </div>
                ) : (
                  goals.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                        Align with Goal
                      </label>
                      <select
                        value={goalId}
                        onChange={(e) => setGoalId(e.target.value)}
                        className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                      >
                        <option value="">None (Independent Habit)</option>
                        {goals.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                )}
              </div>

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
                  className="px-5 py-2.5 rounded-2xl bg-[#1E3127] text-[#FAF7F0] font-medium text-sm hover:bg-[#2A3F34] transition-colors"
                >
                  {isPending ? "Planting..." : "Plant Habit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT HABIT MODAL */}
      {showEditModal && editingHabit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] text-[#1A241E] rounded-3xl p-6 md:p-8 max-w-lg w-full border border-[#EAE5D8] shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF0EC] text-[#5F7E6A] flex items-center justify-center">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-2xl font-bold">Edit Habit Ritual</h4>
                <p className="text-xs text-[#586B60]">Update target values, cadence, or details for this habit.</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Deep Work Session"
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A86]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Intention or motivation behind this ritual..."
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A86]/50"
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
                    Target
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editTargetValue}
                    onChange={(e) => setEditTargetValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    placeholder="mins, pages, times"
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                    Frequency
                  </label>
                  <select
                    value={editFrequencyType}
                    onChange={(e) => setEditFrequencyType(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                  >
                    <option value="DAILY">Every Day (Daily)</option>
                    <option value="TIMES_PER_WEEK">Times per week</option>
                  </select>
                </div>

                {editFrequencyType === "TIMES_PER_WEEK" ? (
                  <div>
                    <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                      Days Per Week
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={editTargetDaysPerWeek}
                      onChange={(e) => setEditTargetDaysPerWeek(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                    />
                  </div>
                ) : (
                  goals.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                        Align with Goal
                      </label>
                      <select
                        value={editGoalId}
                        onChange={(e) => setEditGoalId(e.target.value)}
                        className="w-full px-3 py-2 rounded-2xl border border-[#EAE5D8] bg-white text-xs"
                      >
                        <option value="">None (Independent Habit)</option>
                        {goals.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE5D8]">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingHabit(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#586B60] hover:text-[#1A241E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-2xl bg-[#1E3127] text-[#FAF7F0] font-medium text-sm hover:bg-[#2A3F34] transition-colors shadow-xs"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. GRADUATION CELEBRATION MODAL */}
      {showGraduateModal && graduatingHabit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] text-[#1A241E] rounded-3xl p-6 md:p-8 max-w-lg w-full border border-[#EAE5D8] shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF0EC] text-[#5F7E6A] flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-2xl font-bold">Graduate Ritual</h4>
                <p className="text-xs text-[#586B60]">
                  Enshrine &ldquo;{graduatingHabit.title}&rdquo; into your Mastered Archive.
                </p>
              </div>
            </div>

            {/* Achievement Summary Card */}
            {(() => {
              const stats = getHabitGraduationStats(graduatingHabit);
              return (
                <div className="mb-4 p-4 rounded-2xl bg-white border border-[#EAE5D8] space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9E94] block">
                    Cultivation Journey
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8]">
                      <span className="text-[10px] text-[#586B60] block">Started</span>
                      <span className="font-serif text-xs font-bold text-[#1A241E]">
                        {stats.started.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8]">
                      <span className="text-[10px] text-[#586B60] block">Sessions</span>
                      <span className="font-serif text-xs font-bold text-[#3B664B]">
                        {stats.totalSessions} logs
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8]">
                      <span className="text-[10px] text-[#586B60] block">Consistency</span>
                      <span className="font-serif text-xs font-bold text-[#D98A6C]">
                        {stats.consistencyRate}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <form onSubmit={handleConfirmGraduate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#586B60] mb-1 uppercase tracking-wider">
                  Reflection Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={graduationNote}
                  onChange={(e) => setGraduationNote(e.target.value)}
                  placeholder="e.g. Mastered the core DBMS concepts, queries, and indexing! Ready to move on to OOPs."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EAE5D8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A86]/50 placeholder:text-[#A0AFA6]"
                />
                <p className="text-[11px] text-[#8E9E94] mt-1">
                  This note will be saved in your Mastered Archive to celebrate your growth.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE5D8]">
                <button
                  type="button"
                  onClick={() => {
                    setShowGraduateModal(false);
                    setGraduatingHabit(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#586B60] hover:text-[#1A241E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E3127] text-[#FAF7F0] font-medium text-sm hover:bg-[#2A3F34] transition-colors shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Graduate &amp; Archive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
