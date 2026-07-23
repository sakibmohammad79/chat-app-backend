import { Router } from "express";
import { validate } from "../../utils/zodValidation";
import { loginSchema, registerSchema } from "./auth.validation";
import { authController } from "./auth.controller";
import { authenticate } from "../../utils/auth";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);

router.post("/login", validate(loginSchema), authController.login);

router.post("/refresh", authController.refreshToken);

router.post("/logout", authenticate, authController.logout);

export const authRoutes = router;
