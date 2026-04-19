import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "",
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8000",
};