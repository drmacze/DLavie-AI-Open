import path from "path";
import fs from "fs";

// ── Local model (node-llama-cpp) ──────────────────────────────────────────
const MODEL_DIR = path.join(process.env.HOME ?? "/home/runner", ".dlavie-models");
const MODEL_FILENAME = "Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf";
const MODEL_PATH = path.join(MODEL_DIR, MODEL_FILENAME);
const MODEL_URL =
  "https://huggingface.co/bartowski/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf";

let llamaInstance: any = null;
let localModel: any = null;
let isLoading = false;
let loadError: string | null = null;

export async function initLLM(): Promise<void> {
  if (localModel || isLoading) return;
  isLoading = true;
  try {
    const { getLlama, createModelDownloader, LlamaChatSession } = await import("node-llama-cpp");
    fs.mkdirSync(MODEL_DIR, { recursive: true });
    if (!fs.existsSync(MODEL_PATH)) {
      console.log("[LLM] Downloading Qwen2.5-Coder-1.5B (~1GB)…");
      const dl = await createModelDownloader({ modelUrl: MODEL_URL, dirPath: MODEL_DIR, fileName: MODEL_FILENAME });
      await dl.download();
    }
    console.log("[LLM] Loading local model…");
    llamaInstance = await getLlama({ gpu: false });
    localModel = await llamaInstance.loadModel({ modelPath: MODEL_PATH });
    console.log("[LLM] Local model ready.");
    loadError = null;
  } catch (err: any) {
    loadError = err?.message ?? "Failed to init LLM";
    console.error("[LLM] Init error:", loadError);
  } finally {
    isLoading = false;
  }
}

export function getLLMStatus() {
  return { ready: !!localModel, loading: isLoading, error: loadError };
}

// ── Router ─────────────────────────────────────────────────────────────────
export async function generateChat(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  modelId = "local-qwen-1.5b"
): Promise<{ text: string; tokensUsed: number }> {
  if (modelId.startsWith("grok")) return callXAI(systemPrompt, history, modelId);
  if (modelId.startsWith("gemini")) return callGemini(systemPrompt, history, modelId);
  return callLocal(systemPrompt, history);
}

export async function generateCompletion(code: string, language: string, modelId = "local-qwen-1.5b"): Promise<string> {
  const sys = `You are a ${language} code completion assistant. Return ONLY the completion, no markdown.`;
  const { text } = await generateChat(sys, [{ role: "user", content: code }], modelId);
  return text;
}

// ── Local (Qwen via node-llama-cpp) ───────────────────────────────────────
async function callLocal(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<{ text: string; tokensUsed: number }> {
  if (!localModel) throw new Error("Local LLM not ready. Model is still loading.");
  const { LlamaChatSession } = await import("node-llama-cpp");
  const ctx = await localModel.createContext({ contextSize: 2048 });
  const session = new LlamaChatSession({ contextSequence: ctx.getSequence(), systemPrompt });
  for (let i = 0; i < history.length - 1; i++) {
    const m = history[i]!;
    if (m.role === "user") await session.prompt(m.content, { maxTokens: 1 });
  }
  const last = history[history.length - 1];
  if (!last) throw new Error("No messages");
  const text = await session.prompt(last.content, { maxTokens: 1024 });
  await ctx.dispose();
  return { text, tokensUsed: text.split(" ").length * 1.3 | 0 };
}

// ── xAI Grok ──────────────────────────────────────────────────────────────
async function callXAI(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  modelId: string
): Promise<{ text: string; tokensUsed: number }> {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error("XAI_API_KEY not configured");
  const modelMap: Record<string, string> = {
    "grok-3-mini": "grok-3-mini",
    "grok-3": "grok-3",
  };
  const model = modelMap[modelId] ?? "grok-3-mini";
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...history],
      max_tokens: 2048,
    }),
  });
  if (!res.ok) throw new Error(`xAI API error: ${res.status} ${await res.text()}`);
  const data = await res.json() as any;
  return {
    text: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens ?? 0,
  };
}

// ── Google Gemini ──────────────────────────────────────────────────────────
async function callGemini(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  modelId: string
): Promise<{ text: string; tokensUsed: number }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");
  const modelMap: Record<string, string> = {
    "gemini-2.0-flash": "gemini-2.0-flash",
    "gemini-2.5-pro": "gemini-2.5-pro",
  };
  const model = modelMap[modelId] ?? "gemini-2.0-flash";
  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 2048 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  const data = await res.json() as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { text, tokensUsed: data.usageMetadata?.totalTokenCount ?? 0 };
}
