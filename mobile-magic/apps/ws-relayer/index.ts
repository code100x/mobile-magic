import type { ServerWebSocket } from "bun";
import type { MessagePayload } from "common/types";

//TODO: Add auth
const SUBSCRIPTIONS: ServerWebSocket<unknown>[] = []

const API_SUBSCRIPTIONS: ServerWebSocket<unknown>[] = []

let bufferedMessages: any[] = []

Bun.serve({
    fetch(req, server) {
      // upgrade the request to a WebSocket
      if (server.upgrade(req)) {
        return; // do not return a Response
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
        message(ws: any, message: any) {
            const { event, data }: MessagePayload = JSON.parse(message.toString());
            if (event === "subscribe") {
                SUBSCRIPTIONS.push(ws);
                if (bufferedMessages.length) {
                    SUBSCRIPTIONS.forEach(ws => ws.send(JSON.stringify(bufferedMessages.shift())));
                    bufferedMessages = [];
                }
            } else if (event === "admin") {
                if (!SUBSCRIPTIONS.length) {
                    bufferedMessages.push(data);
                } else {
                    SUBSCRIPTIONS.forEach(ws => ws.send(JSON.stringify(data)));
                }
            } else if (event === "api_subscribe") {
                API_SUBSCRIPTIONS.push(ws);
            } else if (event === "vscode_diff") {
                API_SUBSCRIPTIONS.forEach(ws => ws.send(JSON.stringify(data)));
            }
        },
        open(ws: any) {
            console.log("open");
        },
        close(ws: any) {
            console.log("close");
        },
        
    },
    port: 9093
  });