import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import {
  BookOpen, Plus, Search, Trash2, FileText, Globe, Code2,
  Loader2, Brain, Upload, Tag, Calendar, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const API = `${BASE}/api`;

const TYPE_ICONS: Record<string, typeof FileText> = {
  document: FileText,
  url: Globe,
  code: Code2,
  note: Brain,
};

const TYPE_COLORS: Record<string, string> = {
  document: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  url: "text-green-400 bg-green-500/10 border-green-500/20",
  code: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  note: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function KnowledgePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: docs, isLoading } = useQuery<any[]>({
    queryKey: ["knowledge"],
    queryFn: async () => {
      const r = await fetch(`${API}/knowledge`);
      if (!r.ok) return [];
      return r.json();
    },
  });

  const addDoc = useMutation({
    mutationFn: async (data: any) => {
      const r = await fetch(`${API}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Failed to add document");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge"] });
      setIsOpen(false);
      toast({ title: "Document added", description: "Your document has been added to the knowledge base." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add document.", variant: "destructive" });
    },
  });

  const deleteDoc = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${API}/knowledge/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge"] });
      toast({ title: "Deleted", description: "Document removed from knowledge base." });
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const r = await fetch(`${API}/knowledge/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await r.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".page-title", { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" });
      const cards = containerRef.current?.querySelectorAll(".doc-card");
      if (cards && cards.length > 0) {
        gsap.from(cards, { opacity: 0, y: 20, duration: 0.4, stagger: 0.05, delay: 0.1, ease: "power2.out" });
      }
    }, containerRef.current);
    return () => ctx.revert();
  }, [docs]);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addDoc.mutate({
      title: fd.get("title") as string,
      content: fd.get("content") as string,
      type: fd.get("type") as string,
      tags: (fd.get("tags") as string)?.split(",").map(t => t.trim()).filter(Boolean) ?? [],
      sourceUrl: fd.get("sourceUrl") as string || null,
    });
  };

  const filtered = docs?.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto" ref={containerRef}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="page-title flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h1 className="text-2xl font-black text-white">Knowledge Base</h1>
            </div>
            <p className="text-slate-500 text-sm">Feed DLavie AI with your documents, code snippets, and notes. It will learn from them.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border-0 shadow-lg shadow-amber-500/20">
                <Plus className="w-4 h-4 mr-2" /> Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0520] border-white/[0.08] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" /> Add to Knowledge Base
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Title *</Label>
                  <Input name="title" required placeholder="e.g. API Documentation" className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Type</Label>
                  <Select name="type" defaultValue="document">
                    <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0830] border-white/[0.08]">
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="code">Code Snippet</SelectItem>
                      <SelectItem value="url">URL Reference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Content *</Label>
                  <Textarea name="content" required rows={5} placeholder="Paste your document content, code, or notes here…" className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 resize-none code-font text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Tags (comma separated)</Label>
                  <Input name="tags" placeholder="react, typescript, api" className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Source URL (optional)</Label>
                  <Input name="sourceUrl" placeholder="https://..." className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-white/[0.08]">Cancel</Button>
                  <Button type="submit" disabled={addDoc.isPending} className="bg-amber-600 hover:bg-amber-500 border-0">
                    {addDoc.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Document"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Documents", value: docs?.length ?? 0, icon: FileText, color: "text-violet-400" },
            { label: "Types", value: [...new Set(docs?.map(d => d.type))].length || 0, icon: Tag, color: "text-blue-400" },
            { label: "AI Indexed", value: docs?.filter(d => d.indexed)?.length ?? 0, icon: Brain, color: "text-emerald-400" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-600">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-violet-400" />
            Semantic Search
          </h3>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search your knowledge base…"
              className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching} className="bg-violet-600 hover:bg-violet-500 border-0 shrink-0">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">{searchResults.length} results</p>
              {searchResults.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs font-semibold text-white mb-1">{r.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{r.snippet ?? r.content?.slice(0, 150)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter documents…"
              className="pl-9 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-slate-600 text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : !filtered?.length ? (
          <div className="glass-card rounded-xl p-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-sm mb-2">
              {search ? "No documents match your search" : "No documents yet"}
            </p>
            <p className="text-slate-600 text-xs max-w-xs mx-auto mb-6">
              Add documents, notes, and code snippets to train DLavie AI on your specific knowledge.
            </p>
            {!search && (
              <Button onClick={() => setIsOpen(true)} className="bg-amber-600 hover:bg-amber-500 border-0">
                <Plus className="w-4 h-4 mr-2" /> Add First Document
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((doc: any) => {
              const Icon = TYPE_ICONS[doc.type] ?? FileText;
              return (
                <div key={doc.id} className="doc-card glass-card rounded-xl p-4 flex items-start gap-4 group hover:border-white/10 transition-all">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[doc.type] ?? TYPE_COLORS.document}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-white truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-[9px] ${TYPE_COLORS[doc.type] ?? TYPE_COLORS.document}`}>{doc.type}</Badge>
                        <button
                          onClick={() => deleteDoc.mutate(doc.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">{doc.content}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-700">
                      {doc.tags?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {doc.tags.slice(0, 3).join(", ")}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
