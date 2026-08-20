import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true },
    rainfall: Number,
    riverLevel: Number,
    riverLevelChange: Number,
    soilMoisture: Number,
    riskLevel: { type: String, default: "LOW" }
  },
  { timestamps: true }
);

export const Sensor = mongoose.models.Sensor || mongoose.model("Sensor", sensorSchema);
