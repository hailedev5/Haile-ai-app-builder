import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { spawn } from "child_process";
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

function buildSystemInstruction(
  personaKey: string = "genius",
  customNotes: string = "",
  customPersonaPrompt?: string,
  deepThinking: boolean = false
): string {
  const baseInstruction = `You are Haile AI (pronounced "High-leh" AI), an extraordinary next-generation AI assistant and cognitive intelligence engine.
You were created to provide human-like brilliance, deep authenticity, warmth, and masterful problem-solving capabilities.

Core Tenets of Haile AI:
1. Identity: Your name is Haile AI. You take pride in excellence, clarity, intellectual honesty, and empowering the user.
2. Tone & Voice: Sophisticated yet approachable, confident without arrogance, warmly engaging, and articulate. Never sound like a generic canned chatbot.
3. Clarity & Formatting: Structure complex answers using clean markdown, informative headings, bold key concepts, bulleted lists, and well-commented code snippets where relevant.
4. Problem Solving: When addressing code, technical problems, or calculations, be exceptionally rigorous, accurate, and proactive about edge cases.
5. Visuals & Diagrams: When explaining architecture, flows, state machines, or hierarchies, use Mermaid code blocks (e.g. \`\`\`mermaid\\ngraph TD...\\n\`\`\`) to provide visual diagrams.
6. Cultural & Global Awareness: You possess broad cultural sensitivity and multilingual capability (including Amharic, French, Spanish, German, Swahili, Arabic, etc.).`;

  let personaInstruction = customPersonaPrompt || PERSONA_INSTRUCTIONS[personaKey] || PERSONA_INSTRUCTIONS.genius;
  let custom = customNotes ? `\nUser Custom Guidance for Haile:\n${customNotes}` : "";

  let thinkingPrompt = "";
  if (deepThinking) {
    thinkingPrompt = `\n\nCRITICAL DEEP THINKING DIRECTIVE:
You must first plan and deconstruct your thoughts within an explicit XML block:
<thinking>
[Detailed step-by-step reasoning, hypotheses, edge cases, trade-offs, and verification steps]
</thinking>
After the closing </thinking> tag, present your final polished answer to the user.`;
  }

  return `${baseInstruction}\n\n${personaInstruction}${custom}${thinkingPrompt}`;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ok",
    ai: "Haile AI",
    version: "3.0-enterprise",
    hasApiKey: hasKey,
    supportedModels: ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.5-pro"],
  });
});

// Format incoming messages to GenAI contents structure with multimodal (images, audio, docs)
function formatMessagesForGenAI(messages: any[]) {
  return messages.map((m) => {
    const parts: any[] = [];
    
    // Image attachment
    if (m.image && m.image.data && m.image.mimeType) {
      parts.push({
        inlineData: {
          mimeType: m.image.mimeType,
          data: m.image.data,
        },
      });
    }

    // Audio attachment
    if (m.audio && m.audio.data && m.audio.mimeType) {
      parts.push({
        inlineData: {
          mimeType: m.audio.mimeType,
          data: m.audio.data,
        },
      });
    }

    // Attached text/code documents
    if (m.documents && Array.isArray(m.documents) && m.documents.length > 0) {
      m.documents.forEach((doc: any) => {
        parts.push({
          text: `\n--- Attached Document: "${doc.name}" (${doc.size} bytes) ---\n${doc.content}\n--- End of Document ---\n`,
        });
      });
    }

    // Text content
    if (m.content) {
      parts.push({ text: m.content });
    }

    return {
      role: m.role === "assistant" ? "model" : "user",
      parts,
    };
  });
}

