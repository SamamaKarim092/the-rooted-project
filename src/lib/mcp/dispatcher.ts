import { ROOTED_MCP_TOOLS, executeRootedTool } from "./tools";

export interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * Dispatches an MCP JSON-RPC request for an authenticated user.
 */
export async function dispatchMcpRequest(
  userId: string,
  request: JsonRpcRequest
): Promise<JsonRpcResponse | null> {
  const { id = null, method, params = {} } = request;

  // Notifications (requests without id) do not produce a response
  const isNotification = id === null || id === undefined;

  try {
    switch (method) {
      case "initialize": {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            serverInfo: {
              name: "Rooted Sanctuary MCP Server",
              version: "1.0.0",
            },
            capabilities: {
              tools: {
                listChanged: false,
              },
              resources: {
                listChanged: false,
              },
            },
          },
        };
      }

      case "notifications/initialized": {
        // Client acknowledgment, no response needed
        return null;
      }

      case "ping": {
        return {
          jsonrpc: "2.0",
          id,
          result: {},
        };
      }

      case "resources/list": {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            resources: [
              {
                uri: "rooted://sanctuary/today",
                name: "Today's Sanctuary Overview",
                description: "Live snapshot of today's Harmony Score, intentions checklist, active habits, and sleep recovery.",
                mimeType: "application/json",
              },
              {
                uri: "rooted://intentions/today",
                name: "Today's Intentions",
                description: "All personal tasks and intentions scheduled for today.",
                mimeType: "application/json",
              },
              {
                uri: "rooted://habits/active",
                name: "Active Habits & Streaks",
                description: "All active daily and weekly habits with consistency streak counts.",
                mimeType: "application/json",
              },
            ],
          },
        };
      }

      case "resources/read": {
        const uri = params?.uri;
        let contentText = "";

        if (uri === "rooted://sanctuary/today") {
          const data = await executeRootedTool(userId, "get_today_sanctuary", {});
          contentText = JSON.stringify(data, null, 2);
        } else if (uri === "rooted://intentions/today") {
          const data = await executeRootedTool(userId, "list_intentions", { horizon: "TODAY" });
          contentText = JSON.stringify(data, null, 2);
        } else if (uri === "rooted://habits/active") {
          const data = await executeRootedTool(userId, "list_habits", { status: "ACTIVE" });
          contentText = JSON.stringify(data, null, 2);
        } else {
          throw new Error(`Resource '${uri}' not found.`);
        }

        return {
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: contentText,
              },
            ],
          },
        };
      }

      case "tools/list": {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: ROOTED_MCP_TOOLS,
          },
        };
      }

      case "tools/call": {
        const toolName = params.name;
        const toolArgs = params.arguments || {};

        if (!toolName) {
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: "Missing 'name' in tools/call parameters.",
            },
          };
        }

        const toolResult = await executeRootedTool(userId, toolName, toolArgs);

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(toolResult, null, 2),
              },
            ],
            isError: false,
          },
        };
      }

      default: {
        if (isNotification) return null;
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method '${method}' not found.`,
          },
        };
      }
    }
  } catch (err: any) {
    console.error(`MCP Error in method '${method}':`, err);
    if (isNotification) return null;
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32000,
        message: err.message || "Internal server error while executing tool.",
      },
    };
  }
}
