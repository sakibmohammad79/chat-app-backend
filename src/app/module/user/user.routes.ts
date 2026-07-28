import { Router } from "express";
import { authenticate } from "../../utils/auth";
import { userController } from "./user.controller";
import { validate } from "../../utils/zodValidation";
import {
  searchUserSchema,
  updateProfileSchema,
  userIdParamSchema,
} from "./user.validation";
import { handleAvatarUpload } from "../../middleware/upload.middleware";

const router = Router();

router.use(authenticate);

router.get("/search", validate(searchUserSchema), userController.searchUsers);

router.get("/me", userController.getMyProfile);

router.patch(
  "/me",
  validate(updateProfileSchema),
  userController.updateProfile,
);

router.post("/me/avatar", handleAvatarUpload, userController.updateAvatar);

router.get("/:id", validate(userIdParamSchema), userController.getUserById);

export const userRoutes = router;
