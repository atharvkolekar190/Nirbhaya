import { Router } from "express";

export function createDeviceRouter(deviceController) {
  const router = Router();

  router.get("/latest", deviceController.getLatest);
  router.get("/history", deviceController.getHistory);

  return router;
}
