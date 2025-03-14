import type { VscodeMessagePayload } from "common/types";

export class RelayWebsocket {
    private static instance: RelayWebsocket;
    private ws: WebSocket;
    private callbacks: Map<string, (data: VscodeMessagePayload) => void>;
    private isOpen: boolean = false;
    private bufferedMessages: any[] = [];

    private constructor(url: string) {
        this.ws = new WebSocket(url);
        this.callbacks = new Map();
        this.ws.onmessage = (eventMessage) => {
            const { callbackId, diff, event } = JSON.parse(eventMessage.data);
            const callback = this.callbacks.get(callbackId);
            if (callback) {
                callback({ diff });
            }
        };

        this.ws.onopen = () => {
            this.isOpen = true;
            this.send(JSON.stringify({
                event: "api_subscribe",
            }));
            this.bufferedMessages.forEach((m) => this.send(m));
        }
    }

    static getInstance() {
        if (!RelayWebsocket.instance) {
            RelayWebsocket.instance = new RelayWebsocket(process.env.WS_RELAYER_URL || "ws://ws-relayer:9093");
        }
        return RelayWebsocket.instance;
    }

    send(message: string) {
        if(!this.isOpen) {
            this.bufferedMessages.push(message);
            return;
        }
        this.ws.send(message);
    }

    sendAndAwaitResponse(message: any, callbackId: string): Promise<VscodeMessagePayload> {
        this.send(JSON.stringify({...message, callbackId}));

        return new Promise((resolve, reject) => {
            this.callbacks.set(callbackId, resolve);
        });
    }
    
}