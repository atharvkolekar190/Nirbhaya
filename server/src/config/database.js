import mongoose from "mongoose";

let state = {
  status: "not_configured",
  error: null,
};

export function getDatabaseStatus() {
  return { ...state };
}

export function isDatabaseConnected() {
  return state.status === "connected";
}

export async function connectDatabase(mongodbUri) {
  if (!mongodbUri) {
    state = {
      status: "not_configured",
      error: "MONGODB_URI is not configured.",
    };
    return false;
  }

  try {
    await mongoose.connect(mongodbUri);
    state = { status: "connected", error: null };
    return true;
  } catch (error) {
    state = {
      status: "disconnected",
      error: error instanceof Error ? error.message : "MongoDB connection failed.",
    };
    return false;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  state = { status: "disconnected", error: null };
}
