import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import {
  Zap, Brain, Code2, Cpu, Sparkles, Check, Clock,
  MessageSquare, Loader2, Send, ChevronDown, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

const MODELS = [
  {
    id: "coder",
    name: "DLavie Coder",
    version: "1.5B",
    tagline: "Code Specialist",
    description: "Specialised for code generation, debugging, refactoring, and technical explanations across 50+ programming languages.",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    glow: "shadow-blue-500/20",
    baseModel: "Qwen2.5-Coder-1.5B-Instruct",
    quantisation: "Q4_K_M",
    contextWindow: "2K tokens",
    capabilities: ["Code Generation", "Debugging", "Refactoring", "Code Review", "Multi-language"],
    status: "live",
    sizeGb: "~941 MB",
  },
  {
    id: "nexus",
    name: "DLavie Nexus",
    version: "7B",
    tagline: "General Intelligence",
    description: "Your all-purpose brain. Writes, plans, explains, summarises, and reasons across any domain with depth and nuance.",
    gradient: "from-violet-500 via-purple-500 to-indigo-500",
    glow: "shadow-violet-500/20",
    baseModel: "Qwen3-7B",
    quantisation: "Q4_K_M",
    contextWindow: "8K tokens",
    capabilities: ["Writing", "Analysis", "Planning", "Summarisation", "Q&A"],
    status: "coming",
    sizeGb: "~4.5 GB",
  },
  {
    id: "sage",
    name: "DLavie Sage",
    version: "R1",
    tagline: "Deep Reasoning",
    description: "Think before you answer. Extended chain-of-thought reasoning for maths, logic, complex problems, and scientific analysis.",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    glow: "shadow-pink-500/20",
    baseModel: "DeepSeek-R1-Distill-Qwen-7B",
    quantisation: "Q4_K_M",
    contextWindow: "4K tokens",
    capabilities: ["Mathematics", "Logic", "Science", "Problem Solving", "Chain-of-Thought"],
    status: "coming",
    sizeGb: "~4.7 GB",
  },
  {
    id: "odyssey",
    name: "DLavie Odyssey",
    version: "M",
    tagline: "Multimodal Agent",
    description: "Sees images, reads documents, browses files, and executes multi-step tasks autonomously as a full coding agent.",
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    glow: "shadow-amber-500/20",
    baseModel: "Qwen2.5-VL-7B / MiniMax-M3",
    quantisation: "Q4_K_M",
    contextWindow: "32K tokens",
    capabilities: ["Vision", "Agentic", "File Reading", "Autonomous Tasks", "Multimodal"],
    status: "roadmap",
    sizeGb: "~5.2 GB",
  },
];

const STATUS_STYLES: Record<string, string> = {
  live: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  coming: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  roadmap: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  live: "Live",
  coming: "Coming Soon",
  roadmap: "Roadmap",
};

export default function ModelsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeModel, setActiveModel] = useState("coder");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: aiStatus } = useQuery<{ ready: boolean; loading: boolean; error: string | null }>({
    queryKey: ["ai-status"],
    queryFn: async () => {
      const r = await fetch(`${API}/ai/status`);
      return r.json();
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".page-title", { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" });
      gsap.from(".model-card-anim", { opacity: 0, y: 30, duration: 0.5, stagger: 0.08, delay: 0.1, ease: "power2.out" });
    }, containerRef.current);
    return () => ctx.revert();
  }, []);

  const sendMessage = async () => {
    if (!chatInput.trim() || isSending || !aiStatus?.ready) return;
    const msg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(newMessages);
    setIsSending(true);
    try {
      const r = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: 0, message: msg, model: activeModel }),
      });
      const data = await r.json();
      setChatMessages([...newMessages, { role: "assistant", content: data.content ?? data.error ?? "Error" }]);
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "Error connecting to AI." }]);
    } finally {
      setIsSending(false);
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 50);
    }
  };

  const active = MODELS.find(m => m.id === activeModel)!;

  return (
    <div className="h-full overflow-y-auto" ref={containerRef}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="page-title mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <h1 className="text-2xl font-black text-white">DLavie AI Models</h1>
          </div>
          <p className="text-slate-500 text-sm">
            A family of open-source models powering your IDE. Zero API keys. 100% local inference.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModel(m.id)}
              className={`model-card-anim text-left glass-card rounded-xl p-4 transition-all duration-200 model-card-hover ${
                activeModel === m.id ? "border-violet-500/30 shadow-lg shadow-violet-500/10" : "hover:border-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-lg ${m.glow}`}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <Badge className={`text-[9px] ${STATUS_STYLES[m.status]}`}>
                  {STATUS_LABELS[m.status]}
                </Badge>
              </div>
              <p className="text-sm font-bold text-white">{m.name} <span className="text-violet-400">{m.version}</span></p>
              <p className="text-[10px] text-slate-500 mt-0.5 mb-3">{m.tagline}</p>
              {activeModel === m.id && (
                <div className="flex items-center gap-1 text-[10px] text-violet-400">
                  <Check className="w-3 h-3" /> Selected
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${active.gradient} flex items-center justify-center shadow-xl ${active.glow}`}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{active.name} {active.version}</h2>
                <p className="text-xs text-slate-500">{active.tagline}</p>
              </div>
              <Badge className={`ml-auto text-[10px] ${STATUS_STYLES[active.status]}`}>
                {STATUS_LABELS[active.status]}
              </Badge>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed mb-5">{active.description}</p>

            <div className="space-y-3 mb-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {active.capabilities.map(cap => (
                  <span key={cap} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-300">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Base Model", value: active.baseModel, icon: Cpu },
                { label: "Quantisation", value: active.quantisation, icon: Sparkles },
                { label: "Context Window", value: active.contextWindow, icon: MessageSquare },
                { label: "Model Size", value: active.sizeGb, icon: Info },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-violet-400" />
                    <span className="text-[9px] text-slate-600 uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-300 code-font">{value}</p>
                </div>
              ))}
            </div>

            {active.status === "live" && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">
                  {aiStatus?.loading ? "Loading model into memory…" : aiStatus?.ready ? "Model loaded and ready" : "Model offline"}
                </span>
              </div>
            )}
          </div>

          <div className="glass-card rounded-xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-slate-400">Try {active.name}</span>
              </div>
              {active.status !== "live" && (
                <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                  <Clock className="w-2.5 h-2.5 mr-1" /> Coming Soon
                </Badge>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[320px]">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8">
                  <Sparkles className="w-8 h-8 text-violet-400 mb-3" />
                  <p className="text-sm text-slate-400">Ask {active.name} anything</p>
                  <p className="text-xs text-slate-600 mt-1">Powered by {active.baseModel}</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap code-font ${
                    msg.role === "user"
                      ? "bg-violet-600/20 border border-violet-500/25 text-violet-100"
                      : "bg-white/[0.04] border border-white/[0.06] text-slate-300"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.04] border border-white/[0.06] px-3 py-2 rounded-xl">
                    <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/[0.05] shrink-0">
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={active.status === "live" ? `Message ${active.name}…` : `${active.name} coming soon`}
                  disabled={active.status !== "live" || !aiStatus?.ready}
                  className="min-h-[36px] max-h-24 text-xs resize-none border-white/[0.08] bg-white/[0.03] focus-visible:ring-violet-500/30 placeholder:text-slate-600 code-font"
                  rows={1}
                />
                <Button
                  size="sm"
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || isSending || active.status !== "live" || !aiStatus?.ready}
                  className="self-end h-9 px-3 bg-violet-600 hover:bg-violet-500 border-0 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-[9px] text-slate-700 mt-1.5">
                {aiStatus?.loading ? "Loading model…" : aiStatus?.ready ? "Model ready · Shift+Enter for newline" : "Model offline"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
