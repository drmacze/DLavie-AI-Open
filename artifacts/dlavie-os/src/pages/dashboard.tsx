// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  FolderOpen, Zap, Bot, BookOpen, ArrowRight,
  Code2, Sparkles, Activity, Crown, Cpu
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PLAN_DISPLAY } from "@/lib/supabase";
import { useListRecentProjects } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

const FEATURE_CARDS = [
  { icon: Code2, label: "Projects", href: "/projects", color: "from-violet-500/20 to-indigo-500/10", border: "border-violet-500/20", iconColor: "text-violet-400", desc: "Code with AI" },
  { icon: Bot, label: "Agent", href: "/agent", color: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/20", iconColor: "text-blue-400", desc: "Autonomous AI" },
  { icon: Sparkles, label: "AI Models", href: "/models", color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20", iconColor: "text-emerald-400", desc: "Local + cloud" },
  { icon: BookOpen, label: "Knowledge", href: "/knowledge", color: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20", iconColor: "text-amber-400", desc: "AI context" },
];

export default function Dashboard() {
  const { user, profile } = useAuth();
  const plan = profile?.plan ?? "free";
  const planDisplay = PLAN_DISPLAY[plan] ?? PLAN_DISPLAY.free;

  const { data: recentProjects } = useListRecentProjects();
  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: async () => { const r = await fetch(`${API}/ai/status`); return r.json(); },
    refetchInterval: 10000,
  });

  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "Developer";

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Good day,</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">{displayName}</h1>
            <p className="text-sm text-slate-500 mt-1">What are we building today?</p>
          </div>
          <Link href="/plans">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all hover:scale-105",
              plan === "free" ? "border-white/[0.08] bg-white/[0.03]" : planDisplay.badge
            )}>
              <Crown className={cn("w-3.5 h-3.5", planDisplay.color)} />
              <span className={cn("text-[11px] font-semibold", planDisplay.color)}>{planDisplay.label}</span>
              {plan === "free" && <ArrowRight className="w-3 h-3 text-slate-600" />}
            </div>
          </Link>
        </div>

        {/* AI Status */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-6">
          <div className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            aiStatus?.ready ? "bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse" : "bg-amber-400"
          )} />
          <p className="text-xs text-slate-400 flex-1">
            {aiStatus?.loading
              ? "Loading local model… (~1 min first run)"
              : aiStatus?.ready
              ? "DLavie Coder 1.5B ready · Local model active"
              : aiStatus?.error
              ? `Model error: ${aiStatus.error}`
              : "Connecting to AI engine…"}
          </p>
          <Link href="/models">
            <span className="text-[10px] text-violet-400 hover:text-violet-300 cursor-pointer transition-colors">
              {(aiStatus?.models ?? []).length} models →
            </span>
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <div className={cn(
                  "group p-4 rounded-xl border bg-gradient-to-br cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                  card.color, card.border
                )}>
                  <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center mb-3">
                    <Icon className={cn("w-4 h-4", card.iconColor)} />
                  </div>
                  <p className="text-sm font-semibold text-white mb-0.5">{card.label}</p>
                  <p className="text-[11px] text-slate-500">{card.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Recent Projects</h2>
            <Link href="/projects">
              <span className="text-xs text-slate-500 hover:text-violet-400 transition-colors cursor-pointer">View all →</span>
            </Link>
          </div>
          {recentProjects && recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentProjects.slice(0, 6).map((project) => (
                <Link key={project.id} href={`/editor/${project.id}`}>
                  <div className="group p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/15 flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{project.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.05] text-slate-500">{project.language}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-white/[0.05] bg-white/[0.01] text-center">
              <FolderOpen className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No projects yet</p>
              <Link href="/projects">
                <span className="text-xs text-violet-400 hover:text-violet-300 cursor-pointer mt-1 block">Create your first project →</span>
              </Link>
            </div>
          )}
        </div>

        {/* Usage */}
        {user && (
          <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-400">Usage Today</span>
              </div>
              <span className={cn("text-[10px] font-bold", planDisplay.color)}>{planDisplay.limit}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: "5%" }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-600">Active · {planDisplay.limit}</span>
              {plan === "free" && (
                <Link href="/plans">
                  <span className="text-[10px] text-violet-400 hover:text-violet-300 cursor-pointer">Upgrade →</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
