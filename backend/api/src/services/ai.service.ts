import axios from "axios";
import { ENV } from "../config/env.js";

export const callAIService = async (query: string, items: any[]) => {
  try {
    const res = await axios.post(`${ENV.AI_SERVICE_URL}/rank`, {
      query,
      items,
    });

    return res.data;
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      answer: "Failed to generate response",
      sources: [],
      trials: [],
    };
  }
};