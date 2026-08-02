import { Router } from "express";
import { authenticate } from "../../utils/auth";
import { conversationController } from "./conversation.controller";

const router = Router();

router.use(authenticate);

router.get("/", conversationController.getMyConversations);

export const conversationRoutes = router;
