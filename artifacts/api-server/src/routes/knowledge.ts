import { Router } from "express";
import { db } from "@workspace/db";
import { knowledgeTable } from "@workspace/db";
import { eq, ilike, or, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/knowledge", async (_req, res) => {
  try {
    const docs = await db
      .select()
      .from(knowledgeTable)
      .orderBy(desc(knowledgeTable.createdAt));
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to list knowledge" });
  }
});

router.post("/knowledge", async (req, res) => {
  try {
    const { title, content, type = "document", tags = [], sourceUrl } = req.body;
    if (!title || !content) return res.status(400).json({ error: "title and content required" });

    const [doc] = await db
      .insert(knowledgeTable)
      .values({ title, content, type, tags, sourceUrl: sourceUrl ?? null, indexed: true })
      .returning();
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to add document" });
  }
});

router.get("/knowledge/search", async (req, res) => {
  try {
    const q = (req.query.q as string)?.trim();
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    if (!q) return res.status(400).json({ error: "Query required" });

    const results = await db
      .select({
        id: knowledgeTable.id,
        title: knowledgeTable.title,
        type: knowledgeTable.type,
        tags: knowledgeTable.tags,
        snippet: sql<string>`LEFT(${knowledgeTable.content}, 200)`,
        createdAt: knowledgeTable.createdAt,
      })
      .from(knowledgeTable)
      .where(
        or(
          ilike(knowledgeTable.title, `%${q}%`),
          ilike(knowledgeTable.content, `%${q}%`),
        )
      )
      .orderBy(desc(knowledgeTable.createdAt))
      .limit(limit);

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Search failed" });
  }
});

router.get("/knowledge/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [doc] = await db.select().from(knowledgeTable).where(eq(knowledgeTable.id, id));
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to get document" });
  }
});

router.delete("/knowledge/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(knowledgeTable).where(eq(knowledgeTable.id, id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to delete document" });
  }
});

export async function getRelevantKnowledge(query: string, limit = 3): Promise<string> {
  try {
    const results = await db
      .select({ title: knowledgeTable.title, content: knowledgeTable.content })
      .from(knowledgeTable)
      .where(
        or(
          ilike(knowledgeTable.title, `%${query.slice(0, 50)}%`),
          ilike(knowledgeTable.content, `%${query.slice(0, 50)}%`),
        )
      )
      .limit(limit);

    if (!results.length) return "";
    return "\n\n--- Knowledge Base Context ---\n" +
      results.map(r => `[${r.title}]\n${r.content.slice(0, 500)}`).join("\n\n");
  } catch {
    return "";
  }
}

export default router;
