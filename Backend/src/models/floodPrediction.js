import mongoose from "mongoose";

const floodPredictionSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    probability: Number,
    risk: String,
    confidence: Number,
    predictionWindow: String,
    factors: [{ name: String, impact: Number }]
  },
  { timestamps: true }
);

export const FloodPrediction = mongoose.models.FloodPrediction || mongoose.model("FloodPrediction", floodPredictionSchema);
