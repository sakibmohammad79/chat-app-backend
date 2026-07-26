import { Router } from "express";
import { authenticate } from "../../utils/auth";
import { userController } from "./user.controller";
import { validate } from "../../utils/zodValidation";
import { updateProfileSchema, userIdParamSchema } from "./user.validation";

const router = Router();

router.use(authenticate);

router.get("/me", userController.getMyProfile);

router.patch(
  "/me",
  validate(updateProfileSchema),
  userController.updateProfile,
);

router.get("/:id", validate(userIdParamSchema), userController.getUserById);

export const userRoutes = router;
