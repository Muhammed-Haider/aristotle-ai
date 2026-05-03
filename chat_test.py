#!/usr/bin/env python3
"""
Interactive Chat Test - Aristotle AI
Quick script to test the model with custom questions
"""

from llama_cpp import Llama
import time

MODEL_PATH = "./models/model.gguf"

print("🤖 Loading model...")
start = time.perf_counter()

llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,
    n_threads=4,
    verbose=False
)

load_time = time.perf_counter() - start
print(f"✅ Model loaded in {load_time:.2f}s\n")
print("=" * 60)
print("Interactive Chat - Type 'quit' or 'exit' to stop")
print("=" * 60)

while True:
    # Get user question
    question = input("\n❓ You: ")

    if question.lower() in ['quit', 'exit', 'q']:
        print("\n👋 Goodbye!")
        break

    if not question.strip():
        continue

    # Generate response
    print("🤖 AI: ", end="", flush=True)

    start = time.perf_counter()
    output = llm(
        f"Q: {question}\nA:",
        max_tokens=300,
        stop=["Q:", "\n\n"],
        echo=False
    )

    response_time = time.perf_counter() - start
    response = output["choices"][0]["text"].strip()

    print(response)
    print(f"\n⏱️  ({response_time:.2f}s)")
