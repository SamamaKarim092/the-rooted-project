import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/utils";
import { TasksClient } from "./TasksClient";

export const revalidate = 0;

export default async function TasksPage() {
  const today = getTodayString();
  const tasks = await prisma.task.findMany({
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { dueTime: "asc" }],
    include: {
      goal: true,
      milestone: true,
    },
  });

  const goals = await prisma.goal.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, title: true },
  });

  return <TasksClient initialTasks={tasks} goals={goals} today={today} />;
}
