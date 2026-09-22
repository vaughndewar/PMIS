"use client";

import { useRef, useState } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { buildProjectSnapshot } from "@/lib/ai/snapshot";
import { CITATION_VIEW, type Citation } from "@/lib/ai/citations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, ShieldAlert, Sparkles, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

const SUGGESTED_PROMPTS = [
  "What governance gaps need my attention right now?",
  "Summarize our cost and schedule performance.",
  "What's on the critical path and what could delay us?",
  "What's blocking CR-001?",
];

export function AiAssistantView() {
  const setActiveView = useProjectStore((s) => s.setActiveView);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          snapshot: buildProjectSnapshot(),
        }),
      });
      const data = await res.json();

      if (res.status === 501) {
        setNotConfigured(true);
        setMessages(messages); // roll back the pending user message; nothing was answered
        return;
      }
      if (!res.ok) {
        setError(data.message ?? "Something went wrong asking the assistant.");
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.message, citations: data.citations ?? [] }]);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setError("Couldn't reach the assistant. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-600" />
        <div>
          <h2 className="text-xl font-semibold text-slate-900">AI Assistant</h2>
          <p className="text-sm text-slate-500">Reads project data and cites its sources. Cannot approve, lock, or change anything.</p>
        </div>
      </div>

      {notConfigured ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <ShieldAlert className="mb-3 h-8 w-8 text-amber-500" />
          <p className="text-sm font-semibold text-slate-700">Assistant not configured</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Set <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">ANTHROPIC_API_KEY</code> in your environment
            (e.g. <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">.env.local</code>) and restart the dev server.
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
            {messages.length === 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Try asking</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
                <div
                  className={cn(
                    "flex h-7 w-7 flex-none items-center justify-center rounded-full",
                    m.role === "user" ? "bg-slate-800" : "bg-violet-600"
                  )}
                >
                  {m.role === "user" ? <UserIcon className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                </div>
                <div className={cn("max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm", m.role === "user" ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-800")}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  {!!m.citations?.length && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-slate-200 pt-2">
                      {m.citations.map((c) => (
                        <button key={`${c.type}:${c.id}`} onClick={() => setActiveView(CITATION_VIEW[c.type])}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-violet-50 hover:text-violet-700">
                            {c.id}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-violet-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-400">Thinking…</div>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            <div ref={scrollRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-3 flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about status, risks, blockers, or governance gaps..."
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
