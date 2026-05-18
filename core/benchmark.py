"""
Hardware Benchmark - Aristotle AI
First-launch hardware detection: reads RAM, picks quantization tier, persists settings.
Exposes: is_first_launch(), get_settings(), save_setting(), run_benchmark()
"""

import json
import time
import psutil
from pathlib import Path

_SETTINGS_FILE = Path("./data/settings.json")

_DEFAULTS: dict = {
    "benchmark_done": False,
    "ram_gb": 0.0,
    "quantization_tier": "Q4_K_M",
    "language": "english",
}

TIER_DESCS = {
    "Q4_K_M": "Fast — best for 8 GB RAM devices",
    "Q5_K_M": "Balanced — 12–16 GB RAM devices",
    "Q8_0":   "Highest quality — 16 GB+ RAM devices",
}


def _load() -> dict:
    if _SETTINGS_FILE.exists():
        try:
            with open(_SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def _save(settings: dict) -> None:
    _SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(_SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, indent=2)


def is_first_launch() -> bool:
    return not _load().get("benchmark_done", False)


def get_settings() -> dict:
    merged = dict(_DEFAULTS)
    merged.update(_load())
    return merged


def save_setting(key: str, value) -> None:
    s = get_settings()
    s[key] = value
    _save(s)


def detect_ram_gb() -> float:
    return round(psutil.virtual_memory().total / (1024 ** 3), 1)


def pick_tier(ram_gb: float) -> str:
    if ram_gb >= 16:
        return "Q8_0"
    elif ram_gb >= 12:
        return "Q5_K_M"
    return "Q4_K_M"


def run_benchmark(progress_callback=None) -> dict:
    """
    Detect RAM, pick quantization tier, persist to settings.json.
    progress_callback(pct: int, message: str) called at key steps.
    Returns the completed settings dict.
    """

    def _emit(pct: int, msg: str) -> None:
        if progress_callback:
            progress_callback(pct, msg)

    _emit(20, "Reading system memory...")
    time.sleep(0.3)
    ram_gb = detect_ram_gb()

    _emit(60, f"Found {ram_gb} GB RAM — selecting model tier...")
    time.sleep(0.4)
    tier = pick_tier(ram_gb)

    _emit(90, "Saving settings...")
    time.sleep(0.2)

    s = get_settings()
    s.update({
        "benchmark_done": True,
        "ram_gb": ram_gb,
        "quantization_tier": tier,
    })
    _save(s)

    _emit(100, "Complete!")
    return s
