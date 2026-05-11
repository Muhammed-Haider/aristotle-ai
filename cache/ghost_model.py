"""
Ghost Model - Aristotle AI
Keyword-based cache lookup for pre-written CS concept analogies.
Per CONSTITUTION.md Section 3: cache/ghost_model.py
Exposes: lookup(query) -> str | None  (must return in < 100ms)
"""

import json
import time
from pathlib import Path

_ANALOGIES_FILE = Path("./cache/analogies.json")
_cache: dict | None = None


def _load() -> dict:
    global _cache
    if _cache is None:
        if _ANALOGIES_FILE.exists():
            with open(_ANALOGIES_FILE, "r", encoding="utf-8") as f:
                _cache = json.load(f)
        else:
            _cache = {}
    return _cache


def lookup(query: str) -> str | None:
    """
    Check if query contains a known CS concept keyword.
    Returns the pre-written analogy string if found, else None.
    Target: < 100ms (typically < 1ms in practice).
    """
    data = _load()
    query_lower = query.lower()
    for entry in data.values():
        for keyword in entry.get("keywords", []):
            if keyword in query_lower:
                return entry["analogy"]
    return None


def reload():
    """Force-reload the analogies file from disk."""
    global _cache
    _cache = None
    _load()
