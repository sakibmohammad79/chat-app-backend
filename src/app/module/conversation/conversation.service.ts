import { prisma } from "../../../lib/prisma";
import { ApiError } from "../../error/ApiError";
import { assertAdmin, assertMember } from "../../helper/memberCheck";
import { conversationSelect } from "../../types";
import type {
  CreateConversationInput,
  UpdateGroupInput,
} from "./conversation.validation";
import type { CreateGroupInput } from "./conversation.validation";

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

//create one to one conversation
const createConversationservice = async (
  currentUserId: string,
  data: CreateConversationInput,
) => {
  const { targetUserId } = data;
  if (targetUserId === currentUserId)
    throw new ApiError(400, "You cannot create conversation with yourself");
  //check target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });
  if (!targetUser) throw new ApiError(404, "Target user not found");
  //already exists one to one conversation check
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [
        { members: { some: { userId: currentUserId } } },
        { members: { some: { userId: targetUserId } } },
      ],
    },
    select: conversationSelect,
  });
  // already exists so no create new one, return existing conversation
  if (existingConversation) {
    return { conversation: existingConversation, isNew: false };
  }
  const conversation = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [
          { userId: currentUserId, role: "ADMIN" },
          { userId: targetUserId, role: "MEMBER" },
        ],
      },
    },
    select: conversationSelect,
  });
  return { conversation, isNew: true };
};

const getConverdationByIdService = async (
  converdationId: string,
  userId: string,
) => {
  await assertMember(converdationId, userId);

  const conversation = await prisma.conversation.findUnique({
    where: { id: converdationId },
    select: conversationSelect,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  return conversation;
};

const createGroupService = async (
  currentUserId: string,
  data: CreateGroupInput,
) => {
  const { name, memberIds } = data;
  //duplicate member check
  const uniqueIds = [...new Set(memberIds)];
  //filter out current user id from memberIds
  const otherMeberIds = uniqueIds.filter((id) => id !== currentUserId);
  //check all member exists
  const users = await prisma.user.findMany({
    where: { id: { in: otherMeberIds } },
    select: { id: true },
  });
  if (users.length !== otherMeberIds.length) {
    throw new ApiError(404, "One or more members not found");
  }
  const group = await prisma.conversation.create({
    data: {
      isGroup: true,
      name,
      members: {
        create: [
          { userId: currentUserId, role: "ADMIN" },
          ...otherMeberIds.map((id) => ({
            userId: id,
            role: "MEMBER" as const,
          })),
        ],
      },
    },
    select: conversationSelect,
  });
  return group;
};

const updateGroupService = async (
  conversationId: string,
  userId: string,
  data: UpdateGroupInput,
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) throw new ApiError(404, "Conversation not found");
  if (!conversation.isGroup)
    throw new ApiError(400, "Not a group conversation");

  await assertAdmin(conversationId, userId);
  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      ...(data.name && { name: data.name }),
    },
    select: conversationSelect,
  });
  return updated;
};

export const conversationService = {
  getMyConversationsService,
  createConversationservice,
  getConverdationByIdService,
  createGroupService,
  updateGroupService,
};
