import { prisma } from "../../lib/prisma";
import { ApiError } from "../error/ApiError";

//  member check
export const assertMember = async (conversationId: string, userId: string) => {
  const member = await prisma.conversationMember.findUnique({
    where: { userId_conversationId: { userId, conversationId } },
  });
  if (!member)
    throw new ApiError(403, "You are not a member of this conversation");
  return member;
};

export const assertAdmin = async (conversationId: string, userId: string) => {
  const member = await assertMember(conversationId, userId);
  if (member.role !== "ADMIN") {
    throw new ApiError(403, "Only group admins can perform this action");
  }
  return member;
};
