import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import {
  Plus, ArrowRight, Zap, Code2, Brain, BookOpen,
  FolderGit2, Clock, Cpu, Sparkles, Activity, Github,
  Layers, Shield, Infinity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

const LANG_COLORS: Record<string, string> = {
  TypeScript: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  JavaScript: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  Python: "text-green-400 bg-green-500/10 border-green-500/20",
  Rust: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Go: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  default: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

const MODELS = [
  { name: "DLavie Nexus", sub: "General Intelligence", gradient: "from-violet-500 to-indigo-600", active: true, desc: "Your all-purpose AI brain. Writes, explains, plans, and reasons across any domain." },
  { name: "DLavie Coder", sub: "Code Specialist", gradient: "from-blue-500 to-cyan-600", active: true, desc: "Optimised for code generation, debugging, refactoring, and code review tasks." },
  { name: "DLavie Sage", sub: "Deep Reasoning", gradient: "from-pink-500 to-rose-600", active: false, desc: "Slow thinking, high accuracy. Best for maths, logic, and complex problem solving." },
  { name: "DLavie Odyssey", sub: "Multimodal Agent", gradient: "from-amber-500 to-orange-600", active: false, desc: "Sees, reads, and acts. Image understanding + autonomous multi-step agent." },
];

export default function Dashboard() {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { data: projects } = useQuery<any[]>({
    queryKey: ["recent-projects"],
    queryFn: async () => {
      const r = await fetch(`${API}/projects/recent`);
      if (!r.ok) return [];
      return r.json();
    },
  });

  const { data: aiStatus } = useQuery<{ ready: boolean; loading: boolean }>({
    queryKey: ["ai-status"],
    queryFn: async () => {
      const r = await fetch(`${API}/ai/status`);
      return r.json();
    },
    refetchInterval: 8000,
  });

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-badge", { opacity: 0, y: -16, duration: 0.5, ease: "back.out(2)" });
      gsap.from(".hero-title", { opacity: 0, y: 32, duration: 0.7, delay: 0.1, ease: "power3.out" });
      gsap.from(".hero-sub", { opacity: 0, y: 20, duration: 0.6, delay: 0.25, ease: "power2.out" });
      gsap.from(".hero-btns", { opacity: 0, y: 16, duration: 0.5, delay: 0.4, ease: "power2.out" });
      gsap.from(".stat-card", { opacity: 0, y: 24, duration: 0.45, stagger: 0.07, delay: 0.5, ease: "power2.out" });
    }, heroRef.current);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!cardsRef.current || !projects?.length) return;
    const ctx = gsap.context(() => {
      gsap.from(".project-card", { opacity: 0, y: 20, duration: 0.45, stagger: 0.06, ease: "power2.out" });
      gsap.from(".model-card", { opacity: 0, x: -20, duration: 0.45, stagger: 0.05, delay: 0.1, ease: "power2.out" });
    }, cardsRef.current);
    return () => ctx.revert();
  }, [projects]);

  const aiReady = aiStatus?.ready;
  const aiLoading = aiStatus?.loading;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-12">

        <div ref={heroRef}>
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span className="text-[11px] text-violet-300 font-semibold tracking-wide uppercase">
              DLavie OS — AI-Powered Development Platform
            </span>
          </div>

          <h1 className="hero-title text-5xl md:text-6xl font-black text-white leading-[1.05] mb-5">
            Code smarter with{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent glow-text">
              DLavie AI
            </span>
          </h1>
          <p className="hero-sub text-slate-400 text-lg max-w-xl mb-8 leading-relaxed">
            A fully open-source AI IDE. No API keys, no subscriptions, no cloud lock-in.
            Your data, your models, your infrastructure.
          </p>

          <div className="hero-btns flex flex-wrap gap-3">
            <Link href="/projects">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/30 border-0 h-10 px-6 font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
            <Link href="/models">
              <Button variant="outline" className="border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-slate-300 h-10 px-5">
                <Brain className="w-4 h-4 mr-2 text-violet-400" />
                AI Models
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
              </Button>
            </Link>
            <Link href="/knowledge">
              <Button variant="outline" className="border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-slate-300 h-10 px-5">
                <BookOpen className="w-4 h-4 mr-2 text-amber-400" />
                Knowledge Base
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
            {[
              {
                label: "AI Engine",
                value: aiLoading ? "Loading…" : aiReady ? "Online" : "Offline",
                icon: Cpu,
                color: aiReady ? "text-emerald-400" : aiLoading ? "text-amber-400" : "text-red-400",
                dot: aiReady ? "bg-emerald-400" : "bg-amber-400"
              },
              { label: "Open Source", value: "100%", icon: Shield, color: "text-violet-400", dot: null },
              { label: "API Keys", value: "Zero", icon: Infinity, color: "text-pink-400", dot: null },
              { label: "Projects", value: String(projects?.length ?? 0), icon: Layers, color: "text-blue-400", dot: null },
            ].map((s) => (
              <div key={s.label} className="stat-card glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {s.dot && <div className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />}
                  <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span>
                </div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div ref={cardsRef}>
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                DLavie AI Model Family
              </h2>
              <Link href="/models" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                Configure <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MODELS.map((m) => (
                <div key={m.name} className="model-card glass-card rounded-xl p-4 model-card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-md`}>
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <Badge className={`text-[9px] px-1.5 py-0 ${m.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700/50 text-slate-500 border-slate-600/30"}`}>
                      {m.active ? "Live" : "Soon"}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-white mb-0.5">{m.name}</p>
                  <p className="text-[10px] text-violet-400 mb-2">{m.sub}</p>
                  <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-2">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                Recent Projects
              </h2>
              <Link href="/projects" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                All projects <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {!projects?.length ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <Code2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">No projects yet. Start building!</p>
                <Link href="/projects">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 border-0">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projects.slice(0, 6).map((p: any) => (
                  <Link key={p.id} href={`/editor/${p.id}`} className="project-card glass-card rounded-xl p-4 block group hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200 model-card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/15 to-indigo-500/15 border border-white/[0.06] flex items-center justify-center">
                        <Code2 className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      {p.language && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${LANG_COLORS[p.language] ?? LANG_COLORS.default}`}>
                          {p.language}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-white text-sm mb-1 group-hover:text-violet-200 transition-colors truncate">{p.name}</p>
                    {p.description && (
                      <p className="text-[11px] text-slate-600 line-clamp-1 mb-2">{p.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-slate-700">
                      <Clock className="w-2.5 h-2.5" />
                      {p.lastAccessedAt ? new Date(p.lastAccessedAt).toLocaleDateString() : "Never"}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-violet-400" />
              Quick Access
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Knowledge Base", desc: "Train AI on your docs", icon: BookOpen, href: "/knowledge", gradient: "from-amber-500/15 to-orange-500/10" },
                { label: "GitHub", desc: "Browse & clone repos", icon: Github, href: "/github", gradient: "from-slate-500/15 to-slate-400/10" },
                { label: "AI Models", desc: "Manage model family", icon: Brain, href: "/models", gradient: "from-violet-500/15 to-indigo-500/10" },
                { label: "New Project", desc: "Start coding now", icon: FolderGit2, href: "/projects", gradient: "from-blue-500/15 to-cyan-500/10" },
              ].map((q) => (
                <Link key={q.href} href={q.href} className={`glass-card rounded-xl p-4 block group hover:border-white/10 transition-all model-card-hover bg-gradient-to-br ${q.gradient}`}>
                  <q.icon className="w-5 h-5 text-violet-300 mb-2.5" />
                  <p className="text-sm font-semibold text-white mb-0.5">{q.label}</p>
                  <p className="text-[11px] text-slate-600">{q.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
