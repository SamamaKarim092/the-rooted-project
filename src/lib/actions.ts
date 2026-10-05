"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  getTodayString,
  getYesterdayString,
  calculateSleepDuration,
  evaluateSleepTarget,
  getWeekRange
} from "@/lib/utils";

/**
 * Retrieves the current authenticated Clerk user ID,
 * or gracefully falls back to "default_user" if unauthenticated / running locally.
 * If a real Clerk user logs in, automatically claims any existing unassigned "default_user" data.
 */
export async function getEffectiveUserId(): Promise<string> {
  try {
    const { userId } = await auth();
    if (userId) {
      return userId;
    }
    return "default_user";
  } catch {
    return "default_user";
  }
}

/**
 * Seamlessly migrates existing seed / single-user data from "default_user"
 * to the first authenticated Clerk user account.
 */
export async function claimDefaultUserData(targetUserId: string) {
  if (!targetUserId || targetUserId === "default_user") return;
  try {
    const defaultUserTaskCount = await prisma.task.count({ where: { userId: "default_user" } });
    const defaultUserHabitCount = await prisma.habit.count({ where: { userId: "default_user" } });
    const defaultUserGoalCount = await prisma.goal.count({ where: { userId: "default_user" } });

    if (defaultUserTaskCount === 0 && defaultUserHabitCount === 0 && defaultUserGoalCount === 0) {
      return;
    }

    // Only claim if target user does not have any tasks yet
    const targetUserTaskCount = await prisma.task.count({ where: { userId: targetUserId } });
    if (targetUserTaskCount === 0) {
      await prisma.$transaction([
        prisma.task.updateMany({ where: { userId: "default_user" }, data: { userId: targetUserId } }),
        prisma.habit.updateMany({ where: { userId: "default_user" }, data: { userId: targetUserId } }),
        prisma.goal.updateMany({ where: { userId: "default_user" }, data: { userId: targetUserId } }),
        prisma.note.updateMany({ where: { userId: "default_user" }, data: { userId: targetUserId } }),
        prisma.sleepLog.updateMany({ where: { userId: "default_user" }, data: { userId: targetUserId } }),
      ]);

      const defaultSetting = await prisma.sleepSetting.findUnique({ where: { userId: "default_user" } });
      if (defaultSetting) {
        await prisma.sleepSetting.upsert({
          where: { userId: targetUserId },
          create: { userId: targetUserId, targetHours: defaultSetting.targetHours },
          update: { targetHours: defaultSetting.targetHours },
        });
        await prisma.sleepSetting.delete({ where: { userId: "default_user" } }).catch(() => { });
      }
      console.log(`[Rooted Auth] Successfully claimed default_user data for user ${targetUserId}`);
    }
  } catch (err) {
    console.error("[Rooted Auth] Error claiming default_user data:", err);
  }
}

export async function getDashboardData() {
  const userId = await getEffectiveUserId();
  const today = getTodayString();

  // Fetch today's tasks & recent tasks scoped to user
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { priority: "desc" }],
    include: {
      goal: true,
      milestone: true,
    },
  });
  tasks.sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));

  // Fetch active habits and their logs for past 60 days
  const habits = await prisma.habit.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      logs: {
        orderBy: { date: "desc" },
        take: 60,
      },
      goal: true,
    },
  });

  // Fetch all active goals scoped to user
  const activeGoals = await prisma.goal.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const activeGoal = activeGoals[0] || null;

  // Fetch sleep settings & logs scoped to user
  const sleepSetting = await prisma.sleepSetting.findUnique({
    where: { userId },
  });
  const sleepTargetHours = sleepSetting?.targetHours ?? 8.0;

  const todaySleepLog = await prisma.sleepLog.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  const sleepLogs = await prisma.sleepLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 60,
  });

  // Calculate metrics: strictly tasks where dueDate === today
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const completedTasks = todayTasks.filter((t) => t.status === "COMPLETED");

  const todayHabitLogs = habits.map((h) => {
    const log = h.logs.find((l) => l.date === today);
    return log?.completed ?? false;
  });
  const completedHabitsCount = todayHabitLogs.filter(Boolean).length;

  const totalIntentions = todayTasks.length;
  const completedIntentions = completedTasks.length;

  // Calculate streaks and enrich habits with isCompletedToday & currentStreak
  const enrichedHabits = habits.map((habit) => {
    const todayLog = habit.logs.find((l) => l.date === today);
    const isCompletedToday = Boolean(todayLog?.completed);

    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = habit.logs.find((l) => l.date === dateStr);
      if (log?.completed) {
        currentStreak++;
      } else {
        if (i === 0) continue; // Today not checked off yet, check yesterday
        break;
      }
    }

    return {
      ...habit,
      isCompletedToday,
      currentStreak,
    };
  });

  // Calculate streaks for each habit matrix
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
    habits: enrichedHabits,
    habitMatrix,
    activeGoals,
    activeGoal,
    metrics: {
      harmonyScore,
      rootedDays,
      completedIntentions: completedIntentions,
      totalIntentions: totalIntentions,
    },
    weeklyFlow,
    sleep: {
      targetHours: sleepTargetHours,
      todayLog: todaySleepLog,
      allLogs: sleepLogs,
    },
  };
}

