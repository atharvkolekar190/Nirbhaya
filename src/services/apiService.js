const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(`Backend returned invalid JSON (${response.status}).`, { cause: error });
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message || `Backend request failed (${response.status}).`);
  }

  return payload.data;
}

export function getUser() {
  return Promise.resolve(null);
}

export function getEmergencyContacts() {
  return request("/api/contacts").then((contacts) =>
    contacts.map(({ _id, ...contact }) => ({ id: _id || contact.id, ...contact })),
  );
}

export function createEmergencyContact(contact) {
  return request("/api/contacts", {
    method: "POST",
    body: JSON.stringify(contact),
  }).then(({ _id, ...created }) => ({ id: _id || created.id, ...created }));
}

export function updateEmergencyContact(id, contact) {
  return request(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(contact),
  }).then(({ _id, ...updated }) => ({ id: _id || updated.id, ...updated }));
}

export function deleteEmergencyContact(id) {
  return request(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getSafetyHistory() {
  return request("/api/history");
}

export function recordSafetyEvent(event) {
  return request("/api/history", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export function triggerMacroDroid(trigger) {
  return request(`/api/macrodroid/${encodeURIComponent(trigger)}`, {
    method: "POST",
    headers: {
      "Idempotency-Key": `${trigger}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
  });
}

export function updateEmergencyContacts(contacts) {
  return Promise.resolve(contacts);
}

export function updateDeviceSettings(settings) {
  return Promise.resolve(settings);
}
