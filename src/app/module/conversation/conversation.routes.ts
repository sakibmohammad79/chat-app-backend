import { Router } from "express";
import { authenticate } from "../../utils/auth";
import { conversationController } from "./conversation.controller";
import { validate } from "../../utils/zodValidation";
import {
  conversationIdParamSchema,
  createConversationSchema,
  updateGroupSchema,
} from "./conversation.validation";

const router = Router();

router.use(authenticate);

router.get("/", conversationController.getMyConversations);

router.post(
  "/",
  validate(createConversationSchema),
  conversationController.createConversation,
);

router.post("/group", conversationController.createGroup);

router.get(
  "/:id",
  validate(conversationIdParamSchema),
  conversationController.getConversationById,
);

router.patch(
  "/:id",
  validate(updateGroupSchema),
  conversationController.updateGroup,
);

export const conversationRoutes = router;
