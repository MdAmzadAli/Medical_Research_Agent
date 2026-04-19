import axios from "axios";
import type { AIResponse, Message } from "../types/chat";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const sendMessage = async (
  query: string,
  sessionId: string
): Promise<AIResponse> => {
  const res = await axios.post(`${BASE_URL}/api/chat`, { query, sessionId });
  return res.data;
};

// api/chat.ts — log raw response
export const fetchHistory = async (sessionId: string): Promise<Message[]> => {
  const res = await axios.get(`${BASE_URL}/api/chat/${sessionId}`);
  console.log("[fetchHistory] raw response:", res.data.messages?.[0]);
  return res.data.messages || [];
};