import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, Zap, ChevronRight, Terminal, Code2, Search, FileText, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type AgentStep = {
  step: number;
  thought: string;
  tool?: string;
  toolArgs?: Record<string, any>;
  toolResult?: string;
  response?: string;
};

type AgentResult = {
  steps: AgentStep[];
  finalResponse: string;
};

const TOOL_ICONS: Record<string, React.ElementType> = {
  read_file: FileText,
  list_files: FileText,
  analyze_code: Code2,
  web_search: Search,
  run_terminal: Terminal,
};

const QUICK_TASKS = [
  "Analyze my project structure and suggest improvements",
  "Find potential bugs in my code",
  "Write unit tests for the current file",
  "Refactor code for better performance",
  "Generate documentation for all functions",
  "Create a README for this project",
];

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("local-qwen-1.5b");
  const { session } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [result, loading]);

  const runAgent = async (message: string) => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
      const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
      const res = await fetch(`${BASE}/api/ai/agent`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message, modelId: selectedModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Agent failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const msg = input.trim();
    setInput("");
    runAgent(msg);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">DLavie Agent</h1>
            <p className="text-[10px] text-slate-500">Autonomous multi-step AI assistant</p>
          </div>
        </div>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-violet-500/40"
        >
          <option value="local-qwen-1.5b">DLavie Coder 1.5B (Local)</option>
          <option value="grok-3-mini">Grok 3 Mini</option>
          <option value="grok-3">Grok 3</option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
        </select>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {!result && !loading && !error && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Autonomous Agent Mode</h2>
              <p className="text-sm text-slate-500">Give me a complex task. I'll break it down, use tools, and deliver a complete solution.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_TASKS.map((task) => (
                <button
                  key={task}
                  onClick={() => { setInput(task); }}
                  className="text-left px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/20 text-xs text-slate-400 hover:text-slate-200 transition-all"
                >
                  <ChevronRight className="w-3 h-3 inline mr-1.5 text-violet-500" />
                  {task}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/20 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Agent thinking…</p>
                <p className="text-xs text-slate-500">Analyzing and planning steps</p>
              </div>
            </div>
            {[1,2,3].map((i) => (
              <div key={i} className="mb-3 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02] animate-pulse">
                <div className="h-2.5 bg-white/[0.06] rounded w-3/4 mb-2" />
                <div className="h-2 bg-white/[0.04] rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="max-w-2xl mx-auto space-y-3">
            {/* Steps */}
            {result.steps.map((step) => {
              const ToolIcon = step.tool ? (TOOL_ICONS[step.tool] ?? Terminal) : null;
              return (
                <div key={step.step} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-3 py-2 border-b border-white/[0.04]">
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] font-bold text-violet-400">{step.step}</span>
                    </div>
                    <p className="text-xs text-slate-400 flex-1 truncate">{step.thought}</p>
                    {step.tool && ToolIcon && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <ToolIcon className="w-3 h-3 text-blue-400" />
                        <span className="text-[9px] text-blue-400">{step.tool}</span>
                      </div>
                    )}
                  </div>
                  {step.toolResult && (
                    <div className="px-3 py-2">
                      <p className="text-[11px] text-slate-500 font-mono leading-relaxed">{step.toolResult}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Final response */}
            <div className="rounded-xl border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.05] to-transparent p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-semibold text-emerald-400">Agent Complete</p>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{result.finalResponse}</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/[0.05]">
        <div className="flex gap-2 items-end max-w-2xl mx-auto bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden focus-within:border-violet-500/30 transition-colors">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
            placeholder="Give the agent a complex task…"
            className="min-h-[44px] max-h-32 border-0 bg-transparent resize-none py-3 px-4 text-sm text-slate-300 placeholder:text-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
          />
          <div className="p-2">
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              size="icon"
              className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 shadow-lg shadow-violet-500/20"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
        <p className="text-center text-[9px] text-slate-700 mt-2">Shift+Enter for newline · Agent uses multi-step reasoning</p>
      </div>
    </div>
  );
}
