import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/utils";
import { HabitsClient } from "./HabitsClient";

export const revalidate = 0;

export default async function HabitsPage() {
  const today = getTodayString();
  const habits = await prisma.habit.findMany({
    include: {
      logs: {
        orderBy: { date: "desc" },
      },
      goal: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const goals = await prisma.goal.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, title: true },
  });

  return <HabitsClient initialHabits={habits} goals={goals} today={today} />;
}
