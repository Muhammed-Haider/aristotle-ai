"""
Language Detector - Aristotle AI
Detects whether text is in Urdu (Unicode block U+0600-U+06FF) or English.
Exposes: detect(text) -> "urdu" | "english"
"""


def detect(text: str) -> str:
    """Return 'urdu' if text contains Urdu script characters, else 'english'."""
    for char in text:
        if '؀' <= char <= 'ۿ':
            return "urdu"
    return "english"


def contains_urdu(text: str) -> bool:
    return detect(text) == "urdu"
