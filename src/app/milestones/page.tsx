import { prisma } from "@/lib/prisma";
import { getEffectiveUserId } from "@/lib/actions";
import { MilestonesClient } from "./MilestonesClient";

export const revalidate = 0;

export default async function MilestonesPage() {
  const userId = await getEffectiveUserId();
  const goals = await prisma.goal.findMany({
    where: { userId },
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
