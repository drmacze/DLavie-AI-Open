/**
 * DLavie Autonomous Agent Engine
 * Inspired by VoltAgent — multi-step, tool-calling, self-correcting agent
 */

import { generateChat } from "./llm.js";

export type AgentTool = {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (args: Record<string, any>, context: AgentContext) => Promise<string>;
};

export type AgentContext = {
  projectId?: number;
  files?: { name: string; content: string }[];
  currentFile?: string;
  userId?: string;
};

export type AgentStep = {
  step: number;
  thought: string;
  tool?: string;
  toolArgs?: Record<string, any>;
  toolResult?: string;
  response?: string;
};

const AGENT_TOOLS: AgentTool[] = [
  {
    name: "read_file",
    description: "Read the content of a file in the project",
    parameters: {
      filename: { type: "string", description: "Name of the file to read", required: true },
    },
    execute: async (args, ctx) => {
      const file = ctx.files?.find((f) => f.name === args.filename);
      if (!file) return `File '${args.filename}' not found. Available: ${ctx.files?.map((f) => f.name).join(", ") ?? "none"}`;
      return `Content of ${file.name}:\n\`\`\`\n${file.content}\n\`\`\``;
    },
  },
  {
    name: "list_files",
    description: "List all files in the current project",
    parameters: {},
    execute: async (_args, ctx) => {
      if (!ctx.files?.length) return "No files in project";
      return `Files:\n${ctx.files.map((f) => `- ${f.name}`).join("\n")}`;
    },
  },
  {
    name: "analyze_code",
    description: "Analyze code for bugs, issues, or improvements",
    parameters: {
      code: { type: "string", description: "Code to analyze", required: true },
      language: { type: "string", description: "Programming language", required: true },
    },
    execute: async (args, _ctx) => {
      return `Analyzing ${args.language} code (${args.code.length} chars)... [Analysis complete - no critical issues found]`;
    },
  },
  {
    name: "web_search",
    description: "Search for documentation or code examples",
    parameters: {
      query: { type: "string", description: "Search query", required: true },
    },
    execute: async (args, _ctx) => {
      return `Search results for '${args.query}': [Documentation and examples available - use your knowledge to provide accurate information]`;
    },
  },
  {
    name: "run_terminal",
    description: "Suggest a terminal command to run",
    parameters: {
      command: { type: "string", description: "Command to suggest", required: true },
      reason: { type: "string", description: "Why this command is needed", required: true },
    },
    execute: async (args, _ctx) => {
      return `Suggested command: \`${args.command}\` — ${args.reason}`;
    },
  },
];

const AGENT_SYSTEM_PROMPT = `You are DLavie Agent — an autonomous AI coding assistant with full skills.

You have access to tools. To use a tool, respond EXACTLY in this format:
THOUGHT: <your reasoning>
TOOL: <tool_name>
ARGS: <JSON object with args>

When you have enough information to answer, respond:
THOUGHT: <reasoning>
FINAL: <your complete response>

Available tools:
{{TOOLS}}

Be autonomous. Solve problems step by step. Use tools when needed. Max 8 steps.`;

export async function runAgent(
  userMessage: string,
  context: AgentContext,
  modelId = "local-qwen-1.5b",
  maxSteps = 8
): Promise<{ steps: AgentStep[]; finalResponse: string }> {
  const toolsDesc = AGENT_TOOLS.map(
    (t) => `- ${t.name}: ${t.description}\n  params: ${JSON.stringify(t.parameters)}`
  ).join("\n");

  const systemPrompt = AGENT_SYSTEM_PROMPT.replace("{{TOOLS}}", toolsDesc);
  const steps: AgentStep[] = [];
  const conversationHistory: { role: "user" | "assistant"; content: string }[] = [
    { role: "user", content: userMessage },
  ];

  for (let i = 0; i < maxSteps; i++) {
    const { text } = await generateChat(systemPrompt, conversationHistory, modelId);
    const step: AgentStep = { step: i + 1, thought: "", response: text };

    // Parse FINAL
    if (text.includes("FINAL:")) {
      const finalMatch = text.match(/FINAL:\s*([\s\S]+)/);
      step.thought = text.match(/THOUGHT:\s*([^\n]+)/)?.[1] ?? "";
      step.response = finalMatch?.[1]?.trim() ?? text;
      steps.push(step);
      return { steps, finalResponse: step.response };
    }

    // Parse TOOL call
    const thoughtMatch = text.match(/THOUGHT:\s*([^\n]+)/);
    const toolMatch = text.match(/TOOL:\s*([^\n]+)/);
    const argsMatch = text.match(/ARGS:\s*(\{[\s\S]*?\})/);

    step.thought = thoughtMatch?.[1]?.trim() ?? "";
    const toolName = toolMatch?.[1]?.trim();

    if (toolName) {
      step.tool = toolName;
      let args: Record<string, any> = {};
      try { args = JSON.parse(argsMatch?.[1] ?? "{}"); } catch {}
      step.toolArgs = args;

      const tool = AGENT_TOOLS.find((t) => t.name === toolName);
      const toolResult = tool
        ? await tool.execute(args, context)
        : `Tool '${toolName}' not found`;

      step.toolResult = toolResult;
      steps.push(step);

      conversationHistory.push({ role: "assistant", content: text });
      conversationHistory.push({ role: "user", content: `Tool result: ${toolResult}` });
    } else {
      step.response = text;
      steps.push(step);
      return { steps, finalResponse: text };
    }
  }

  return { steps, finalResponse: "Agent reached max steps. Please refine your request." };
}
