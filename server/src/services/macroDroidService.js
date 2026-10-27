const DEFAULT_TIMEOUT_MS = 10000;

const TRIGGER_CONFIG = {
  danger: {
    configKey: "macrodroidDangerWebhookUrl",
    label: "danger",
  },
  afraid: {
    configKey: "macrodroidAfraidWebhookUrl",
    label: "afraid",
  },
  location: {
    configKey: "macrodroidLocationWebhookUrl",
    label: "location",
  },
};

function validateWebhookUrl(value, trigger) {
  if (!value) {
    const error = new Error(`MacroDroid ${trigger} webhook is not configured.`);
    error.code = "MACRODROID_WEBHOOK_NOT_CONFIGURED";
    error.statusCode = 503;
    throw error;
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
  } catch {
    const error = new Error(`MacroDroid ${trigger} webhook configuration is invalid.`);
    error.code = "MACRODROID_WEBHOOK_INVALID";
    error.statusCode = 503;
    throw error;
  }

  return value;
}

export function createMacroDroidService({
  config,
  fetchImplementation = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  now = () => Date.now(),
}) {
  if (typeof fetchImplementation !== "function") {
    throw new Error("A fetch implementation is required.");
  }

  return {
    async trigger(trigger) {
      const definition = TRIGGER_CONFIG[trigger];
      if (!definition) throw new Error(`Unsupported MacroDroid trigger: ${trigger}.`);

      const url = validateWebhookUrl(config[definition.configKey], definition.label);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetchImplementation(url, {
          method: "POST",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = new Error(`MacroDroid ${trigger} webhook returned HTTP ${response.status}.`);
          error.code = response.status === 429 ? "MACRODROID_RATE_LIMITED" : "MACRODROID_WEBHOOK_FAILED";
          error.statusCode = response.status === 429 ? 429 : 502;
          throw error;
        }

        return {
          trigger,
          status: "accepted",
          acceptedAt: new Date(now()).toISOString(),
          notificationDelivery: "unconfirmed",
        };
      } catch (error) {
        if (error?.name === "AbortError") {
          const timeoutError = new Error(`MacroDroid ${trigger} webhook timed out.`);
          timeoutError.code = "MACRODROID_WEBHOOK_TIMEOUT";
          timeoutError.statusCode = 504;
          throw timeoutError;
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
