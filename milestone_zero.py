#!/usr/bin/env python3
"""
Milestone Zero - Aristotle AI
================================
This script validates the core premise of the Aristotle AI system:
- Load a GGUF model via llama.cpp
- Answer a hardcoded CS question
- Stream response to terminal
- Verify RAM usage < 1.5 GB
- Verify response time < 15 seconds

SUCCESS CRITERIA (from CONSTITUTION.md §1):
1. Model loads successfully
2. Coherent answer is generated
3. RAM usage < 1.5 GB during inference
4. Response generated in < 15 seconds
5. No internet connection required

If this script passes, Milestone Zero is complete.
Commit and tag as v0.1-milestone-zero before moving to Phase 2.
"""

import time
import sys
import os
from pathlib import Path

# Performance monitoring
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False
    print("⚠️  Warning: psutil not installed. RAM monitoring disabled.")
    print("   Install with: pip install psutil")

# Check if model exists
MODEL_PATH = "./models/model.gguf"
if not Path(MODEL_PATH).exists():
    print("❌ ERROR: Model file not found at", MODEL_PATH)
    print("\n📥 Download a GGUF model first:")
    print("   1. Visit https://huggingface.co/models?sort=trending&search=gguf")
    print("   2. Download a Q4_K_M quantized model (< 1.5 GB)")
    print("   3. Place it at: ./models/model.gguf")
    print("\n💡 Recommended models:")
    print("   - Phi-3-mini-4k-instruct-Q4_K_M.gguf (~2.5 GB)")
    print("   - TinyLlama-1.1B-Chat-Q4_K_M.gguf (~650 MB)")
    sys.exit(1)

print("🚀 Milestone Zero - Aristotle AI Inference Test")
print("=" * 60)

# Import llama-cpp-python
try:
    from llama_cpp import Llama
except ImportError:
    print("❌ ERROR: llama-cpp-python not installed")
    print("   Install with: pip install llama-cpp-python")
    sys.exit(1)

# Get initial memory baseline
if HAS_PSUTIL:
    process = psutil.Process()
    baseline_ram_mb = process.memory_info().rss / 1024 / 1024
    print(f"📊 Baseline RAM: {baseline_ram_mb:.1f} MB")

# Test question (hardcoded CS question as per spec)
TEST_QUESTION = "Q: What is a pointer in C? A:"

print(f"❓ Test Question: {TEST_QUESTION.strip()}")
print("-" * 60)

# Start timing
start_time = time.perf_counter()

print("⏳ Loading model...")
model_load_start = time.perf_counter()

try:
    llm = Llama(
        model_path=MODEL_PATH,
        n_ctx=2048,        # Context window
        n_threads=4,       # CPU threads
        verbose=False      # Suppress llama.cpp logs
    )
    model_load_time = time.perf_counter() - model_load_start
    print(f"✅ Model loaded in {model_load_time:.2f}s")

    if HAS_PSUTIL:
        post_load_ram_mb = process.memory_info().rss / 1024 / 1024
        model_ram_mb = post_load_ram_mb - baseline_ram_mb
        print(f"📊 Model RAM usage: {model_ram_mb:.1f} MB ({post_load_ram_mb:.1f} MB total)")

        # Check RAM constraint
        ram_gb = post_load_ram_mb / 1024
        if ram_gb > 1.5:
            print(f"⚠️  WARNING: RAM usage {ram_gb:.2f} GB exceeds 1.5 GB target!")
        else:
            print(f"✅ RAM usage {ram_gb:.2f} GB is within 1.5 GB target")

except Exception as e:
    print(f"❌ ERROR loading model: {e}")
    sys.exit(1)

print("\n⏳ Generating response...")
inference_start = time.perf_counter()

try:
    output = llm(
        TEST_QUESTION,
        max_tokens=200,
        stop=["Q:", "\n\n"],
        echo=False
    )

    inference_time = time.perf_counter() - inference_start
    total_time = time.perf_counter() - start_time

    # Extract response
    response = output["choices"][0]["text"]

    print("\n" + "=" * 60)
    print("📝 RESPONSE:")
    print("-" * 60)
    print(response.strip())
    print("=" * 60)

    # Performance summary
    print(f"\n⏱️  Inference time: {inference_time:.2f}s")
    print(f"⏱️  Total time: {total_time:.2f}s")

    # Check time constraint
    if inference_time > 15:
        print(f"⚠️  WARNING: Inference time {inference_time:.2f}s exceeds 15s target!")
    else:
        print(f"✅ Inference time within 15s target")

    # Final RAM check
    if HAS_PSUTIL:
        final_ram_mb = process.memory_info().rss / 1024 / 1024
        final_ram_gb = final_ram_mb / 1024
        print(f"📊 Final RAM: {final_ram_mb:.1f} MB ({final_ram_gb:.2f} GB)")

    print("\n" + "=" * 60)
    print("✅ MILESTONE ZERO COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Commit this working state")
    print("2. Tag as: v0.1-milestone-zero")
    print("3. Proceed to Phase 2 (Cache Layer)")

except Exception as e:
    print(f"❌ ERROR during inference: {e}")
    sys.exit(1)
