import { useParams, Link } from "wouter";
import { useGetProject } from "@workspace/api-client-react";
import { Code2, Settings, TerminalSquare, Search } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import FileTree from "@/components/editor/file-tree";
import CodeEditor from "@/components/editor/code-editor";
import AIChat from "@/components/editor/ai-chat";

export default function Editor() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const fileId = params.fileId ? Number(params.fileId) : undefined;

  const { data: project, isLoading: isProjectLoading } = useGetProject(projectId, {
    query: { enabled: !!projectId }
  });

  if (isProjectLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Code2 className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-mono text-muted-foreground">Initializing environment...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Project not found or you don't have access.</p>
        <Link href="/projects" className="text-primary hover:underline font-mono text-sm">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="h-12 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="hover:opacity-80 transition-opacity">
            <Code2 className="w-4 h-4 text-primary" />
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold font-mono leading-tight">{project.name}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{project.language}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/50 rounded-md px-2 py-1 text-xs text-muted-foreground font-mono gap-2 mr-4 border">
            <Search className="w-3 h-3" />
            <span className="opacity-50">Cmd + K</span>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                <TerminalSquare className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Terminal</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal">
          {/* File Explorer Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-sidebar border-r flex flex-col relative z-10">
            <div className="h-8 border-b flex items-center px-3 shrink-0 bg-sidebar/50 backdrop-blur-sm sticky top-0">
              <span className="text-xs font-semibold tracking-wider text-sidebar-foreground/70 uppercase">Explorer</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FileTree projectId={projectId} activeFileId={fileId} />
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors z-20" />

          {/* Code Editor */}
          <ResizablePanel defaultSize={55} className="flex flex-col relative z-0 bg-background">
            {fileId ? (
              <CodeEditor projectId={projectId} fileId={fileId} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50">
                <Code2 className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-mono text-sm">Select a file to start coding</p>
              </div>
            )}
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors z-20" />

          {/* AI Chat Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-card flex flex-col relative z-10 border-l">
            <div className="h-8 border-b flex items-center px-3 shrink-0 bg-card/50 backdrop-blur-sm sticky top-0">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                DLavie Assistant
              </span>
            </div>
            <AIChat projectId={projectId} currentFileId={fileId} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      
      {/* Bottom Status Bar */}
      <footer className="h-6 border-t bg-card shrink-0 flex items-center px-3 justify-between text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Connected
          </span>
          <span className="hover:text-foreground cursor-pointer transition-colors">main</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>Spaces: 2</span>
          <span>{project.language}</span>
        </div>
      </footer>
    </div>
  );
}
