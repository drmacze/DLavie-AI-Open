import { Router } from "express";
import { db, messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListMessagesParams, SendChatMessageBody, GetAiCompletionBody } from "@workspace/api-zod";
import { generateChat, generateCompletion, getLLMStatus } from "../lib/llm.js";
import { getRelevantKnowledge } from "./knowledge.js";

const router = Router();

const DLAVIA_SYSTEM_PROMPT = `You are DLavie AI — an advanced open-source coding intelligence built into the DLavie OS IDE.

You are part of the DLavie AI family:
• DLavie Nexus — general intelligence
• DLavie Coder (YOU) — code specialist  
• DLavie Sage — deep reasoning
• DLavie Odyssey — multimodal agent

Your personality: precise, helpful, direct. You love clean code and good architecture.

Core capabilities:
- Write, debug, refactor, and review code in any language
- Explain complex concepts with clarity
- Suggest best practices and design patterns
- Help with architecture decisions
- Read and understand project context

Rules:
- Be concise and focused. No fluff.
- Always use markdown code blocks with language labels
- If you don't know something, say so honestly
- Respond in the same language as the user's message`;

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
    const projectId = body.projectId || 0;

    if (projectId > 0) {
      await db.insert(messagesTable).values({
        projectId,
        role: "user",
        content: body.message,
      });
    }

    const history = projectId > 0
      ? await db
          .select()
          .from(messagesTable)
          .where(eq(messagesTable.projectId, projectId))
          .orderBy(messagesTable.createdAt)
          .limit(20)
      : [{ role: "user", content: body.message }];

    const knowledgeContext = await getRelevantKnowledge(body.message, 3);

    const systemPrompt = [
      DLAVIA_SYSTEM_PROMPT,
      body.context ? `\nCurrent file context:\n\`\`\`\n${body.context}\n\`\`\`` : "",
      knowledgeContext,
    ].filter(Boolean).join("");

    const chatHistory = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const assistantContent = await generateChat(systemPrompt, chatHistory);

    if (projectId > 0) {
      const [assistantMsg] = await db
        .insert(messagesTable)
        .values({ projectId, role: "assistant", content: assistantContent })
        .returning();
      return res.json(assistantMsg);
    }

    res.json({ id: 0, projectId: 0, role: "assistant", content: assistantContent, createdAt: new Date().toISOString() });
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
