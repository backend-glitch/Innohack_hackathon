import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    riskLevel: { type: String, default: "LOW" }
  },
  { timestamps: true }
);

export const Location = mongoose.models.Location || mongoose.model("Location", locationSchema);
