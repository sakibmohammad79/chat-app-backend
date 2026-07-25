import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { userRoutes } from "../module/user/user.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;
