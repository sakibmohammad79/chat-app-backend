import { prisma } from "../../../lib/prisma";
import { ApiError } from "../../error/ApiError";
import type {
  EditMessageInput,
  getMessageQuery,
  SendMessageInput,
} from "./message.validation";

// Message response in same shape
const messageSelect = {
  id: true,
  content: true,
  type: true,
  isDeleted: true,
  isEdited: true,
  createdAt: true,
  updatedAt: true,

  sender: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },

  // Quoted reply preview
  replyTo: {
    select: {
      id: true,
      content: true,
      isDeleted: true,
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },

  // Emoji reactions
  reactions: {
    select: {
      id: true,
      emoji: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

// Check whether user is a member
const assertConversationMember = async (
  conversationId: string,
  userId: string,
) => {
  const member = await prisma.conversationMember.findUnique({
    where: {
      userId_conversationId: {
        userId,
        conversationId,
      },
    },
  });

  if (!member) {
    throw new ApiError(403, "You are not a member of this conversation");
  }

  return member;
};

// Get messages with cursor pagination
const getMessagesService = async (
  conversationId: string,
  userId: string,
  query: getMessageQuery,
) => {
  // Check membership
  await assertConversationMember(conversationId, userId);

  const { cursor, limit } = query;

  // check cursor message
  let cursorCreatedAt: Date | undefined;

  if (cursor) {
    const cursorMessage = await prisma.message.findUnique({
      where: {
        id: cursor,
      },
      select: {
        createdAt: true,
        conversationId: true,
      },
    });

    if (!cursorMessage) {
      throw new ApiError(404, "Cursor message not found");
    }

    // check cursor is another conversation message
    if (cursorMessage.conversationId !== conversationId) {
      throw new ApiError(400, "Invalid cursor");
    }
    cursorCreatedAt = cursorMessage.createdAt;
  }
  //  Messages fetch
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      // if has cursor get before this messages
      ...(cursorCreatedAt && {
        createdAt: {
          lt: cursorCreatedAt,
        },
      }),
    },

    select: messageSelect,

    // Latest → oldest
    orderBy: {
      createdAt: "desc",
    },

    take: limit,
  });

  //  have more message
  const hasMore = messages.length === limit;

  //  Next cursor
  const nextCursor =
    hasMore && messages.length > 0
      ? (messages[messages.length - 1]?.id ?? null)
      : null;

  //  oldest → newest
  messages.reverse();

  return {
    messages,
    nextCursor,
    hasMore,
  };
};

const sendMessageService = async (
  conversationId: string,
  senderId: string,
  data: SendMessageInput,
) => {
  await assertConversationMember(conversationId, senderId);

  if (data.replyToId) {
    const replyTarget = await prisma.message.findUnique({
      where: { id: data.replyToId },
    });
    if (!replyTarget || replyTarget.conversationId !== conversationId) {
      throw new ApiError(404, "Reply target message not found");
    }
    if (replyTarget.isDeleted) {
      throw new ApiError(400, "Cannot reply to a deleted message");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        content: data.content,
        type: data.type,
        senderId,
        conversationId,
        ...(data.replyToId && { replyToId: data.replyToId }),
      },
      select: messageSelect,
    });

    //conversation updatedAt update - shwoing in sidebar top
    await tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
    return message;
  });

  return result;
};

const editMessageService = async (
  messageId: string,
  userId: string,
  data: EditMessageInput,
) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });
  if (!message) {
    throw new ApiError(404, "Message not found");
  }
  if (message.isDeleted) {
    throw new ApiError(400, "Cannot edit a deleted message");
  }
  if (message.senderId !== userId) {
    throw new ApiError(403, "You can only edit your own message");
  }

  //when content same
  if (message.content === data.content) {
    throw new ApiError(400, "No change made");
  }

  const update = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: data.content,
      isEdited: true,
    },
    select: messageSelect,
  });
  return update;
};

const deleteMessageService = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        include: {
          members: { select: { userId: true, role: true } },
        },
      },
    },
  });
  if (!message) {
    throw new ApiError(404, "Message not found");
  }
  if (message.isDeleted) {
    throw new ApiError(400, "Message already deleted");
  }
  const isSender = message.senderId === userId;
  const isGroupAdmin = message.conversation.members.some(
    (m) => m.userId === userId && m.role === "ADMIN",
  );

  if (!isSender && !isGroupAdmin) {
    throw new ApiError(403, "You cannot delete this message");
  }

  const deleted = await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      content: "This message was deleted",
    },
    select: messageSelect,
  });
  return deleted;
};

//toggle reaction
export const toggleReactionService = async (
  messageId: string,
  userId: string,
  emoji: string,
) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, isDeleted: true, conversationId: true },
  });

  if (!message) throw new ApiError(404, "Message not found");
  if (message.isDeleted)
    throw new ApiError(400, "Cannot react to a deleted message");

  // user - this conversation member?
  await assertConversationMember(message.conversationId, userId);

  // has same emoji - remove toggle
  const existing = await prisma.messageReaction.findUnique({
    where: { userId_messageId_emoji: { userId, messageId, emoji } },
  });

  if (existing) {
    await prisma.messageReaction.delete({
      where: { userId_messageId_emoji: { userId, messageId, emoji } },
    });
    return { action: "removed", emoji };
  }

  // if empty then add
  await prisma.messageReaction.create({
    data: { userId, messageId, emoji },
  });

  return { action: "added", emoji };
};

export const messageService = {
  getMessagesService,
  sendMessageService,
  editMessageService,
  deleteMessageService,
  toggleReactionService
};
