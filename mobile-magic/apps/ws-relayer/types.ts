export type MessagePayload = {
    event: "subscribe";
    data?: null;
} | {
    event: "admin";
    data: {
        type: "command" | "update-file"
        content: string;
        path?: string;
    };
}