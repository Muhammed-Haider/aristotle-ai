// Tracking module — all real usage data persisted in localStorage
// SSR-safe: all localStorage access is guarded by typeof window check

export interface PracticeResult {
  date: string;
  subject: string;
  score: number;
  total: number;
  correct: number;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  minutes: number;
  questions: number;
  topics: string[];
}

interface Mistake {
  topic: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

type Messages = { role: "user" | "assistant"; content: string }[];

const KEY_PRACTICE = "ar_practice";
const KEY_DAYLOGS  = "ar_daylogs";
const KEY_TOPICS   = "ar_topics";
const KEY_MISTAKES = "ar_mistakes";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function save(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ────────── Day Log helpers ────────── */

function mutateTodayLog(cb: (log: DayLog) => void) {
  const t = todayKey();
  const logs = load<DayLog[]>(KEY_DAYLOGS, []);
  let log = logs.find(l => l.date === t);
  if (!log) {
    log = { date: t, minutes: 0, questions: 0, topics: [] };
    logs.push(log);
  }
  cb(log);
  save(KEY_DAYLOGS, logs.slice(-90));
}

export function trackTime(minutes: number, topicKey?: string) {
  mutateTodayLog(log => {
    log.minutes += minutes;
    if (topicKey && !log.topics.includes(topicKey)) log.topics.push(topicKey);
  });
}

export function getDayLogs(): DayLog[] {
  return load<DayLog[]>(KEY_DAYLOGS, []);
}

export function getStreak(): number {
  const dates = new Set(getDayLogs().map(l => l.date));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if (!dates.has(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getTodayStats(): { minutes: number; questions: number; topics: number } {
  const t = todayKey();
  const log = getDayLogs().find(l => l.date === t);
  return {
    minutes:   log?.minutes   ?? 0,
    questions: log?.questions ?? 0,
    topics:    log?.topics.length ?? 0,
  };
}

export function getWeeklyMinutes(): number[] {
  const logs = getDayLogs();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return logs.find(l => l.date === d.toISOString().slice(0, 10))?.minutes ?? 0;
  });
}

/* ────────── Practice results ────────── */

export function recordPractice(subject: string, score: number, total: number, correct: number) {
  const results = load<PracticeResult[]>(KEY_PRACTICE, []);
  results.push({ date: new Date().toISOString(), subject, score, total, correct });
  save(KEY_PRACTICE, results.slice(-500));
  mutateTodayLog(log => { log.questions += total; });
}

export function getPracticeResults(): PracticeResult[] {
  return load<PracticeResult[]>(KEY_PRACTICE, []);
}

export function getMasteryForSubject(subject: string): number | null {
  const all = getPracticeResults().filter(r =>
    r.subject.toLowerCase().includes(subject.toLowerCase().split(" ")[0]) ||
    subject.toLowerCase().includes(r.subject.toLowerCase().split(" ")[0])
  );
  if (all.length === 0) return null;
  const recent = all.slice(-5);
  return Math.round(recent.reduce((a, r) => a + r.score, 0) / recent.length);
}

export function getTotalXP(): number {
  const quizXP = getPracticeResults().reduce((a, r) => a + r.correct * 10, 0);
  const timeXP = getDayLogs().reduce((a, l) => a + l.minutes * 2, 0);
  return Math.min(quizXP + timeXP, 99999);
}

export function getTotalQuestions(): number {
  return getPracticeResults().reduce((a, r) => a + r.total, 0);
}

export function getAvgAccuracy(): number {
  const results = getPracticeResults();
  if (results.length === 0) return 0;
  return Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
}

/* ────────── Mistakes / adaptive memory ────────── */

export function recordMistake(
  topic: string, question: string, userAnswer: string, correctAnswer: string
) {
  const mistakes = load<Mistake[]>(KEY_MISTAKES, []);
  mistakes.push({ topic, question, userAnswer, correctAnswer });
  save(KEY_MISTAKES, mistakes.slice(-50));
}

export function getMistakeSummary(subject?: string): string {
  const mistakes = load<Mistake[]>(KEY_MISTAKES, []);
  const relevant = subject
    ? mistakes.filter(m => m.topic.toLowerCase().includes(subject.toLowerCase().split(" ")[0]))
    : mistakes;
  if (relevant.length === 0) return "";
  const items = relevant
    .slice(-5)
    .map(m => `- In ${m.topic}: student chose "${m.userAnswer}" but correct was "${m.correctAnswer}"`)
    .join("\n");
  return `\n\nStudent's recent practice mistakes — gently surface these gaps via Socratic questions:\n${items}`;
}

/* ────────── Chat history per topic ────────── */

export function getChatHistory(topicKey: string): Messages {
  const sessions = load<Record<string, { messages: Messages }>>(KEY_TOPICS, {});
  return sessions[topicKey]?.messages ?? [];
}

export function saveChatHistory(topicKey: string, messages: Messages) {
  if (messages.length === 0) return;
  const sessions = load<Record<string, { messages: Messages; lastVisit: string }>>(KEY_TOPICS, {});
  sessions[topicKey] = {
    messages:  messages.filter(m => m.content.trim()).slice(-60),
    lastVisit: new Date().toISOString(),
  };
  save(KEY_TOPICS, sessions);
}

export function clearChatHistory(topicKey: string) {
  const sessions = load<Record<string, unknown>>(KEY_TOPICS, {});
  delete sessions[topicKey];
  save(KEY_TOPICS, sessions);
}
