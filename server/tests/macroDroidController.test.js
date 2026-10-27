import test from "node:test";
import assert from "node:assert/strict";
import { createMacroDroidController } from "../src/controllers/macroDroidController.js";

function request(ip, headers = {}) {
  return {
    params: { trigger: "danger" },
    ip,
    get(name) {
      return headers[name] || headers[name.toLowerCase()];
    },
  };
}

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("requires the configured trigger token", async () => {
  const controller = createMacroDroidController({
    service: { trigger: async () => { throw new Error("must not call"); } },
    model: null,
    isDatabaseConnected: () => false,
    triggerToken: "configured-token",
  });
  const result = response();

  await controller.trigger(request("auth-test", { "X-MacroDroid-Trigger-Token": "wrong" }), result, () => {
    throw new Error("next should not be called");
  });

  assert.equal(result.statusCode, 401);
  assert.equal(result.body.error.code, "MACRODROID_TRIGGER_UNAUTHORIZED");
});

test("rate-limits repeated trigger requests", async () => {
  let calls = 0;
  const controller = createMacroDroidController({
    service: { trigger: async () => { calls += 1; return { status: "accepted" }; } },
    model: null,
    isDatabaseConnected: () => false,
  });
  const first = response();
  const second = response();

  await controller.trigger(request("rate-test"), first, () => {});
  await controller.trigger(request("rate-test"), second, () => {});

  assert.equal(first.statusCode, 202);
  assert.equal(second.statusCode, 429);
  assert.equal(calls, 1);
});
