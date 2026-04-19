import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api", chatRoutes);

// health check
app.get("/health", async (req, res) => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL||"http://localhost:8000";
    const aiResponse = await fetch(`${aiServiceUrl}/health`);
    const aiStatus = aiResponse.ok ? "healthy" : "unhealthy";

    res.json({
      status: "healthy",
      services: {
        api: "healthy",
        ai_service: aiStatus,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(207).json({
      status: "degraded",
      services: {
        api: "healthy",
        ai_service: "unreachable",
      },
      timestamp: new Date().toISOString(),
    });
  }
});

app.use(errorMiddleware);
export default app;