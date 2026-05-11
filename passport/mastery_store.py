"""
Mastery Store - Aristotle AI
Local JSON store for topic scores and quiz history.
Per CONSTITUTION.md Section 3: passport/mastery_store.py
Exposes: update, get, get_all, reset
"""

import json
from datetime import datetime
from pathlib import Path

DATA_DIR      = Path("./data")
PASSPORT_FILE = DATA_DIR / "passport.json"


def _load() -> dict:
    if not PASSPORT_FILE.exists():
        return {}
    with open(PASSPORT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(data: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    with open(PASSPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def update(email: str, topic: str, score: int) -> None:
    """Record a quiz result. Score 0–100."""
    data = _load()
    if email not in data:
        data[email] = {}
    if topic not in data[email]:
        data[email][topic] = {"scores": [], "best": 0, "attempts": 0}

    entry = data[email][topic]
    entry["scores"].append({
        "score": score,
        "timestamp": datetime.utcnow().isoformat(),
    })
    entry["attempts"] += 1
    entry["best"] = max(entry["best"], score)
    _save(data)


def get(email: str, topic: str) -> dict:
    """Get mastery data for one topic."""
    data = _load()
    return data.get(email, {}).get(topic, {"scores": [], "best": 0, "attempts": 0})


def get_all(email: str) -> dict:
    """Get all topic mastery data for a user."""
    return _load().get(email, {})


def reset(email: str, topic: str) -> None:
    """Reset mastery data for a topic."""
    data = _load()
    if email in data and topic in data[email]:
        del data[email][topic]
        _save(data)