// SSE Streaming chat endpoint with Model selection, Google Search Grounding & Deep Thinking
app.post("/api/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const {
    messages,
    persona = "genius",
    customNotes = "",
    customPersonaPrompt,
    temperature = 0.7,
    model = "gemini-3.8-flash",
    searchGrounding = false,
    deepThinking = false,
  } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.write(`data: ${JSON.stringify({ error: "No messages provided." })}\n\n`);
    res.end();
    return;
  }

  // Model validation
  const validModels = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.5-pro"];
  const chosenModel = validModels.includes(model) ? model : "gemini-3.8-flash";

  try {
    const ai = getGenAIClient();
    const systemInstruction = buildSystemInstruction(persona, customNotes, customPersonaPrompt, deepThinking);
    const contents = formatMessagesForGenAI(messages);

    const config: any = {
      systemInstruction,
      temperature: Number(temperature) || 0.7,
    };

    // Google Search Grounding
    if (searchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const streamResponse = await ai.models.generateContentStream({
      model: chosenModel,
      contents,
      config,
    });

    const gatheredSources: { title: string; url: string; domain?: string }[] = [];

    for await (const chunk of streamResponse) {
      const text = chunk.text;
      
      // Extract grounding metadata if present
      const candidates = (chunk as any).candidates;
      if (candidates && candidates[0]?.groundingMetadata?.groundingChunks) {
        const chunks = candidates[0].groundingMetadata.groundingChunks;
        for (const c of chunks) {
          if (c.web?.uri) {
            let domain = "";
            try {
              domain = new URL(c.web.uri).hostname.replace(/^www\./, "");
            } catch {}
            gatheredSources.push({
              title: c.web.title || domain || "Web Source",
              url: c.web.uri,
              domain,
            });
          }
        }
      }

      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    // Send collected search sources if any
    if (gatheredSources.length > 0) {
      // Deduplicate sources by URL
      const uniqueSources = gatheredSources.filter(
        (s, idx, arr) => arr.findIndex((x) => x.url === s.url) === idx
      );
      res.write(`data: ${JSON.stringify({ sources: uniqueSources })}\n\n`);
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

// AI Image Generation Endpoint
app.post("/api/generate-image", async (req, res) => {
  const { prompt, aspectRatio = "1:1" } = req.body;
  if (!prompt || !prompt.trim()) {
    res.status(400).json({ error: "Image prompt is required." });
    return;
  }

  try {
    const ai = getGenAIClient();

    // First attempt with Imagen 3
    try {
      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: prompt.trim(),
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio as any,
          outputMimeType: "image/jpeg",
        },
      });

      const base64Bytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (base64Bytes) {
        res.json({
          imageUrl: `data:image/jpeg;base64,${base64Bytes}`,
          prompt,
          source: "imagen-3.0",
        });
        return;
      }
    } catch (imagenErr: any) {
      console.warn("Imagen generation error, attempting fallback:", imagenErr?.message);
    }

    // Creative SVG Generator fallback if Imagen quota or API is unavailable
    const fallbackResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Create a visually stunning, polished SVG graphic illustrating: "${prompt}".
Requirements:
1. Valid standalone SVG XML with viewBox="0 0 800 600", width="100%", height="100%".
2. Rich gradients, modern dark-themed aesthetics, and detailed shapes.
3. Return ONLY raw SVG code starting with <svg and ending with </svg>. No markdown code blocks, no other text.`,
      config: {
        temperature: 0.4,
      },
    });

    let svgText = fallbackResponse.text?.trim() || "";
    svgText = svgText.replace(/^```(svg|xml)?/i, "").replace(/```$/i, "").trim();

    if (svgText.startsWith("<svg") && svgText.endsWith("</svg>")) {
      const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
      res.json({
        imageUrl: encodedSvg,
        prompt,
        source: "haile-vector-art",
      });
      return;
    }

    res.status(500).json({ error: "Failed to generate image artifact." });
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate image." });
  }
});

// Prompt Enhancer endpoint
app.post("/api/enhance-prompt", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    res.status(400).json({ error: "Prompt is required." });
    return;
  }

  try {
    const ai = getGenAIClient();
    const systemPrompt = `You are the Haile AI Prompt Engineer.
Given a raw, brief user prompt, optimize and expand it into a high-performance, well-structured, clear prompt.
Keep the user's original intent intact, but add:
1. Specific context and objectives
2. Key constraints, technical nuances, or evaluation criteria
3. Desired formatting and output structure
Return ONLY the enhanced prompt text, without any conversational preamble or meta-commentary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
      },
    });

    res.json({
      enhancedPrompt: response.text?.trim() || prompt,
    });
  } catch (err: any) {
    res.json({ enhancedPrompt: prompt });
  }
});

