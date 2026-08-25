import { prisma } from "../../../lib/prisma";
import type { AuthSocket } from "../socket.types";

const messageSelect = {
  id: true,
  content: true,
  type: true,
  isDeleted: true,
  isEdited: true,
  createdAt: true,
  updatedAt: true,
  sender: {
    select: { id: true, name: true, avatar: true },
  },
  replyTo: {
    select: {
      id: true,
      content: true,
      isDeleted: true,
      sender: { select: { id: true, name: true } },
    },
  },
  reactions: {
    select: {
      id: true,
      emoji: true,
      userId: true,
      user: { select: { id: true, name: true } },
    },
  },
} as const;

export const registerMessageHandler = (socket: AuthSocket) => {
  const { id: userId } = socket.user;

  //join conversation room
  //join in conversation when client connect

  socket.on("join_conversation", async (conversationId: string) => {
    try {
      //member verify
      const member = await prisma.conversationMember.findUnique({
        where: { userId_conversationId: { userId, conversationId } },
      });
      if (!member) {
        socket.emit("error", { message: "Not a member of this conversation" });
        return;
      }
      //join in socket.io room - this room receive any emit
      socket.join(conversationId);
    } catch (err) {
      console.error("Join conversation error:", err);
    }
  });

  //Leave conversation room
  socket.on("leave_conversation", (conversationId: string) => {
    socket.leave(conversationId);
  });

  // send message
  socket.on("send_message", async (data) => {
    const { conversationId, content, type = "TEXT", replyToId } = data;
  });
};
