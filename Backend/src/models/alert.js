import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    location: String,
    lat: Number,
    lng: Number,
    riskLevel: String,
    title: String,
    message: String,
    probability: Number,
    recommendedAction: String
  },
  { timestamps: true }
);

export const Alert = mongoose.models.Alert || mongoose.model("Alert", alertSchema);
