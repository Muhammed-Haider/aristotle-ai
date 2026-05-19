import { useState, useRef, useEffect } from "react";
import { streamChat } from "../api";

interface Message { role: "user" | "assistant"; content: string; }

interface Props { user: { email: string; name: string }; }

export default function ChatScreen({ user }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [language, setLanguage] = useState<"english" | "urdu">("english");
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

    const userMsg: Message = { role: "user", content: text };
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "" }]);
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h2 className="text-white font-semibold text-sm">Chat with Aristotle</h2>
          <p className="text-slate-500 text-xs mt-0.5">Socratic CS tutor · offline</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {(["english", "urdu"] as const).map(l => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                language === l ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {l === "english" ? "English" : "اردو"}
            </button>
          ))}
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-500/20">
              A
            </div>
            <p className="text-slate-400 text-sm text-center max-w-xs">
              Ask me anything about Computer Science.<br />
              I'll guide you to the answer, Socratically.
            </p>
            {["What is a pointer?", "Explain recursion", "How does hashing work?"].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                className="text-xs text-slate-500 hover:text-blue-400 border border-white/8 hover:border-blue-500/40 px-4 py-2 rounded-full transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
              msg.role === "user"
                ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white"
                : "bg-white/10 text-slate-300"
            }`}>
              {msg.role === "user" ? (user.name || user.email)[0].toUpperCase() : "A"}
            </div>
            <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-600/20 border border-blue-500/30 text-slate-100 rounded-tr-sm"
                : "bg-white/5 border border-white/8 text-slate-200 rounded-tl-sm"
            } ${language === "urdu" && msg.role === "assistant" ? "text-right" : ""}`}
              dir={language === "urdu" && msg.role === "assistant" ? "rtl" : "ltr"}
            >
              {msg.content || (
                <span className="flex gap-1 items-center h-4">
                  {[0,1,2].map(d => <span key={d} className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />)}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="px-6 pb-6 pt-3 border-t border-white/5">
        <div className="flex gap-3 items-end glass rounded-2xl px-4 py-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={language === "urdu" ? "یہاں لکھیں…" : "Ask a CS question…"}
            dir={language === "urdu" ? "rtl" : "ltr"}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none max-h-32 leading-relaxed"
            style={{ fieldSizing: "content" } as any}
          />
          <button
            onClick={send} disabled={streaming || !input.trim()}
            className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 flex items-center justify-center transition-all shrink-0 shadow-md shadow-blue-500/30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-slate-600 text-[10px] mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
