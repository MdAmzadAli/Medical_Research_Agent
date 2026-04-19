import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const contextSchema = new mongoose.Schema({
  disease: {
    type: String,
    default: "",
  },
  topics: {
    type: [String],
    default: [],
  },
  lastQuery: {
    type: String,
    default: "",
  },
});

const chatSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    context: {
      type: contextSchema,
      default: {},
    },
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);