// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Zap, Brain, Code2, Cpu, Check, Loader2, Send,
  Lock, Wifi, WifiOff, ChevronDown, Info, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PLAN_DISPLAY, isDeveloperPlan } from "@/lib/supabase";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

const MODEL_INFO = {
  "local-qwen-1.5b": { gradient: "from-violet-500 to-indigo-500", glow: "shadow-violet-500/20", icon: Cpu, provider: "Local · Offline" },
  "grok-3-mini":      { gradient: "from-blue-500 to-cyan-500",    glow: "shadow-blue-500/20",   icon: Zap,  provider: "xAI" },
  "grok-3":           { gradient: "from-blue-600 to-violet-600",  glow: "shadow-violet-500/20", icon: Brain, provider: "xAI" },
  "gemini-2.0-flash": { gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/20", icon: Zap, provider: "Google" },
  "gemini-2.5-pro":   { gradient: "from-emerald-600 to-blue-500", glow: "shadow-blue-500/20",   icon: Star, provider: "Google" },
};

const PLAN_ORDER = { free: 0, lite: 1, plus: 2, max: 3, developer: 99 };

export default function ModelsPage() {
  const { profile } = useAuth();
  const plan = profile?.plan ?? "free";
  const [selectedModel, setSelectedModel] = useState("local-qwen-1.5b");
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: async () => { const r = await fetch(`${API}/ai/status`); return r.json(); },
    refetchInterval: 5000,
  });

  const models = aiStatus?.models ?? [];

  const testModel = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResponse("");
    try {
      const r = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, modelId: selectedModel }),
      });
      const data = await r.json();
      setResponse(data.content ?? data.error ?? "No response");
    } catch (err: any) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-violet-400" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">AI Models</h1>
          </div>
          <p className="text-sm text-slate-500">Local inference + cloud AI models. Local model runs offline, no API key needed.</p>
        </div>

        {/* Models grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {models.length === 0 && [
            { id: "local-qwen-1.5b", name: "DLavie Coder 1.5B", description: "Qwen2.5-Coder, runs locally offline", plan: "free", available: true, contextWindow: 2048 },
          ].map(renderModelCard)}
          {models.map(renderModelCard)}
        </div>

        {/* Test console */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">Model Test Console</span>
            </div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-xs bg-white/[0.05] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-violet-500/40 max-w-[200px]"
            >
              {models.length === 0 && <option value="local-qwen-1.5b">DLavie Coder 1.5B (Local)</option>}
              {models.filter((m: any) => m.available).map((m: any) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {response && (
            <div className="px-4 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-lg bg-violet-500/20 border border-violet-500/20 flex items-center justify-center">
                  <Zap className="w-2.5 h-2.5 text-violet-400" />
                </div>
                <span className="text-[10px] text-violet-400 font-semibold">Response</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">{response}</p>
            </div>
          )}

          <div className="flex gap-2 items-end p-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); testModel(); }}}
              placeholder="Test a model — ask anything…"
              className="min-h-[40px] max-h-24 border-0 bg-transparent resize-none text-sm text-slate-300 placeholder:text-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
              rows={1}
            />
            <Button
              onClick={testModel}
              disabled={!input.trim() || loading}
              size="icon"
              className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 hover:opacity-90 border-0 flex-shrink-0"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  function renderModelCard(model: any) {
    const info = MODEL_INFO[model.id as keyof typeof MODEL_INFO] ?? MODEL_INFO["local-qwen-1.5b"];
    const Icon = info.icon;
    const userLevel = PLAN_ORDER[plan as keyof typeof PLAN_ORDER] ?? 0;
    const modelLevel = PLAN_ORDER[model.plan as keyof typeof PLAN_ORDER] ?? 0;
    const isDev = isDeveloperPlan(plan);
    const locked = !isDev && userLevel < modelLevel;
    const isSelected = selectedModel === model.id;

    return (
      <button
        key={model.id}
        onClick={() => !locked && model.available && setSelectedModel(model.id)}
        className={cn(
          "text-left p-4 rounded-xl border transition-all duration-200 w-full",
          locked ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01] cursor-pointer",
          isSelected ? "border-violet-500/40 bg-violet-500/[0.06]" : "border-white/[0.07] bg-white/[0.02]"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0", info.gradient, info.glow)}>
            <Icon className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white">{model.name}</p>
              {locked && <Lock className="w-3 h-3 text-slate-600" />}
              {isDev && !locked && <Star className="w-3 h-3 text-emerald-400" />}
              {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
              {!model.available && !locked && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">No API key</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{model.description}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] text-slate-600">{info.provider}</span>
              <span className="text-[9px] text-slate-700">·</span>
              <span className="text-[9px] text-slate-600">{(model.contextWindow / 1000).toFixed(0)}K ctx</span>
              <span className="text-[9px] text-slate-700">·</span>
              <span className={cn("text-[9px] font-semibold capitalize", PLAN_DISPLAY[model.plan]?.color ?? "text-slate-500")}>
                {model.plan}+
              </span>
              {isDev && (
                <span className="text-[8px] text-emerald-400 font-bold tracking-wider uppercase">Dev</span>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  }
}
