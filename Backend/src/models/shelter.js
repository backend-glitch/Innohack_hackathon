import mongoose from "mongoose";

const shelterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    capacity: Number,
    available: Number,
    status: { type: String, default: "OPEN" },
    medicalSupport: { type: Boolean, default: false },
    waterAvailable: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Shelter = mongoose.models.Shelter || mongoose.model("Shelter", shelterSchema);
