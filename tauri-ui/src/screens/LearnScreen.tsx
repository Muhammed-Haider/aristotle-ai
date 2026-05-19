import { useState, useRef, useEffect } from "react";
import { streamChat } from "../api";

interface Message { role: "user" | "assistant"; content: string; }
interface Props { user: { email: string; name: string }; }

const SUBJECTS = [
  "DSA - Graph Algorithms",
  "DSA - Dynamic Programming",
  "DSA - Trees & Heaps",
  "Operating Systems - Process Management",
  "Operating Systems - Memory Management",
  "Computer Networks - TCP/IP Model",
  "Computer Networks - Routing Protocols",
  "Database Systems - SQL & Normalization",
  "Database Systems - Transactions & Indexing",
  "OOP - Design Patterns",
  "Theory of Computation - Automata",
  "Compiler Design - Parsing",
];

export default function LearnScreen({ user }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [language, setLanguage] = useState<"english" | "urdu">("english");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState("Standard");
  const bottomRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);
    cancelRef.current = streamChat(
      text, history, language,
      (token) => setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + token };
        return copy;
      }),
      () => setStreaming(false),
      (err) => { setStreaming(false); console.error(err); }
    );
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#1e2a3e]">
        <div>
          <h1 className="text-xl font-bold text-white">Learn with AI</h1>
          <p className="text-[#8899b0] text-xs mt-0.5">Interactive AI-powered learning experience</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-[#131c2e] rounded-lg p-1 border border-[#1e2a3e]">
            {(["english", "urdu"] as const).map(l => (
              <button key={l} onClick={() => setLanguage(l)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${language === l ? "bg-[#2563eb] text-white" : "text-[#8899b0] hover:text-white"}`}>
                {l === "english" ? "English" : "اردو"}
              </button>
            ))}
          </div>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
            className="bg-[#131c2e] border border-[#1e2a3e] text-[#e2e8f0] text-xs px-3 py-1.5 rounded-lg outline-none">
            {["Beginner", "Standard", "Advanced"].map(d => <option key={d}>{d}</option>)}
          </select>
          <button className="px-4 py-1.5 rounded-lg bg-[#2563eb] text-white text-xs font-medium">Start Session</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* left: content panel */}
        <div className="w-80 shrink-0 flex flex-col border-r border-[#1e2a3e] overflow-y-auto">
          <div className="p-4 border-b border-[#1e2a3e]">
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full bg-[#131c2e] border border-[#1e2a3e] text-[#e2e8f0] text-sm px-3 py-2 rounded-lg outline-none">
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="p-4 flex-1">
            <div className="text-[#8899b0] text-xs mb-3 uppercase tracking-wider">Topic Overview</div>
            {messages.length === 0 ? (
              <div className="text-[#4a5568] text-sm text-center mt-8">
                <div className="text-3xl mb-3">📖</div>
                <p>Start a conversation to explore this topic with Aristotle</p>
              </div>
            ) : (
              <div className="text-[#c8d3e0] text-sm leading-relaxed space-y-3">
                <p className="font-medium text-white">{subject}</p>
                <p className="text-[#8899b0] text-xs">{messages.length} messages in this session</p>
              </div>
            )}

            <div className="mt-6">
              <div className="text-[#8899b0] text-xs mb-2 uppercase tracking-wider">Quick Questions</div>
              {["Explain the key concept", "Give me an example", "What's the formula?"].map(q => (
                <button key={q} onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                  className="w-full text-left text-xs text-[#8899b0] hover:text-[#2563eb] px-3 py-2 rounded-lg hover:bg-[#131c2e] transition-all mb-1 border border-transparent hover:border-[#1e2a3e]">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* right: chat */}
        <div className="flex-1 flex flex-col">
          {/* messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 fade-in">
                <div className="w-14 h-14 rounded-2xl bg-[#2563eb] flex items-center justify-center shadow-xl"
                  style={{ boxShadow: "0 0 30px rgba(37,99,235,0.4)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.14z"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.14z"/>
                  </svg>
                </div>
                <p className="text-[#8899b0] text-sm text-center max-w-xs leading-relaxed">
                  Aristotle is ready to teach. Ask a question about <strong className="text-white">{subject}</strong>
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${msg.role === "user" ? "bg-[#2563eb] text-white" : "bg-[#131c2e] text-[#8899b0] border border-[#1e2a3e]"}`}>
                  {msg.role === "user" ? (user.name || user.email)[0].toUpperCase() : "A"}
                </div>
                <div className={`max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#2563eb]/20 border border-[#2563eb]/30 text-[#e2e8f0] rounded-tr-sm"
                    : "bg-[#131c2e] border border-[#1e2a3e] text-[#c8d3e0] rounded-tl-sm"
                }`}
                  dir={language === "urdu" && msg.role === "assistant" ? "rtl" : "ltr"}>
                  {msg.content || (
                    <span className="flex gap-1 items-center h-4">
                      {[0,1,2].map(d => <span key={d} className="typing-dot w-1.5 h-1.5 rounded-full bg-[#8899b0] inline-block" />)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="px-6 pb-5 pt-3 border-t border-[#1e2a3e]">
            <div className="flex gap-3 items-end bg-[#131c2e] border border-[#1e2a3e] rounded-xl px-4 py-3 focus-within:border-[#2563eb] transition-colors">
              <textarea ref={textareaRef} rows={1} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                placeholder={language === "urdu" ? "یہاں سوال لکھیں…" : "Ask a question about this topic…"}
                dir={language === "urdu" ? "rtl" : "ltr"}
                className="flex-1 bg-transparent text-sm text-white placeholder-[#4a5568] outline-none resize-none max-h-32 leading-relaxed"
                style={{ fieldSizing: "content" } as any} />
              <button onClick={send} disabled={streaming || !input.trim()}
                className="w-8 h-8 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-30 flex items-center justify-center transition-all shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex gap-3">
                <button className="text-[#8899b0] hover:text-white text-xs transition-colors">Previous Quiz</button>
                <button className="text-[#8899b0] hover:text-white text-xs transition-colors">Save Notes</button>
                <button className="text-[#8899b0] hover:text-white text-xs transition-colors">Share</button>
              </div>
              <p className="text-[#4a5568] text-[10px]">Enter to send · Shift+Enter new line</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
