import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useListProjects, useCreateProject, getListProjectsQueryKey, getListRecentProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Plus, Search, Code2, Clock, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import gsap from "gsap";

const LANG_COLORS: Record<string, string> = {
  typescript: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  javascript: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  python: "text-green-400 bg-green-400/10 border-green-400/20",
  rust: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  go: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  default: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const createProject = useCreateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListRecentProjectsQueryKey() });
        setIsCreateOpen(false);
        toast({ title: "Project created", description: "Your new workspace is ready." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create project.", variant: "destructive" });
      }
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".projects-header", { opacity: 0, y: -16, duration: 0.5, ease: "power2.out" });
      const cards = containerRef.current?.querySelectorAll(".project-card");
      if (cards && cards.length > 0) {
        gsap.from(cards, { opacity: 0, y: 20, duration: 0.4, stagger: 0.06, delay: 0.15, ease: "power2.out" });
      }
    }, containerRef.current);
    return () => ctx.revert();
  }, [projects]);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createProject.mutate({
      data: {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        language: formData.get("language") as string,
      }
    });
  };

  const filteredProjects = projects?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div ref={containerRef} className="h-full overflow-y-auto p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="projects-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-violet-400" />
              All Projects
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage your workspaces and applications.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <Input
                placeholder="Search projects..."
                className="pl-9 w-56 bg-white/[0.04] border-white/[0.06] text-slate-300 placeholder:text-slate-600 focus-visible:ring-violet-500/30 focus-visible:border-violet-500/40 text-sm h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 h-9 px-4 text-sm font-semibold shadow-lg shadow-violet-500/25">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[440px] bg-[#0e0b28] border-white/[0.08] text-white">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    Create New Project
                  </DialogTitle>
                  <DialogDescription className="text-slate-500">
                    Set up a new AI-powered workspace.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-slate-300 text-xs font-medium">Project Name</Label>
                    <Input
                      id="name" name="name" required
                      placeholder="my-awesome-app"
                      className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 focus-visible:ring-violet-500/30 focus-visible:border-violet-500/40 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-slate-300 text-xs font-medium">Description <span className="text-slate-600">(optional)</span></Label>
                    <Textarea
                      id="description" name="description"
                      placeholder="A brief description of your project."
                      className="resize-none bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 focus-visible:ring-violet-500/30 focus-visible:border-violet-500/40 text-sm"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="language" className="text-slate-300 text-xs font-medium">Primary Language</Label>
                    <Select name="language" defaultValue="typescript">
                      <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-slate-300 focus:ring-violet-500/30">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0e0b28] border-white/[0.08] text-white">
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="pt-2">
                    <Button
                      variant="outline" type="button"
                      onClick={() => setIsCreateOpen(false)}
                      className="border-white/[0.08] text-slate-400 hover:bg-white/[0.04]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProject.isPending}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0"
                    >
                      {createProject.isPending ? "Creating…" : "Create Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-white/[0.04] rounded mb-3 w-2/3" />
                <div className="h-3 bg-white/[0.03] rounded mb-2 w-full" />
                <div className="h-3 bg-white/[0.03] rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(project => (
              <Link
                key={project.id}
                href={`/editor/${project.id}`}
                className="project-card glass-card rounded-xl p-5 block group hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/15 to-indigo-500/15 border border-white/[0.06] flex items-center justify-center group-hover:border-violet-500/20 transition-colors">
                    <Code2 className="w-4 h-4 text-violet-400" />
                  </div>
                  {project.language && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${LANG_COLORS[project.language] ?? LANG_COLORS.default}`}>
                      {project.language}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-white text-sm mb-1.5 group-hover:text-violet-200 transition-colors truncate">
                  {project.name}
                </p>
                {project.description && (
                  <p className="text-[12px] text-slate-600 line-clamp-2 mb-3 leading-relaxed">{project.description}</p>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-700 mt-auto pt-2 border-t border-white/[0.04]">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-16 text-center border-dashed">
            <FolderOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-400 mb-1">
              {search ? "No matching projects" : "No projects yet"}
            </h3>
            <p className="text-slate-600 text-sm max-w-xs mx-auto mb-6">
              {search ? "Try a different search term." : "Create your first AI-powered workspace to get started."}
            </p>
            {!search && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
