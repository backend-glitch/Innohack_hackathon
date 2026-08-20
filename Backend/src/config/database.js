import mongoose from "mongoose";

let connected = false;

export async function connectDatabase(uri) {
  if (!uri || connected) return connected;
  await mongoose.connect(uri);
  connected = true;
  return connected;
}

export function isDatabaseConnected() {
  return connected && mongoose.connection.readyState === 1;
}
