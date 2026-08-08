import { prisma } from "../../../lib/prisma";
import { ApiError } from "../../error/ApiError";
import { assertAdmin, assertMember } from "../../helper/memberCheck";
import { conversationSelect } from "../../types";
import type {
  AddMembersInput,
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

const addMembersService = async (
  conversationId: string,
  userId: string,
  data: AddMembersInput,
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: { select: { userId: true } } },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  if (!conversation.isGroup) {
    throw new ApiError(400, "Cannot add members to a private chat");
  }

  await assertAdmin(conversationId, userId);

  const existingMemberIds = conversation.members.map((m) => m.userId);
  const newMemberIds = data.memberIds.filter(
    (id) => !existingMemberIds.includes(id),
  );

  if (newMemberIds.length === 0) {
    throw new ApiError(400, "All provided users are already member");
  }

  const users = await prisma.user.findMany({
    where: { id: { in: newMemberIds } },
    select: { id: true },
  });

  if (users.length !== newMemberIds.length) {
    throw new ApiError(404, "One or more users not found");
  }
  await prisma.conversationMember.createMany({
    data: newMemberIds.map((id: string) => ({
      userId: id,
      conversationId,
      role: "MEMBER",
    })),
  });

  const updated = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: conversationSelect,
  });
  return updated;
};

// ─── Remove Member
export const removeMemberService = async (
  conversationId: string,
  adminId: string,
  targetUserId: string,
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) throw new ApiError(404, "Conversation not found");
  if (!conversation.isGroup)
    throw new ApiError(400, "Cannot remove from private chat");

  await assertAdmin(conversationId, adminId);

  if (targetUserId === adminId) {
    throw new ApiError(400, "Use leave group to remove yourself");
  }

  const targetMember = await prisma.conversationMember.findUnique({
    where: { userId_conversationId: { userId: targetUserId, conversationId } },
  });

  if (!targetMember)
    throw new ApiError(404, "User is not a member of this group");

  await prisma.conversationMember.delete({
    where: { userId_conversationId: { userId: targetUserId, conversationId } },
  });
};

//  Leave Group
export const leaveGroupService = async (
  conversationId: string,
  userId: string,
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      members: { select: { userId: true, role: true } },
    },
  });

  if (!conversation) throw new ApiError(404, "Conversation not found");
  if (!conversation.isGroup)
    throw new ApiError(400, "Cannot leave a private chat");

  await assertMember(conversationId, userId);

  const remainingMembers = conversation.members.filter(
    (m) => m.userId !== userId,
  );

  // when last member leave the group is deleted
  if (remainingMembers.length === 0) {
    await prisma.conversation.delete({ where: { id: conversationId } });
    return { deleted: true };
  }

  // when admin gone admin will be next member
  const leavingMember = conversation.members.find((m) => m.userId === userId);
  if (leavingMember?.role === "ADMIN") {
    const nextAdmin = remainingMembers[0]!;
    await prisma.conversationMember.update({
      where: {
        userId_conversationId: {
          userId: nextAdmin.userId,
          conversationId,
        },
      },
      data: { role: "ADMIN" },
    });
  }

  await prisma.conversationMember.delete({
    where: { userId_conversationId: { userId, conversationId } },
  });

  return { deleted: false };
};

export const conversationService = {
  getMyConversationsService,
  createConversationservice,
  getConverdationByIdService,
  createGroupService,
  updateGroupService,
  addMembersService,
  removeMemberService,
  leaveGroupService,
};
