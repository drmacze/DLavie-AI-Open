import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { Settings, Cpu, Brain, Github, Database, Zap, Check, AlertCircle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

export default function SettingsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: aiStatus } = useQuery<{ ready: boolean; loading: boolean; error: string | null }>({
    queryKey: ["ai-status"],
    queryFn: async () => {
      const r = await fetch(`${API}/ai/status`);
      return r.json();
    },
    refetchInterval: 5000,
  });

  const { data: githubStatus } = useQuery<{ connected: boolean; user?: any }>({
    queryKey: ["github-status"],
    queryFn: async () => {
      const r = await fetch(`${API}/github/status`);
      if (!r.ok) return { connected: false };
      return r.json();
    },
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".settings-section", { opacity: 0, y: 20, duration: 0.4, stagger: 0.07 });
    }, containerRef.current);
    return () => ctx.revert();
  }, []);

  const STATUS = [
    {
      label: "DLavie Coder 1.5B",
      desc: "Qwen2.5-Coder-1.5B-Instruct · Q4_K_M · Local CPU inference",
      icon: Brain,
      color: "text-violet-400",
      ok: aiStatus?.ready,
      loading: aiStatus?.loading,
      error: aiStatus?.error,
    },
    {
      label: "GitHub Integration",
      desc: githubStatus?.connected ? `Connected as @${githubStatus.user?.login}` : "GITHUB_PERSONAL_ACCESS_TOKEN not set",
      icon: Github,
      color: "text-slate-300",
      ok: githubStatus?.connected,
      loading: false,
      error: null,
    },
    {
      label: "PostgreSQL Database",
      desc: "Local PostgreSQL with pgvector 0.8.0",
      icon: Database,
      color: "text-blue-400",
      ok: true,
      loading: false,
      error: null,
    },
  ];

  return (
    <div className="h-full overflow-y-auto" ref={containerRef}>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div className="settings-section">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-slate-400" />
            <h1 className="text-2xl font-black text-white">Settings</h1>
          </div>
          <p className="text-slate-500 text-sm">System status and configuration for DLavie OS.</p>
        </div>

        <div className="settings-section glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            System Status
          </h2>
          <div className="space-y-3">
            {STATUS.map(s => (
              <div key={s.label} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{s.label}</p>
                  <p className="text-[11px] text-slate-600 truncate">{s.desc}</p>
                  {s.error && <p className="text-[10px] text-red-400 mt-0.5">{s.error}</p>}
                </div>
                <Badge className={`text-[9px] shrink-0 ${
                  s.loading ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : s.ok ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {s.loading ? "Loading" : s.ok ? "Active" : "Offline"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400" />
            Privacy & Security
          </h2>
          <div className="space-y-3">
            {[
              { label: "Zero telemetry", desc: "No data is sent to any external server" },
              { label: "Local AI inference", desc: "All AI runs on your machine. No cloud API calls." },
              { label: "Open source", desc: "DLavie OS is fully open source. Inspect the code." },
              { label: "Encrypted secrets", desc: "API tokens stored as environment secrets, never in code" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/[0.03] border border-emerald-500/[0.08]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-300">{item.label}</p>
                  <p className="text-[11px] text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            DLavie AI Roadmap
          </h2>
          <div className="space-y-2">
            {[
              { version: "v2.0", label: "DLavie Coder 1.5B", status: "live", desc: "Qwen2.5-Coder — coding assistant" },
              { version: "v2.1", label: "DLavie Nexus 7B", status: "planned", desc: "Qwen3-7B — general intelligence" },
              { version: "v2.2", label: "DLavie Sage R1", status: "planned", desc: "DeepSeek-R1 distill — deep reasoning" },
              { version: "v3.0", label: "DLavie Odyssey", status: "roadmap", desc: "Multimodal + full agent capabilities" },
              { version: "v3.1", label: "DLavie Voice", status: "roadmap", desc: "Whisper STT + Kokoro TTS" },
            ].map(item => (
              <div key={item.version} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                <span className="text-[9px] code-font text-slate-700 w-8 shrink-0">{item.version}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-300">{item.label}</p>
                  <p className="text-[10px] text-slate-600">{item.desc}</p>
                </div>
                <Badge className={`text-[9px] ${
                  item.status === "live" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : item.status === "planned" ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                }`}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
