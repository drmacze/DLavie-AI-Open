/**
 * DLavie AI Model Registry
 * Multi-provider AI engine: local GGUF, xAI Grok, Google Gemini
 */

export type ModelProvider = "local" | "xai" | "gemini";

export type ModelInfo = {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  contextWindow: number;
  plan: "free" | "lite" | "plus" | "max";
  available: boolean;
};

export const MODEL_REGISTRY: ModelInfo[] = [
  {
    id: "local-qwen-1.5b",
    name: "DLavie Coder 1.5B",
    provider: "local",
    description: "Qwen2.5-Coder 1.5B — fast local model, runs offline",
    contextWindow: 2048,
    plan: "free",
    available: true,
  },
  {
    id: "grok-3-mini",
    name: "Grok 3 Mini",
    provider: "xai",
    description: "xAI Grok 3 Mini — fast reasoning, great for code",
    contextWindow: 131072,
    plan: "lite",
    available: !!process.env.XAI_API_KEY,
  },
  {
    id: "grok-3",
    name: "Grok 3",
    provider: "xai",
    description: "xAI Grok 3 — full intelligence, advanced reasoning",
    contextWindow: 131072,
    plan: "plus",
    available: !!process.env.XAI_API_KEY,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    description: "Google Gemini 2.0 Flash — multimodal, fast, efficient",
    contextWindow: 1048576,
    plan: "lite",
    available: !!process.env.GEMINI_API_KEY,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "gemini",
    description: "Google Gemini 2.5 Pro — most capable, 1M context",
    contextWindow: 1048576,
    plan: "plus",
    available: !!process.env.GEMINI_API_KEY,
  },
];

export function getModel(modelId: string): ModelInfo | undefined {
  return MODEL_REGISTRY.find((m) => m.id === modelId);
}

export function getModelsForPlan(plan: string): ModelInfo[] {
  const order: Record<string, number> = { free: 0, lite: 1, plus: 2, max: 3 };
  const userLevel = order[plan] ?? 0;
  return MODEL_REGISTRY.filter((m) => (order[m.plan] ?? 0) <= userLevel);
}
