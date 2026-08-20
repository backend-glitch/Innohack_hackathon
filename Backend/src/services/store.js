import { FloodPrediction } from "../models/floodPrediction.js";
import { Weather } from "../models/weather.js";
import { Shelter } from "../models/shelter.js";
import { Alert } from "../models/alert.js";
import { FloodZone } from "../models/floodZone.js";
import { Sensor } from "../models/sensor.js";

export async function saveWeather(doc) {
  return Weather.create(doc);
}

export async function savePrediction(doc) {
  return FloodPrediction.create(doc);
}

export async function saveShelter(doc) {
  return Shelter.create(doc);
}

export async function saveAlert(doc) {
  return Alert.create(doc);
}

export async function saveFloodZone(doc) {
  return FloodZone.create(doc);
}

export async function saveSensor(doc) {
  return Sensor.create(doc);
}
