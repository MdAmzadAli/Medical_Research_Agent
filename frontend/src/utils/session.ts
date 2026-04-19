import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "medical_chat_session_id";

export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};