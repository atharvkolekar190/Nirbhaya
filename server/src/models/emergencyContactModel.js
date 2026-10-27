import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    priority: { type: Number, required: true, min: 1, max: 99 },
  },
  { timestamps: true },
);

export const EmergencyContact = mongoose.models.EmergencyContact ||
  mongoose.model("EmergencyContact", emergencyContactSchema);
