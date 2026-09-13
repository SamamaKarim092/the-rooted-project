import { getDashboardData } from "@/lib/actions";
import { HeaderCapsules } from "@/components/layout/HeaderCapsules";
import { DashboardMainView } from "@/components/dashboard/DashboardMainView";

export const revalidate = 0; // Fresh dynamic data on every request

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Top Header Capsule Bar */}
      <HeaderCapsules
        greeting="Good morning"
        userName="Alex"
        harmonyScore={data.metrics.harmonyScore}
        rootedDays={data.metrics.rootedDays}
        completedIntentions={data.metrics.completedIntentions}
        totalIntentions={data.metrics.totalIntentions}
      />

      {/* Interactive Main View: Journal (Canonical Design 6) & Task (Weekly/Monthly Horizons) */}
      <DashboardMainView data={data} />
    </div>
  );
}
