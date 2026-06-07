import { Router } from "express";
import { db, messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { ListMessagesParams, SendChatMessageBody, GetAiCompletionBody } from "@workspace/api-zod";

const router = Router();

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

router.get("/projects/:projectId/messages", async (req, res) => {
  try {
    const { projectId } = ListMessagesParams.parse({ projectId: Number(req.params.projectId) });
    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.projectId, projectId))
      .orderBy(messagesTable.createdAt);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/ai/chat", async (req, res) => {
  try {
    const body = SendChatMessageBody.parse(req.body);

    const [userMsg] = await db
      .insert(messagesTable)
      .values({ projectId: body.projectId, role: "user", content: body.message })
      .returning();

    let openai: OpenAI;
    try {
      openai = getOpenAIClient();
    } catch {
      const [errorMsg] = await db
        .insert(messagesTable)
        .values({
          projectId: body.projectId,
          role: "assistant",
          content: "AI assistant is not configured. Please add an OPENAI_API_KEY to enable AI features.",
        })
        .returning();
      return res.json(errorMsg);
    }

    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.projectId, body.projectId))
      .orderBy(messagesTable.createdAt)
      .limit(20);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are DLavie OS AI — an intelligent coding assistant embedded in a web IDE. Help the developer with code questions, debugging, code reviews, and explanations. Be concise and precise. ${body.context ? `\n\nCurrent file context:\n\`\`\`\n${body.context}\n\`\`\`` : ""}`,
      },
      ...history.slice(0, -1).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: body.message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 2048,
    });

    const assistantContent = completion.choices[0]?.message?.content ?? "No response generated.";

    const [assistantMsg] = await db
      .insert(messagesTable)
      .values({ projectId: body.projectId, role: "assistant", content: assistantContent })
      .returning();

    res.json(assistantMsg);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.post("/ai/complete", async (req, res) => {
  try {
    const body = GetAiCompletionBody.parse(req.body);

    let openai: OpenAI;
    try {
      openai = getOpenAIClient();
    } catch {
      return res.json({ suggestion: "", explanation: "AI not configured. Add OPENAI_API_KEY to enable completions." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a code completion assistant. Given ${body.language} code, suggest a continuation or improvement. Return ONLY the code suggestion, no explanation, no markdown fences.`,
        },
        {
          role: "user",
          content: body.code,
        },
      ],
      max_tokens: 512,
    });

    const suggestion = completion.choices[0]?.message?.content ?? "";
    res.json({ suggestion, explanation: null });
  } catch (err) {
    res.status(500).json({ error: "Failed to get completion" });
  }
});

export default router;
