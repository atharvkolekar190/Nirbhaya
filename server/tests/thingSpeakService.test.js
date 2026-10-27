import test from "node:test";
import assert from "node:assert/strict";
import {
  ThingSpeakService,
  normalizeThingSpeakHistory,
  normalizeThingSpeakFeed,
} from "../src/services/thingSpeakService.js";

function responseFrom(payload, options = {}) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: async () => payload,
  };
}

test("normalizes valid readings from a ThingSpeak feed", () => {
  const result = normalizeThingSpeakFeed({
    channel_id: 3531398,
    feeds: [
      {
        entry_id: 1,
        created_at: "2026-10-13T06:00:00Z",
        field1: "0.42",
        field2: "82",
        field3: "0",
        field4: "0",
        field5: "18.5204",
        field6: "73.8567",
      },
    ],
  }, Date.parse("2026-10-13T06:00:30Z"));

  assert.equal(result.readings.accelerationG, 0.42);
  assert.equal(result.readings.heartRateBpm, 82);
  assert.equal(result.readings.emergencyStatus, 0);
  assert.equal(result.phoneLocation.latitude, 18.5204);
  assert.equal(result.phoneLocation.longitude, 73.8567);
  assert.equal(result.freshness.accelerationG.status, "fresh");
});

test("uses the latest valid value independently for fields from separate entries", () => {
  const result = normalizeThingSpeakFeed({
    channel_id: 3531398,
    feeds: [
      { entry_id: 1, created_at: "2026-10-13T06:00:00Z", field1: "0.3", field5: "18.5" },
      { entry_id: 2, created_at: "2026-10-13T06:00:05Z", field2: "80", field6: "73.8" },
      { entry_id: 3, created_at: "2026-10-13T06:00:10Z", field3: "1", field4: "2" },
    ],
  });

  assert.equal(result.readings.accelerationG, 0.3);
  assert.equal(result.timestamps.accelerationG, "2026-10-13T06:00:00Z");
  assert.equal(result.readings.heartRateBpm, 80);
  assert.equal(result.timestamps.heartRateBpm, "2026-10-13T06:00:05Z");
  assert.equal(result.readings.emergencyStatus, 1);
  assert.equal(result.readings.emergencyType, 2);
  assert.equal(result.phoneLocation.latitude, 18.5);
  assert.equal(result.phoneLocation.longitude, 73.8);
});

test("does not convert missing or empty fields to zero", () => {
  const result = normalizeThingSpeakFeed({
    feeds: [
      { entry_id: 1, created_at: "2026-10-13T06:00:00Z", field1: "", field2: null },
    ],
  });

  assert.equal(result.readings.accelerationG, null);
  assert.equal(result.readings.heartRateBpm, null);
  assert.equal(result.timestamps.accelerationG, null);
  assert.equal(result.freshness.accelerationG.status, "unavailable");
});

test("rejects invalid coordinates while preserving valid coordinate fields", () => {
  const result = normalizeThingSpeakFeed({
    feeds: [
      {
        created_at: "2026-10-13T06:00:00Z",
        field5: "91",
        field6: "-181",
      },
      {
        created_at: "2026-10-13T06:00:01Z",
        field5: "18.52",
      },
    ],
  });

  assert.equal(result.phoneLocation.latitude, 18.52);
  assert.equal(result.phoneLocation.longitude, null);
});

test("marks old readings as stale", () => {
  const result = normalizeThingSpeakFeed({
    feeds: [{ created_at: "2026-10-13T05:00:00Z", field1: "0.5" }],
  }, Date.parse("2026-10-13T06:00:01Z"));

  assert.equal(result.freshness.accelerationG.status, "stale");
  assert.ok(result.freshness.accelerationG.ageSeconds >= 3600);
});

test("handles upstream HTTP failures and invalid responses", async () => {
  const rateLimited = new ThingSpeakService({
    channelId: "3531398",
    fetchImplementation: async () => responseFrom({}, { ok: false, status: 429 }),
  });

  await assert.rejects(rateLimited.getLatestData(), /rate limit exceeded/);

  const invalidJson = new ThingSpeakService({
    channelId: "3531398",
    fetchImplementation: async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("invalid");
      },
    }),
  });

  await assert.rejects(invalidJson.getLatestData(), /invalid JSON/);
});

test("uses a short cache and only adds the API key when configured", async () => {
  const urls = [];
  let calls = 0;
  const service = new ThingSpeakService({
    channelId: "3531398",
    readApiKey: "private-key",
    cacheMs: 1000,
    now: () => 100,
    fetchImplementation: async (url) => {
      urls.push(String(url));
      calls += 1;
      return responseFrom({ channel_id: 3531398, feeds: [] });
    },
  });

  await service.getLatestData();
  await service.getLatestData();

  assert.equal(calls, 1);
  assert.match(urls[0], /api_key=private-key/);
  assert.match(urls[0], /results=20/);
});

test("normalizes historical readings in feed order without inventing values", () => {
  const result = normalizeThingSpeakHistory({
    channel_id: 3531398,
    feeds: [
      { entry_id: 1, created_at: "2026-10-13T06:00:00Z", field1: "0.4" },
      { entry_id: 2, created_at: "2026-10-13T06:00:05Z", field2: "81", field5: "91" },
    ],
  });

  assert.equal(result.readings.length, 2);
  assert.equal(result.readings[0].accelerationG, 0.4);
  assert.equal(result.readings[0].heartRateBpm, null);
  assert.equal(result.readings[1].heartRateBpm, 81);
  assert.equal(result.readings[1].latitude, null);
});
