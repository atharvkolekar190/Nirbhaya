const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

async function get(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message || `Device request failed (${response.status}).`);
  }

  return payload.data;
}

export function getDeviceData() {
  return get("/api/device/latest");
}

export function getSensorHistory(limit = 100) {
  return get(`/api/device/history?limit=${encodeURIComponent(limit)}`);
}
