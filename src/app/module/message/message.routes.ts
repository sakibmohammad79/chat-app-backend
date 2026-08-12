import { Router } from "express";
import { authenticate } from "../../utils/auth";
import { validate } from "../../utils/zodValidation";
import { getMessagesSchema } from "./message.validation";
import { messageController } from "./message.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/conversations/:id/messages",
  validate(getMessagesSchema),
  messageController.getMessages,
);

export const messageRoutes = router;
