export const FIELD_NAMES = ["accelerationG", "heartRateBpm", "emergencyStatus", "emergencyType", "latitude", "longitude"];
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_CACHE_MS = 10000;

function isNonEmpty(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function toNumber(value) {
  if (!isNonEmpty(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNumericField(feed, fieldNumber) {
  return toNumber(feed[`field${fieldNumber}`]);
}

function validLatitude(value) {
  return value !== null && value >= -90 && value <= 90;
}

function validLongitude(value) {
  return value !== null && value >= -180 && value <= 180;
}

function latestField(feedEntries, fieldNumber, validator = () => true) {
  for (const feed of [...feedEntries].reverse()) {
    const value = parseNumericField(feed, fieldNumber);

    if (value !== null && validator(value)) {
      return {
        value,
        timestamp: feed.created_at || null,
        entryId: feed.entry_id ?? null,
      };
    }
  }

  return {
    value: null,
    timestamp: null,
    entryId: null,
  };
}

function freshness(timestamp, now = Date.now()) {
  if (!timestamp) {
    return { status: "unavailable", ageSeconds: null };
  }

  const timestampMs = Date.parse(timestamp);

  if (Number.isNaN(timestampMs)) {
    return { status: "unavailable", ageSeconds: null };
  }

  const ageSeconds = Math.max(0, Math.round((now - timestampMs) / 1000));

  return {
    status: ageSeconds <= 60 ? "fresh" : "stale",
    ageSeconds,
  };
}

export function normalizeThingSpeakHistory(payload) {
  if (!payload || !Array.isArray(payload.feeds)) {
    throw new Error("ThingSpeak response must contain a feeds array.");
  }

  return {
    channelId: String(payload.channel_id ?? ""),
    readings: payload.feeds
      .map((feed) => ({
        timestamp: feed.created_at || null,
        entryId: feed.entry_id ?? null,
        accelerationG: toNumber(feed.field1),
        heartRateBpm: toNumber(feed.field2),
        emergencyStatus: [0, 1].includes(toNumber(feed.field3)) ? toNumber(feed.field3) : null,
        emergencyType: (() => {
          const value = toNumber(feed.field4);
          return Number.isInteger(value) && value >= 0 && value <= 2 ? value : null;
        })(),
        latitude: validLatitude(toNumber(feed.field5)) ? toNumber(feed.field5) : null,
        longitude: validLongitude(toNumber(feed.field6)) ? toNumber(feed.field6) : null,
      }))
      .filter((reading) =>
        reading.timestamp &&
        FIELD_NAMES.some((field) => reading[field] !== null),
      ),
  };
}

export function normalizeThingSpeakFeed(payload, now = Date.now()) {
  if (!payload || !Array.isArray(payload.feeds)) {
    throw new Error("ThingSpeak response must contain a feeds array.");
  }

  const feeds = payload.feeds;
  const acceleration = latestField(feeds, 1);
  const heartRate = latestField(feeds, 2);
  const emergencyStatus = latestField(feeds, 3, (value) => value === 0 || value === 1);
  const emergencyType = latestField(feeds, 4, (value) => value >= 0 && value <= 2 && Number.isInteger(value));
  const latitude = latestField(feeds, 5, validLatitude);
  const longitude = latestField(feeds, 6, validLongitude);
  const fieldReadings = {
    accelerationG: acceleration,
    heartRateBpm: heartRate,
    emergencyStatus,
    emergencyType,
    latitude,
    longitude,
  };
  const freshnessByField = Object.fromEntries(
    FIELD_NAMES.map((name) => [name, freshness(fieldReadings[name].timestamp, now)]),
  );
  const availableFields = FIELD_NAMES.filter((name) => fieldReadings[name].value !== null);

  return {
    channelId: String(payload.channel_id ?? ""),
    lastUpdated: feeds.at(-1)?.created_at || null,
    readings: {
      accelerationG: acceleration.value,
      heartRateBpm: heartRate.value,
      emergencyStatus: emergencyStatus.value,
      emergencyType: emergencyType.value,
    },
    phoneLocation: {
      latitude: latitude.value,
      longitude: longitude.value,
    },
    timestamps: Object.fromEntries(
      FIELD_NAMES.map((name) => [name, fieldReadings[name].timestamp]),
    ),
    freshness: freshnessByField,
    dataStatus: availableFields.length === 0 ? "unavailable" : "partial_or_complete",
    availableFields,
  };
}

export class ThingSpeakService {
  constructor({
    channelId,
    readApiKey = "",
    fetchImplementation = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    cacheMs = DEFAULT_CACHE_MS,
    now = () => Date.now(),
  }) {
    if (!channelId) {
      throw new Error("ThingSpeak channel ID is required.");
    }

    if (typeof fetchImplementation !== "function") {
      throw new Error("A fetch implementation is required.");
    }

    this.channelId = channelId;
    this.readApiKey = readApiKey;
    this.fetchImplementation = fetchImplementation;
    this.timeoutMs = timeoutMs;
    this.cacheMs = cacheMs;
    this.now = now;
    this.cachedResult = null;
    this.cachedAt = 0;
    this.historyCache = new Map();
  }

  getFeedUrl() {
    const url = new URL(
      `https://api.thingspeak.com/channels/${encodeURIComponent(this.channelId)}/feeds.json`,
    );
    url.searchParams.set("results", "20");

    if (this.readApiKey) {
      url.searchParams.set("api_key", this.readApiKey);
    }

    return url;
  }

  async getLatestData() {
    const currentTime = this.now();

    if (this.cachedResult && currentTime - this.cachedAt < this.cacheMs) {
      return this.cachedResult;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response;

    try {
      response = await this.fetchImplementation(this.getFeedUrl(), {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("ThingSpeak request timed out.", { cause: error });
      }

      throw new Error(
        `ThingSpeak request failed: ${error instanceof Error ? error.message : "network error"}`,
        { cause: error },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("ThingSpeak rate limit exceeded.");
      }

      throw new Error(`ThingSpeak returned HTTP ${response.status}.`);
    }

    let payload;

    try {
      payload = await response.json();
    } catch (error) {
      throw new Error("ThingSpeak returned invalid JSON.", { cause: error });
    }

    const normalized = {
      ...normalizeThingSpeakFeed(payload, currentTime),
      channelId: String(payload.channel_id ?? payload.channel?.id ?? this.channelId),
    };
    this.cachedResult = normalized;
    this.cachedAt = currentTime;
    return normalized;
  }

  clearLatestCache() {
    this.cachedResult = null;
    this.cachedAt = 0;
  }

  async getHistory(limit = 100) {
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 8000);
    const currentTime = this.now();
    const cachedHistory = this.historyCache.get(safeLimit);
    if (cachedHistory && currentTime - cachedHistory.cachedAt < this.cacheMs) {
      return cachedHistory.value;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const url = this.getFeedUrl();
    url.searchParams.set("results", String(safeLimit));

    let response;

    try {
      response = await this.fetchImplementation(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("ThingSpeak request timed out.", { cause: error });
      }

      throw new Error(
        `ThingSpeak request failed: ${error instanceof Error ? error.message : "network error"}`,
        { cause: error },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("ThingSpeak rate limit exceeded.");
      }

      throw new Error(`ThingSpeak returned HTTP ${response.status}.`);
    }

    let payload;

    try {
      payload = await response.json();
    } catch (error) {
      throw new Error("ThingSpeak returned invalid JSON.", { cause: error });
    }

    const normalized = {
      ...normalizeThingSpeakHistory(payload),
      channelId: String(payload.channel_id ?? payload.channel?.id ?? this.channelId),
    };

    const result = {
      ...normalized,
      freshness: {
        status: normalized.readings.length === 0
          ? "unavailable"
          : freshness(normalized.readings.at(-1)?.timestamp, currentTime).status,
        ageSeconds: normalized.readings.length === 0
          ? null
          : freshness(normalized.readings.at(-1)?.timestamp, currentTime).ageSeconds,
      },
    };
    this.historyCache.set(safeLimit, { cachedAt: currentTime, value: result });
    return result;
  }
}
