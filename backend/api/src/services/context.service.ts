import { Chat } from "../models/chat.model.js";

export const getOrCreateContext = async (sessionId: string) => {
  let chat = await Chat.findOne({ sessionId });

  if (!chat) {
    chat = new Chat({
      sessionId,
      messages: [],
      context: {
        disease: "",
        topics: [],
        lastQuery: "",
      },
    });

    await chat.save();
  }

  return chat;
};

export const updateContext = async (sessionId: string, context: any) => {
  await Chat.findOneAndUpdate(
    { sessionId },
    { context },
    { returnDocument: 'after' }
  );
};