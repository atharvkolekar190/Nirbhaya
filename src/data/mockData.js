export const deviceData = {
  deviceId: "NB-001",
  deviceName: "NIRBHAYA Band",
  connectionStatus: "Connected",
  batteryLevel: 86,

  gpsStatus: "Available",
  gsmStatus: "Connected",
  loraStatus: "Standby",

  emergencyStatus: "Safe",

  heartRate: {
    value: 82,
    unit: "BPM",
    status: "Normal",
  },

  motion: {
    status: "Normal",
    activity: "Stable",
  },

  location: {
    latitude: 18.5204,
    longitude: 73.8567,
    accuracy: 8,
    lastUpdated: "Just now",
  },
};


export const userData = {
  id: "USR-001",
  name: "User",
  email: "user@example.com",
  phone: "+91 9876543210",
};


export const emergencyContacts = [
  {
    id: 1,
    name: "Mom",
    relationship: "Mother",
    phone: "+91 9876543211",
    priority: 1,
  },
  {
    id: 2,
    name: "Dad",
    relationship: "Father",
    phone: "+91 9876543212",
    priority: 2,
  },
  {
    id: 3,
    name: "Emergency Friend",
    relationship: "Friend",
    phone: "+91 9876543213",
    priority: 3,
  },
];


export const safetyEvents = [
  {
    id: 1,
    type: "System Check",
    status: "Completed",
    date: "2026-08-29",
    time: "10:42 AM",
    location: "Pune",
  },
  {
    id: 2,
    type: "Manual SOS",
    status: "Cancelled",
    date: "2026-08-28",
    time: "07:35 PM",
    location: "Pune",
  },
  {
    id: 3,
    type: "Motion Alert",
    status: "Resolved",
    date: "2026-08-27",
    time: "06:18 PM",
    location: "Pune",
  },
];


export const sensorHistory = [
  {
    time: "10:00",
    heartRate: 78,
    motion: 20,
  },
  {
    time: "10:05",
    heartRate: 81,
    motion: 25,
  },
  {
    time: "10:10",
    heartRate: 84,
    motion: 30,
  },
  {
    time: "10:15",
    heartRate: 80,
    motion: 22,
  },
  {
    time: "10:20",
    heartRate: 86,
    motion: 35,
  },
  {
    time: "10:25",
    heartRate: 82,
    motion: 28,
  },
];