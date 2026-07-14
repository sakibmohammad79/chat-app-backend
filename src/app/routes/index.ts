import { Router } from "express";

const router = Router();

const moduleRoutes = [
  {
    path: "/",
    route: "",
  },
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;
