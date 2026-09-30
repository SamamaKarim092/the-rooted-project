import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/utils";
import { getEffectiveUserId } from "@/lib/actions";
import { GrowthClient } from "./GrowthClient";

export const revalidate = 0;

export default async function GrowthPage() {
  const userId = await getEffectiveUserId();
  const today = getTodayString();

  const [habits, tasks, sleepLogs, sleepSetting] = await Promise.all([
    prisma.habit.findMany({
      where: { userId },
      include: {
        logs: {
          orderBy: { date: "desc" },
          take: 120,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.sleepLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 120,
    }),
    prisma.sleepSetting.findUnique({
      where: { userId },
    }),
  ]);

  const targetHours = sleepSetting?.targetHours ?? 8.0;

  return (
    <GrowthClient
      habits={habits}
      tasks={tasks}
      sleepLogs={sleepLogs}
      targetHours={targetHours}
      today={today}
    />
  );
}
