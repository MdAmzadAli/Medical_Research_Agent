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
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use(errorMiddleware);
export default app;