import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import gsap from "gsap";
import {
  Github, Star, GitFork, Search, Code2, Eye, RefreshCw,
  Loader2, Book, Lock, Globe, GitBranch, Calendar, ExternalLink, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-400",
  CSS: "bg-pink-500",
  HTML: "bg-orange-400",
  Java: "bg-red-500",
  "C++": "bg-blue-400",
  default: "bg-slate-500",
};

export default function GitHubPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [repoSearch, setRepoSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: status } = useQuery<{ connected: boolean; user?: any }>({
    queryKey: ["github-status"],
    queryFn: async () => {
      const r = await fetch(`${API}/github/status`);
      if (!r.ok) return { connected: false };
      return r.json();
    },
  });

  const { data: repos, isLoading, refetch } = useQuery<any[]>({
    queryKey: ["github-repos"],
    queryFn: async () => {
      const r = await fetch(`${API}/github/repos`);
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!status?.connected,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".page-title", { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" });
      const cards = containerRef.current?.querySelectorAll(".repo-card");
      if (cards && cards.length > 0) {
        gsap.from(cards, { opacity: 0, y: 20, duration: 0.4, stagger: 0.04, delay: 0.1, ease: "power2.out" });
      }
    }, containerRef.current);
    return () => ctx.revert();
  }, [repos]);

  const handleSearch = async () => {
    if (!repoSearch.trim()) return;
    setIsSearching(true);
    try {
      const r = await fetch(`${API}/github/search?q=${encodeURIComponent(repoSearch)}`);
      const data = await r.json();
      setSearchResults(Array.isArray(data.items) ? data.items : []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const filtered = repos?.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto" ref={containerRef}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="page-title flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Github className="w-5 h-5 text-slate-300" />
              <h1 className="text-2xl font-black text-white">GitHub</h1>
            </div>
            <p className="text-slate-500 text-sm">Browse your repositories, explore code, and import projects.</p>
          </div>
          {status?.connected && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
            </Button>
          )}
        </div>

        {!status?.connected ? (
          <div className="glass-card rounded-xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <Github className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">GitHub Not Connected</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-4 leading-relaxed">
              Add your <span className="text-violet-400 code-font">GITHUB_PERSONAL_ACCESS_TOKEN</span> environment variable to connect your GitHub account.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              Set GITHUB_PERSONAL_ACCESS_TOKEN in your environment secrets
            </div>
          </div>
        ) : (
          <>
            {status.user && (
              <div className="glass-card rounded-xl p-4 mb-6 flex items-center gap-4">
                <img src={status.user.avatar_url} alt="" className="w-12 h-12 rounded-full border-2 border-violet-500/30" />
                <div>
                  <p className="font-semibold text-white">{status.user.name ?? status.user.login}</p>
                  <p className="text-xs text-slate-500">@{status.user.login} · {status.user.public_repos} public repos</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-emerald-400">Connected</span>
                </div>
              </div>
            )}

            <div className="glass-card rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-violet-400" />
                Search GitHub
              </h3>
              <div className="flex gap-2">
                <Input
                  value={repoSearch}
                  onChange={e => setRepoSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Search public repositories…"
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600"
                />
                <Button onClick={handleSearch} disabled={isSearching} className="bg-violet-600 hover:bg-violet-500 border-0 shrink-0">
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">{searchResults.length} results</p>
                  {searchResults.map(r => (
                    <a
                      key={r.id}
                      href={r.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all group"
                    >
                      <Book className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-violet-400 group-hover:text-violet-300 truncate">{r.full_name}</p>
                        {r.description && <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{r.description}</p>}
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-700">
                          <span className="flex items-center gap-1"><Star className="w-2.5 h-2.5" />{r.stargazers_count?.toLocaleString()}</span>
                          {r.language && <span>{r.language}</span>}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 shrink-0 mt-0.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter your repos…" className="pl-9 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-slate-600 text-sm" />
              </div>
              <span className="text-xs text-slate-600">{filtered?.length ?? 0} repos</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered?.map((repo: any) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-card glass-card rounded-xl p-4 group hover:border-white/10 transition-all model-card-hover block"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {repo.private ? <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Globe className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                        <p className="text-sm font-semibold text-violet-400 group-hover:text-violet-300 truncate">{repo.name}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 shrink-0 ml-2" />
                    </div>
                    {repo.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-slate-700">
                      {repo.language && (
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${LANG_COLORS[repo.language] ?? LANG_COLORS.default}`} />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Star className="w-2.5 h-2.5" />{repo.stargazers_count}</span>
                      <span className="flex items-center gap-1"><GitFork className="w-2.5 h-2.5" />{repo.forks_count}</span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
