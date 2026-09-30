import crypto from "crypto";

export interface McpSession {
  id: string;
  userId: string;
  controller: ReadableStreamDefaultController;
  createdAt: number;
}

// In-memory registry of active SSE connections
const activeSessions = new Map<string, McpSession>();

export function createSession(userId: string, controller: ReadableStreamDefaultController): string {
  const sessionId = crypto.randomUUID();
  activeSessions.set(sessionId, {
    id: sessionId,
    userId,
    controller,
    createdAt: Date.now(),
  });
  return sessionId;
}

export function getSession(sessionId: string): McpSession | undefined {
  return activeSessions.get(sessionId);
}

export function removeSession(sessionId: string): void {
  activeSessions.delete(sessionId);
}

export function sendSseEvent(sessionId: string, event: string, data: any): boolean {
  const session = activeSessions.get(sessionId);
  if (!session) return false;

  try {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    const message = `event: ${event}\ndata: ${payload}\n\n`;
    session.controller.enqueue(new TextEncoder().encode(message));
    return true;
  } catch (err) {
    console.error(`Failed to send SSE event to session ${sessionId}:`, err);
    activeSessions.delete(sessionId);
    return false;
  }
}
