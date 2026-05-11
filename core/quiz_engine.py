"""
Quiz Engine - Aristotle AI
LLM-backed question generation and answer evaluation.
Per CONSTITUTION.md Phase 6.
Exposes: generate_question(topic, level), evaluate_answer(question, answer, topic)
"""

import core.inference as inference
import cache.ghost_model as ghost_model


def generate_question(topic: str, level: str = "Intermediate") -> dict:
    """
    Return a quiz question for topic/level.
    Checks the pre-written cache first; falls back to LLM generation on a miss.
    Returns: {"question": str, "topic": str, "level": str}
    """
    cached = ghost_model.lookup_quiz(topic, level)
    if cached:
        return cached

    prompt = (
        f"Generate one {level}-level Computer Science quiz question about {topic}. "
        f"Write only the question — no answer, no explanation, no numbering."
    )
    question = inference.ask(prompt, max_tokens=120).strip()
    return {"question": question, "topic": topic, "level": level}


def evaluate_answer(question: str, answer: str, topic: str) -> dict:
    """
    Evaluate a student's answer using the LLM.
    Returns: {"score": int (0-100), "feedback": str, "correct": bool}
    """
    prompt = (
        f"Topic: {topic}\n"
        f"Question: {question}\n"
        f"Student answer: {answer}\n\n"
        f"Evaluate the answer. Respond in exactly this format:\n"
        f"SCORE: <0-100>\n"
        f"FEEDBACK: <one sentence of constructive feedback>"
    )
    raw = inference.ask(prompt, max_tokens=120).strip()

    score = 50
    feedback = "Could not parse evaluation."

    for line in raw.splitlines():
        line = line.strip()
        if line.upper().startswith("SCORE:"):
            try:
                score = max(0, min(100, int(line.split(":", 1)[1].strip())))
            except (ValueError, IndexError):
                pass
        elif line.upper().startswith("FEEDBACK:"):
            feedback = line.split(":", 1)[1].strip()

    return {"score": score, "feedback": feedback, "correct": score >= 60}
