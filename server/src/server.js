import { createApp } from "./app.js";
import { config, validateRuntimeConfig } from "./config/env.js";
import {
  connectDatabase,
  getDatabaseStatus,
  isDatabaseConnected,
} from "./config/database.js";
import { ThingSpeakService } from "./services/thingSpeakService.js";
import { createDeviceDataService } from "./services/deviceDataService.js";
import { createDeviceController } from "./controllers/deviceController.js";
import { createContactController } from "./controllers/contactController.js";
import { createHistoryController } from "./controllers/historyController.js";
import { EmergencyContact } from "./models/emergencyContactModel.js";
import { SafetyEvent } from "./models/safetyEventModel.js";
import { createMacroDroidService } from "./services/macroDroidService.js";
import { createMacroDroidController } from "./controllers/macroDroidController.js";

async function startServer() {
  const runtimeConfig = validateRuntimeConfig(config);
  const connected = await connectDatabase(config.mongodbUri);

  if (!runtimeConfig.valid) {
    console.warn(`MongoDB is not configured. Missing: ${runtimeConfig.missing.join(", ")}.`);
  } else if (!connected) {
    console.error("MongoDB connection failed. The health endpoint will report a degraded status.");
  } else {
    console.log("MongoDB connection established.");
  }

  const thingSpeakService = new ThingSpeakService({
    channelId: config.thingspeakChannelId,
    readApiKey: config.thingspeakReadApiKey,
    timeoutMs: config.thingspeakTimeoutMs,
    cacheMs: config.thingspeakCacheMs,
  });
  const deviceDataService = createDeviceDataService(thingSpeakService);
  const deviceController = createDeviceController(deviceDataService);
  const contactController = createContactController({
    model: EmergencyContact,
    isDatabaseConnected,
  });
  const historyController = createHistoryController({
    model: SafetyEvent,
    isDatabaseConnected,
  });
  const macroDroidService = createMacroDroidService({ config });
  const macroDroidController = createMacroDroidController({
    service: macroDroidService,
    model: SafetyEvent,
    isDatabaseConnected,
    triggerToken: config.macrodroidTriggerToken,
    onAccepted: (trigger) => {
      if (trigger === "location") thingSpeakService.clearLatestCache();
    },
  });
  const app = createApp({
    config,
    getDatabaseStatus,
    deviceController,
    contactController,
    historyController,
    macroDroidController,
  });

  app.listen(config.port, () => {
    console.log(`NIRBHAYA backend listening on port ${config.port}.`);
  });
}

startServer().catch((error) => {
  console.error(`Backend startup failed: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
