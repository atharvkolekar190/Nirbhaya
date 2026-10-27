const RATE_LIMIT_MS = 10000;
const recentRequests = new Map();

function persistAttempt(model, isDatabaseConnected, details) {
  if (!model || !isDatabaseConnected()) return Promise.resolve();

  return model.create({
    type: `MacroDroid ${details.trigger}`,
    status: details.status,
    description: details.description,
    source: "macrodroid",
    occurredAt: new Date(),
    deduplicationKey: details.idempotencyKey,
  }).catch(() => undefined);
}

export function createMacroDroidController({
  service,
  model,
  isDatabaseConnected,
  triggerToken = "",
  onAccepted = () => {},
}) {
  return {
    trigger: async (request, response, next) => {
      const trigger = request.params.trigger;
      const key = request.get("Idempotency-Key")?.trim() || `${request.ip}:${trigger}`;
      const requester = `${request.ip}:${trigger}`;
      const currentTime = Date.now();
      const previousRequest = recentRequests.get(requester);

      if (previousRequest && currentTime - previousRequest < RATE_LIMIT_MS) {
        return response.status(429).json({
          success: false,
          error: {
            code: "MACRODROID_TRIGGER_RATE_LIMITED",
            message: "Please wait before submitting this trigger again.",
          },
        });
      }

      if (triggerToken && request.get("X-MacroDroid-Trigger-Token") !== triggerToken) {
        return response.status(401).json({
          success: false,
          error: {
            code: "MACRODROID_TRIGGER_UNAUTHORIZED",
            message: "A valid MacroDroid trigger token is required.",
          },
        });
      }

      recentRequests.set(requester, currentTime);

      try {
        const result = await service.trigger(trigger);
        onAccepted(trigger);
        await persistAttempt(model, isDatabaseConnected, {
          trigger,
          status: "Accepted",
          description: `MacroDroid ${trigger} webhook accepted. Notification delivery remains unconfirmed.`,
          idempotencyKey: key,
        });

        return response.status(202).json({
          success: true,
          data: {
            ...result,
            authorization: triggerToken ? "token" : "not_configured",
          },
        });
      } catch (error) {
        await persistAttempt(model, isDatabaseConnected, {
          trigger,
          status: "Failed",
          description: error instanceof Error ? error.message : "MacroDroid trigger failed.",
          idempotencyKey: key,
        });
        return next(error);
      }
    },
  };
}
