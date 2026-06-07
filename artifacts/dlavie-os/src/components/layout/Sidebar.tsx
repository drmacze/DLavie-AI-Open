import { Link, useRoute } from "wouter";
import {
  LayoutDashboard, FolderOpen, Brain, BookOpen,
  Github, Settings, Zap, Cpu, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FolderOpen, label: "Projects", href: "/projects" },
  { icon: Brain, label: "DLavie AI", href: "/models" },
  { icon: BookOpen, label: "Knowledge", href: "/knowledge" },
  { icon: Github, label: "GitHub", href: "/github" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="flex flex-col h-full w-52 flex-shrink-0 border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]">
        <div className="relative flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#090618]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-none">DLavie</p>
          <p className="text-[9px] text-violet-400 mt-0.5 font-semibold tracking-widest uppercase">OS v2.0</p>
        </div>
      </div>

      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-violet-500/8 border border-violet-500/15">
          <Cpu className="w-3 h-3 text-violet-400 flex-shrink-0" />
          <span className="text-[10px] text-violet-300 font-medium truncate">DLavie Coder 1.5B</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        </div>
      </div>

      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="px-2 py-2 border-t border-white/[0.06] space-y-0.5">
        {bottomItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
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
      <div
        className={cn(
          "group flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
          isActive
            ? "bg-violet-500/15 text-violet-300"
            : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
        )}
      >
        <Icon className={cn("flex-shrink-0 w-4 h-4", isActive ? "text-violet-400" : "text-slate-600 group-hover:text-slate-400")} />
        <span className="flex-1 truncate">{label}</span>
        {isActive && <ChevronRight className="w-3 h-3 text-violet-500/60 flex-shrink-0" />}
      </div>
    </Link>
  );
}
