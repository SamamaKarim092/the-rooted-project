import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/utils";
import { GrowthClient } from "./GrowthClient";

export const revalidate = 0;

export default async function GrowthPage() {
  const today = getTodayString();

  const habits = await prisma.habit.findMany({
    include: {
      logs: {
        orderBy: { date: "desc" },
        take: 60,
      },
    },
  });

  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <GrowthClient habits={habits} tasks={tasks} today={today} />;
}
