import { useState, useRef, useEffect } from "react";
import { assistantApi } from "../../api";
import { tasksApi } from "../../api";
import type { AssistantMessage, Task } from "../../types";
import { Dots_v4 } from "../../components/ui/spinner";

const SUGGESTED_PROMPTS = [
  { icon: "assignment", text: "Show deadlines this week" },
  { icon: "event_note", text: "Plan study schedule" },
  { icon: "history_edu", text: "When is my next exam?" },
];

export function Assistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const userName = localStorage.getItem("duemate_user_name") || "Student";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tasksApi.getAll().then(setTasks).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const nextTask = pendingTasks[0];

  function renderMessageContent(content: string) {
    return content.split("\n").map((line, idx) => {
      let cleanLine = line;
      let isBullet = false;
      if (cleanLine.trim().startsWith("- ") || cleanLine.trim().startsWith("* ")) {
        cleanLine = cleanLine.trim().substring(2);
        isBullet = true;
      }
      
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }
      
      const contentNode = parts.length > 0 ? parts : cleanLine;
      
      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm font-medium text-slate-800 leading-relaxed">
            {contentNode}
          </li>
        );
      }
      return (
        <p key={idx} className="text-sm font-medium text-slate-800 leading-relaxed min-h-[1rem]">
          {contentNode}
        </p>
      );
    });
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: AssistantMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await assistantApi.chat(text);
      const aiMsg: AssistantMessage = {
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: AssistantMessage = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[390px] md:max-w-4xl mx-auto min-h-screen relative pb-40 bg-background-base">
      {/* Top App Bar (Desktop Only) */}
      <header className="hidden md:flex w-full top-0 sticky z-50 bg-background-base/80 backdrop-blur-md h-16 justify-between items-center px-6">
        <div className="flex flex-col">
          <span className="text-[24px] font-bold text-secondary">DueMate</span>
          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
            Academic Companion
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-full border border-white/50">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[12px] font-bold text-on-surface-variant">Online</span>
        </div>
      </header>

      <main className="px-6 mt-4 space-y-8">
        {/* AI Intro Card */}
        <section
          className="neumorphic-raised p-6 relative overflow-hidden"
          style={{ borderRadius: "20px" }}
        >
          <div className="relative z-10 flex gap-4 items-start">
            <div className="flex-1">
              <h1 className="text-[20px] font-bold text-primary mb-1">
                Hi {userName} 👋
              </h1>
              <p className="text-[16px] text-on-surface-variant leading-relaxed">
                I can help you manage your semester, understand deadlines, and plan your study time.
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center"
              style={{
                boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)",
                animation: "pulse-glow 3s infinite ease-in-out",
              }}
            >
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-highlight-soft rounded-full opacity-30 blur-2xl" />
        </section>

        {/* Suggested Prompts */}
        {messages.length === 0 && (
          <section className="overflow-x-auto flex gap-3 pb-2 -mx-6 px-6 scrollbar-hide">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p.text}
                onClick={() => sendMessage(p.text)}
                className="neumorphic-raised px-4 py-3 whitespace-nowrap text-[13px] font-semibold text-secondary flex items-center gap-2 active:scale-95 transition-all"
                style={{ borderRadius: "12px" }}
              >
                <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
                {p.text}
              </button>
            ))}
          </section>
        )}

        {/* Chat Messages */}
        <section className="space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "user" ? (
                <div className="bg-blue-600 text-white px-5 py-3 max-w-[85%] md:max-w-xl shadow-md rounded-[20px] rounded-br-sm">
                  <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="neu-raised-premium p-5 max-w-[90%] md:max-w-2xl space-y-2.5 rounded-[22px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-blue-600 text-base">auto_awesome</span>
                    <span className="text-xs font-bold text-blue-600">DueMate AI</span>
                  </div>
                  <div className="space-y-1">
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="neu-raised-premium p-4 flex items-center gap-3 rounded-[20px]">
                <Dots_v4 />
                <span className="text-xs font-semibold text-slate-500">DueMate is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </section>

        {/* Context Aware Card — shown only when no messages yet */}
        {messages.length === 0 && (
          <section className="space-y-2">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant px-1">
              Based on Your Semester
            </h3>
            <div className="neumorphic-raised p-4 flex justify-between divide-x divide-outline/10" style={{ borderRadius: "20px" }}>
              <div className="flex-1 px-2 text-center">
                <div className="text-[20px] font-bold text-secondary">{pendingTasks.length}</div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase">Deadlines</div>
              </div>
              <div className="flex-1 px-2 text-center">
                <div className="text-[13px] font-bold text-primary line-clamp-1 leading-tight mt-1 capitalize">
                  {nextTask?.parsed_course ?? "—"}
                </div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase">Next Task</div>
              </div>
              <div className="flex-1 px-2 text-center">
                <div className="text-[13px] font-bold text-danger mt-1 uppercase">
                  {nextTask?.parsed_due_date
                    ? new Date(nextTask.parsed_due_date).toLocaleDateString("en-US", { weekday: "short" })
                    : "—"}
                </div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase">Due</div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Message Input Bar (Fixed) */}
      <div
        className="fixed bottom-0 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[390px] md:max-w-4xl px-6 pb-4"
        style={{ background: "linear-gradient(to top, #EAF0F8 60%, transparent)" }}
      >
        <div className="neumorphic-inset h-14 flex items-center px-4 gap-3">
          <span className="material-symbols-outlined text-outline">mic</span>
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-outline/60 text-primary"
            placeholder="Ask DueMate anything..."
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          />
          <button
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-md active:scale-95 transition-transform"
            onClick={() => sendMessage(input)}
          >
            <span className="material-symbols-outlined text-white">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
