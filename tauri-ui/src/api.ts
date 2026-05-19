const BASE = "http://127.0.0.1:5748";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export function streamChat(
  prompt: string,
  history: { role: string; content: string }[],
  language: string,
  onToken: (t: string) => void,
  onDone: () => void,
  onError: (e: string) => void
): () => void {
  const ctrl = new AbortController();

  fetch(`${BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, history, language }),
    signal: ctrl.signal,
  }).then(async (res) => {
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
        const data = line.slice(6);
        if (data === "[DONE]") { onDone(); return; }
        try { onToken(JSON.parse(data).token); } catch { /* skip */ }
      }
    }
    onDone();
  }).catch((e) => {
    if (e.name !== "AbortError") onError(String(e));
  });

  return () => ctrl.abort();
}

export interface BenchmarkResult {
  benchmark_done: boolean;
  ram_gb: number;
  quantization_tier: string;
}

export function streamBenchmark(
  onProgress: (pct: number, msg: string) => void,
  onDone: (result: BenchmarkResult) => void,
  onError: (e: string) => void
): void {
  fetch(`${BASE}/benchmark/run`, { method: "POST" })
    .then(async (res) => {
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
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            const ev = JSON.parse(data);
            onProgress(ev.pct, ev.msg);
            if (ev.result) onDone(ev.result);
          } catch { /* skip */ }
        }
      }
    })
    .catch((e) => onError(String(e)));
}
