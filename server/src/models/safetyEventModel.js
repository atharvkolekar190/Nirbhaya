import mongoose from "mongoose";

const safetyEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: {
      name: { type: String, trim: true },
      latitude: Number,
      longitude: Number,
    },
    source: { type: String, enum: ["application", "macrodroid"], default: "application" },
    occurredAt: { type: Date, required: true },
    deduplicationKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export const SafetyEvent = mongoose.models.SafetyEvent ||
  mongoose.model("SafetyEvent", safetyEventSchema);
