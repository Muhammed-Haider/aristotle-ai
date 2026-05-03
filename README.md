# Aristotle AI - Offline Socratic CS Tutor

An offline, locally-running desktop application for Computer Science education using AI-powered Socratic dialogue.

**Status:** ✅ Phase 5 - UI Shell (Desktop App Ready)

---

## 🚀 Quick Start - Run the Desktop App

**1. Create virtual environment:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

**2. Install dependencies:**
```bash
pip install -r requirements.txt
```

Or use prebuilt wheel for faster installation:
```bash
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu
pip install PyQt6 psutil
```

**3. Download AI model:**
- Download [TinyLlama Q2_K](https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF) (~400 MB)
- Place as: `./models/model.gguf`

**4. Run the app:**
```bash
python main.py
```

That's it! The desktop app will open with a login screen, then you can start chatting with the AI tutor.

---

## 🎯 Project Vision

Aristotle AI is a fully offline AI tutor that:
- Runs entirely on your local machine (no internet required after setup)
- Uses Socratic questioning to teach CS concepts
- Tracks your learning progress with a "Mastery Passport"
- Works on modest hardware (Core i5, 8 GB RAM minimum)

---

## 📋 Milestone Zero - Quick Start

**Goal:** Verify that local LLM inference works on your hardware.

### Prerequisites

- Python 3.9 or higher
- 8 GB RAM minimum
- 10 GB free disk space
- Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** On Windows, `llama-cpp-python` may require Visual Studio C++ Build Tools. If installation fails:
1. Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Install "Desktop development with C++"
3. Retry `pip install llama-cpp-python`

### Step 2: Download a GGUF Model

You need a quantized GGUF model file. **Recommended options:**

#### Option A: Small Model (Fastest, ~650 MB)
**TinyLlama 1.1B - Q4_K_M**
```bash
# Create models directory
mkdir -p models

# Download TinyLlama (replace with actual download link)
# Visit: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF
# Download: tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
# Move to: ./models/model.gguf
```

#### Option B: Better Quality (~2.5 GB)
**Phi-3 Mini - Q4_K_M**
```bash
# Visit: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf
# Download: Phi-3-mini-4k-instruct-q4.gguf
# Rename and move to: ./models/model.gguf
```

#### Option C: Manual Download Steps
1. Visit https://huggingface.co/models?search=gguf&sort=trending
2. Search for models with "Q4_K_M" in the name
3. Download a file under 3 GB
4. Place it at: `./models/model.gguf`

**Important:** The script expects the model at `./models/model.gguf` (exact path)

### Step 3: Run Milestone Zero

```bash
python milestone_zero.py
```

**Expected output:**
```
🚀 Milestone Zero - Aristotle AI Inference Test
============================================================
📊 Baseline RAM: 45.2 MB
❓ Test Question: Q: What is a pointer in C? A:
------------------------------------------------------------
⏳ Loading model...
✅ Model loaded in 2.34s
📊 Model RAM usage: 892.3 MB (937.5 MB total)
✅ RAM usage 0.92 GB is within 1.5 GB target

⏳ Generating response...

============================================================
📝 RESPONSE:
------------------------------------------------------------
A pointer in C is a variable that stores the memory address
of another variable. It allows indirect access to data...
============================================================

⏱️  Inference time: 8.45s
⏱️  Total time: 10.79s
✅ Inference time within 15s target
📊 Final RAM: 945.2 MB (0.92 GB)

============================================================
✅ MILESTONE ZERO COMPLETE!
============================================================
```

### Success Criteria

Milestone Zero passes if:
- ✅ Model loads without errors
- ✅ A coherent answer is generated
- ✅ RAM usage < 1.5 GB
- ✅ Response time < 15 seconds
- ✅ No internet connection used

---

## 🏗️ Project Structure

```
aristotle-ai/
├── core/              # LLM inference engine (Phase 1)
├── cache/             # Ghost-Model cache (Phase 2)
├── auth/              # User authentication (Phase 3)
├── passport/          # Mastery Passport (Phase 4)
├── ui/                # PyQt6 interface (Phase 5)
├── models/            # GGUF models (not committed to git)
├── data/              # Cache and user data
├── milestone_zero.py  # First validation script
├── CONSTITUTION.md    # Architecture decisions (READ THIS FIRST)
└── requirements.txt   # Python dependencies
```

---

## 📖 Architecture

See [`.specify/memory/constitution.md`](.specify/memory/constitution.md) for the complete architectural specification.

**Key principles:**
- **Offline-first:** No internet required after initial setup
- **Modular:** 5 independent modules with clear boundaries
- **Testable:** Every phase has acceptance criteria
- **Minimal:** Start simple, add complexity only when needed

---

## 🚀 Development Phases

- ✅ **Phase 1:** Milestone Zero (Terminal inference)
- ⬜ **Phase 2:** Cache Layer (Ghost-Model) - Deferred
- ⬜ **Phase 3:** Authentication
- ⬜ **Phase 4:** Mastery Passport
- ✅ **Phase 5:** UI Shell (PyQt6) - **CURRENT**
- ⬜ **Phase 6:** Quiz Engine
- ⬜ **Phase 7:** Bilingual + Concept Mapper
- ⬜ **Phase 8:** Hardware Benchmark
- ⬜ **Phase 9:** Packaging (PyInstaller)

---

## 🛠️ Troubleshooting

### Model not found
```
❌ ERROR: Model file not found at ./models/model.gguf
```
**Solution:** Download a GGUF model and place it at `./models/model.gguf`

### llama-cpp-python installation fails (Windows)
```
ERROR: Could not build wheels for llama-cpp-python
```
**Solution:**
1. Install Visual Studio C++ Build Tools
2. Or try prebuilt wheel: `pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu`

### RAM usage exceeds 1.5 GB
```
⚠️ WARNING: RAM usage 2.34 GB exceeds 1.5 GB target!
```
**Solution:** Download a smaller quantized model (Q4_K_M or lower)

### Response time exceeds 15 seconds
```
⚠️ WARNING: Inference time 23.45s exceeds 15s target!
```
**Solution:**
1. Reduce `max_tokens` in script
2. Use a smaller model
3. Increase `n_threads` (if you have more CPU cores)

---

## 📚 Resources

- [Constitution (Architecture Rules)](.specify/memory/constitution.md)
- [llama.cpp Documentation](https://github.com/ggerganov/llama.cpp)
- [GGUF Model Hub](https://huggingface.co/models?search=gguf)
- [PyQt6 Documentation](https://www.riverbankcomputing.com/static/Docs/PyQt6/)

---

## 📄 License

[Your License Here]

---

## 🤝 Contributing

This project follows strict architectural guidelines defined in `CONSTITUTION.md`.

**Before contributing:**
1. Read the Constitution
2. Verify Milestone Zero passes on your machine
3. Follow the defined build phases
4. Ensure all changes respect the offline-first principle

---

**Current Status:** Milestone Zero Implementation
**Last Updated:** 2026-05-03
