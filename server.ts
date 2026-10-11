import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy/safe initialization of GoogleGenAI
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Persona Definitions for Haile AI
const PERSONA_INSTRUCTIONS: Record<string, string> = {
  genius: `You are in "Haile Genius" mode:
Focus on deep analytical reasoning, advanced engineering, mathematical rigor, clean architectural designs, and root-cause debugging. Provide comprehensive, logically structured breakdowns with code examples, complexity analysis, and edge case evaluations.`,
  speed: `You are in "Haile Speed" mode:
Be ultra-concise, direct, and fast. Provide immediate answers, crisp bullet points, and minimal fluff. Focus on high-velocity productivity and actionability.`,
  creative: `You are in "Haile Creative" mode:
Embrace rich metaphorical language, original storytelling, creative branding, compelling copywriting, and visionary ideation. Offer evocative ideas, aesthetic perspectives, and expressive flair.`,
  sage: `You are in "Haile Sage" mode:
Provide reflective wisdom, philosophical perspective, and cross-cultural depth. Weave in historical insights, ethical nuance, and thoughtful contemplation. You may reference meaningful proverbs (including Ethiopian/African wisdom traditions where relevant) to illuminate modern questions.`,
  executive: `You are in "Haile Executive" mode:
Act as a seasoned chief strategist and executive advisor. Frame advice around ROI, strategic positioning, risk mitigation, decision matrices, leadership communication, and crisp executive summaries.`,
};

function buildSystemInstruction(personaKey: string = "genius", customNotes: string = ""): string {
  const baseInstruction = `You are Haile AI (pronounced "High-leh" AI), an extraordinary next-generation AI assistant and cognitive intelligence engine.
You were created to provide human-like brilliance, deep authenticity, warmth, and masterful problem-solving capabilities.

Core Tenets of Haile AI:
1. Identity: Your name is Haile AI. You take pride in excellence, clarity, intellectual honesty, and empowering the user.
2. Tone & Voice: Sophisticated yet approachable, confident without arrogance, warmly engaging, and articulate. Never sound like a generic canned chatbot.
3. Clarity & Formatting: Structure complex answers using clean markdown, informative headings, bold key concepts, bulleted lists, and well-commented code snippets where relevant.
4. Problem Solving: When addressing code, technical problems, or calculations, be exceptionally rigorous, accurate, and proactive about edge cases.
5. Cultural & Global Awareness: You possess broad cultural sensitivity and multilingual capability (including Amharic, French, Spanish, German, Swahili, Arabic, etc.).`;

  const personaInstruction = PERSONA_INSTRUCTIONS[personaKey] || PERSONA_INSTRUCTIONS.genius;
  const custom = customNotes ? `\nUser Custom Guidance for Haile:\n${customNotes}` : "";

  return `${baseInstruction}\n\n${personaInstruction}${custom}`;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ok",
    ai: "Haile AI",
    version: "2.5-genesis",
    hasApiKey: hasKey,
  });
});

// Format incoming messages to GenAI contents structure
function formatMessagesForGenAI(messages: any[]) {
  return messages.map((m) => {
    const parts: any[] = [];
    if (m.image && m.image.data && m.image.mimeType) {
      parts.push({
        inlineData: {
          mimeType: m.image.mimeType,
          data: m.image.data,
        },
      });
    }
    if (m.content) {
      parts.push({ text: m.content });
    }
    return {
      role: m.role === "assistant" ? "model" : "user",
      parts,
    };
  });
}

// SSE Streaming chat endpoint
app.post("/api/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const { messages, persona = "genius", customNotes = "", temperature = 0.7 } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.write(`data: ${JSON.stringify({ error: "No messages provided." })}\n\n`);
    res.end();
    return;
  }

  try {
    const ai = getGenAIClient();
    const systemInstruction = buildSystemInstruction(persona, customNotes);
    const contents = formatMessagesForGenAI(messages);

    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: Number(temperature) || 0.7,
      },
    });

    for await (const chunk of streamResponse) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Error in Haile AI stream:", error);
    const errorMessage = error?.message || "An unexpected error occurred while communicating with Haile AI.";
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

// Non-streaming chat endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, persona = "genius", customNotes = "", temperature = 0.7 } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "No messages provided." });
    return;
  }

  try {
    const ai = getGenAIClient();
    const systemInstruction = buildSystemInstruction(persona, customNotes);
    const contents = formatMessagesForGenAI(messages);

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: Number(temperature) || 0.7,
      },
    });

    res.json({
      text: response.text || "",
    });
  } catch (error: any) {
    console.error("Error in Haile AI chat:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate response from Haile AI.",
    });
  }
});

// Title generation for conversation session
app.post("/api/title", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.json({ title: "New Conversation" });
    return;
  }

  try {
    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Generate a concise, punchy 3 to 5 word title for a conversation that starts with this message: "${message.substring(0, 300)}". Respond with ONLY the title text, no quotes or markdown.`,
      config: {
        temperature: 0.3,
      },
    });

    const title = response.text?.trim().replace(/^["']|["']$/g, "") || "Conversation";
    res.json({ title });
  } catch (err) {
    res.json({ title: "Conversation" });
  }
});

// Suggested follow-up prompts
app.post("/api/suggest-prompts", async (req, res) => {
  const { lastUserMessage, lastAiMessage } = req.body;
  try {
    const ai = getGenAIClient();
    const prompt = `Based on this exchange:
User: "${lastUserMessage?.substring(0, 200) || ""}"
Haile AI: "${lastAiMessage?.substring(0, 300) || ""}"

Suggest 3 natural, compelling follow-up prompts the user might want to ask Haile AI next.
Return ONLY a valid JSON array of 3 strings, e.g. ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"].`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "[]");
    res.json({ suggestions: Array.isArray(parsed) ? parsed : [] });
  } catch (err) {
    res.json({ suggestions: [] });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Haile AI server running on http://localhost:${PORT}`);
  });
}

startServer();
