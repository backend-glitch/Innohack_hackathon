import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { handleRequest } from "./src/app.js";
import { connectDatabase } from "./src/config/database.js";

loadEnvFile();

const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;

connectDatabase(mongoUri).catch((error) => {
  console.warn("MongoDB connection skipped:", error.message);
});

const server = createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred."
        }
      })
    );
  });
});

server.listen(port, () => {
  console.log(`FloodGuard API running on http://localhost:${port}/api/health`);
});

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
