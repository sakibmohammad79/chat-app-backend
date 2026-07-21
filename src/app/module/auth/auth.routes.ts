import { Router } from "express";
import { validate } from "../../utils/zodValidation";
import { loginSchema, registerSchema } from "./auth.validation";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);

router.post("/login", validate(loginSchema), authController.login);

export const authRoutes = router;
