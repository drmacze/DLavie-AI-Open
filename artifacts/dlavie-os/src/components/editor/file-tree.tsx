import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListFiles, useCreateFile, getListFilesQueryKey, useDeleteFile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { FileCode, FileText, Folder, FolderOpen, Plus, MoreVertical, Trash2, FileJson, FileType2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface FileTreeProps {
  projectId: number;
  activeFileId?: number;
}

// Helper to build tree structure
interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  fileId?: number;
  children?: Record<string, TreeNode>;
}

function buildTree(files: any[]): TreeNode {
  const root: TreeNode = { name: "root", path: "", type: "folder", children: {} };

  files.forEach(file => {
    const parts = file.path.split("/").filter(Boolean);
    let current = root;

    parts.forEach((part: string, i: number) => {
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      if (!current.children) current.children = {};

      if (!current.children[part]) {
        if (isLast) {
          current.children[part] = {
            name: part,
            path: currentPath,
            type: "file",
            fileId: file.id
          };
        } else {
          current.children[part] = {
            name: part,
            path: currentPath,
            type: "folder",
            children: {}
          };
        }
      }
      current = current.children[part];
    });
  });

  return root;
}

const getFileIcon = (filename: string) => {
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return <FileCode className="w-3.5 h-3.5 text-yellow-400" />;
  if (filename.endsWith('.json')) return <FileJson className="w-3.5 h-3.5 text-green-400" />;
  if (filename.endsWith('.css') || filename.endsWith('.scss')) return <FileType2 className="w-3.5 h-3.5 text-pink-400" />;
  return <FileText className="w-3.5 h-3.5 text-muted-foreground" />;
};

function TreeItem({ 
  node, 
  depth = 0, 
  projectId, 
  activeFileId,
  onDelete
}: { 
  node: TreeNode; 
  depth?: number; 
  projectId: number; 
  activeFileId?: number;
  onDelete: (id: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === "folder";
  const isActive = node.fileId === activeFileId;

  if (node.name === "root") {
    return (
      <div className="w-full">
        {Object.values(node.children || {}).sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === "folder" ? -1 : 1;
        }).map(child => (
          <TreeItem 
            key={child.path} 
            node={child} 
            depth={0} 
            projectId={projectId} 
            activeFileId={activeFileId}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        className={`flex items-center group w-full text-sm py-1 px-2 cursor-pointer select-none transition-colors
          ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-sidebar-foreground/80 hover:text-sidebar-foreground'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => isFolder && setIsOpen(!isOpen)}
      >
        {isFolder ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isOpen ? <FolderOpen className="w-3.5 h-3.5 shrink-0 text-muted-foreground" /> : <Folder className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
            <span className="truncate font-mono text-xs">{node.name}</span>
          </div>
        ) : (
          <Link href={`/editor/${projectId}/files/${node.fileId}`} className="flex items-center gap-1.5 flex-1 min-w-0">
            {getFileIcon(node.name)}
            <span className="truncate font-mono text-xs">{node.name}</span>
          </Link>
        )}

        {!isFolder && node.fileId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded text-muted-foreground shrink-0 ml-2">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive focus:bg-destructive/10 text-xs font-mono"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.fileId!);
                }}
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isFolder && isOpen && node.children && (
        <div>
          {Object.values(node.children).sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === "folder" ? -1 : 1;
          }).map(child => (
            <TreeItem 
              key={child.path} 
              node={child} 
              depth={depth + 1} 
              projectId={projectId} 
              activeFileId={activeFileId}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ projectId, activeFileId }: FileTreeProps) {
  const { data: files, isLoading } = useListFiles(projectId, {
    query: { enabled: !!projectId }
  });
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFile = useCreateFile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFilesQueryKey(projectId) });
        setIsNewFileOpen(false);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create file.", variant: "destructive" });
      }
    }
  });

  const deleteFile = useDeleteFile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFilesQueryKey(projectId) });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to delete file.", variant: "destructive" });
      }
    }
  });

  const handleCreateFile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const path = formData.get("path") as string;
    const name = path.split("/").pop() || "untitled";
    
    // Guess basic language
    let language = "plaintext";
    if (name.endsWith('.ts') || name.endsWith('.tsx')) language = "typescript";
    else if (name.endsWith('.js') || name.endsWith('.jsx')) language = "javascript";
    else if (name.endsWith('.json')) language = "json";
    else if (name.endsWith('.css')) language = "css";

    createFile.mutate({
      projectId,
      data: {
        name,
        path,
        language,
        content: ""
      }
    });
  };

  const tree = useMemo(() => {
    if (!files) return null;
    return buildTree(files);
  }, [files]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-4 bg-muted/50 rounded animate-pulse w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full py-2">
      <div className="px-3 flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Project Files</span>
        
        <Dialog open={isNewFileOpen} onOpenChange={setIsNewFileOpen}>
          <DialogTrigger asChild>
            <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New File</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFile} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="path">File Path</Label>
                <Input 
                  id="path" 
                  name="path" 
                  required 
                  placeholder="src/components/button.tsx" 
                  className="font-mono text-sm" 
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">Directories will be created automatically.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsNewFileOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createFile.isPending}>
                  {createFile.isPending ? "Creating..." : "Create File"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tree && (
          <TreeItem 
            node={tree} 
            projectId={projectId} 
            activeFileId={activeFileId} 
            onDelete={(id) => deleteFile.mutate({ projectId, fileId: id })}
          />
        )}
        
        {files?.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-muted-foreground font-mono">No files yet.</p>
            <Button 
              variant="link" 
              className="text-xs font-mono text-primary h-auto p-0 mt-2"
              onClick={() => setIsNewFileOpen(true)}
            >
              Create one
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
