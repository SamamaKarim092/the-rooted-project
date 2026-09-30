import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/utils";
import { getEffectiveUserId } from "@/lib/actions";
import { HabitsClient } from "./HabitsClient";

export const revalidate = 0;

export default async function HabitsPage() {
  const userId = await getEffectiveUserId();
  const today = getTodayString();
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        orderBy: { date: "desc" },
      },
      goal: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const goals = await prisma.goal.findMany({
    where: { userId, status: "ACTIVE" },
    select: { id: true, title: true },
  });

  return <HabitsClient initialHabits={habits} goals={goals} today={today} />;
}
