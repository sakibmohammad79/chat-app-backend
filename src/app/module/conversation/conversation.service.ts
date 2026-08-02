import { prisma } from "../../../lib/prisma";
import { conversationSelect } from "../../types";

//  Get My Conversations
export const getMyConversationsService = async (userId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      members: { some: { userId } }, // I am in member — all conversation
    },
    select: conversationSelect,
    orderBy: { updatedAt: "desc" }, // sort on last activity
  });

  // Unread count  — after lastreadAt, how many messages are there
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const myMember = conv.members.find((m: any) => m.user.id === userId);

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          isDeleted: false,
          senderId: { not: userId }, // not count my own message
          createdAt: { gt: myMember?.lastReadAt ?? new Date(0) },
        },
      });

      return { ...conv, unreadCount };
    }),
  );

  return conversationsWithUnread;
};

export const conversationService = {
  getMyConversationsService,
};
