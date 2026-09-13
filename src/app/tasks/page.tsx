import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/utils";
import { TasksClient } from "./TasksClient";

export const revalidate = 0;

export default async function TasksPage() {
  const today = getTodayString();
  const tasks = await prisma.task.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      goal: true,
      milestone: true,
    },
  });

  tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const goals = await prisma.goal.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, title: true },
  });

  return <TasksClient initialTasks={tasks} goals={goals} today={today} />;
}
