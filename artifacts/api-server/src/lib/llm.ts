import { getLlama, createModelDownloader, LlamaChatSession } from "node-llama-cpp";
import path from "path";
import fs from "fs";

const MODEL_DIR = path.join(process.env.HOME ?? "/home/runner", ".dlavie-models");
const MODEL_FILENAME = "Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf";
const MODEL_PATH = path.join(MODEL_DIR, MODEL_FILENAME);
const MODEL_URL = "https://huggingface.co/bartowski/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf";

let llamaInstance: Awaited<ReturnType<typeof getLlama>> | null = null;
let modelInstance: Awaited<ReturnType<Awaited<ReturnType<typeof getLlama>>["loadModel"]>> | null = null;
let isLoading = false;
let loadError: string | null = null;

export async function initLLM(): Promise<void> {
  if (modelInstance || isLoading) return;
  isLoading = true;
  try {
    fs.mkdirSync(MODEL_DIR, { recursive: true });

    if (!fs.existsSync(MODEL_PATH)) {
      console.log("[LLM] Downloading Qwen2.5-Coder-1.5B model (~1GB)...");
      const downloader = await createModelDownloader({
        modelUrl: MODEL_URL,
        dirPath: MODEL_DIR,
        fileName: MODEL_FILENAME,
      });
      await downloader.download();
      console.log("[LLM] Model download complete.");
    }

    console.log("[LLM] Loading model into memory...");
    llamaInstance = await getLlama({ gpu: false });
    modelInstance = await llamaInstance.loadModel({ modelPath: MODEL_PATH });
    console.log("[LLM] Qwen2.5-Coder ready.");
    loadError = null;
  } catch (err: any) {
    loadError = err?.message ?? "Failed to initialize LLM";
    console.error("[LLM] Init error:", loadError);
  } finally {
    isLoading = false;
  }
}

export function getLLMStatus(): { ready: boolean; loading: boolean; error: string | null } {
  return { ready: !!modelInstance, loading: isLoading, error: loadError };
}

export async function generateChat(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  if (!modelInstance) throw new Error("LLM not ready. Model is still loading.");

  const context = await modelInstance.createContext({ contextSize: 2048 });
  const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
    systemPrompt,
  });

  for (let i = 0; i < history.length - 1; i++) {
    const msg = history[i]!;
    if (msg.role === "user") {
      await session.prompt(msg.content, { maxTokens: 1 });
    }
  }

  const lastMsg = history[history.length - 1];
  if (!lastMsg) throw new Error("No messages provided");

  const response = await session.prompt(lastMsg.content, { maxTokens: 1024 });
  await context.dispose();
  return response;
}

export async function generateCompletion(code: string, language: string): Promise<string> {
  if (!modelInstance) throw new Error("LLM not ready. Model is still loading.");

  const context = await modelInstance.createContext({ contextSize: 1024 });
  const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
    systemPrompt: `You are a ${language} code completion assistant. When given code, complete it naturally. Return ONLY the completion text, no markdown, no explanation.`,
  });

  const response = await session.prompt(code, { maxTokens: 256 });
  await context.dispose();
  return response;
}
