// Database sync — pushes tracking data to Supabase in the background.
// All functions are fire-and-forget; failures are silent (localStorage is primary).

import { createClient } from "./supabase/client";
import { getUser } from "./auth";

async function uid(): Promise<string | null> {
  const u = getUser();
  return u?.id ?? null;
}

/* ── Day logs ── */
export async function syncDayLog(
  date: string,
  minutes: number,
  questions: number,
  topics: string[]
) {
  const userId = await uid();
  if (!userId) return;
  const supabase = createClient();
  await supabase.from("tracking_daylogs").upsert(
    { user_id: userId, date, minutes, questions, topics },
    { onConflict: "user_id,date" }
  );
}

/* ── Practice results ── */
export async function pushPracticeResult(
  subject: string,
  score: number,
  total: number,
  correct: number
) {
  const userId = await uid();
  if (!userId) return;
  const supabase = createClient();
  await supabase.from("tracking_practice").insert({
    user_id: userId,
    subject,
    score,
    total,
    correct,
  });
}

/* ── Mistakes ── */
export async function pushMistake(
  topic: string,
  question: string,
  userAnswer: string,
  correctAnswer: string
) {
  const userId = await uid();
  if (!userId) return;
  const supabase = createClient();
  await supabase.from("tracking_mistakes").insert({
    user_id:        userId,
    topic,
    question,
    user_answer:    userAnswer,
    correct_answer: correctAnswer,
  });
}

/* ── Pull all data from DB into localStorage on login ── */
export async function pullUserData() {
  const userId = await uid();
  if (!userId || typeof window === "undefined") return;
  const supabase = createClient();

  const [{ data: logs }, { data: practice }, { data: mistakes }] = await Promise.all([
    supabase
      .from("tracking_daylogs")
      .select("date,minutes,questions,topics")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(90),
    supabase
      .from("tracking_practice")
      .select("subject,score,total,correct,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("tracking_mistakes")
      .select("topic,question,user_answer,correct_answer")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // Merge into localStorage (DB wins for existing dates)
  if (logs && logs.length > 0) {
    localStorage.setItem("ar_daylogs", JSON.stringify(logs));
  }
  if (practice && practice.length > 0) {
    const mapped = practice.map((r) => ({
      date:    r.created_at,
      subject: r.subject,
      score:   r.score,
      total:   r.total,
      correct: r.correct,
    }));
    localStorage.setItem("ar_practice", JSON.stringify(mapped));
  }
  if (mistakes && mistakes.length > 0) {
    const mapped = mistakes.map((m) => ({
      topic:         m.topic,
      question:      m.question,
      userAnswer:    m.user_answer,
      correctAnswer: m.correct_answer,
    }));
    localStorage.setItem("ar_mistakes", JSON.stringify(mapped));
  }
}
