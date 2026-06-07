import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListMessages, useSendChatMessage, getListMessagesQueryKey } from "@workspace/api-client-react";
import { Send, Sparkles, User, Bot, Loader2, Brain, Zap, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AIChatProps {
  projectId: number;
  currentFileId?: number;
}

function CodeBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-[12px] leading-relaxed whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const lines = part.slice(3).split("\n");
          const lang = lines[0]?.trim() ?? "";
          const code = lines.slice(1).join("\n").replace(/```$/, "").trimEnd();
          return (
            <div key={i} className="relative my-2 rounded-lg overflow-hidden border border-violet-500/20">
              <div className="flex items-center justify-between px-3 py-1.5 bg-violet-500/10 border-b border-violet-500/15">
                <span className="text-[9px] text-violet-400 code-font uppercase tracking-wider">{lang || "code"}</span>
                <button
                  onClick={() => copy(code)}
                  className="text-[9px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-3 text-[11px] text-slate-300 overflow-x-auto code-font bg-black/30">
                {code}
              </pre>
            </div>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

const QUICK_PROMPTS = [
  "Explain this code",
  "Find bugs",
  "Write tests",
  "Refactor",
  "Add types",
  "Document this",
];

export default function AIChat({ projectId, currentFileId }: AIChatProps) {
  const [input, setInput] = useState("");
  const qc = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useListMessages(projectId, {
    query: { enabled: !!projectId, queryKey: getListMessagesQueryKey(projectId) },
  });

  const sendMessage = useSendChatMessage({
    mutation: {
      onSuccess: () => {
        setInput("");
        qc.invalidateQueries({ queryKey: getListMessagesQueryKey(projectId) });
      },
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMessage.isPending]);

  const handleSubmit = (msg?: string) => {
    const text = msg ?? input;
    if (!text.trim() || sendMessage.isPending) return;
    sendMessage.mutate({
      data: {
        projectId,
        message: text,
        context: currentFileId ? `Current file ID: ${currentFileId}` : undefined,
      },
    });
    if (!msg) setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`flex items-center gap-1.5 text-[9px] px-1 ${msg.role === "user" ? "text-slate-600" : "text-violet-500"}`}>
                {msg.role === "user" ? (
                  <>
                    <span>You</span>
                    <User className="w-2.5 h-2.5" />
                  </>
                ) : (
                  <>
                    <Zap className="w-2.5 h-2.5" />
                    <span>DLavie Coder</span>
                  </>
                )}
              </div>
              <div
                className={`max-w-[92%] px-3 py-2.5 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-violet-600/20 border border-violet-500/25 text-violet-100 rounded-tr-sm"
                    : "bg-white/[0.04] border border-white/[0.06] text-slate-300 rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <CodeBlock content={msg.content} />
                ) : (
                  <p className="text-[12px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-1">DLavie Coder 1.5B</p>
              <p className="text-[11px] text-slate-600">Ask me to write, debug, or explain code.</p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => handleSubmit(p)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-violet-500/20 bg-violet-500/8 text-violet-400 hover:bg-violet-500/15 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {sendMessage.isPending && (
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1.5 text-[9px] text-violet-500 px-1">
              <Zap className="w-2.5 h-2.5" />
              <span>DLavie Coder</span>
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] px-3 py-2.5 rounded-xl rounded-tl-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
              <span className="w-1.5 h-1.5 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-2.5 border-t border-white/[0.05] shrink-0">
        {messages && messages.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {QUICK_PROMPTS.slice(0, 3).map(p => (
              <button
                key={p}
                onClick={() => handleSubmit(p)}
                disabled={sendMessage.isPending}
                className="text-[9px] px-2 py-1 rounded-full border border-white/[0.06] text-slate-600 hover:text-slate-400 hover:border-white/[0.1] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden focus-within:border-violet-500/30 transition-colors">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask DLavie AI…"
            className="min-h-[38px] max-h-28 border-0 bg-transparent resize-none py-2.5 px-3 text-[12px] code-font text-slate-300 placeholder:text-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
          />
          <div className="p-1.5">
            <Button
              onClick={() => handleSubmit()}
              size="icon"
              disabled={!input.trim() || sendMessage.isPending}
              className="h-7 w-7 rounded-lg bg-violet-600 hover:bg-violet-500 border-0 shadow-md shadow-violet-500/20"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <p className="text-[9px] text-slate-800 mt-1 px-1">Shift+Enter for newline · AI runs locally</p>
      </div>
    </div>
  );
}
