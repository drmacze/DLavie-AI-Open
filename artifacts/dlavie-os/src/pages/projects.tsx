import { useState } from "react";
import { Link } from "wouter";
import { useListProjects, useCreateProject, getListProjectsQueryKey, getListRecentProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Folder, Plus, Search, Code2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-14 border-b flex items-center px-6 gap-4 shrink-0 bg-card">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="font-bold font-mono tracking-tight">DLavie OS</span>
        </Link>
        <div className="h-4 w-px bg-border mx-2" />
        <span className="text-sm font-medium text-muted-foreground">Projects</span>
      </header>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">All Projects</h1>
            <p className="text-sm text-muted-foreground">Manage your workspaces and applications.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9 font-mono text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="font-mono shrink-0">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Set up a new intelligent workspace.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" name="name" required placeholder="my-awesome-app" className="font-mono text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" name="description" placeholder="A brief description of your project." className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Primary Language</Label>
                    <Select name="language" defaultValue="typescript">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createProject.isPending}>
                      {createProject.isPending ? "Creating..." : "Create Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-muted/50 rounded-t-xl" />
                <CardContent className="h-16" />
              </Card>
            ))}
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredProjects.map(project => (
              <Card key={project.id} className="group hover:border-primary/50 transition-all flex flex-col h-full cursor-pointer relative overflow-hidden">
                <Link href={`/editor/${project.id}`} className="absolute inset-0 z-10" />
                <CardHeader className="pb-3 border-b bg-muted/10 shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                      <CardTitle className="text-base font-mono truncate">{project.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col flex-1">
                  <CardDescription className="line-clamp-2 text-sm flex-1">
                    {project.description || "No description provided."}
                  </CardDescription>
                  <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground font-mono shrink-0">
                    <span className="bg-secondary px-2 py-1 rounded-md">{project.language}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-card border-dashed">
            <Folder className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-1">No projects found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              {search ? "No projects match your search criteria." : "You haven't created any projects yet."}
            </p>
            {!search && (
              <Button onClick={() => setIsCreateOpen(true)} className="font-mono">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
