
import { prisma } from "../../../lib/prisma";
import { getIO } from "../socket.instance";
import type { AuthSocket } from "../socket.types";

export const registerPresenceHandlers = (socket: AuthSocket) => {
  const userId = socket.user.id;
  const io = getIO();

  //  User Online 
  // online mark when connected
  const handleOnline = async () => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true },
      });

   
      const memberships = await prisma.conversationMember.findMany({
        where: { userId },
        select: { conversationId: true },
      });

      memberships.forEach(({ conversationId }) => {
        socket.to(conversationId).emit("user_online", userId);
      });
    } catch (err) {
      console.error("Presence online error:", err);
    }
  };

  // ─── User Offline 
  // offline mark when user disconnected
  const handleOffline = async () => {
    try {
      const lastSeen = new Date();

      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeen },
      });

    
      const memberships = await prisma.conversationMember.findMany({
        where: { userId },
        select: { conversationId: true },
      });

      memberships.forEach(({ conversationId }) => {
        socket.to(conversationId).emit("user_offline", { userId, lastSeen });
      });
    } catch (err) {
      console.error("Presence offline error:", err);
    }
  };

  //online
  handleOnline();

  // offline when disconnect
  socket.on("disconnect", handleOffline);
};