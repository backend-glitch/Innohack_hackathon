import mongoose from "mongoose";

const floodZoneSchema = new mongoose.Schema(
  {
    zoneId: { type: String, required: true },
    riskScore: Number,
    riskLevel: String,
    polygon: { type: [Array], default: [] }
  },
  { timestamps: true }
);

export const FloodZone = mongoose.models.FloodZone || mongoose.model("FloodZone", floodZoneSchema);
