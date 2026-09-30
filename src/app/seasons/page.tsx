import { getSeasonsData } from "@/lib/actions";
import { SeasonsClient } from "./SeasonsClient";

export const revalidate = 0;

export default async function SeasonsPage() {
  const data = await getSeasonsData();

  return (
    <SeasonsClient
      tasks={data.tasks}
      habits={data.habits}
      sleepLogs={data.sleepLogs}
      sleepSetting={data.sleepSetting}
      today={data.today}
    />
  );
}
