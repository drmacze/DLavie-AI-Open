// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, Cpu, Brain, Github, Database, Zap, Check, AlertCircle, Shield, Key, ExternalLink, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PLAN_DISPLAY, isDeveloperPlan } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [copied, setCopied] = useState("");

  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: async () => { const r = await fetch(`${API}/ai/status`); return r.json(); },
    refetchInterval: 5000,
  });

  const { data: healthStatus } = useQuery({
    queryKey: ["health"],
    queryFn: async () => { const r = await fetch(`${API}/healthz`); return r.json(); },
    refetchInterval: 10000,
  });

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const plan = profile?.plan ?? "free";
  const planDisplay = PLAN_DISPLAY[plan] ?? PLAN_DISPLAY.free;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
            <Settings className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-xs text-slate-500">System configuration & account</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Account */}
          {user && (
            <Section title="Account" icon={Shield}>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-violet-300">
                    {(profile?.full_name ?? user.email ?? "U").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{profile?.full_name ?? "User"}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className={cn("px-2.5 py-1 rounded-full border text-[10px] font-bold", planDisplay.badge)}>
                  {planDisplay.label}
                </div>
                {isDeveloperPlan(plan as any) && (
                  <span className="text-[8px] text-emerald-400 font-bold tracking-wider uppercase">Dev</span>
                )}
              </div>
            </Section>
          )}

          {/* AI Engine */}
          <Section title="AI Engine" icon={Brain}>
            <StatusRow
              label="Local Model (Qwen2.5-Coder 1.5B)"
              status={aiStatus?.ready ? "ready" : aiStatus?.loading ? "loading" : "error"}
              detail={aiStatus?.loading ? "Downloading/loading (~1 min first run)" : aiStatus?.error ?? "Runs offline, no API key needed"}
            />
            <StatusRow
              label="xAI Grok API"
              status={aiStatus?.models?.find((m: any) => m.id === "grok-3-mini")?.available ? "ready" : "warning"}
              detail={aiStatus?.models?.find((m: any) => m.id === "grok-3-mini")?.available ? "Connected" : "Set XAI_API_KEY to enable"}
            />
            <StatusRow
              label="Google Gemini API"
              status={aiStatus?.models?.find((m: any) => m.id === "gemini-2.0-flash")?.available ? "ready" : "warning"}
              detail={aiStatus?.models?.find((m: any) => m.id === "gemini-2.0-flash")?.available ? "Connected" : "Set GEMINI_API_KEY to enable"}
            />
          </Section>

          {/* Database */}
          <Section title="Database" icon={Database}>
            <StatusRow
              label="PostgreSQL (Replit DB)"
              status={healthStatus ? "ready" : "loading"}
              detail="Primary database via Drizzle ORM"
            />
            <StatusRow
              label="Supabase"
              status={import.meta.env.VITE_SUPABASE_URL ? "ready" : "warning"}
              detail={import.meta.env.VITE_SUPABASE_URL ? "Auth + usage logs" : "SUPABASE_URL not configured"}
            />
          </Section>

          {/* Required API Keys */}
          <Section title="API Keys (for cloud models)" icon={Key}>
            <div className="space-y-2">
              {[
                { key: "XAI_API_KEY", label: "xAI API Key", desc: "Enables Grok 3 Mini & Grok 3", url: "https://console.x.ai" },
                { key: "GEMINI_API_KEY", label: "Gemini API Key", desc: "Enables Gemini 2.0 Flash & 2.5 Pro", url: "https://aistudio.google.com/app/apikey" },
                { key: "MIDTRANS_SERVER_KEY", label: "Midtrans Server Key", desc: "Payment processing", url: "https://dashboard.midtrans.com" },
                { key: "MIDTRANS_CLIENT_KEY", label: "Midtrans Client Key", desc: "Frontend payment UI", url: "https://dashboard.midtrans.com" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-[9px] font-mono text-slate-500 bg-white/[0.04] px-2 py-1 rounded">{item.key}</code>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-2 px-1">Add keys in Replit Secrets → then restart the API Server workflow</p>
          </Section>

          {/* Deploy */}
          <Section title="Deployment" icon={Zap}>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-xs font-medium text-white mb-1">Supabase Schema</p>
                <p className="text-[10px] text-slate-500 mb-2">Run this SQL in your Supabase SQL Editor to set up auth tables</p>
                <div className="flex items-center gap-2">
                  <code className="text-[9px] text-slate-400 bg-black/30 px-2 py-1 rounded font-mono flex-1 truncate">scripts/supabase-schema.sql</code>
                  <button onClick={() => copyText("scripts/supabase-schema.sql", "sql")} className="text-violet-400 hover:text-violet-300 transition-colors">
                    {copied === "sql" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-xs font-medium text-white mb-1">Vercel Deploy</p>
                <p className="text-[10px] text-slate-500 mb-2">GitHub Actions auto-deploys on push to main. Setup script:</p>
                <code className="text-[9px] text-slate-400 bg-black/30 px-2 py-1 rounded font-mono block">bash scripts/setup-vercel.sh</code>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.05]">
        <Icon className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function StatusRow({ label, status, detail }: { label: string; status: "ready" | "loading" | "warning" | "error"; detail?: string }) {
  const colors = {
    ready:   { dot: "bg-emerald-400 shadow-sm shadow-emerald-400/50", text: "text-emerald-400", label: "Ready" },
    loading: { dot: "bg-amber-400 animate-pulse",                      text: "text-amber-400",   label: "Loading" },
    warning: { dot: "bg-slate-600",                                     text: "text-slate-500",   label: "Not configured" },
    error:   { dot: "bg-red-400",                                       text: "text-red-400",     label: "Error" },
  };
  const c = colors[status];

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", c.dot)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-300 font-medium">{label}</p>
        {detail && <p className="text-[10px] text-slate-600 truncate">{detail}</p>}
      </div>
      <span className={cn("text-[10px] font-medium", c.text)}>{c.label}</span>
    </div>
  );
}
