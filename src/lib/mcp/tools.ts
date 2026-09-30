import { prisma } from "@/lib/prisma";
import { getTodayString, calculateStreak, getWeekRange } from "@/lib/utils";

/**
 * Standard MCP Tool Definitions exposed to Claude, Gemini, Grok, and ChatGPT.
 */
export const ROOTED_MCP_TOOLS = [
  {
    name: "get_today_sanctuary",
    description:
      "Get today's full sanctuary overview in Rooted: daily Harmony Score (0-100%), habit completion checklist, today's intentions, overdue task count, and sleep recovery.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "list_intentions",
    description:
      "List personal to-do intentions/tasks. Can filter by horizon ('TODAY', 'UPCOMING', 'ANYTIME'), status ('PENDING', 'COMPLETED'), or priority.",
    inputSchema: {
      type: "object",
      properties: {
        horizon: {
          type: "string",
          enum: ["TODAY", "UPCOMING", "ANYTIME", "ALL"],
          description: "Which time horizon to inspect. Defaults to 'TODAY'.",
        },
        status: {
          type: "string",
          enum: ["PENDING", "COMPLETED", "ALL"],
          description: "Filter by task status. Defaults to 'ALL'.",
        },
        priority: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
          description: "Optional filter by priority level.",
        },
      },
      required: [],
    },
  },
  {
    name: "create_intention",
    description:
      "Plant a new daily intention or task in Rooted with category, priority, and optional due date.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The intention or task title (e.g. 'Draft system architecture document').",
        },
        category: {
          type: "string",
          enum: ["Mind", "Body", "Craft", "Spirit", "Study", "Career", "General"],
          description: "Category for the intention. Defaults to 'Craft'.",
        },
        priority: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
          description: "Priority of the intention. Defaults to 'MEDIUM'.",
        },
        dueDate: {
          type: "string",
          description: "Due date in 'YYYY-MM-DD' format. If empty or null, task is added to the 'Anytime' backlog.",
        },
        description: {
          type: "string",
          description: "Optional notes or details for the intention.",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "complete_intention",
    description:
      "Mark a task/intention as completed in Rooted, by either its task ID or matching its title.",
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "The exact task ID to complete.",
        },
        title: {
          type: "string",
          description: "If task ID is unknown, the name/title of the task to mark completed.",
        },
      },
      required: [],
    },
  },
  {
    name: "reschedule_overdue_tasks",
    description:
      "Trigger the Morning Reset in Rooted: shifts all overdue past tasks to today's date so the user can start fresh without guilt.",
    inputSchema: {
      type: "object",
      properties: {
        targetDate: {
          type: "string",
          description: "Target date in 'YYYY-MM-DD' format. Defaults to today.",
        },
      },
      required: [],
    },
  },
  {
    name: "list_habits",
    description:
      "List all user habits, current streak counts, frequency targets, and whether each habit has been checked off today.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["ACTIVE", "COMPLETED", "ALL"],
          description: "Filter habits. Defaults to 'ACTIVE'.",
        },
      },
      required: [],
    },
  },
  {
    name: "log_habit",
    description:
      "Record a habit check-in for today (or a specific date) in Rooted, recalculate the streak, and update Harmony.",
    inputSchema: {
      type: "object",
      properties: {
        habitId: {
          type: "string",
          description: "The unique ID of the habit.",
        },
        habitName: {
          type: "string",
          description: "If habit ID is unknown, the title of the habit to log (e.g. 'Morning Meditation').",
        },
        date: {
          type: "string",
          description: "The date to log check-in for ('YYYY-MM-DD'). Defaults to today.",
        },
        note: {
          type: "string",
          description: "Optional mindful reflection note for this habit session.",
        },
        completed: {
          type: "boolean",
          description: "Whether the habit was completed. Defaults to true.",
        },
      },
      required: [],
    },
  },
  {
    name: "add_note",
    description:
      "Plant a new thought, reflection, or note into Rooted's Field Notes thought garden.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Title of the note.",
        },
        content: {
          type: "string",
          description: "Body markdown content of the note.",
        },
        category: {
          type: "string",
          enum: ["Mind", "Body", "Craft", "Spirit", "Study", "Career", "General"],
          description: "Category for the note.",
        },
        isPinned: {
          type: "boolean",
          description: "Whether to pin this note to the top of the notes garden.",
        },
      },
      required: ["title"],
    },
  },
];

/**
 * Execute an MCP tool securely for a specific authenticated user.
 */
