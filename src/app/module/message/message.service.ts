import { prisma } from "../../../lib/prisma";
import { ApiError } from "../../error/ApiError";
import type { getMessageQuery } from "./message.validation";

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

export const messageService = {
  getMessagesService,
};
