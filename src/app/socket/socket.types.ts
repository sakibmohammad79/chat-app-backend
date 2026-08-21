import type { Socket } from "socket.io";

export interface AuthSocket extends Socket {
  user: {
    id: string;
    email: string;
  };
}

//client -> server events
export interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;

  send_message: (data: {
    conversationId: string;
    content: string;
    type?: "TEXT" | "IMAGE" | "FILE";
    replyToId?: string;
  }) => void;

  typing_start: (conversationId: string) => void;
  typing_stop: (conversationId: string) => void;

  mark_seen: (data: { conversationId: string; messageId: string }) => void;
}
