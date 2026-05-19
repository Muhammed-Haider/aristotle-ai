# Aristotle AI — Offline Socratic CS Tutor

<div align="center">

**An intelligent, offline AI tutor for Computer Science education**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## Overview

Aristotle AI is a **fully offline desktop application** that uses local LLM inference to teach Computer Science concepts through Socratic dialogue. It runs entirely on your local machine with zero internet dependency after initial setup.

**Key principles:**
- 100% Offline — works without internet after setup
- Socratic Method — teaches through guided questioning, not just answers
- Lightweight — runs on modest hardware (8 GB RAM, Core i5)
- Privacy-first — all data stays on your machine
- Free & open source — no subscriptions, no API costs

---

## Architecture

The system has two layers:

```
┌─────────────────────────────────────────┐
│          Tauri Desktop Shell            │
│     React + TypeScript + Tailwind       │
│  (Dashboard, Chat, Progress, Practice)  │
└────────────────┬────────────────────────┘
                 │ HTTP  localhost:5748
┌────────────────▼────────────────────────┐
│         FastAPI Backend                 │
│   llama-cpp-python · LLM Inference      │
│   Auth · Passport · Quiz Engine         │
└─────────────────────────────────────────┘
```

- **Frontend** — Tauri 2 + React 19 + TypeScript + Tailwind CSS desktop app
- **Backend** — FastAPI server running locally, serving inference over HTTP
- **Model** — GGUF quantized model via `llama-cpp-python` (llama.cpp)

---

## Features

- **AI Chat** — real-time Socratic CS tutoring via streaming LLM responses
- **Progress Analytics** — animated subject mastery bars, weekly activity chart, accuracy ring
- **Practice Mode** — quiz-style questions with instant AI feedback
- **Exam Planner** — schedule topics and track upcoming work
- **Focus Mode** — distraction-free study timer
- **Subject Management** — organize topics across DSA, OS, Networks, DB, OOP, and more
- **Offline-first** — full functionality without internet after model download

---

## Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.9+ |
| Node.js | 18+ |
| Rust | 1.77+ (for Tauri) |
| RAM | 8 GB minimum |
| Disk | 10 GB free |
| OS | Windows 10/11, macOS 11+, Ubuntu 20.04+ |

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Muhammed-Haider/aristotle-ai.git
cd aristotle-ai
```

### 2. Set up the Python backend

```bash
# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

> If `llama-cpp-python` fails to build on Windows, use the prebuilt wheel:
> ```bash
> pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu
> ```

### 3. Download the AI model

**Option A — Automatic (recommended)**
```bash
python setup.py
```
Downloads TinyLlama Q4_K_M (~650 MB) from HuggingFace automatically.

**Option B — Manual**
1. Go to [TinyLlama-1.1B-GGUF on HuggingFace](https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF)
2. Download `tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf`
3. Place it at `./models/model_new.gguf`

### 4. Start the FastAPI backend

```bash
python -m uvicorn api.main:app --port 5748 --reload
```

The backend runs at `http://127.0.0.1:5748`. Keep this terminal open.

> To verify it's working, open `http://127.0.0.1:5748/docs` in a browser — you'll see the interactive API docs.

### 5. Run the Tauri desktop app

Open a **second terminal**:

```bash
cd tauri-ui

# Install Node dependencies (first time only)
npm install

# Install Tauri CLI (first time only)
npm install -g @tauri-apps/cli

# Launch in development mode
npm run tauri dev
```

The desktop window opens automatically. It connects to the backend on port 5748.

---

## Running just the frontend (browser mode)

If you want to develop the UI without the full Tauri shell:

```bash
cd tauri-ui
npm install
npm run dev
```

Open `http://localhost:1420` in your browser.

---

## Running the legacy PyQt6 app

The original PyQt6 desktop app is still available:

```bash
# Make sure venv is active and model is downloaded
python main.py
```

---

## Project Structure

