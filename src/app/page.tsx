import { getDashboardData } from "@/lib/actions";
import { HeaderCapsules } from "@/components/layout/HeaderCapsules";
import { DashboardMainView } from "@/components/dashboard/DashboardMainView";
import { currentUser } from "@clerk/nextjs/server";
import { LandingView } from "@/components/landing/LandingView";

export const revalidate = 0; // Fresh dynamic data on every request

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await currentUser().catch(() => null);
  const resolvedParams = searchParams ? await searchParams : {};
  const forceLanding = resolvedParams.landing === "true";

  // First-time visitor (unauthenticated) or explicit landing preview:
  if (!user || forceLanding) {
    return <LandingView user={user} />;
  }

  // Authenticated user: load personal sanctuary dashboard data
  const data = await getDashboardData();
  const userName = user.firstName || user.username || "Samama";

  // Format date: e.g. "September 21, 2026"
  const dateParts = data.today.split("-");
  const formattedDate = dateParts.length === 3
    ? new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10))
        .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : data.today;

  return (
    <div className="space-y-8 w-full">
      {/* Top Header Capsule Bar */}
      <HeaderCapsules
        greeting="Good morning"
        userName={userName}
        dateStr={formattedDate}
        harmonyScore={data.metrics.harmonyScore}
        rootedDays={data.metrics.rootedDays}
        completedIntentions={data.metrics.completedIntentions}
        totalIntentions={data.metrics.totalIntentions}
        restHours={
          data.sleep?.todayLog?.durationMinutes
            ? Number((data.sleep.todayLog.durationMinutes / 60).toFixed(1))
            : null
        }
      />

      {/* Interactive Main View: Journal (Canonical Design 6) & Task (Weekly/Monthly Horizons) */}
      <DashboardMainView data={data} />
    </div>
  );
}
