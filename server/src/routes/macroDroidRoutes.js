import { Router } from "express";

export function createMacroDroidRouter(controller) {
  const router = Router();
  router.post("/:trigger", controller.trigger);
  return router;
}
