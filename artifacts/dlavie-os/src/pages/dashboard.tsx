import { useListRecentProjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Folder, Plus, Activity, Code2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: recentProjects, isLoading } = useListRecentProjects();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-14 border-b flex items-center px-6 gap-4 shrink-0 bg-card">
        <Code2 className="w-5 h-5 text-primary" />
        <span className="font-bold font-mono tracking-tight">DLavie OS</span>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/projects" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            All Projects
          </Link>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-lg">
            Pick up where you left off or start something new in your intelligent workspace.
          </p>
          
          <div className="flex gap-4 pt-4">
            <Link href="/projects">
              <Button size="lg" className="font-mono">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </section>

        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Recent Projects</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-24 bg-muted/50 rounded-t-xl" />
                  <CardContent className="h-16" />
                </Card>
              ))}
            </div>
          ) : recentProjects && recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map(project => (
                <Card key={project.id} className="group hover:border-primary/50 transition-all cursor-pointer">
                  <Link href={`/editor/${project.id}`}>
                    <CardHeader className="pb-3 border-b bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <CardTitle className="text-base font-mono">{project.name}</CardTitle>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <CardDescription className="line-clamp-2 min-h-[40px]">
                        {project.description || "No description provided."}
                      </CardDescription>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground font-mono">
                        <span>{project.language}</span>
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <Folder className="w-8 h-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium mb-1">No recent projects</p>
                <p className="text-sm text-muted-foreground/70 mb-4">You haven't worked on any projects yet.</p>
                <Link href="/projects">
                  <Button variant="outline" size="sm">Create your first project</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
