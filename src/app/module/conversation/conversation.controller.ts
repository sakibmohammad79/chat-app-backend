import type { NextFunction, Request, Response } from "express";
import { conversationService } from "./conversation.service";
import { sendResponse } from "../../utils/apiRespnse";

const getMyConversations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const conversations = await conversationService.getMyConversationsService(
      req.user!.id,
    );
    // send response
    sendResponse(res, { data: conversations });
  } catch (error) {
    next(error);
  }
};

const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await conversationService.createConversationservice(
      req.user!.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: result.isNew ? 201 : 200,
      message: result.isNew
        ? "Conversation created successfully"
        : "Conversation already exists",
      data: result.conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const conversationController = {
  getMyConversations,
  createConversation,
};
