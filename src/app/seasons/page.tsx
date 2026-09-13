import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/utils";
import { SeasonsClient } from "./SeasonsClient";

export const revalidate = 0;

export default async function SeasonsPage() {
  const today = getTodayString();

  const tasks = await prisma.task.findMany({
    orderBy: [{ dueDate: "desc" }, { dueTime: "asc" }],
  });

  const habits = await prisma.habit.findMany({
    include: {
      logs: {
        orderBy: { date: "desc" },
      },
    },
  });

  return <SeasonsClient tasks={tasks} habits={habits} today={today} />;
}
