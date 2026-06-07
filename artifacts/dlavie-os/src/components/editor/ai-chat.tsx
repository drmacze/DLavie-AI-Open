import { useState, useRef, useEffect } from "react";
import { useListMessages, useSendChatMessage, getListMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AIChatProps {
  projectId: number;
  currentFileId?: number;
}

export default function AIChat({ projectId, currentFileId }: AIChatProps) {
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, isLoading } = useListMessages(projectId, {
    query: { enabled: !!projectId, queryKey: getListMessagesQueryKey(projectId) }
  });

  const sendMessage = useSendChatMessage({
    mutation: {
      onSuccess: () => {
        setInput("");
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(projectId) });
      }
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMessage.isPending]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    sendMessage.mutate({
      data: {
        projectId,
        message: input,
        context: currentFileId ? `File context: ${currentFileId}` : undefined
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-card relative">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col gap-1.5 max-w-[90%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground px-1 mb-1">
                {msg.role === 'user' ? (
                  <>You <User className="w-3 h-3" /></>
                ) : (
                  <><Bot className="w-3 h-3 text-primary" /> Assistant</>
                )}
              </div>
              <div 
                className={`p-3 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' 
                    : 'bg-muted/50 border rounded-2xl rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap break-words font-mono text-[13px]">{msg.content}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
            <Sparkles className="w-8 h-8 mb-4 text-primary" />
            <p className="text-sm font-mono">How can I help you build today?</p>
            <p className="text-xs text-muted-foreground mt-2">I can write code, explain errors, or scaffold components.</p>
          </div>
        )}
        
        {sendMessage.isPending && (
          <div className="flex flex-col gap-1.5 max-w-[90%] mr-auto items-start">
             <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground px-1 mb-1">
              <Bot className="w-3 h-3 text-primary" /> Assistant
            </div>
            <div className="p-3 bg-muted/50 border rounded-2xl rounded-tl-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-card/80 backdrop-blur shrink-0 relative z-20">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-muted/30 border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="min-h-[44px] max-h-32 border-0 bg-transparent resize-none py-3 px-4 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-hide"
            rows={1}
          />
          <div className="p-2 shrink-0">
            <Button 
              type="submit" 
              size="icon" 
              className="h-8 w-8 rounded-lg"
              disabled={!input.trim() || sendMessage.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
        <div className="flex justify-between items-center mt-2 px-2">
           <span className="text-[10px] text-muted-foreground font-mono">Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
