import express from "express";
import { createHealthRouter } from "./routes/healthRoutes.js";
import { createDeviceRouter } from "./routes/deviceRoutes.js";
import { createContactRouter } from "./routes/contactRoutes.js";
import { createHistoryRouter } from "./routes/historyRoutes.js";
import { createMacroDroidRouter } from "./routes/macroDroidRoutes.js";

export function createApp({
  config,
  getDatabaseStatus,
  deviceController,
  contactController,
  historyController,
  macroDroidController,
}) {
  const app = express();

  app.use(express.json());
  app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", config.frontendOrigin);
    response.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    response.header("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key, X-MacroDroid-Trigger-Token");

    if (request.method === "OPTIONS") {
      return response.sendStatus(204);
    }

    return next();
  });

  app.use("/api/health", createHealthRouter(getDatabaseStatus));
  app.use("/api/device", createDeviceRouter(deviceController));
  app.use("/api/contacts", createContactRouter(contactController));
  app.use("/api/history", createHistoryRouter(historyController));
  app.use("/api/macrodroid", createMacroDroidRouter(macroDroidController));

  app.use((request, response) => {
    response.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "The requested endpoint was not found.",
      },
    });
  });

  app.use((error, request, response, next) => {
    if (response.headersSent) {
      return next(error);
    }

    response.status(error.statusCode || 502).json({
      success: false,
      error: {
        code: error.code || "UPSTREAM_ERROR",
        message: error instanceof Error ? error.message : "An upstream service error occurred.",
      },
    });
  });

  return app;
}
