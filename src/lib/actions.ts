"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/utils";

export async function getDashboardData() {
  const today = getTodayString();

  // Fetch today's tasks & recent tasks
  const tasks = await prisma.task.findMany({
    orderBy: [{ status: "asc" }, { priority: "desc" }],
    include: {
      goal: true,
      milestone: true,
    },
  });
  tasks.sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));

  // Fetch active habits and their logs for past 60 days (covers weekly & monthly retrospectives)
  const habits = await prisma.habit.findMany({
    where: { status: "ACTIVE" },
    include: {
      logs: {
        orderBy: { date: "desc" },
        take: 60,
      },
      goal: true,
    },
  });

  // Fetch primary active goal
  const activeGoal = await prisma.goal.findFirst({
    where: { status: "ACTIVE" },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
  });

  // Calculate metrics
  const todayTasks = tasks.filter((t) => !t.dueDate || t.dueDate === today);
  const completedTasks = todayTasks.filter((t) => t.status === "COMPLETED");

  const todayHabitLogs = habits.map((h) => {
    const log = h.logs.find((l) => l.date === today);
    return log?.completed ?? false;
  });
  const completedHabitsCount = todayHabitLogs.filter(Boolean).length;

  const totalIntentions = todayTasks.length;
  const completedIntentions = completedTasks.length;

  // Calculate streaks for each habit
  const habitMatrix = habits.map((habit) => {
    // Check completion for past 7 days: [6 days ago, ..., today]
    const days: { date: string; dayLabel: string; isCompleted: boolean; isToday: boolean }[] = [];
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = habit.logs.find((l) => l.date === dateStr);
      days.push({
        date: dateStr,
        dayLabel: dayNames[d.getDay()],
        isCompleted: log?.completed ?? false,
        isToday: i === 0,
      });
    }

    // Calculate current streak
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = habit.logs.find((l) => l.date === dateStr);
      if (log?.completed) {
        currentStreak++;
      } else {
        if (i === 0) {
          // Today not done yet, check if yesterday was done
          continue;
        }
        break;
      }
    }

    return {
      id: habit.id,
      title: habit.title,
      category: habit.category,
      color: habit.color,
      currentStreak: currentStreak,
      days,
    };
  });

  // Calculate weekly flow wave points (Mon..Sun)
  const flowDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyFlow = flowDays.map((label, idx) => {
    const d = new Date();
    // Anchor to this week's days
    const currentDay = d.getDay(); // 0 is Sun, 1 is Mon
    const distanceToMon = (currentDay + 6) % 7;
    d.setDate(d.getDate() - distanceToMon + idx);
    const dateStr = d.toISOString().split("T")[0];

    const tasksDone = tasks.filter((t) => t.dueDate === dateStr && t.status === "COMPLETED").length;
    const habitsDone = habits.reduce((acc, h) => {
      const log = h.logs.find((l) => l.date === dateStr);
      return acc + (log?.completed ? 1 : 0);
    }, 0);

    const totalActivity = tasksDone + habitsDone;
    return {
      day: label,
      date: dateStr,
      value: totalActivity > 0 ? Math.min(Math.max(totalActivity * 16 + 20, 20), 95) : 10,
    };
  });

  const totalTodayItems = totalIntentions + habits.length;
  const completedTodayItems = completedIntentions + completedHabitsCount;
  const harmonyScore = totalTodayItems > 0 ? Math.round((completedTodayItems / totalTodayItems) * 100) : 0;
  const rootedDays = habits.length > 0 ? Math.max(...habitMatrix.map((h) => h.currentStreak), 0) : 0;

  return {
    today,
    tasks: todayTasks,
    allTasks: tasks,
    habits,
    habitMatrix,
    activeGoal,
    metrics: {
      harmonyScore,
      rootedDays,
      completedIntentions: completedIntentions,
      totalIntentions: totalIntentions,
    },
    weeklyFlow,
  };
}

export async function toggleTaskStatus(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return null;

  const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: nextStatus,
      completedAt: nextStatus === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  return updated;
}

