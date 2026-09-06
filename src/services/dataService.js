import { deviceData, userData, emergencyContacts, safetyEvents, sensorHistory } from "../data/mockData";
import { getDeviceData, getSensorHistory } from "./thingSpeakService";
import {
  getUser,
  getEmergencyContacts,
  getSafetyHistory,
} from "./apiService";

let emergencyContactsStore = [...emergencyContacts];

export async function fetchDeviceData() {
  const liveData = await getDeviceData();

  return liveData || deviceData;
}


export async function fetchSensorHistory() {
  const liveData = await getSensorHistory();

  return liveData || sensorHistory;
}


export async function fetchSensorReadings() {
  const liveData = await getSensorHistory();
  const history = liveData || sensorHistory;

  const heartRate = history.map((entry, index) => ({
    time: entry.time || `T-${history.length - index}`,
    bpm: entry.heartRate ?? 80 + index,
  }));

  const motion = history.map((entry, index) => ({
    time: entry.time || `T-${history.length - index}`,
    motion: entry.motion ?? 20 + index * 4,
  }));

  const recentReadings = history
    .slice(-5)
    .reverse()
    .map((entry) => ({
      time: entry.time || "Just now",
      bpm: entry.heartRate ?? 82,
      motion: motionLevelLabel(entry.motion ?? 25),
      gps: "Available",
      status: "Normal",
    }));

  return {
    heartRate,
    motion,
    recentReadings,
    lastUpdated: "Just now",
    rangeMap: {
      "1 Hour": {
        heartRate: heartRate.slice(-6),
        motion: motion.slice(-6),
        recentReadings,
      },
      "6 Hours": {
        heartRate: heartRate.slice(-12),
        motion: motion.slice(-12),
        recentReadings,
      },
      "24 Hours": {
        heartRate: heartRate,
        motion: motion,
        recentReadings,
      },
    },
  };
}

function motionLevelLabel(value) {
  if (value >= 65) return "High";
  if (value >= 35) return "Normal";
  return "Low";
}


export async function fetchUserData() {
  const data = await getUser();

  return data || userData;
}


export async function fetchEmergencyContacts() {
  const data = await getEmergencyContacts();

  return data || [...emergencyContactsStore];
}


export async function addEmergencyContact(contact) {
  const nextContact = {
    id: contact.id ?? Date.now(),
    name: contact.name,
    relationship: contact.relationship,
    phone: contact.phone,
    priority: Number(contact.priority) || 1,
  };

  emergencyContactsStore = [nextContact, ...emergencyContactsStore];

  return nextContact;
}


export async function updateEmergencyContact(id, contact) {
  const updatedContact = {
    id,
    name: contact.name,
    relationship: contact.relationship,
    phone: contact.phone,
    priority: Number(contact.priority) || 1,
  };

  emergencyContactsStore = emergencyContactsStore.map((current) =>
    current.id === id ? updatedContact : current
  );

  return updatedContact;
}


export async function deleteEmergencyContact(id) {
  const deletedItem = emergencyContactsStore.find((contact) => contact.id === id);

  emergencyContactsStore = emergencyContactsStore.filter((contact) => contact.id !== id);

  return deletedItem;
}


export async function fetchSafetyHistory() {
  const data = await getSafetyHistory();
  const source = data && data.length ? data : safetyEvents;

  return source.map((event, index) => ({
    id: event.id ?? index + 1,
    type: event.type || "System Check",
    status: event.status || "Resolved",
    timestamp: event.timestamp || toTimestamp(event.date, event.time, index),
    description:
      event.description ||
      defaultDescription(event.type, event.status),
    location: {
      name: event.location || "Pune",
      latitude: event.latitude ?? 18.5204,
      longitude: event.longitude ?? 73.8567,
    },
  }));
}

function toTimestamp(dateString, timeString, index) {
  const hasDate = typeof dateString === "string" && dateString.trim();
  const hasTime = typeof timeString === "string" && timeString.trim();

  if (!hasDate) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() - index);
    return fallback.toISOString();
  }

  if (!hasTime) {
    return new Date(dateString).toISOString();
  }

  const parsed = new Date(`${dateString} ${timeString}`);

  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date(dateString);
    return fallback.toISOString();
  }

  return parsed.toISOString();
}

function defaultDescription(type, status) {
  if (type === "Emergency SOS") {
    return status === "Cancelled"
      ? "Emergency SOS was triggered but cancelled before escalation."
      : "Emergency SOS was raised and monitored for response.";
  }

  if (type === "Voice SOS") {
    return "Voice SOS was initiated and resolved after confirmation.";
  }

  if (type === "Motion Alert") {
    return "Motion activity was detected and reviewed for an unusual condition.";
  }

  return "Routine system check completed successfully and verified device health.";
}