import { prisma } from "@/lib/prisma";
import { MilestonesClient } from "./MilestonesClient";

export const revalidate = 0;

export default async function MilestonesPage() {
  const goals = await prisma.goal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
      habits: true,
      tasks: true,
    },
  });

  return <MilestonesClient initialGoals={goals} />;
}
