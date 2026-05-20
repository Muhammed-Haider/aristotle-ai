import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { topic = "Data Structures", difficulty = "Standard" } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Generate a ${difficulty.toLowerCase()} level Computer Science quiz question about "${topic}".
Return ONLY raw JSON — no markdown, no code fences, no extra text:
{
  "question": "the full question text",
  "options": ["A) first option", "B) second option", "C) third option", "D) fourth option"],
  "correct": "A",
  "explanation": "clear explanation of why the answer is correct"
}`,
        },
      ],
      max_tokens: 400,
    });

    const text = (completion.choices[0]?.message?.content ?? "")
      .trim()
      .replace(/^```json?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    return Response.json(JSON.parse(text));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
