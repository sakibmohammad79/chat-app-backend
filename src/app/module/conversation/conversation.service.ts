import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type {
  CreateConversationInput,
  CreateGroupInput,
  UpdateGroupInput,
  AddMembersInput,
} from "./conversation.validation";

// ─── Reusable Select ──────────────────────────────────────────────────────────
// Conversation list/detail e consistently same shape return korbo
const conversationSelect = {
  id: true,
  isGroup: true,
  name: true,
  avatar: true,
  inviteToken: true,
  createdAt: true,
  updatedAt: true,
  members: {
    select: {
      id: true,
      role: true,
      joinedAt: true,
      lastReadAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          isOnline: true,
          lastSeen: true,
        },
      },
    },
  },
  // Last message preview — conversation list e dorkar
  messages: {
    take: 1,
    orderBy: { createdAt: "desc" as const },
    where: { isDeleted: false },
    select: {
      id: true,
      content: true,
      type: true,
      createdAt: true,
      sender: {
        select: { id: true, name: true, avatar: true },
      },
    },
  },
} as const;

// ─── Helper: member check ─────────────────────────────────────────────────────
const assertMember = async (conversationId: string, userId: string) => {
  const member = await prisma.conversationMember.findUnique({
    where: { userId_conversationId: { userId, conversationId } },
  });
  if (!member)
    throw new ApiError(403, "You are not a member of this conversation");
  return member;
};

const assertAdmin = async (conversationId: string, userId: string) => {
  const member = await assertMember(conversationId, userId);
  if (member.role !== "ADMIN") {
    throw new ApiError(403, "Only group admins can perform this action");
  }
  return member;
};

// ─── Get My Conversations ────────────────────────────────────────────────────
export const getMyConversationsService = async (userId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      members: { some: { userId } }, // ami member achi — shob conversation
    },
    select: conversationSelect,
    orderBy: { updatedAt: "desc" }, // last activity onujayi sort
  });

  // Unread count add koro — lastReadAt er pore kototai message
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const myMember = conv.members.find((m) => m.user.id === userId);

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          isDeleted: false,
          senderId: { not: userId }, // nijera message count na
          createdAt: { gt: myMember?.lastReadAt ?? new Date(0) },
        },
      });

      return { ...conv, unreadCount };
    }),
  );

  return conversationsWithUnread;
};
