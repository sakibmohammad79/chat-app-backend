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

// server -> client events
export interface ServerToClientEvents {
  new_message: (message: unknown) => void;
  message_edited: (message: unknown) => void;
  message_deleted: (data: {
    messageId: string;
    conversationId: string;
  }) => void;
  reaction_toggled: (data: {
    messageId: string;
    action: "added" | "removed";
    emoji: string;
    userId: string;
  }) => void;

  user_typing: (data: {
    conversationId: string;
    userId: string;
    userName: string;
  }) => void;
  user_stop_typing: (data: { conversationId: string; userId: string }) => void;

  user_online: (userId: string) => void;
  user_offline: (data: { userId: string; lastSeen: Date }) => void;

  message_seen: (data: {
    conversationId: string;
    messageId: string;
    seenBy: { userId: string; userName: string };
  }) => void;

  error: (data: { message: string }) => void;
}
