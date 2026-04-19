import { Request, Response, NextFunction } from "express";
import { getOrCreateContext, updateContext } from "../services/context.service.js";
import { buildFinalQuery, detectDisease, expandQuery } from "../services/query.service.js";
import { fetchAllData } from "../services/retrieval.service.js";
import { callAIService } from "../services/ai.service.js";
import { Chat } from "../models/chat.model.js";

export const chatHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, query } = req.body;

    if (!sessionId || !query) {
      return res.status(400).json({ error: "sessionId and query required" });
    }

    // 1️⃣ Get existing context
    const chatDoc = await getOrCreateContext(sessionId);
    let context = chatDoc.context;

    // 2️⃣ Detect disease switch
    const newDisease = await detectDisease(query,context);
    console.log("newDisease is :",newDisease);

    if (newDisease && newDisease !== context.disease) {
      context.disease = newDisease;
      context.topics = [];  
    }

    // 3️⃣ Build final query (context-aware)
    const finalQuery = buildFinalQuery(query, context, newDisease);
    console.log("finalQuery is: ",finalQuery);
   
    const queries = await expandQuery(finalQuery);
    console.log("Expanded Queries are :", queries);
    
    // 4️⃣ Fetch research data
    const data = await fetchAllData(queries, context.disease);
    // data.forEach((item)=>
    //   {console.log("Title :",item.title);
    //     console.log("URL :", item.url);
    //   });
    // console.log("data is :", data);
    // 5️⃣ Send to AI service (ranking + LLM)
    const aiResponse = await callAIService(query, data);
    
    // 6️⃣ Update context
    context.lastQuery = query;
    await updateContext(sessionId, context);

    // // 7️⃣ Save messages
    chatDoc.messages.push(
      { role: "user", content: query },
      { role: "assistant", content: JSON.stringify(aiResponse) }
    );

    // if (chatDoc.messages.length > 20) {
    //   chatDoc.messages = chatDoc.messages.slice(-20);
    // }

    await chatDoc.save();

    // // 8️⃣ Send response
    // return res.json({"message":"all good"});
    console.log(aiResponse)
    return res.json(aiResponse);

  } catch (error) {
    next(error);
  }
};

// chat.controller.ts

export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const chatDoc = await Chat.findOne({ sessionId });

    if (!chatDoc) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    // Parse assistant messages back to structured object
    const messages = chatDoc.messages.map((msg) => {
      if (msg.role === "assistant") {
        try {
          return {
            role: msg.role,
            content: JSON.parse(msg.content),  // structured sections object
            timestamp: msg.timestamp,
          };
        } catch {
          return {
            role: msg.role,
            content: msg.content,              // fallback — return as plain string
            timestamp: msg.timestamp,
          };
        }
      }

      // User messages — plain string, no parsing needed
      return {
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      };
    });

    return res.status(200).json({
      sessionId: chatDoc.sessionId,
      context: chatDoc.context,
      messages,
      createdAt: chatDoc.createdAt,
      updatedAt: chatDoc.updatedAt,
    });

  } catch (error) {
    next(error);
  }
};