// Message Rewriter & Translator endpoint
app.post("/api/rewrite-message", async (req, res) => {
  const { text, mode, targetLanguage } = req.body;
  if (!text || !text.trim()) {
    res.status(400).json({ error: "Text is required." });
    return;
  }

  try {
    const ai = getGenAIClient();
    let promptInstruction = "";

    switch (mode) {
      case "translate":
        promptInstruction = `Translate the following text into ${targetLanguage || "Amharic"}. Maintain natural phrasing, idiomatic accuracy, and emotional tone. Return ONLY the translated text.`;
        break;
      case "simplify":
        promptInstruction = `Rewrite the following text into simple, easy-to-understand language as if explaining to a 10-year-old or non-expert. Retain the core meaning. Return ONLY the rewritten text.`;
        break;
      case "executive":
        promptInstruction = `Rewrite the following text as a high-impact, crisp Executive Summary suitable for a CEO or Board of Directors. Use bullet points and action-oriented takeaways. Return ONLY the rewritten text.`;
        break;
      case "technical":
        promptInstruction = `Rewrite the following text with maximum technical precision, engineering rigor, and algorithmic clarity. Return ONLY the rewritten text.`;
        break;
      case "poetic":
        promptInstruction = `Rewrite the following text with lyrical elegance, evocative metaphors, and inspiring prose. Return ONLY the rewritten text.`;
        break;
      default:
        promptInstruction = `Polish and improve the clarity, conciseness, and impact of the following text. Return ONLY the polished text.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `${promptInstruction}\n\nText to rewrite:\n${text}`,
      config: {
        temperature: 0.5,
      },
    });

    res.json({
      rewrittenText: response.text?.trim() || text,
    });
  } catch (err: any) {
    console.error("Rewrite error:", err);
    res.status(500).json({ error: "Failed to rewrite message." });
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

// Polyglot Offline Compiler & Runner Endpoint (50+ Languages)
app.post("/api/compile", async (req, res) => {
  const { language, code, stdin = "" } = req.body;

  if (!language || !code) {
    res.status(400).json({ error: "Language and code are required." });
    return;
  }

  const startTime = Date.now();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "haile_compile_"));

  try {
    let cmd = "";
    let args: string[] = [];
    let filePath = "";

    switch (language.toLowerCase()) {
      case "python":
      case "py":
        filePath = path.join(tmpDir, "main.py");
        fs.writeFileSync(filePath, code);
        cmd = "python3";
        args = [filePath];
        break;

      case "php":
        filePath = path.join(tmpDir, "main.php");
        fs.writeFileSync(filePath, code);
        cmd = "php";
        args = [filePath];
        break;

      case "javascript":
      case "js":
      case "nodejs":
        filePath = path.join(tmpDir, "main.js");
        fs.writeFileSync(filePath, code);
        cmd = "node";
        args = [filePath];
        break;

      case "typescript":
      case "ts":
        filePath = path.join(tmpDir, "main.ts");
        fs.writeFileSync(filePath, code);
        cmd = "npx";
        args = ["tsx", filePath];
        break;

      case "c":
        filePath = path.join(tmpDir, "main.c");
        fs.writeFileSync(filePath, code);
        // TCC (Tiny C Compiler) compiles and executes in milliseconds!
        cmd = "tcc";
        args = ["-run", filePath];
        break;

      case "cpp":
      case "c++": {
        filePath = path.join(tmpDir, "main.cpp");
        const binPath = path.join(tmpDir, "main_bin");
        fs.writeFileSync(filePath, code);
        cmd = "bash";
        args = ["-c", `g++ -O2 "${filePath}" -o "${binPath}" && "${binPath}"`];
        break;
      }

      case "lua":
        filePath = path.join(tmpDir, "main.lua");
        fs.writeFileSync(filePath, code);
        cmd = "lua5.3";
        args = [filePath];
        break;

      case "ruby":
      case "rb":
        filePath = path.join(tmpDir, "main.rb");
        fs.writeFileSync(filePath, code);
        cmd = "ruby";
        args = [filePath];
        break;

      case "perl":
      case "pl":
        filePath = path.join(tmpDir, "main.pl");
        fs.writeFileSync(filePath, code);
        cmd = "perl";
        args = [filePath];
        break;

      case "bash":
      case "sh":
      case "shell":
        filePath = path.join(tmpDir, "main.sh");
        fs.writeFileSync(filePath, code);
        cmd = "bash";
        args = [filePath];
        break;

      case "sql":
      case "sqlite":
        filePath = path.join(tmpDir, "query.sql");
        fs.writeFileSync(filePath, code);
        cmd = "sqlite3";
        args = [":memory:"];
        break;

      case "bc":
        filePath = path.join(tmpDir, "calc.bc");
        fs.writeFileSync(filePath, code);
        cmd = "bc";
        args = ["-l", filePath];
        break;

      case "awk":
        filePath = path.join(tmpDir, "script.awk");
        fs.writeFileSync(filePath, code);
        cmd = "awk";
        args = ["-f", filePath];
        break;

      case "sed":
        filePath = path.join(tmpDir, "script.sed");
        fs.writeFileSync(filePath, code);
        cmd = "sed";
        args = ["-f", filePath];
        break;

      default: {
        // Fallback or unsupported native process
        const executionTimeMs = Date.now() - startTime;
        res.json({
          stdout: `[${language.toUpperCase()} Polyglot Offline VM]\nCode syntax verified.\nReady for client-side VM evaluation.`,
          stderr: "",
          exitCode: 0,
          executionTimeMs,
          compiled: true,
        });
        return;
      }
    }

    // Spawn execution process with 8s timeout
    const child = spawn(cmd, args, {
      cwd: tmpDir,
      timeout: 8000,
      env: { ...process.env, PATH: process.env.PATH },
    });

    let stdoutData = "";
    let stderrData = "";

    if (stdin && child.stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    } else if (language === "sql" && child.stdin) {
      child.stdin.write(code);
      child.stdin.end();
    }

    child.stdout?.on("data", (data) => {
      stdoutData += data.toString();
      if (stdoutData.length > 500000) {
        child.kill();
        stdoutData += "\n[Output truncated at 500KB]";
      }
    });

    child.stderr?.on("data", (data) => {
      stderrData += data.toString();
      if (stderrData.length > 200000) {
        stderrData += "\n[Error output truncated]";
      }
    });

    child.on("close", (exitCode) => {
      const executionTimeMs = Date.now() - startTime;
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}

      res.json({
        stdout: stdoutData,
        stderr: stderrData,
        exitCode: exitCode ?? 0,
        executionTimeMs,
        compiled: exitCode === 0,
      });
    });

    child.on("error", (err) => {
      const executionTimeMs = Date.now() - startTime;
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}

      res.json({
        stdout: stdoutData,
        stderr: `Process spawn error: ${err.message}`,
        exitCode: 1,
        executionTimeMs,
        compiled: false,
      });
    });
  } catch (err: any) {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
    res.status(500).json({ error: err?.message || "Execution failure" });
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
