import { Router } from "express";
import { authenticate } from "../../utils/auth";
import { validate } from "../../utils/zodValidation";
import {
  addReactionSchema,
  editMessageSchema,
  messageIdParamSchema,
} from "./message.validation";
import { messageController } from "./message.controller";

const router = Router();

router.use(authenticate);

router.patch(
  "/:id",
  validate(editMessageSchema),
  messageController.editMessage,
);

router.delete(
  "/:id",
  validate(messageIdParamSchema),
  messageController.deleteMessage,
);

router.post(
  "/:id/reaction",
  validate(addReactionSchema),
  messageController.toggleReaction,
);

export const messageRoutes = router;