export async function executeRootedTool(userId: string, name: string, args: Record<string, any> = {}) {
  const today = getTodayString();

  switch (name) {
    case "get_today_sanctuary": {
      const [tasks, habits, sleepLog, sleepSetting] = await Promise.all([
        prisma.task.findMany({
          where: { userId },
          orderBy: { order: "asc" },
        }),
        prisma.habit.findMany({
          where: { userId, status: "ACTIVE" },
          include: { logs: true },
        }),
        prisma.sleepLog.findUnique({
          where: { userId_date: { userId, date: today } },
        }),
        prisma.sleepSetting.findUnique({
          where: { userId },
        }),
      ]);

      const todayTasks = tasks.filter((t) => t.dueDate === today);
      const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < today && t.status === "PENDING");
      const completedTodayTasks = todayTasks.filter((t) => t.status === "COMPLETED");

      const habitStatuses = habits.map((h) => {
        const todayLog = h.logs.find((l) => l.date === today);
        const streak = calculateStreak(h.logs.map((l) => ({ date: l.date, completed: l.completed })));
        return {
          id: h.id,
          title: h.title,
          category: h.category,
          currentStreak: streak,
          completedToday: Boolean(todayLog?.completed),
        };
      });

      const completedHabitsCount = habitStatuses.filter((h) => h.completedToday).length;

      // Harmony Score (0-100)
      const taskRatio = todayTasks.length > 0 ? completedTodayTasks.length / todayTasks.length : 1;
      const habitRatio = habits.length > 0 ? completedHabitsCount / habits.length : 1;
      const harmonyScore = Math.round((taskRatio * 0.5 + habitRatio * 0.5) * 100);

      return {
        date: today,
        harmonyScore: Math.min(100, Math.max(0, harmonyScore)),
        intentions: {
          totalScheduledToday: todayTasks.length,
          completedCount: completedTodayTasks.length,
          pendingCount: todayTasks.length - completedTodayTasks.length,
          overdueCount: overdueTasks.length,
          items: todayTasks.map((t) => ({
            id: t.id,
            title: t.title,
            category: t.category,
            priority: t.priority,
            status: t.status,
          })),
        },
        habits: {
          totalActive: habits.length,
          completedCount: completedHabitsCount,
          items: habitStatuses,
        },
        sleep: {
          recordedToday: Boolean(sleepLog),
          durationHours: sleepLog ? Number((sleepLog.durationMinutes / 60).toFixed(1)) : null,
          targetHours: sleepSetting?.targetHours ?? 8.0,
          quality: sleepLog?.quality || null,
        },
      };
    }

    case "list_intentions": {
      const horizon = args.horizon || "TODAY";
      const status = args.status || "ALL";

      const allTasks = await prisma.task.findMany({
        where: { userId },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });

      let filtered = allTasks;

      // Filter by horizon
      if (horizon === "TODAY") {
        filtered = filtered.filter((t) => t.dueDate === today);
      } else if (horizon === "UPCOMING") {
        filtered = filtered.filter((t) => t.dueDate && t.dueDate > today);
      } else if (horizon === "ANYTIME") {
        filtered = filtered.filter((t) => !t.dueDate);
      }

      // Filter by status
      if (status === "PENDING") {
        filtered = filtered.filter((t) => t.status === "PENDING");
      } else if (status === "COMPLETED") {
        filtered = filtered.filter((t) => t.status === "COMPLETED");
      }

      // Filter by priority
      if (args.priority) {
        filtered = filtered.filter((t) => t.priority === args.priority);
      }

      return {
        count: filtered.length,
        tasks: filtered.map((t) => ({
          id: t.id,
          title: t.title,
          category: t.category,
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate || "Anytime",
          completedAt: t.completedAt,
        })),
      };
    }

    case "create_intention": {
      if (!args.title || typeof args.title !== "string") {
        throw new Error("Missing required 'title' parameter.");
      }

      const count = await prisma.task.count({ where: { userId } });
      const task = await prisma.task.create({
        data: {
          userId,
          title: args.title.trim(),
          category: args.category || "Craft",
          priority: args.priority || "MEDIUM",
          dueDate: args.dueDate !== undefined ? args.dueDate : today,
          description: args.description || null,
          order: count,
          status: "PENDING",
        },
      });

      return {
        success: true,
        message: `Planted intention '${task.title}' for ${task.dueDate || "Anytime"}.`,
        task: {
          id: task.id,
          title: task.title,
          category: task.category,
          priority: task.priority,
          dueDate: task.dueDate || "Anytime",
        },
      };
    }

    case "complete_intention": {
      let targetTask = null;

      if (args.taskId) {
        targetTask = await prisma.task.findFirst({
          where: { id: args.taskId, userId },
        });
      } else if (args.title) {
        targetTask = await prisma.task.findFirst({
          where: {
            userId,
            title: { contains: args.title.trim() },
            status: "PENDING",
          },
        });
      }

      if (!targetTask) {
        throw new Error(
          args.taskId
            ? `Task with ID '${args.taskId}' not found.`
            : `No pending task found matching title '${args.title}'.`
        );
      }

      const updated = await prisma.task.update({
        where: { id: targetTask.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      return {
        success: true,
        message: `Intention '${updated.title}' has been marked completed!`,
        task: {
          id: updated.id,
          title: updated.title,
          status: updated.status,
          completedAt: updated.completedAt,
        },
      };
    }

    case "reschedule_overdue_tasks": {
      const targetDate = args.targetDate || today;

      const overdue = await prisma.task.findMany({
        where: {
          userId,
          dueDate: { lt: today },
          status: "PENDING",
        },
      });

      if (overdue.length === 0) {
        return {
          rescheduledCount: 0,
          message: "No overdue tasks to reschedule! All intentions are up to date.",
        };
      }

      await prisma.task.updateMany({
        where: {
          userId,
          dueDate: { lt: today },
          status: "PENDING",
        },
        data: {
          dueDate: targetDate,
        },
      });

      return {
        rescheduledCount: overdue.length,
        message: `Successfully shifted ${overdue.length} overdue intention(s) to ${targetDate}.`,
        rescheduledTasks: overdue.map((t) => t.title),
      };
    }

    case "list_habits": {
      const statusFilter = args.status === "ALL" ? undefined : args.status || "ACTIVE";

      const habits = await prisma.habit.findMany({
        where: {
          userId,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
        include: { logs: true },
        orderBy: { createdAt: "asc" },
      });

      return {
        total: habits.length,
        habits: habits.map((h) => {
          const streak = calculateStreak(h.logs.map((l) => ({ date: l.date, completed: l.completed })));
          const todayLog = h.logs.find((l) => l.date === today);
          return {
            id: h.id,
            title: h.title,
            category: h.category,
            frequencyType: h.frequencyType,
            status: h.status,
            currentStreak: streak,
            completedToday: Boolean(todayLog?.completed),
            totalLogsRecorded: h.logs.filter((l) => l.completed).length,
          };
        }),
      };
    }

    case "log_habit": {
      let habit = null;

      if (args.habitId) {
        habit = await prisma.habit.findFirst({
          where: { id: args.habitId, userId },
          include: { logs: true },
        });
      } else if (args.habitName) {
        habit = await prisma.habit.findFirst({
          where: {
            userId,
            title: { contains: args.habitName.trim() },
            status: "ACTIVE",
          },
          include: { logs: true },
        });
      }

      if (!habit) {
        throw new Error(
          args.habitId
            ? `Habit with ID '${args.habitId}' not found.`
            : `No active habit found matching name '${args.habitName}'.`
        );
      }

      const logDate = args.date || today;
      const isCompleted = args.completed !== undefined ? args.completed : true;

      const log = await prisma.habitLog.upsert({
        where: {
          habitId_date: {
            habitId: habit.id,
            date: logDate,
          },
        },
        update: {
          completed: isCompleted,
          note: args.note !== undefined ? args.note : undefined,
        },
        create: {
          habitId: habit.id,
          date: logDate,
          completed: isCompleted,
          note: args.note || null,
        },
      });

      // Recalculate streak
      const allLogs = await prisma.habitLog.findMany({ where: { habitId: habit.id } });
      const newStreak = calculateStreak(allLogs.map((l) => ({ date: l.date, completed: l.completed })));

      return {
        success: true,
        message: `Habit '${habit.title}' recorded for ${logDate}. Current streak: ${newStreak} day(s).`,
        habit: {
          id: habit.id,
          title: habit.title,
          date: logDate,
          completed: log.completed,
          currentStreak: newStreak,
        },
      };
    }

    case "add_note": {
      if (!args.title || typeof args.title !== "string") {
        throw new Error("Missing required 'title' parameter.");
      }

      const note = await prisma.note.create({
        data: {
          userId,
          title: args.title.trim(),
          content: args.content ? args.content.trim() : "",
          category: args.category || "General",
          isPinned: Boolean(args.isPinned),
        },
      });

      return {
        success: true,
        message: `Note '${note.title}' planted in the Thought Garden.`,
        note: {
          id: note.id,
          title: note.title,
          category: note.category,
          isPinned: note.isPinned,
          createdAt: note.createdAt,
        },
      };
    }

    default:
      throw new Error(`Unknown tool: '${name}'.`);
  }
}
