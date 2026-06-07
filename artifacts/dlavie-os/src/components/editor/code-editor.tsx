import { useState, useEffect, useRef, useCallback } from "react";
import { useGetFile, useUpdateFile, getGetFileQueryKey, getListFilesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeEditorProps {
  projectId: number;
  fileId: number;
}

export default function CodeEditor({ projectId, fileId }: CodeEditorProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { data: file, isLoading, isError } = useGetFile(projectId, fileId, {
    query: { enabled: !!projectId && !!fileId, queryKey: getGetFileQueryKey(projectId, fileId) }
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (file && initializedForId.current !== file.id) {
      initializedForId.current = file.id;
      setContent(file.content || "");
      setIsDirty(false);
    }
  }, [file]);

  const updateFile = useUpdateFile({
    mutation: {
      onSuccess: () => {
        setIsDirty(false);
        queryClient.invalidateQueries({ queryKey: getGetFileQueryKey(projectId, fileId) });
        queryClient.invalidateQueries({ queryKey: getListFilesQueryKey(projectId) });
      }
    }
  });

  const handleSave = useCallback(() => {
    if (!isDirty) return;
    updateFile.mutate({
      projectId,
      fileId,
      data: { content }
    });
  }, [content, isDirty, projectId, fileId, updateFile]);

  // Handle Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newContent = content.substring(0, start) + "  " + content.substring(end);
      setContent(newContent);
      setIsDirty(true);
      
      // Move cursor after the inserted spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-card/30">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground font-mono">Loading file...</span>
        </div>
      </div>
    );
  }

  if (isError || !file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-card/30 text-muted-foreground gap-2">
        <AlertCircle className="w-8 h-8 text-destructive/50" />
        <span className="text-sm font-mono">Failed to load file</span>
      </div>
    );
  }

  // Create line numbers array
  const lineCount = content.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full w-full bg-card/30">
      {/* Editor Header */}
      <div className="h-10 border-b flex items-center justify-between px-4 shrink-0 bg-card/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-foreground/80">{file.path}</span>
          {isDirty && <span className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 font-mono text-xs"
          onClick={handleSave}
          disabled={!isDirty || updateFile.isPending}
        >
          {updateFile.isPending ? "Saving..." : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save
            </>
          )}
        </Button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden flex relative bg-[#1e1e1e]">
        {/* Line Numbers */}
        <div className="w-12 shrink-0 bg-[#1e1e1e] border-r border-white/5 py-4 flex flex-col items-end px-3 select-none overflow-hidden text-[#858585] font-mono text-sm leading-relaxed" aria-hidden="true">
          {lineNumbers.map(n => (
            <div key={n}>{n}</div>
          ))}
        </div>
        
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setIsDirty(true);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-[#d4d4d4] font-mono text-sm leading-relaxed p-4 resize-none outline-none focus:ring-0 whitespace-pre scrollbar-hide"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
}
