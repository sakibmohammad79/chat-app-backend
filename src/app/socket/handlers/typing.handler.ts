import { prisma } from "../../../lib/prisma";
import type { AuthSocket } from "../socket.types";

export const registerTypingHandlers = (socket: AuthSocket) => {
  const { id: userId } = socket.user;

  //typing start
  socket.on("typing_start", async (conversationId: string) => {
    try {
      //verify is member?
      const member = await prisma.conversationMember.findUnique({
        where: { userId_conversationId: { userId, conversationId } },
        include: { user: { select: { name: true } } },
      });
      if (!member) return;
      //knowing other in rook - accept yourself (socket.io)
      socket.to(conversationId).emit("user_typing", {
        conversationId,
        userId,
        userName: member.user.name,
      });
    } catch (err) {
      console.error("Typing start error", err);
    }
  });
  socket.on("typing_stop", (conversationId: string) => {
    socket.to(conversationId).emit("user_stop_typing", {
      conversationId,
      userId,
    });
  });
};
