import { Router } from "express";
import { authenticate } from "../../utils/auth";
import { conversationController } from "./conversation.controller";
import { validate } from "../../utils/zodValidation";
import { createConversationSchema } from "./conversation.validation";

const router = Router();

router.use(authenticate);

router.get("/", conversationController.getMyConversations);

router.post(
  "/",
  validate(createConversationSchema),
  conversationController.createConversation,
);

export const conversationRoutes = router;
