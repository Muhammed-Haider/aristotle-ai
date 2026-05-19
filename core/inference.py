"""
Core Inference Module - Aristotle AI
====================================
ONLY place where llama-cpp-python is called directly.
As per CONSTITUTION.md Section 3: "ui/ NEVER calls llama_cpp directly"

Exposes: ask(prompt, history) -> str
"""

from llama_cpp import Llama
from typing import Optional, List, Dict
import threading

# Phi-3 Mini chat template tokens
_SYS_START  = "<|system|>\n"
_SYS_END    = "<|end|>\n"
_USER_START = "<|user|>\n"
_USER_END   = "<|end|>\n"
_ASST_START = "<|assistant|>\n"
_ASST_END   = "<|end|>\n"

# Socratic system prompt — defines Aristotle's teaching personality
SYSTEM_PROMPT = """You are Aristotle, a Socratic computer science tutor. Your rules:
1. NEVER give the full answer immediately. Guide the student to find it themselves.
2. Ask 1-2 short guiding questions to make them think first.
3. If they are stuck, give one small hint then ask again.
4. When they get it right, confirm briefly and build on it.
5. Keep every response under 4 sentences plus your guiding question.
6. Use simple real-world analogies to explain abstract CS concepts.
7. Be warm, encouraging, and patient."""

# Stop tokens for Phi-3 Mini
_STOP_TOKENS = ["<|end|>", "<|user|>", "<|endoftext|>"]


class InferenceEngine:
    """
    Singleton inference engine for LLM interactions.
    Manages model loading, context, and response generation.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.llm: Optional[Llama] = None
        self.model_path = self._resolve_model_path()
        self.is_loaded = False
        self._initialized = True

    @staticmethod
    def _resolve_model_path() -> str:
        try:
            import json
            from pathlib import Path
            settings_file = Path("./data/settings.json")
            if settings_file.exists():
                s = json.loads(settings_file.read_text(encoding="utf-8"))
                if s.get("model_file"):
                    return s["model_file"]
        except Exception:
            pass
        return "./models/model_new.gguf"

    def load_model(self, model_path: Optional[str] = None) -> bool:
        """
        Load the GGUF model into memory.

        Args:
            model_path: Path to GGUF model file (default: ./models/model.gguf)

        Returns:
            bool: True if loaded successfully, False otherwise
        """
        if self.is_loaded:
            return True

        if model_path:
            self.model_path = model_path

        try:
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=4096,        # Context window size
                n_threads=4,       # CPU threads
                verbose=False      # Suppress llama.cpp logs
            )
            self.is_loaded = True
            return True

        except Exception as e:
            print(f"Error loading model: {e}")
            return False

    def ask(self, prompt: str, history: Optional[List[Dict[str, str]]] = None,
            max_tokens: int = 300) -> str:
        """
        Ask the LLM a question and get a response.

        Args:
            prompt: The question or prompt to send to the model
            history: Optional conversation history [{"role": "user", "content": "..."}]
            max_tokens: Maximum tokens to generate

        Returns:
            str: The model's response
        """
        if not self.is_loaded:
            if not self.load_model():
                return "Error: Model not loaded. Please check model file exists."

        try:
            # Format prompt with history if provided
            full_prompt = self._format_prompt(prompt, history)

            # Generate response
            output = self.llm(
                full_prompt,
                max_tokens=max_tokens,
                stop=_STOP_TOKENS,
                echo=False,
                temperature=0.7
            )

            response = output["choices"][0]["text"].strip()
            return response

        except Exception as e:
            return f"Error generating response: {str(e)}"

    def _format_prompt(self, prompt: str, history: Optional[List[Dict[str, str]]]) -> str:
        result = _SYS_START + SYSTEM_PROMPT + _SYS_END
        for turn in (history or [])[-6:]:
            if turn.get("role") == "user":
                result += _USER_START + turn["content"] + _USER_END
            else:
                result += _ASST_START + turn["content"] + _ASST_END
        result += _USER_START + prompt + _USER_END + _ASST_START
        return result

    def ask_stream(self, prompt: str, history: Optional[List[Dict[str, str]]] = None,
                   max_tokens: int = 300):
        """
        Generator that yields response tokens one by one for streaming display.
        Falls back to yielding a single error string if the model is not loaded.
        """
        if not self.is_loaded:
            if not self.load_model():
                yield "Error: Model not loaded. Please check model file exists."
                return

        try:
            full_prompt = self._format_prompt(prompt, history)
            stream = self.llm(
                full_prompt,
                max_tokens=max_tokens,
                stop=_STOP_TOKENS,
                echo=False,
                temperature=0.7,
                stream=True,
            )
            for chunk in stream:
                token = chunk["choices"][0]["text"]
                if token:
                    yield token
        except Exception as e:
            yield f"Error generating response: {str(e)}"

    def reload_model(self, model_path: str) -> bool:
        """Unload current model and load a new one."""
        self.unload_model()
        return self.load_model(model_path)

    def unload_model(self):
        """Unload the model from memory."""
        if self.llm:
            del self.llm
            self.llm = None
            self.is_loaded = False


# Global instance
_engine = InferenceEngine()


def ask(prompt: str, history: Optional[List[Dict[str, str]]] = None,
        max_tokens: int = 300) -> str:
    """
    Public API: Ask the AI a question.

    Args:
        prompt: The question to ask
        history: Optional conversation history
        max_tokens: Maximum response length

    Returns:
        str: AI response
    """
    return _engine.ask(prompt, history, max_tokens)


def ask_stream(prompt: str, history: Optional[List[Dict[str, str]]] = None,
               max_tokens: int = 300):
    """Public API: stream response tokens one by one."""
    return _engine.ask_stream(prompt, history, max_tokens)


def load_model(model_path: Optional[str] = None) -> bool:
    """
    Public API: Load the model.

    Args:
        model_path: Optional custom model path

    Returns:
        bool: True if successful
    """
    return _engine.load_model(model_path)


def is_model_loaded() -> bool:
    """Check if model is currently loaded."""
    return _engine.is_loaded


def reload_model(model_path: str) -> bool:
    """Public API: unload current model and load a different one."""
    return _engine.reload_model(model_path)