export async function getSeasonsData() {
  const userId = await getEffectiveUserId();
  const today = getTodayString();

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ dueDate: "desc" }, { dueTime: "asc" }],
  });

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const sleepLogs = await prisma.sleepLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const sleepSetting = await prisma.sleepSetting.findUnique({
    where: { userId },
  });

  return {
    tasks,
    habits,
    sleepLogs,
    sleepSetting,
    today,
  };
}

export async function toggleTaskStatus(taskId: string) {
  const userId = await getEffectiveUserId();
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
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
  const userId = await getEffectiveUserId();
  let newOrder = 0;
  try {
    const maxOrderResult: any = await prisma.$queryRawUnsafe(
      `SELECT MAX("order") as maxOrder FROM Task WHERE userId = ?`,
      userId
    );
    newOrder = ((maxOrderResult?.[0]?.maxOrder as number) ?? -1) + 1;
  } catch {
    newOrder = 0;
  }

  const task = await prisma.task.create({
    data: {
      userId,
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
  const userId = await getEffectiveUserId();
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) return null;

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
  const userId = await getEffectiveUserId();
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) return null;

  const task = await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/seasons");
  return task;
}

export async function rescheduleTask(taskId: string, newDueDate: string | null) {
  const userId = await getEffectiveUserId();
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) return null;

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

export async function rescheduleYesterdayTasks(targetDate?: string, yesterdayDate?: string) {
  const userId = await getEffectiveUserId();
  const today = targetDate || getTodayString();
  const yesterday = yesterdayDate || getYesterdayString(today);
  const result = await prisma.task.updateMany({
    where: {
      userId,
      status: "PENDING",
      dueDate: yesterday,
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

export async function rescheduleAllOverdueTasks(targetDate?: string, sourceDate?: string) {
  const userId = await getEffectiveUserId();
  const today = targetDate || getTodayString();
  const whereClause: any = {
    userId,
    status: "PENDING",
  };
  if (sourceDate) {
    whereClause.dueDate = sourceDate;
  } else {
    whereClause.dueDate = { lt: today };
  }
  const result = await prisma.task.updateMany({
    where: whereClause,
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
  const userId = await getEffectiveUserId();
  const result = await prisma.task.deleteMany({ where: { userId } });
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
  const userId = await getEffectiveUserId();
  const habit = await prisma.habit.create({
    data: {
      userId,
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
  const userId = await getEffectiveUserId();
  const existing = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!existing) return null;

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
  const userId = await getEffectiveUserId();
  const existing = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!existing) return null;

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
  const userId = await getEffectiveUserId();
  const existing = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!existing) return null;

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
  const userId = await getEffectiveUserId();
  const existing = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!existing) return null;

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
  const userId = await getEffectiveUserId();
  const userHabits = await prisma.habit.findMany({ where: { userId }, select: { id: true } });
  const habitIds = userHabits.map((h) => h.id);
  await prisma.habitLog.deleteMany({ where: { habitId: { in: habitIds } } });
  const result = await prisma.habit.deleteMany({ where: { userId } });
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

export async function createGoal(data: {
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  initialMilestones?: { title: string; stage?: string }[];
}) {
  const userId = await getEffectiveUserId();
  const targetDateObj = data.targetDate ? new Date(data.targetDate) : null;

  const milestonesData = (data.initialMilestones || [])
    .filter((m) => m.title && m.title.trim())
    .map((m, idx) => ({
      title: m.title.trim(),
      stage: m.stage || (idx === 0 ? "Seed" : idx === 1 ? "Sprout" : "Milestone"),
      isCompleted: false,
      order: idx + 1,
    }));

  const goal = await prisma.goal.create({
    data: {
      userId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      category: data.category || "Craft",
      targetDate: targetDateObj,
      status: "ACTIVE",
      progressPercentage: 0,
      milestones: {
        create: milestonesData,
      },
    },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
      habits: true,
      tasks: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
  return goal;
}

export async function createMilestone(data: {
  goalId: string;
  title: string;
  stage?: string;
}) {
  const goal = await prisma.goal.findUnique({
    where: { id: data.goalId },
    include: { milestones: true },
  });
  if (!goal) return null;

  const nextOrder = goal.milestones.length + 1;
  const milestone = await prisma.milestone.create({
    data: {
      goalId: data.goalId,
      title: data.title.trim(),
      stage: data.stage || "Milestone",
      order: nextOrder,
      isCompleted: false,
    },
  });

  // Recalculate goal progress
  const totalCount = goal.milestones.length + 1;
  const completedCount = goal.milestones.filter((m) => m.isCompleted).length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  await prisma.goal.update({
    where: { id: data.goalId },
    data: { progressPercentage },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
  return milestone;
}

export async function deleteMilestone(milestoneId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { goal: { include: { milestones: true } } },
  });
  if (!milestone) return null;

  const goalId = milestone.goalId;
  await prisma.milestone.delete({
    where: { id: milestoneId },
  });

  // Recalculate goal progress
  const remainingMilestones = milestone.goal.milestones.filter((m) => m.id !== milestoneId);
  const progressPercentage =
    remainingMilestones.length > 0
      ? Math.round(
        (remainingMilestones.filter((m) => m.isCompleted).length /
          remainingMilestones.length) *
        100
      )
      : 0;

  await prisma.goal.update({
    where: { id: goalId },
    data: { progressPercentage },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
  return { success: true, goalId };
}

export async function deleteGoal(goalId: string) {
  const userId = await getEffectiveUserId();
  const existing = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!existing) return null;

  // Unlink tasks and habits first
  await prisma.task.updateMany({
    where: { userId, goalId },
    data: { goalId: null, milestoneId: null },
  });
  await prisma.habit.updateMany({
    where: { userId, goalId },
    data: { goalId: null },
  });

  const deleted = await prisma.goal.delete({
    where: { id: goalId },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
  return deleted;
}

export async function setActiveGoal(goalId: string) {
  const userId = await getEffectiveUserId();
  await prisma.goal.updateMany({
    where: { userId, id: { not: goalId }, status: "ACTIVE" },
    data: { status: "PAUSED" },
  });
  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
  return updated;
}

export async function updateGoal(
  goalId: string,
  data: {
    title?: string;
    description?: string | null;
    category?: string;
    targetDate?: string | null;
    status?: string;
  }
) {
  const userId = await getEffectiveUserId();
  const existing = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!existing) return null;

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.targetDate !== undefined
        ? { targetDate: data.targetDate ? new Date(data.targetDate) : null }
        : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
    include: {
      milestones: { orderBy: { order: "asc" } },
      habits: true,
      tasks: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
  return updated;
}

export async function updateMilestone(
  milestoneId: string,
  data: {
    title?: string;
    stage?: string;
    order?: number;
  }
) {
  const userId = await getEffectiveUserId();
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { goal: true },
  });
  if (!milestone || milestone.goal.userId !== userId) return null;

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.stage !== undefined ? { stage: data.stage } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/milestones");
  return updated;
}

// ==========================================
// 🌙 SLEEP TRACKING SERVER ACTIONS
// ==========================================

export async function logSleep(formData: {
  date?: string;
  bedtime: string;
  wakeTime: string;
  quality?: string;
  notes?: string;
}) {
  const userId = await getEffectiveUserId();
  const logDate = formData.date || getTodayString();
  const { durationMinutes } = calculateSleepDuration(formData.bedtime, formData.wakeTime);

  const sleepLog = await prisma.sleepLog.upsert({
    where: {
      userId_date: {
        userId,
        date: logDate,
      },
    },
    create: {
      userId,
      date: logDate,
      bedtime: formData.bedtime,
      wakeTime: formData.wakeTime,
      durationMinutes,
      quality: formData.quality || "BALANCED",
      notes: formData.notes || null,
    },
    update: {
      bedtime: formData.bedtime,
      wakeTime: formData.wakeTime,
      durationMinutes,
      quality: formData.quality || "BALANCED",
      notes: formData.notes !== undefined ? formData.notes : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/seasons");
  revalidatePath("/growth");
  return sleepLog;
}

export async function updateSleepTarget(targetHours: number) {
  const userId = await getEffectiveUserId();
  const safeTarget = Math.max(4.0, Math.min(14.0, targetHours));
  const setting = await prisma.sleepSetting.upsert({
    where: { userId },
    create: { userId, targetHours: safeTarget },
    update: { targetHours: safeTarget },
  });

  revalidatePath("/");
  return setting;
}

export async function deleteSleepLog(id: string) {
  const userId = await getEffectiveUserId();
  const existing = await prisma.sleepLog.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const deleted = await prisma.sleepLog.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/seasons");
  revalidatePath("/growth");
  return deleted;
}

export async function getSleepData() {
  const userId = await getEffectiveUserId();
  const today = getTodayString();
  const setting = await prisma.sleepSetting.findUnique({
    where: { userId },
  });
  const targetHours = setting?.targetHours ?? 8.0;

  const todaySleepLog = await prisma.sleepLog.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  const sleepLogs = await prisma.sleepLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 60,
  });

  return {
    today,
    targetHours,
    todayLog: todaySleepLog,
    allLogs: sleepLogs,
  };
}

// ==========================================
// 📝 NOTES ACTIONS
// ==========================================

export async function getNotes() {
  const userId = await getEffectiveUserId();
  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: [
      { isPinned: "desc" },
      { updatedAt: "desc" },
    ],
  });
  return notes;
}

export async function createNote(data?: {
  title?: string;
  content?: string;
  category?: string;
  isPinned?: boolean;
  color?: string;
}) {
  const userId = await getEffectiveUserId();
  const newNote = await prisma.note.create({
    data: {
      userId,
      title: data?.title?.trim() || "Untitled Note",
      content: data?.content ?? "",
      category: data?.category ?? "General",
      isPinned: data?.isPinned ?? false,
      color: data?.color ?? null,
    },
  });

  revalidatePath("/notes");
  return newNote;
}

export async function updateNote(
  id: string,
  data: {
    title?: string;
    content?: string;
    category?: string;
    isPinned?: boolean;
    color?: string | null;
  }
) {
  const userId = await getEffectiveUserId();
  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const updated = await prisma.note.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() || "Untitled Note" } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
    },
  });

  revalidatePath("/notes");
  return updated;
}

export async function deleteNote(id: string) {
  const userId = await getEffectiveUserId();
  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const deleted = await prisma.note.delete({
    where: { id },
  });

  revalidatePath("/notes");
  return deleted;
}

export async function togglePinNote(id: string) {
  const userId = await getEffectiveUserId();
  const note = await prisma.note.findFirst({ where: { id, userId } });
  if (!note) return null;

  const updated = await prisma.note.update({
    where: { id },
    data: { isPinned: !note.isPinned },
  });

  revalidatePath("/notes");
  return updated;
}

// ==========================================
// 🛡️ DATA EXPORT & ACCOUNT PURGE ACTIONS
// ==========================================

export async function exportUserData() {
  const userId = await getEffectiveUserId();

  const [goals, habits, tasks, sleepLogs, sleepSetting, notes] = await Promise.all([
    prisma.goal.findMany({
      where: { userId },
      include: { milestones: { orderBy: { order: "asc" } } },
    }),
    prisma.habit.findMany({
      where: { userId },
      include: { logs: { orderBy: { date: "desc" } } },
    }),
    prisma.task.findMany({
      where: { userId },
      include: { goal: true, milestone: true },
      orderBy: { order: "asc" },
    }),
    prisma.sleepLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    prisma.sleepSetting.findUnique({
      where: { userId },
    }),
    prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    userId,
    data: {
      goals,
      habits,
      tasks,
      sleepLogs,
      sleepSetting: sleepSetting || { targetHours: 8.0 },
      notes,
    },
  };
}

export async function clearAllUserData() {
  const userId = await getEffectiveUserId();

  await prisma.$transaction([
    prisma.task.deleteMany({ where: { userId } }),
    prisma.habitLog.deleteMany({ where: { habit: { userId } } }),
    prisma.habit.deleteMany({ where: { userId } }),
    prisma.milestone.deleteMany({ where: { goal: { userId } } }),
    prisma.goal.deleteMany({ where: { userId } }),
    prisma.sleepLog.deleteMany({ where: { userId } }),
    prisma.note.deleteMany({ where: { userId } }),
  ]);

  await prisma.sleepSetting.upsert({
    where: { userId },
    create: { userId, targetHours: 8.0 },
    update: { targetHours: 8.0 },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/habits");
  revalidatePath("/seasons");
  revalidatePath("/milestones");
  revalidatePath("/growth");
  revalidatePath("/notes");
  revalidatePath("/settings");

  return { success: true };
}
