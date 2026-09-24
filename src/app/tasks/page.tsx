import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/utils";
import { getEffectiveUserId } from "@/lib/actions";
import { TasksClient } from "./TasksClient";

export const revalidate = 0;

export default async function TasksPage() {
  const userId = await getEffectiveUserId();
  const today = getTodayString();
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      goal: true,
      milestone: true,
    },
  });

  tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const goals = await prisma.goal.findMany({
    where: { userId, status: "ACTIVE" },
    select: { id: true, title: true },
  });

  return <TasksClient initialTasks={tasks} goals={goals} today={today} />;
}
