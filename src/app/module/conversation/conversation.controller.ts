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

export const conversationController = {
  getMyConversations,
};
