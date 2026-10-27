import {
  deviceData as mockDeviceData,
  userData,
  emergencyContacts as mockEmergencyContacts,
  safetyEvents as mockSafetyEvents,
  sensorHistory as mockSensorHistory,
} from "../data/mockData";
import {
  getDeviceData,
  getSensorHistory,
} from "./thingSpeakService";
import {
  createEmergencyContact,
  deleteEmergencyContact as deleteContactRequest,
  getEmergencyContacts,
  getSafetyHistory,
  recordSafetyEvent,
  triggerMacroDroid,
  updateEmergencyContact as updateContactRequest,
  getUser,
} from "./apiService";

const USE_MOCK_DATA = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === "true";
const POLLING_INTERVAL_MS = Number(import.meta.env.VITE_DEVICE_POLLING_MS || 30000);

export { POLLING_INTERVAL_MS };

function freshnessLabel(status) {
  if (status === "fresh") return "Fresh";
  if (status === "stale") return "Stale";
  return "Unavailable";
}

function emergencyStatusLabel(value) {
  if (value === 0) return "Safe";
  if (value === 1) return "SOS";
  return null;
}

function emergencyTypeLabel(value) {
  if (value === 0) return "None";
  if (value === 1) return "Danger";
  if (value === 2) return "Afraid";
  return null;
}

function mapDeviceData(data) {
  const readings = data.readings || {};
  const freshness = data.freshness || {};
  const location = data.phoneLocation || {};

  return {
    deviceId: `THINGSPEAK-${data.channelId || "unknown"}`,
    deviceName: "NIRBHAYA ThingSpeak Device",
    connectionStatus: data.dataStatus === "unavailable" ? "Unavailable" : "Connected",
    emergencyStatus: emergencyStatusLabel(readings.emergencyStatus),
    emergencyType: emergencyTypeLabel(readings.emergencyType),
    heartRate: {
      value: readings.heartRateBpm,
      unit: "BPM",
      status: freshnessLabel(freshness.heartRateBpm?.status),
      timestamp: data.timestamps?.heartRateBpm || null,
    },
    acceleration: {
      value: readings.accelerationG,
      unit: "g",
      status: freshnessLabel(freshness.accelerationG?.status),
      timestamp: data.timestamps?.accelerationG || null,
    },
    motion: { status: "Unavailable", activity: null },
    gpsStatus: location.latitude !== null && location.longitude !== null
      ? freshnessLabel(
        freshness.latitude?.status === "stale" || freshness.longitude?.status === "stale"
          ? "stale"
          : "fresh",
      )
      : "Unavailable",
    gsmStatus: "Unavailable",
    loraStatus: "Unavailable",
    location: {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: null,
      latitudeTimestamp: data.timestamps?.latitude || null,
      longitudeTimestamp: data.timestamps?.longitude || null,
      lastUpdated: data.timestamps?.latitude || data.timestamps?.longitude || null,
      freshness: {
        latitude: freshness.latitude,
        longitude: freshness.longitude,
      },
    },
    timestamps: data.timestamps || {},
    freshness,
    dataStatus: data.dataStatus,
    lastUpdated: data.lastUpdated,
  };
}

function mapHistory(data) {
  return (data.readings || []).map((entry) => ({
    time: entry.timestamp,
    timestamp: entry.timestamp,
    heartRate: entry.heartRateBpm,
    motion: entry.accelerationG,
    accelerationG: entry.accelerationG,
    emergencyStatus: entry.emergencyStatus,
    emergencyType: entry.emergencyType,
    latitude: entry.latitude,
    longitude: entry.longitude,
  }));
}

export async function fetchDeviceData() {
  if (USE_MOCK_DATA) return mockDeviceData;
  return mapDeviceData(await getDeviceData());
}

export async function fetchSensorHistory() {
  if (USE_MOCK_DATA) return mockSensorHistory;
  return mapHistory(await getSensorHistory(100));
}

export async function fetchSensorReadings() {
  const history = await fetchSensorHistory();
  const heartRate = history
    .filter((entry) => entry.heartRate !== null)
    .map((entry) => ({ time: entry.time, timestamp: entry.timestamp, bpm: entry.heartRate }));
  const motion = history
    .filter((entry) => entry.accelerationG !== null)
    .map((entry) => ({ time: entry.time, timestamp: entry.timestamp, acceleration: entry.accelerationG }));

  const toRecentReading = (entry) => ({
    time: entry.time,
    bpm: entry.heartRate,
    motion: entry.accelerationG,
    gps: entry.latitude !== null && entry.latitude !== undefined &&
      entry.longitude !== null && entry.longitude !== undefined
      ? "Available"
      : "Unavailable",
    status: entry.emergencyStatus === 1 ? "SOS" : entry.emergencyStatus === 0 ? "Normal" : "Unavailable",
  });

  return {
    heartRate,
    motion,
    recentReadings: history.slice(-5).reverse().map(toRecentReading),
    lastUpdated: history.at(-1)?.timestamp || null,
    freshness: history.at(-1)?.timestamp ? "available" : "unavailable",
    rangeMap: {
      "1 Hour": { heartRate: heartRate.slice(-6), motion: motion.slice(-6), recentReadings: history.slice(-6).reverse().map(toRecentReading) },
      "6 Hours": { heartRate: heartRate.slice(-12), motion: motion.slice(-12), recentReadings: history.slice(-12).reverse().map(toRecentReading) },
      "24 Hours": { heartRate, motion, recentReadings: history.slice().reverse().map(toRecentReading) },
    },
  };
}

export async function fetchUserData() {
  if (USE_MOCK_DATA) return userData;
  return getUser();
}

export function fetchEmergencyContacts() {
  if (USE_MOCK_DATA) return Promise.resolve([...mockEmergencyContacts]);
  return getEmergencyContacts();
}

export function addEmergencyContact(contact) {
  if (USE_MOCK_DATA) return Promise.resolve({ id: Date.now(), ...contact });
  return createEmergencyContact(contact);
}

export function updateEmergencyContact(id, contact) {
  if (USE_MOCK_DATA) return Promise.resolve({ id, ...contact });
  return updateContactRequest(id, contact);
}

export function deleteEmergencyContact(id) {
  if (USE_MOCK_DATA) return Promise.resolve({ id });
  return deleteContactRequest(id);
}

export function fetchSafetyHistory() {
  if (USE_MOCK_DATA) return Promise.resolve(mockSafetyEvents);
  return getSafetyHistory();
}

export function saveSafetyEvent(event) {
  if (USE_MOCK_DATA) return Promise.resolve({ id: Date.now(), ...event });
  return recordSafetyEvent(event);
}

export function triggerMacro(trigger) {
  if (USE_MOCK_DATA) {
    return Promise.reject(new Error("MacroDroid triggers are unavailable while mock data mode is enabled."));
  }
  return triggerMacroDroid(trigger);
}
