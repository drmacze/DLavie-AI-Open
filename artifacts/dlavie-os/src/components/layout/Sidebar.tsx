import { Link, useRoute, useLocation } from "wouter";
import {
  LayoutDashboard, FolderOpen, Brain, BookOpen,
  Github, Settings, Zap, Cpu, ChevronRight, User,
  Bot, CreditCard, LogOut, Crown, Sparkles, Terminal,
  Code2, Layers, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PLAN_DISPLAY, isDeveloperPlan } from "@/lib/supabase";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FolderOpen, label: "Projects", href: "/projects" },
  { icon: Brain, label: "AI Models", href: "/models" },
  { icon: Bot, label: "Agent", href: "/agent" },
  { icon: BookOpen, label: "Knowledge", href: "/knowledge" },
  { icon: Github, label: "GitHub", href: "/github" },
];

const bottomItems = [
  { icon: CreditCard, label: "Plans & Billing", href: "/plans" },
  { icon: Download, label: "Download App", href: "/download" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const { user, profile, signOut } = useAuth();
  const plan = profile?.plan ?? "free";
  const planDisplay = PLAN_DISPLAY[plan] ?? PLAN_DISPLAY.free;
  const isDev = isDeveloperPlan(plan);

  return (
    <aside className="flex flex-col h-full w-[220px] flex-shrink-0 border-r border-white/[0.06] bg-[#0a0e1a]/90 backdrop-blur-xl relative">
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-600/[0.06] to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-4 py-4 border-b border-white/[0.05]">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#0a0e1a] shadow-sm shadow-emerald-400/50" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-white leading-none tracking-tight">DLavie</p>
          <p className="text-[9px] text-violet-400/70 mt-0.5 font-semibold tracking-[0.15em] uppercase">OS v2.0</p>
        </div>
      </div>

      {/* Active model indicator */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-gradient-to-r from-violet-500/[0.08] to-indigo-500/[0.04] border border-violet-500/[0.12]">
          <Cpu className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-violet-300 font-medium truncate">DLavie Coder 1.5B</p>
            <p className="text-[8px] text-slate-600 truncate">Local · Offline</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 shadow-sm shadow-emerald-400/60" />
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[9px] font-semibold text-slate-700 uppercase tracking-[0.12em]">Workspace</p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 pb-2 space-y-0.5 overflow-y-auto scrollbar-none">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/[0.05]">
        <div className="px-4 pt-3 pb-1">
          <p className="text-[9px] font-semibold text-slate-700 uppercase tracking-[0.12em]">Account</p>
        </div>
        <div className="px-2 pb-2 space-y-0.5">
          {bottomItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        {/* User profile */}
        <div className="mx-3 mb-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-violet-300">
                  {(profile?.full_name ?? user.email ?? "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate leading-none">
                  {profile?.full_name ?? user.email?.split("@")[0] ?? "User"}
                </p>
                <span className={cn("text-[9px] font-semibold", planDisplay.color)}>
                  {planDisplay.label}
                </span>
                {isDev && (
                  <span className="text-[8px] text-emerald-400 ml-1 font-bold tracking-wider uppercase">Dev</span>
                )}
              </div>
              <button onClick={signOut} className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium">Sign in</p>
                  <p className="text-[9px] text-slate-600">to unlock all features</p>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, href }: {
  icon: React.ElementType; label: string; href: string;
}) {
  const [isActive] = useRoute(href === "/" ? href : `${href}*`);

  return (
    <Link href={href}>
      <div className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer relative",
        isActive
          ? "bg-gradient-to-r from-violet-500/[0.14] to-indigo-500/[0.06] text-white border border-violet-500/[0.15]"
          : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
      )}>
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-violet-400/70" />
        )}
        <Icon className={cn(
          "flex-shrink-0 w-4 h-4 transition-colors",
          isActive ? "text-violet-400" : "text-slate-600 group-hover:text-slate-400"
        )} />
        <span className="flex-1 truncate">{label}</span>
        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-400/50 flex-shrink-0" />}
      </div>
    </Link>
  );
}
