import { Router } from "express";

export function createHistoryRouter(controller) {
  const router = Router();
  router.post("/", controller.create);
  router.get("/", controller.list);
  return router;
}
