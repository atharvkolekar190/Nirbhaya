import dotenv from "dotenv";

dotenv.config();

const DEFAULT_CHANNEL_ID = "3531398";

function requiredString(value, name) {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`${name} is required.`);
  }

  return normalized;
}

export function loadConfig(environment = process.env) {
  const portValue = environment.PORT?.trim() || "5000";
  const port = Number(portValue);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  const channelId = requiredString(
    environment.THINGSPEAK_CHANNEL_ID || DEFAULT_CHANNEL_ID,
    "THINGSPEAK_CHANNEL_ID",
  );

  if (!/^\d+$/.test(channelId)) {
    throw new Error("THINGSPEAK_CHANNEL_ID must contain only digits.");
  }

  const frontendOrigin = requiredString(
    environment.FRONTEND_ORIGIN || "http://localhost:5173",
    "FRONTEND_ORIGIN",
  );

  return {
    port,
    mongodbUri: environment.MONGODB_URI?.trim() || "",
    thingspeakChannelId: channelId,
    thingspeakReadApiKey: environment.THINGSPEAK_READ_API_KEY?.trim() || "",
    frontendOrigin,
    thingspeakTimeoutMs: Number(environment.THINGSPEAK_TIMEOUT_MS || 5000),
    thingspeakCacheMs: Number(environment.THINGSPEAK_CACHE_MS || 10000),
    macrodroidDangerWebhookUrl: environment.MACRODROID_DANGER_WEBHOOK_URL?.trim() || "",
    macrodroidAfraidWebhookUrl: environment.MACRODROID_AFRAID_WEBHOOK_URL?.trim() || "",
    macrodroidLocationWebhookUrl: environment.MACRODROID_LOCATION_WEBHOOK_URL?.trim() || "",
    macrodroidTriggerToken: environment.MACRODROID_TRIGGER_TOKEN?.trim() || "",
  };
}

export function validateRuntimeConfig(config) {
  const missing = [];

  if (!config.mongodbUri) {
    missing.push("MONGODB_URI");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

export const config = loadConfig();
