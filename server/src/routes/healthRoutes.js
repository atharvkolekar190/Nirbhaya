import { Router } from "express";

export function createHealthRouter(getDatabaseStatus) {
  const router = Router();

  router.get("/", (request, response) => {
    const database = getDatabaseStatus();
    const healthy = database.status === "connected";

    response.status(healthy ? 200 : 503).json({
      success: healthy,
      status: healthy ? "ok" : "degraded",
      service: "nirbhaya-backend",
      database,
    });
  });

  return router;
}
