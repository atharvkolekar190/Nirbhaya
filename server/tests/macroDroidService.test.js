import test from "node:test";
import assert from "node:assert/strict";
import { createMacroDroidService } from "../src/services/macroDroidService.js";

function config(overrides = {}) {
  return {
    macrodroidDangerWebhookUrl: "",
    macrodroidAfraidWebhookUrl: "",
    macrodroidLocationWebhookUrl: "",
    ...overrides,
  };
}

test("rejects an unconfigured trigger without making a request", async () => {
  let calls = 0;
  const service = createMacroDroidService({
    config: config(),
    fetchImplementation: async () => {
      calls += 1;
    },
  });

  await assert.rejects(service.trigger("danger"), (error) => {
    assert.equal(error.code, "MACRODROID_WEBHOOK_NOT_CONFIGURED");
    assert.equal(error.statusCode, 503);
    return true;
  });
  assert.equal(calls, 0);
});

test("accepts successful webhook responses without claiming delivery", async () => {
  const urls = [];
  const service = createMacroDroidService({
    config: config({ macrodroidAfraidWebhookUrl: "https://example.test/afraid" }),
    now: () => Date.parse("2026-10-13T10:00:00Z"),
    fetchImplementation: async (url, options) => {
      urls.push({ url: String(url), method: options.method });
      return { ok: true, status: 200 };
    },
  });

  const result = await service.trigger("afraid");
  assert.deepEqual(urls, [{ url: "https://example.test/afraid", method: "POST" }]);
  assert.equal(result.status, "accepted");
  assert.equal(result.notificationDelivery, "unconfirmed");
});

test("maps timeout and upstream failure responses", async () => {
  const timeoutService = createMacroDroidService({
    config: config({ macrodroidLocationWebhookUrl: "https://example.test/location" }),
    timeoutMs: 1,
    fetchImplementation: async (_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      });
    }),
  });
  await assert.rejects(timeoutService.trigger("location"), /timed out/);

  const failedService = createMacroDroidService({
    config: config({ macrodroidDangerWebhookUrl: "https://example.test/danger" }),
    fetchImplementation: async () => ({ ok: false, status: 500 }),
  });
  await assert.rejects(failedService.trigger("danger"), /HTTP 500/);
});
