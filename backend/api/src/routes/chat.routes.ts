import express from "express";
import { chatHandler, getChatHistory } from "../controllers/chat.controller.js";

const router = express.Router();

// POST /api/chat
router.post("/chat", chatHandler);
router.get("/chat/:sessionId", getChatHistory); 

export default router;