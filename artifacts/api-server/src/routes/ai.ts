import { Router } from "express";
import { db, messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListMessagesParams, SendChatMessageBody, GetAiCompletionBody } from "@workspace/api-zod";
import { generateChat, generateCompletion, getLLMStatus } from "../lib/llm.js";

const router = Router();

router.get("/ai/status", (_req, res) => {
  res.json(getLLMStatus());
});

router.get("/projects/:projectId/messages", async (req, res) => {
  try {
    const { projectId } = ListMessagesParams.parse({ projectId: Number(req.params.projectId) });
    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.projectId, projectId))
      .orderBy(messagesTable.createdAt);
    res.json(messages);
  } catch {
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/ai/chat", async (req, res) => {
  try {
    const body = SendChatMessageBody.parse(req.body);

    await db.insert(messagesTable).values({
      projectId: body.projectId,
      role: "user",
      content: body.message,
    });

    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.projectId, body.projectId))
      .orderBy(messagesTable.createdAt)
      .limit(20);

    const systemPrompt = [
      "You are DLavie OS AI — an intelligent coding assistant built directly into the IDE.",
      "Help the developer with code questions, debugging, code reviews, and explanations.",
      "Be concise, accurate, and practical. Focus on code quality.",
      body.context ? `\nCurrent file context:\n\`\`\`\n${body.context}\n\`\`\`` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const chatHistory = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const assistantContent = await generateChat(systemPrompt, chatHistory);

    const [assistantMsg] = await db
      .insert(messagesTable)
      .values({ projectId: body.projectId, role: "assistant", content: assistantContent })
      .returning();

    res.json(assistantMsg);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to process message" });
  }
});

router.post("/ai/complete", async (req, res) => {
  try {
    const body = GetAiCompletionBody.parse(req.body);
    const suggestion = await generateCompletion(body.code, body.language);
    res.json({ suggestion, explanation: null });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to generate completion" });
  }
});

export default router;
