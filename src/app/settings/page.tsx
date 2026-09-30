import { currentUser } from "@clerk/nextjs/server";
import { SettingsClient } from "./SettingsClient";
import { listApiKeysAction } from "@/lib/apiActions";

export const revalidate = 0;

export default async function SettingsPage() {
  const user = await currentUser().catch(() => null);
  const initialApiKeys = await listApiKeysAction().catch(() => []);

  return (
    <SettingsClient
      userName={user?.firstName || user?.username || "Samama"}
      userEmail={user?.emailAddresses?.[0]?.emailAddress || ""}
      userImageUrl={user?.imageUrl || ""}
      isSignedIn={!!user}
      initialApiKeys={initialApiKeys}
    />
  );
}
