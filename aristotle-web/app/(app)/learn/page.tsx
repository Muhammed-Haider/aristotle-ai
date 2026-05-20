"use client";
import { useState, useRef, useEffect } from "react";
import { getUser, User } from "@/lib/auth";

interface Message { role: "user" | "assistant"; content: string; }

const SUBJECTS = [
  "Data Structures - Arrays & Linked Lists",
  "Data Structures - Stacks & Queues",
  "Data Structures - Trees & Heaps",
  "Algorithms - Sorting & Searching",
  "Algorithms - Dynamic Programming",
  "Algorithms - Graph Algorithms",
  "OOP - Classes & Inheritance",
  "OOP - Design Patterns",
  "Operating Systems - Processes & Threads",
  "Operating Systems - Memory Management",
  "Computer Networks - TCP/IP Model",
  "Computer Networks - Routing Protocols",
  "Database Systems - SQL & Normalization",
  "Database Systems - Transactions & Indexing",
  "Theory of Computation - Automata",
  "Compiler Design - Parsing",
];

const QUICK = [
  "Explain this concept simply",
  "Give me a real-world example",
  "What is the time complexity?",
  "How does this compare to alternatives?",
  "What are common mistakes here?",
];

export default function LearnPage() {
  const [user, setUser]         = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const [subject, setSubject]   = useState(SUBJECTS[0]);
  const [language, setLanguage] = useState<"english" | "urdu">("english");
  const [difficulty, setDifficulty] = useState("Standard");
  const bottomRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  useEffect(() => { setUser(getUser()); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    const history = messages.filter(m => m.content);
    setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, history, subject, language }),
        signal: ctrl.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const { token } = JSON.parse(data);
            setMessages(prev => {
              const copy = [...prev];
              copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + token };
              return copy;
            });
          } catch { /* skip malformed */ }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: "Connection error. Please try again." };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#1e2a3e] shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white">Learn with AI</h1>
          <p className="text-[#8899b0] text-xs mt-0.5">Interactive Socratic learning experience</p>
        </div>
        <div className="flex items-center gap-3">
          {/* language toggle */}
          <div className="flex gap-1 bg-[#131c2e] rounded-lg p-1 border border-[#1e2a3e]">
            {(["english", "urdu"] as const).map(l => (
              <button key={l} onClick={() => setLanguage(l)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  language === l ? "bg-[#2563eb] text-white" : "text-[#8899b0] hover:text-white"
                }`}>
                {l === "english" ? "English" : "اردو"}
              </button>
            ))}
          </div>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
            className="bg-[#131c2e] border border-[#1e2a3e] text-[#e2e8f0] text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer">
            {["Beginner", "Standard", "Advanced"].map(d => <option key={d}>{d}</option>)}
          </select>
          <button onClick={() => { setMessages([]); abortRef.current?.abort(); }}
            className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold transition-colors">
            New Session
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* left: topic panel */}
        <div className="w-72 shrink-0 flex flex-col border-r border-[#1e2a3e] overflow-hidden">
          <div className="p-4 border-b border-[#1e2a3e]">
            <label className="block text-[10px] text-[#8899b0] uppercase tracking-wider mb-2 font-semibold">Topic</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1e2a3e] text-[#e2e8f0] text-xs px-3 py-2.5 rounded-lg outline-none focus:border-[#2563eb] cursor-pointer transition-colors">
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            <div className="text-[10px] text-[#8899b0] uppercase tracking-wider mb-3 font-semibold">Quick Prompts</div>
            {QUICK.map(q => (
              <button key={q} onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                className="w-full text-left text-xs text-[#8899b0] hover:text-white px-3 py-2.5 rounded-lg hover:bg-[#131c2e] border border-transparent hover:border-[#1e2a3e] transition-all mb-1 block">
                {q}
              </button>
            ))}

            {messages.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#1e2a3e]">
                <div className="text-[10px] text-[#8899b0] uppercase tracking-wider mb-2 font-semibold">Session</div>
                <div className="text-xs text-[#4a5568]">{messages.length} messages</div>
                <div className="text-xs text-[#4a5568] mt-0.5 truncate">{subject.split(" - ")[0]}</div>
              </div>
            )}
          </div>
        </div>

        {/* right: chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white text-2xl font-bold shadow-2xl"
                  style={{ boxShadow: "0 0 50px rgba(37,99,235,0.35)" }}>
                  A
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold mb-1.5">Aristotle is ready to teach</p>
                  <p className="text-[#8899b0] text-sm max-w-xs leading-relaxed">
                    Ask me anything about{" "}
                    <span className="text-[#3b82f6] font-medium">{subject.split(" - ").pop()}</span>.
                    <br />I'll guide you with questions, not just answers.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                  {["What is this concept?", "Show me an example", "Quiz me on this"].map(q => (
                    <button key={q} onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                      className="text-xs text-[#8899b0] hover:text-[#3b82f6] border border-[#1e2a3e] hover:border-[#2563eb]/40 px-4 py-2 rounded-full transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-[#2563eb] text-white"
                      : "bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white"
                  }`}>
                    {msg.role === "user" ? (user?.name || "U")[0].toUpperCase() : "A"}
                  </div>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#2563eb]/15 border border-[#2563eb]/25 text-[#e2e8f0] rounded-tr-sm"
                      : "bg-[#131c2e] border border-[#1e2a3e] text-[#c8d3e0] rounded-tl-sm"
                  }`}
                    dir={language === "urdu" && msg.role === "assistant" ? "rtl" : "ltr"}>
                    {msg.content || (
                      <span className="flex gap-1.5 items-center h-5">
                        {[0, 1, 2].map(d => (
                          <span key={d} className="typing-dot w-1.5 h-1.5 rounded-full bg-[#8899b0] inline-block" />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="px-6 pb-5 pt-3 border-t border-[#1e2a3e] shrink-0">
            <div className="flex gap-3 items-end bg-[#131c2e] border border-[#1e2a3e] rounded-xl px-4 py-3 focus-within:border-[#2563eb] transition-colors">
              <textarea ref={textareaRef} rows={1} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                placeholder={language === "urdu" ? "یہاں سوال لکھیں…" : `Ask about ${subject.split(" - ").pop()}…`}
                dir={language === "urdu" ? "rtl" : "ltr"}
                className="flex-1 bg-transparent text-sm text-white placeholder-[#4a5568] outline-none resize-none max-h-32 leading-relaxed"
                style={{ fieldSizing: "content" } as React.CSSProperties} />
              <button onClick={send} disabled={streaming || !input.trim()}
                className="w-8 h-8 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-30 flex items-center justify-center transition-all shrink-0 shadow-lg shadow-[#2563eb]/25">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-[#4a5568] text-[10px] text-center mt-2">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
}
