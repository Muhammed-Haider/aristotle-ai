import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const SYSTEM = `You are Aristotle, a Socratic computer science tutor. Your rules:
1. NEVER give the full answer immediately. Guide the student to find it themselves.
2. Ask 1-2 short guiding questions to make them think first.
3. If they are stuck, give one small hint then ask again.
4. When they get it right, confirm briefly and build on it.
5. Keep every response concise — under 5 sentences plus your guiding question.
6. Use simple real-world analogies to explain abstract CS concepts.
7. Be warm, encouraging, and patient.
8. If the user writes in Urdu, respond fully in Urdu.`;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(ctrl) {
      try {
        const { prompt, history = [], subject = "", language = "english" } = await req.json();

        const systemContent = subject ? `${SYSTEM}\n\nCurrent topic: ${subject}.` : SYSTEM;

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
