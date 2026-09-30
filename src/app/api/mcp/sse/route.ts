import { NextRequest } from "next/server";
import { verifyApiKey } from "@/lib/apiKey";
import { createSession, removeSession } from "@/lib/mcp/sessionStore";
import { POST as handleMessage } from "../messages/route";

export const dynamic = "force-dynamic";

/**
 * MCP Server-Sent Events (SSE) Handshake Endpoint.
 * Used by Claude, Grok, Gemini Spark, and ChatGPT.
 * Supports:
 * - GET: Establishes persistent SSE event stream.
 * - POST: Handles direct JSON-RPC messages from clients like ChatGPT that send commands directly to the SSE URL.
 * - HEAD/OPTIONS: CORS preflight & liveness checks.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const queryToken = url.searchParams.get("token");
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const token = queryToken || bearerToken;

  if (!token) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized. Missing required 'token' query parameter or Bearer authorization header.",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  }

  const authUser = await verifyApiKey(token);
  if (!authUser) {
    return new Response(
      JSON.stringify({ error: "Unauthorized. Invalid or revoked API key." }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  }

  let heartbeatInterval: NodeJS.Timeout | null = null;
  let currentSessionId: string | null = null;

  const stream = new ReadableStream({
    start(controller) {
      currentSessionId = createSession(authUser.userId, controller);

      // Construct the absolute messages endpoint for this session
      const forwardedHost = req.headers.get("x-forwarded-host");
      const host = forwardedHost || req.headers.get("host") || url.host;
      const forwardedProto = req.headers.get("x-forwarded-proto");
      const proto = forwardedProto || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
      const origin = `${proto}://${host}`;
      const messageEndpoint = `${origin}/api/mcp/messages?sessionId=${currentSessionId}&token=${encodeURIComponent(token)}`;

      // 1. Initial MCP endpoint announcement event
      const initialMessage = `event: endpoint\ndata: ${messageEndpoint}\n\n`;
      controller.enqueue(new TextEncoder().encode(initialMessage));

      // 2. Heartbeat keep-alive every 20 seconds to prevent connection drops
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }, 20000);
    },
    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (currentSessionId) removeSession(currentSessionId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function POST(req: NextRequest) {
  return handleMessage(req);
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  });
}

