import { useState, useEffect, useRef } from "react";
import type { Message, AIResponse } from "../types/chat";
import { sendMessage, fetchHistory } from "../api/chat";
import { getSessionId } from "../utils/session";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef(getSessionId());
  const bottomRef = useRef<HTMLDivElement>(null);

console.log("[session] sessionId =", localStorage.getItem("medical_chat_session_id"));  
useEffect(() => {
  const loadHistory = async () => {
    try {
      console.log("[useChat] Loading history for session:", sessionId.current);
      const history = await fetchHistory(sessionId.current);
      console.log("[useChat] History loaded:", history.length, "messages");
      if (history.length > 0) setMessages(history);
    } catch (e) {
      console.error("[useChat] History fetch failed:", e);
    }
  };
  loadHistory();
}, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (query: string) => {
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const response: AIResponse = await sendMessage(query, sessionId.current);
      const assistantMsg: Message = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setError("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, send, bottomRef, sessionId: sessionId.current };
};