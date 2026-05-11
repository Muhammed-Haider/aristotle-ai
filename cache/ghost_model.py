"""
Ghost Model - Aristotle AI
Keyword-based cache lookup for analogies and pre-written quiz questions.
Per CONSTITUTION.md Section 3: cache/ghost_model.py
Exposes:
  lookup(query)            -> str | None   (analogy, < 100ms)
  lookup_quiz(topic, level) -> dict | None  (question dict, < 100ms)
"""

import json
import random
from pathlib import Path

_ANALOGIES_FILE = Path("./cache/analogies.json")
_QUIZ_FILE      = Path("./cache/quiz_questions.json")

_analogy_cache: dict | None = None
_quiz_cache: dict | None = None

# Per-session set of used questions per topic to avoid repeats
_used: dict[str, set] = {}


# ─────────────────────────────────────────────── analogy lookup ──

def _load_analogies() -> dict:
    global _analogy_cache
    if _analogy_cache is None:
        if _ANALOGIES_FILE.exists():
            with open(_ANALOGIES_FILE, "r", encoding="utf-8") as f:
                _analogy_cache = json.load(f)
        else:
            _analogy_cache = {}
    return _analogy_cache


def lookup(query: str) -> str | None:
    """
    Check if query contains a known CS concept keyword.
    Returns the pre-written analogy string if found, else None.
    Target: < 100ms (typically < 1ms in practice).
    """
    data = _load_analogies()
    query_lower = query.lower()
    for entry in data.values():
        for keyword in entry.get("keywords", []):
            if keyword in query_lower:
                return entry["analogy"]
    return None


# ──────────────────────────────────────────── quiz question lookup ──

def _load_quiz() -> dict:
    global _quiz_cache
    if _quiz_cache is None:
        if _QUIZ_FILE.exists():
            with open(_QUIZ_FILE, "r", encoding="utf-8") as f:
                _quiz_cache = json.load(f)
        else:
            _quiz_cache = {}
    return _quiz_cache


def lookup_quiz(topic: str, level: str = "Intermediate") -> dict | None:
    """
    Return a cached question for the topic, preferring the given level.
    Avoids repeating questions within the same session.
    Returns dict {"question": str, "topic": str, "level": str} or None.
    """
    data = _load_quiz()

    # Find the matching topic key (case-insensitive, partial match allowed)
    questions = data.get(topic)
    if not questions:
        topic_lower = topic.lower()
        for key, val in data.items():
            if key.lower() == topic_lower or key.lower() in topic_lower or topic_lower in key.lower():
                questions = val
                topic = key
                break

    if not questions:
        return None

    used_indices = _used.setdefault(topic, set())

    # Prefer matching level; fall back to any level
    preferred = [i for i, q in enumerate(questions) if q.get("level") == level and i not in used_indices]
    fallback  = [i for i, q in enumerate(questions) if i not in used_indices]
    pool      = preferred if preferred else fallback

    # All questions used this session — reset and start over
    if not pool:
        _used[topic] = set()
        pool = list(range(len(questions)))

    idx = random.choice(pool)
    _used[topic].add(idx)

    q = questions[idx]
    return {"question": q["question"], "topic": topic, "level": q.get("level", level)}


def reload():
    """Force-reload both cache files from disk."""
    global _analogy_cache, _quiz_cache
    _analogy_cache = None
    _quiz_cache    = None
    _load_analogies()
    _load_quiz()
