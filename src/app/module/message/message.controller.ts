import type { NextFunction, Request, Response } from "express";
import { messageService } from "./message.service";
import { sendResponse } from "../../utils/apiRespnse";

const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await messageService.getMessagesService(
      req.params.id as string,
      req.user!.id,
      {
        cursor: req.query.cursor as string | undefined,
        limit: Number(req.query.limit) || 30,
      },
    );

    sendResponse(res, {
      data: result.messages,
      meta: {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
    });
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await messageService.sendMessageService(
      req.params.id as string,
      req.user!.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 201,
      message: "Message send successfully.",
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

export const messageController = {
  getMessages,
  sendMessage,
};
