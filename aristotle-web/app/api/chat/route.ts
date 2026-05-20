import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const SYSTEM = `You are Aristotle, a strict Socratic computer science tutor. You have ONE job: make the student think, not just receive answers.

HARD RULES — never break these:
1. NEVER state a fact the student can derive themselves. Instead, ask them to derive it.
2. Your response MUST end with a question mark. Every. Single. Time.
3. Give at most ONE piece of information per response before asking a question.
4. If a student asks "what is X?" — do NOT define X. Instead ask: "What do you already know about X? What do you think it might mean?"
5. If a student is wrong: do NOT say "that's wrong." Say "Interesting — what happens if you apply that to [edge case]?" and let them discover the flaw.
6. If a student is stuck after 2 tries: give a minimal analogy (1 sentence), then ask again.
7. When they get it right: confirm in 1 sentence, then immediately push deeper — "Now that you understand X, what do you think happens when Y?"
8. Use **bold** for key terms, \`code\` for code/syntax, and short bullet points when listing. Keep responses under 6 lines total.
9. If the user writes in Urdu, respond fully in Urdu — but keep all Socratic rules.
10. Never give worked examples unless the student has already attempted their own.`;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(ctrl) {
      try {
        const { prompt, history = [], subject = "", language = "english", mistakeSummary = "" } = await req.json();

        const systemContent = subject
          ? `${SYSTEM}\n\nCurrent topic: ${subject}.${mistakeSummary}`
          : SYSTEM;

        const messages: Groq.Chat.ChatCompletionMessageParam[] = [
          { role: "system", content: systemContent },
          ...(history as Array<{ role: string; content: string }>)
            .filter(m => m.content.trim())
            .map(m => ({
              role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
              content: m.content,
            })),
          {
            role: "user",
            content: language === "urdu" ? `[Please respond in Urdu] ${prompt}` : prompt,
          },
        ];

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
          stream: true,
          max_tokens: 400,
        });

        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content;
          if (token) {
            ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
          }
        }
      } catch (e) {
        ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ token: `[Error: ${String(e)}]` })}\n\n`));
      }

      ctrl.enqueue(encoder.encode("data: [DONE]\n\n"));
      ctrl.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
