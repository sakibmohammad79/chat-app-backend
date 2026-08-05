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

const getConversationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const conversationId = req.params.id;
    const conversation = await conversationService.getConverdationByIdService(
      conversationId as string,
      req.user!.id,
    );
    sendResponse(res, { data: conversation });
  } catch (err) {
    next(err);
  }
};

const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await conversationService.createGroupService(
      req.user!.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 201,
      message: "Group created successfully",
      data: group,
    });
  } catch (err) {
    next(err);
  }
};

const updateGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedGroup = await conversationService.updateGroupService(
      req.params.id as string,
      req.user!.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 200,
      message: "Group updated successfully",
      data: updatedGroup,
    });
  } catch (err) {
    next(err);
  }
};

export const conversationController = {
  getMyConversations,
  createConversation,
  getConversationById,
  createGroup,
  updateGroup,
};
