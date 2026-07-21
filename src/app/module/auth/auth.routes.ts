import { Router } from "express";
import { validate } from "../../utils/zodValidation";
import { registerSchema } from "./auth.validation";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
