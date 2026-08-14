import { Router } from "express";
import { authenticate } from "../../utils/auth";
import { conversationController } from "./conversation.controller";
import { validate } from "../../utils/zodValidation";
import {
  addMembersSchema,
  conversationIdParamSchema,
  createConversationSchema,
  removeMemberSchema,
  updateGroupSchema,
} from "./conversation.validation";
import {
  getMessagesSchema,
  sendMessageSchema,
} from "../message/message.validation";
import { messageController } from "../message/message.controller";

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

// add members
router.post(
  "/:id/members",
  validate(addMembersSchema),
  conversationController.addMembers,
);

router.delete(
  "/:id/members/:userId",
  validate(removeMemberSchema),
  conversationController.removeMember,
);

router.delete(
  "/:id/leave",
  validate(conversationIdParamSchema),
  conversationController.leaveGroup,
);

router.patch(
  "/:id/read",
  validate(conversationIdParamSchema),
  conversationController.markAsRead,
);
// logic and req & res handle in message module
router.get(
  "/:id/messages",
  validate(getMessagesSchema),
  messageController.getMessages,
);

router.post(
  "/:id/messages",
  validate(sendMessageSchema),
  messageController.sendMessage,
);

export const conversationRoutes = router;
