import crypto from "crypto";
import { prisma } from "./prisma";

/**
 * Generate a cryptographically secure Personal Access Token (PAT) for Rooted AI Connectors.
 * Only the SHA-256 hash is persisted in the database.
 * The rawToken is returned only once to display to the user.
 */
export async function createApiKey(userId: string, name: string = "AI Connector") {
  const randomHex = crypto.randomBytes(24).toString("hex");
  const rawToken = `rooted_pat_${randomHex}`;
  const keyHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const keyPrefix = `${rawToken.slice(0, 16)}...`;

  const record = await prisma.apiKey.create({
    data: {
      userId,
      name: name.trim() || "AI Connector",
      keyHash,
      keyPrefix,
    },
  });

  return {
    id: record.id,
    name: record.name,
    keyPrefix: record.keyPrefix,
    rawToken, // Plaintext token shown only once
    createdAt: record.createdAt,
  };
}

/**
 * Verify a bearer token or query param token against the hashed ApiKey records.
 * Updates lastUsedAt timestamp on successful match.
 */
export async function verifyApiKey(token: string) {
  if (!token || typeof token !== "string" || !token.startsWith("rooted_pat_")) {
    return null;
  }

  const keyHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
  });

  if (!apiKey) {
    return null;
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update lastUsedAt asynchronously without blocking execution
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch((err) => console.error("Failed to update ApiKey lastUsedAt:", err));

  return {
    userId: apiKey.userId,
    keyId: apiKey.id,
    name: apiKey.name,
  };
}

/**
 * List active API keys belonging to a specific user.
 * Never exposes the raw token or hash.
 */
export async function listUserApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });
}

/**
 * Revoke/delete an API key belonging to a specific user.
 */
export async function revokeApiKey(keyId: string, userId: string) {
  return prisma.apiKey.deleteMany({
    where: {
      id: keyId,
      userId,
    },
  });
}