```
aristotle-ai/
├── main.py                  # PyQt6 legacy entry point
├── api/                     # FastAPI backend
│   ├── main.py              # App factory, routes
│   ├── inference.py         # LLM streaming endpoint
│   ├── auth.py              # User authentication
│   └── passport.py          # Progress / mastery tracking
├── core/                    # Shared inference engine
│   └── inference.py         # llama-cpp-python wrapper
├── ui/                      # PyQt6 UI (legacy)
│   ├── main_window.py
│   ├── chat_window.py
│   └── login_screen.py
├── tauri-ui/                # Tauri desktop frontend
│   ├── src/
│   │   ├── screens/         # All app screens
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── ChatScreen.tsx
│   │   │   ├── ProgressScreen.tsx
│   │   │   ├── PracticeScreen.tsx
│   │   │   ├── FocusModeScreen.tsx
│   │   │   ├── ExamPlannerScreen.tsx
│   │   │   └── SubjectsScreen.tsx
│   │   ├── api.ts           # HTTP client (port 5748)
│   │   ├── App.tsx          # Root component + routing
│   │   └── index.css        # Global styles + animations
│   ├── src-tauri/           # Rust/Tauri configuration
│   │   └── tauri.conf.json
│   └── package.json
├── models/                  # GGUF models — never committed
├── data/                    # User data — never committed
├── specs/                   # Feature specifications (SDD)
├── history/                 # Prompt History Records
├── .specify/                # Project constitution + templates
├── requirements.txt
└── README.md
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Desktop shell | [Tauri 2](https://tauri.app/) | Lightweight native window (Rust-based) |
| UI framework | React 19 + TypeScript | Component-based frontend |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Build tool | Vite 7 | Fast dev server + bundler |
| Backend | [FastAPI](https://fastapi.tiangolo.com/) | Local HTTP API server |
| AI inference | [llama-cpp-python](https://github.com/abetlen/llama-cpp-python) | CPU-only LLM inference |
| Model format | GGUF (Q4_K_M) | Quantized model for low RAM usage |
| Legacy UI | PyQt6 | Original cross-platform desktop GUI |
| Packaging | PyInstaller | Standalone executable (Phase 9) |

---

## Model Options

| Model | File size | RAM usage | Quality | Recommended for |
|---|---|---|---|---|
| TinyLlama Q4_K_M | 650 MB | ~900 MB | Good | **Default** — 8 GB RAM devices |
| Gemma 2B Q4_K_M | 1.6 GB | ~2 GB | Better | 12 GB RAM devices |
| Phi-3 Mini Q4_K_M | 2.3 GB | ~3 GB | Best | 16 GB+ RAM devices |

---

## Development Phases

- ✅ **Phase 1** — Milestone Zero: terminal inference validation
- ✅ **Phase 2** — Cache layer: pre-cached common questions
- ✅ **Phase 3** — Authentication: user login/register
- ✅ **Phase 4** — Mastery Passport: learning progress tracking
- ✅ **Phase 5** — UI Shell: PyQt6 desktop app
- ✅ **Phase 5b** — Tauri UI: React + TypeScript desktop shell
- ⬜ **Phase 6** — Quiz Engine: adaptive assessments
- ⬜ **Phase 7** — Bilingual support: English & Urdu
- ⬜ **Phase 8** — Hardware benchmark: auto-optimize for device
- ⬜ **Phase 9** — Packaging: distributable installer

---

## Troubleshooting

**Backend not connecting (UI shows no data)**
```
Check that the FastAPI server is running:
  python -m uvicorn api.main:app --port 5748
Then restart the Tauri app.
```

**Model file not found**
```
Error: Model file not found at ./models/model_new.gguf
Fix: Run python setup.py, or manually place the .gguf file at ./models/model_new.gguf
```

**llama-cpp-python build fails on Windows**
```bash
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu
```

**Tauri dev fails with Rust errors**
```bash
rustup update stable
```

**Node version mismatch**
```bash
node --version   # must be 18+
nvm use 20       # if using nvm
```

---

## Commit Format

```
[module] short description

Examples:
[inference] add streaming support
[ui] animate progress bars in ProgressScreen
[auth] implement Argon2 password hashing
[api] add /passport endpoint
```

---

## License

MIT — see [LICENSE](LICENSE)

---

## Contact

**Maintainer:** Muhammed Haider
**GitHub:** [@Muhammed-Haider](https://github.com/Muhammed-Haider)
**Repo:** [aristotle-ai](https://github.com/Muhammed-Haider/aristotle-ai)
