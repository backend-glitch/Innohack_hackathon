import mongoose from "mongoose";

const weatherSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    rainfallProbability: Number,
    windSpeed: Number,
    condition: String
  },
  { timestamps: true }
);

export const Weather = mongoose.models.Weather || mongoose.model("Weather", weatherSchema);
