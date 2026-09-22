import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ASSISTANT_TOOLS, executeTool } from "@/lib/ai/tools";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { dedupeCitations, type Citation } from "@/lib/ai/citations";
import type { ProjectSnapshot } from "@/lib/ai/snapshot";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AssistantRequestBody {
  messages: ChatMessage[];
  snapshot: ProjectSnapshot;
}

const MODEL = "claude-sonnet-5";
const MAX_TOOL_ROUNDS = 6;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: "Set ANTHROPIC_API_KEY in your environment (e.g. .env.local) and restart the dev server to enable the assistant.",
      },
      { status: 501 }
    );
  }

  let body: AssistantRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.messages?.length || !body.snapshot) {
    return NextResponse.json({ error: "bad_request", message: "Missing messages or snapshot." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const snapshot = body.snapshot;
  const allCitations: Citation[] = [];

  const conversation: Anthropic.MessageParam[] = body.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: ASSISTANT_SYSTEM_PROMPT,
        tools: ASSISTANT_TOOLS,
        messages: conversation,
      });

      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      if (toolUseBlocks.length === 0 || response.stop_reason !== "tool_use") {
        const text = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n\n");
        return NextResponse.json({ message: text, citations: dedupeCitations(allCitations) });
      }

      conversation.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolUseBlocks) {
        const { result, citations } = executeTool(block.name, (block.input ?? {}) as Record<string, unknown>, snapshot);
        allCitations.push(...citations);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
      conversation.push({ role: "user", content: toolResults });
    }

    return NextResponse.json(
      { error: "tool_loop_exceeded", message: "The assistant made too many tool calls without answering. Try a narrower question." },
      { status: 500 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error calling the assistant.";
    return NextResponse.json({ error: "assistant_error", message }, { status: 502 });
  }
}
