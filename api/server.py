"""
Aristotle AI — FastAPI backend
Wraps all existing Python modules and exposes them over HTTP + SSE.
Run: python -m api.server
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

import core.benchmark as benchmark

app = FastAPI(title="Aristotle AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:1420", "tauri://localhost"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── request models ────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    prompt: str
    history: list[dict] = []
    language: str = "english"

class AuthRequest(BaseModel):
    email: str
    password: str
    name: str = ""

class SettingRequest(BaseModel):
    key: str
    value: str


# ── chat ──────────────────────────────────────────────────────────────────────

@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    from cache.ghost_model import lookup
    from core.inference import ask_stream
    from core.language_detector import detect, contains_urdu

    language = req.language
    if language == "auto":
        language = "urdu" if contains_urdu(req.prompt) else "english"

    cached = lookup(req.prompt)
    if cached:
        async def _cached():
            yield f"data: {json.dumps({'token': cached})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(_cached(), media_type="text/event-stream")

    history = req.history

    def _generate():
        for token in ask_stream(req.prompt, history):
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(_generate(), media_type="text/event-stream")


# ── auth ──────────────────────────────────────────────────────────────────────

@app.post("/auth/register")
def auth_register(req: AuthRequest):
    from auth.auth_manager import register
    ok, msg = register(req.email, req.password)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "email": req.email, "name": req.name or req.email}

@app.post("/auth/login")
def auth_login(req: AuthRequest):
    from auth.auth_manager import login, _save_session
    ok, msg = login(req.email, req.password)
    if not ok:
        raise HTTPException(status_code=401, detail=msg)
    _save_session(req.email)
    return {"success": True, "email": req.email, "name": req.email}

@app.post("/auth/logout")
def auth_logout():
    from auth.auth_manager import clear_session
    clear_session()
    return {"success": True}

@app.get("/auth/session")
def auth_session():
    from auth.auth_manager import get_session
    email = get_session()
    if not email:
        return {}
    return {"email": email, "name": email}


# ── passport ──────────────────────────────────────────────────────────────────

@app.get("/passport")
def passport():
    from auth.auth_manager import get_session
    from passport.mastery_store import get_all
    email = get_session()
    if not email:
        return {"topics": {}, "total_questions": 0, "streak": 0}
    data = get_all(email)
    return data or {"topics": {}, "total_questions": 0, "streak": 0}


# ── quiz ──────────────────────────────────────────────────────────────────────

@app.get("/quiz")
def quiz(topic: Optional[str] = "programming"):
    from core.quiz_engine import generate_question
    return generate_question(topic or "programming")

@app.post("/quiz/evaluate")
def quiz_evaluate(question: str, answer: str, topic: str = "programming"):
    from core.quiz_engine import evaluate_answer
    return evaluate_answer(question, answer, topic)


# ── settings ──────────────────────────────────────────────────────────────────

@app.get("/settings")
def settings():
    return benchmark.get_settings()

@app.post("/settings")
def save_setting(req: SettingRequest):
    val = req.value
    if req.key == "model_file":
        from core.inference import reload_model
        benchmark.save_setting(req.key, val)
        reload_model(val)
    else:
        benchmark.save_setting(req.key, val)
    return {"success": True}

@app.get("/models")
def list_models():
    models_dir = Path("./models")
    result = []
    for f in sorted(models_dir.glob("*.gguf")):
        size_mb = f.stat().st_size / (1024 * 1024)
        result.append({
            "name": f.name,
            "path": str(f),
            "size_mb": round(size_mb, 1),
            "size_label": f"{size_mb/1024:.1f} GB" if size_mb >= 1024 else f"{size_mb:.0f} MB",
            "speed": "fast" if size_mb < 1000 else "quality",
        })
    return result


# ── benchmark ─────────────────────────────────────────────────────────────────

class TierRequest(BaseModel):
    tier: str

@app.get("/benchmark/status")
def benchmark_status():
    s = benchmark.get_settings()
    return {
        "benchmark_done": s.get("benchmark_done", False),
        "ram_gb": s.get("ram_gb", 0.0),
        "quantization_tier": s.get("quantization_tier", "Q4_K_M"),
    }

@app.post("/benchmark/run")
async def benchmark_run():
    """Stream benchmark progress as SSE events."""
    import asyncio, threading

    loop = asyncio.get_event_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def _cb(pct: int, msg: str):
        loop.call_soon_threadsafe(queue.put_nowait, {"pct": pct, "msg": msg})

    def _work():
        result = benchmark.run_benchmark(_cb)
        loop.call_soon_threadsafe(queue.put_nowait, {"pct": 100, "msg": "Complete!", "result": result})
        loop.call_soon_threadsafe(queue.put_nowait, None)

    threading.Thread(target=_work, daemon=True).start()

    async def _stream():
        while True:
            event = await queue.get()
            if event is None:
                yield "data: [DONE]\n\n"
                break
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(_stream(), media_type="text/event-stream")

@app.post("/benchmark/set-tier")
def benchmark_set_tier(req: TierRequest):
    benchmark.save_setting("quantization_tier", req.tier)
    return {"success": True, "quantization_tier": req.tier}


# ── entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5748, log_level="error")
