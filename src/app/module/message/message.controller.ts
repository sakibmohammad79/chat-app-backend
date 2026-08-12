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

export const messageController = {
  getMessages,
};