export async function toggleHabitLog(habitId: string, dateStr?: string) {
  const date = dateStr || getTodayString();
  const existingLog = await prisma.habitLog.findUnique({
    where: {
      habitId_date: {
        habitId,
        date,
      },
    },
  });

  if (existingLog) {
    await prisma.habitLog.update({
      where: { id: existingLog.id },
      data: {
        completed: !existingLog.completed,
      },
    });
  } else {
    await prisma.habitLog.create({
      data: {
        habitId,
        date,
        completed: true,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/seasons");
  revalidatePath("/growth");
}

export async function createTask(formData: {
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  dueDate?: string | null;
  dueTime?: string;
  goalId?: string;
  milestoneId?: string;
}) {
  let newOrder = 0;
  try {
    const maxOrderResult: any = await prisma.$queryRawUnsafe(
      `SELECT MAX("order") as maxOrder FROM Task`
    );
    newOrder = ((maxOrderResult?.[0]?.maxOrder as number) ?? -1) + 1;
  } catch {
    newOrder = 0;
  }

  const task = await prisma.task.create({
    data: {
      title: formData.title,
      description: formData.description,
      priority: formData.priority || "MEDIUM",
      category: formData.category || "Craft",
      dueDate: formData.dueDate === undefined ? getTodayString() : (formData.dueDate || null),
      dueTime: formData.dueTime || null,
      goalId: formData.goalId || null,
      milestoneId: formData.milestoneId || null,
    },
  });

  try {
    await prisma.$executeRawUnsafe(
      `UPDATE Task SET "order" = ? WHERE id = ?`,
      newOrder,
      task.id
    );
  } catch (e) {
    console.error("Could not set task order:", e);
  }

  revalidatePath("/");
  revalidatePath("/tasks");
  return task;
}

export async function updateTask(
  taskId: string,
  formData: {
    title: string;
    description?: string;
    priority?: string;
    category?: string;
    dueDate?: string;
    goalId?: string | null;
  }
) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: formData.title,
      description: formData.description !== undefined ? formData.description : undefined,
      priority: formData.priority || "MEDIUM",
      category: formData.category || "Craft",
      dueDate: formData.dueDate || null,
      goalId: formData.goalId !== undefined ? formData.goalId : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/seasons");
  return task;
}

export async function deleteTask(taskId: string) {
  const task = await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/seasons");
  return task;
}

export async function rescheduleTask(taskId: string, newDueDate: string | null) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      dueDate: newDueDate || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/seasons");
  return task;
}

export async function rescheduleAllOverdueTasks(targetDate?: string) {
  const today = targetDate || getTodayString();
  const result = await prisma.task.updateMany({
    where: {
      status: "PENDING",
      dueDate: {
        lt: today,
      },
    },
    data: {
      dueDate: today,
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/seasons");
  return result;
}

export async function deleteAllTasks() {
  const result = await prisma.task.deleteMany({});
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/seasons");
  return result;
}

export async function reorderTasks(taskIds: string[]) {
  try {
    await prisma.$transaction(
      taskIds.map((id, index) =>
        prisma.task.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  } catch (e) {
    console.error("Could not update task order via transaction, falling back:", e);
    for (let i = 0; i < taskIds.length; i++) {
      try {
        await prisma.task.update({
          where: { id: taskIds[i] },
          data: { order: i },
        });
      } catch (err) {
        console.error(`Failed to update order for task ${taskIds[i]}:`, err);
      }
    }
  }
  revalidatePath("/tasks");
  revalidatePath("/");
  revalidatePath("/seasons");
}

export async function createHabit(formData: {
  title: string;
  description?: string;
  category?: string;
  targetDaysPerWeek?: number;
  targetValue?: number;
  unit?: string;
  color?: string;
  goalId?: string;
}) {
  const habit = await prisma.habit.create({
    data: {
      title: formData.title,
      description: formData.description,
      category: formData.category || "Mind",
      targetDaysPerWeek: formData.targetDaysPerWeek || 7,
      targetValue: formData.targetValue || 1,
      unit: formData.unit || "times",
      color: formData.color || "#7C9A86",
      goalId: formData.goalId || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/seasons");
  revalidatePath("/growth");
  return habit;
}

export async function updateHabit(
  habitId: string,
  formData: {
    title: string;
    description?: string;
    category?: string;
    targetDaysPerWeek?: number;
    targetValue?: number;
    unit?: string;
    color?: string;
    goalId?: string | null;
  }
) {
  const habit = await prisma.habit.update({
    where: { id: habitId },
    data: {
      title: formData.title,
      description: formData.description,
      category: formData.category || "Mind",
      targetDaysPerWeek: formData.targetDaysPerWeek ?? 7,
      targetValue: formData.targetValue ?? 1,
      unit: formData.unit || "times",
      color: formData.color || "#7C9A86",
      goalId: formData.goalId !== undefined ? formData.goalId : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/seasons");
  revalidatePath("/growth");
  return habit;
}

export async function deleteHabit(habitId: string) {
  const habit = await prisma.habit.delete({
    where: { id: habitId },
  });
  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/seasons");
  revalidatePath("/growth");
  return habit;
}

export async function graduateHabit(habitId: string, note?: string) {
  const habit = await prisma.habit.update({
    where: { id: habitId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      completionNote: note || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/seasons");
  revalidatePath("/growth");
  return habit;
}

export async function reopenHabit(habitId: string) {
  const habit = await prisma.habit.update({
    where: { id: habitId },
    data: {
      status: "ACTIVE",
      completedAt: null,
      completionNote: null,
    },
  });

  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/seasons");
  revalidatePath("/growth");
  return habit;
}

export async function deleteAllHabits() {
  await prisma.habitLog.deleteMany({});
  const result = await prisma.habit.deleteMany({});
  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/seasons");
  revalidatePath("/growth");
  return result;
}

export async function toggleMilestone(milestoneId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { goal: { include: { milestones: true } } },
  });
  if (!milestone) return null;

  const updatedMilestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      isCompleted: !milestone.isCompleted,
      completedAt: !milestone.isCompleted ? new Date() : null,
    },
  });

  // Recalculate goal progress
  const allMilestones = milestone.goal.milestones;
  const completedCount =
    allMilestones.filter((m) =>
      m.id === milestoneId ? !milestone.isCompleted : m.isCompleted
    ).length;
  const progressPercentage = Math.round(
    (completedCount / allMilestones.length) * 100
  );

  await prisma.goal.update({
    where: { id: milestone.goalId },
    data: { progressPercentage },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
  return updatedMilestone;
}
