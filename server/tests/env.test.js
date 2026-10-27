import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig, validateRuntimeConfig } from "../src/config/env.js";

test("loads safe defaults without inventing MongoDB credentials", () => {
  const config = loadConfig({});

  assert.equal(config.port, 5000);
  assert.equal(config.thingspeakChannelId, "3531398");
  assert.equal(config.mongodbUri, "");
  assert.deepEqual(validateRuntimeConfig(config), {
    valid: false,
    missing: ["MONGODB_URI"],
  });
});

test("rejects invalid port and channel configuration", () => {
  assert.throws(
    () => loadConfig({ PORT: "not-a-port" }),
    /PORT must be an integer/,
  );
  assert.throws(
    () => loadConfig({ THINGSPEAK_CHANNEL_ID: "abc" }),
    /THINGSPEAK_CHANNEL_ID must contain only digits/,
  );
});
