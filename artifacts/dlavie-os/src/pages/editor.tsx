import { useState, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Code2, ChevronLeft, Save, Cpu, Brain, GitBranch, Wifi
} from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FileTree from "@/components/editor/file-tree";
import AIChat from "@/components/editor/ai-chat";
import { CodeMirrorEditor } from "@/components/editor/CodeMirrorEditor";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

export default function Editor() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const fileId = params.fileId ? Number(params.fileId) : undefined;
  const [activeFileId, setActiveFileId] = useState<number | undefined>(fileId);
  const [editorContent, setEditorContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const r = await fetch(`${API}/projects/${projectId}`);
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
    enabled: !!projectId,
  });

  const { data: activeFile } = useQuery({
    queryKey: ["file", activeFileId],
    queryFn: async () => {
      const r = await fetch(`${API}/projects/${projectId}/files/${activeFileId}`);
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
    enabled: !!activeFileId,
    onSuccess: (f: any) => {
      setEditorContent(f.content ?? "");
      setIsDirty(false);
    },
  } as any);

  const saveFile = useMutation({
    mutationFn: async () => {
      if (!activeFileId) return;
      const r = await fetch(`${API}/projects/${projectId}/files/${activeFileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editorContent }),
      });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => {
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["file", activeFileId] });
      toast({ title: "Saved", description: "File saved successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save file.", variant: "destructive" });
    },
  });

  const handleChange = useCallback((val: string) => {
    setEditorContent(val);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(() => {
    if (isDirty) saveFile.mutate();
  }, [isDirty, saveFile]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  if (projectLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: "rgba(8,5,25,0.95)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-slate-500 code-font">Initializing workspace…</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4" style={{ background: "rgba(8,5,25,0.95)" }}>
        <p className="text-slate-400">Project not found.</p>
        <Link href="/projects">
          <Button variant="outline" size="sm" className="border-white/10">
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden"
      style={{ background: "rgba(6,4,20,0.97)" }}
      onKeyDown={handleKeyDown as any}
      tabIndex={-1}
    >
      <header className="h-11 flex items-center justify-between px-3 shrink-0 border-b border-white/[0.05]" style={{ background: "rgba(8,5,25,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </Link>
          <div className="w-px h-4 bg-white/[0.08]" />
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Code2 className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-tight">{project.name}</p>
            <p className="text-[9px] text-slate-600 leading-tight">{project.language}</p>
          </div>
          {activeFile && (
            <>
              <div className="w-px h-4 bg-white/[0.08] ml-1" />
              <span className="text-xs text-slate-400 code-font">{activeFile.name}</span>
              {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1" />}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveFile.isPending}
              className="h-7 px-3 text-xs bg-violet-600 hover:bg-violet-500 border-0"
            >
              <Save className="w-3 h-3 mr-1.5" />
              {saveFile.isPending ? "Saving…" : "Save"}
            </Button>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-500 code-font">DLavie Coder 1.5B</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={18} minSize={12} maxSize={28}>
            <div
              className="h-full flex flex-col border-r border-white/[0.05]"
              style={{ background: "rgba(8,5,25,0.85)" }}
            >
              <div className="h-7 flex items-center px-3 border-b border-white/[0.04]">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Explorer</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <FileTree
                  projectId={projectId}
                  activeFileId={activeFileId}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-white/[0.05] hover:bg-violet-500/30 transition-colors cursor-col-resize" />

          <ResizablePanel defaultSize={55}>
            <div className="h-full flex flex-col">
              {activeFileId ? (
                <CodeMirrorEditor
                  value={editorContent}
                  filename={activeFile?.name ?? "untitled"}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-30">
                  <Code2 className="w-16 h-16 text-slate-600" />
                  <p className="text-sm text-slate-500 code-font">Select a file to edit</p>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-white/[0.05] hover:bg-violet-500/30 transition-colors cursor-col-resize" />

          <ResizablePanel defaultSize={27} minSize={20} maxSize={40}>
            <div
              className="h-full flex flex-col border-l border-white/[0.05]"
              style={{ background: "rgba(8,5,25,0.9)" }}
            >
              <div className="h-7 flex items-center justify-between px-3 border-b border-white/[0.04] shrink-0">
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-violet-400" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">DLavie Assistant</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              </div>
              <AIChat projectId={projectId} currentFileId={activeFileId} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <footer
        className="h-5 flex items-center justify-between px-3 border-t border-white/[0.04] shrink-0"
        style={{ background: "rgba(6,4,18,0.95)" }}
      >
        <div className="flex items-center gap-3 text-[9px] code-font text-slate-700">
          <span className="flex items-center gap-1">
            <GitBranch className="w-2.5 h-2.5" />
            main
          </span>
          <span className="flex items-center gap-1">
            <Wifi className="w-2.5 h-2.5 text-emerald-600" />
            Connected
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px] code-font text-slate-700">
          <span>UTF-8</span>
          <span>Spaces: 2</span>
          <span className="text-violet-600">{project.language}</span>
        </div>
      </footer>
    </div>
  );
}
