import { NextRequest } from "next/server";
import { verifyApiKey } from "@/lib/apiKey";
import { getSession, sendSseEvent } from "@/lib/mcp/sessionStore";
import { dispatchMcpRequest, JsonRpcRequest } from "@/lib/mcp/dispatcher";

export const dynamic = "force-dynamic";

/**
 * MCP Message Receiver Endpoint.
 * Receives JSON-RPC client messages (tools/list, tools/call) and sends results back through the SSE stream.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  const queryToken = url.searchParams.get("token");
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const token = queryToken || bearerToken;

  let userId: string | null = null;

  // 1. Parse JSON-RPC Payload
  let body: JsonRpcRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error. Invalid JSON." },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  }

  // 2. Allow public initialize and ping handshakes for client discovery/probing
  if (body.method === "initialize" || body.method === "ping") {
    const rpcResponse = await dispatchMcpRequest("public", body);
    return new Response(JSON.stringify(rpcResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // 3. Resolve userId from active session or token for protected operations
  if (sessionId) {
    const session = getSession(sessionId);
    if (session) {
      userId = session.userId;
    }
  }

  if (!userId && token) {
    const authUser = await verifyApiKey(token);
    if (authUser) {
      userId = authUser.userId;
    }
  }

  if (!userId) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: body.id ?? null,
        error: { code: -32001, message: "Unauthorized. Invalid session ID or API token." },
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  }

  // 4. Process the protected RPC method (tools/list, tools/call)
  const rpcResponse = await dispatchMcpRequest(userId, body);

  // 5. Send response through SSE stream if session is connected
  if (sessionId && rpcResponse) {
    sendSseEvent(sessionId, "message", rpcResponse);
  }

  // Return HTTP 200 with the response directly
  return new Response(rpcResponse ? JSON.stringify(rpcResponse) : "{}", {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  });
}
