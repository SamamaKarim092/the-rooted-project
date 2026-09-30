"use server";

import { revalidatePath } from "next/cache";
import { getEffectiveUserId } from "./actions";
import { createApiKey, listUserApiKeys, revokeApiKey } from "./apiKey";

/**
 * Server Action to generate a new AI Connector token for the current user.
 */
export async function createApiKeyAction(name: string) {
  const userId = await getEffectiveUserId();
  const result = await createApiKey(userId, name);
  revalidatePath("/settings");
  return result;
}

/**
 * Server Action to list all active AI Connector tokens for the current user.
 */
export async function listApiKeysAction() {
  const userId = await getEffectiveUserId();
  return listUserApiKeys(userId);
}

/**
 * Server Action to revoke an AI Connector token.
 */
export async function revokeApiKeyAction(keyId: string) {
  const userId = await getEffectiveUserId();
  await revokeApiKey(keyId, userId);
  revalidatePath("/settings");
  return { success: true };
}
