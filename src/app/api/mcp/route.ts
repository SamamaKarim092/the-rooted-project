import { NextRequest } from "next/server";
import { GET as handleSse } from "./sse/route";
import { POST as handleMessage } from "./messages/route";
import { verifyApiKey } from "@/lib/apiKey";

export const dynamic = "force-dynamic";

/**
 * Universal MCP Endpoint (/api/mcp).
 * Handles:
 * - HEAD: Liveness probes from Gemini and MCP hosts (returns 200 OK).
 * - GET: SSE Handshake if streaming, or server discovery metadata.
 * - POST: Direct JSON-RPC execution (tools/list, tools/call).
 * - OPTIONS: Full CORS preflight.
 */
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function GET(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("authorization");

  // If request accepts SSE or explicit token stream, stream the SSE handshake
  if (accept.includes("text/event-stream") || url.searchParams.has("stream")) {
    return handleSse(req);
  }

  // If token is provided, verify it
  if (token) {
    const rawToken = token.startsWith("Bearer ") ? token.substring(7) : token;
    const authUser = await verifyApiKey(rawToken);
    if (!authUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Invalid or revoked API key." }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        }
      );
    }
  }

  // Server metadata discovery / ping
  return new Response(
    JSON.stringify({
      name: "Rooted Sanctuary MCP Server",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: { listChanged: false },
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  return handleMessage(req);
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
