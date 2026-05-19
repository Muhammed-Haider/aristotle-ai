# Aristotle AI — Offline Socratic CS Tutor

<div align="center">

**An intelligent, fully offline AI tutor for Computer Science education**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## What is this?

Aristotle AI is a **fully offline desktop application** that uses a locally running language model to teach Computer Science through Socratic dialogue. It runs entirely on your machine — no internet required after initial setup, no API keys, no subscriptions.

**Core principles:**
- 100% offline after model download
- Teaches through questions, not just answers (Socratic method)
- Runs on modest hardware (Core i5, 8 GB RAM)
- All data stays on your machine (local JSON, no cloud sync)

---

## Architecture

```
┌────────────────────────────────────────────┐
│           Tauri Desktop Shell              │
│      React 19 · TypeScript · Tailwind      │
│   20 screens: Chat, Progress, Quiz, etc.   │
└─────────────────┬──────────────────────────┘
                  │  HTTP  localhost:5748
┌─────────────────▼──────────────────────────┐
│          FastAPI Backend (api/server.py)    │
│                                            │
│  core/inference.py  ←  llama-cpp-python    │
│  auth/auth_manager.py  ←  bcrypt           │
│  cache/ghost_model.py  ←  analogy cache    │
│  passport/mastery_store.py  ←  progress    │
│  core/quiz_engine.py  ←  quiz generation   │
│  core/benchmark.py  ←  hardware detection  │
└────────────────────────────────────────────┘
```

- **Frontend:** Tauri 2 + React 19 + TypeScript desktop app (`tauri-ui/`)
- **Backend:** FastAPI server running locally on port 5748 (`api/server.py`)
- **Model:** GGUF quantized LLM loaded via `llama-cpp-python`
- **Data:** Local JSON files in `data/` (users, sessions, passport, settings)

---

## Features

| Feature | Status | Module |
|---|---|---|
| Streaming AI chat (Socratic tutor) | ✅ | `core/inference.py` |
| User registration & login (bcrypt) | ✅ | `auth/auth_manager.py` |
| Analogy/answer cache (fast lookup) | ✅ | `cache/ghost_model.py` |
| Topic mastery tracking | ✅ | `passport/mastery_store.py` |
| Quiz generation & evaluation | ✅ | `core/quiz_engine.py` |
| Hardware auto-detection (RAM → quant tier) | ✅ | `core/benchmark.py` |
| Urdu/English language detection | ✅ | `core/language_detector.py` |
| Progress analytics (animated bars, charts) | ✅ | `ProgressScreen.tsx` |
| Exam planner | ✅ | `ExamPlannerScreen.tsx` |
| Focus mode (study timer) | ✅ | `FocusModeScreen.tsx` |
| PyInstaller packaging | ✅ | `aristotle.spec` / `build.ps1` |

---

## Prerequisites

| Tool | Version | Why |
|---|---|---|
| Python | 3.9+ | Backend |
| Node.js | 18+ | Tauri frontend |
| Rust | 1.77+ | Tauri native shell |
| RAM | 8 GB min | LLM inference |
| Disk | 10 GB free | Model storage |

---

## Quick Start

### Option A — One command (Windows, recommended)

```powershell
.\start.ps1
```

This starts the Python backend and the Tauri desktop window together. Make sure you've completed the setup steps below first.

---

### Option B — Manual (step by step)

#### 1. Clone

```bash
git clone https://github.com/Muhammed-Haider/aristotle-ai.git
cd aristotle-ai
```

#### 2. Python environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

#### 3. Install Python dependencies

```bash
pip install -r requirements.txt
pip install fastapi "uvicorn[standard]"
```

> On Windows, if `llama-cpp-python` fails to build from source:
> ```bash
> pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu
> ```

#### 4. Download the AI model

```bash
python setup.py
```

This downloads TinyLlama Q4_K_M (~650 MB) into `./models/model_new.gguf`.

**Or manually:**
1. Download `tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf` from [HuggingFace](https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF)
2. Place it at `./models/model_new.gguf`

#### 5. Start the backend

```bash
python -m api.server
```

Leave this terminal open. The API runs at `http://127.0.0.1:5748`.
Visit `http://127.0.0.1:5748/docs` to verify all endpoints are up.

#### 6. Start the Tauri frontend (new terminal)

```bash
cd tauri-ui
npm install        # first time only
npm run tauri dev  # opens the desktop window
```

---

## API Endpoints

The backend exposes these endpoints at `http://127.0.0.1:5748`:

| Method | Path | Description |
|---|---|---|
| `POST` | `/chat/stream` | Streaming LLM response (SSE) |
| `POST` | `/auth/register` | Create new account |
| `POST` | `/auth/login` | Authenticate user |
| `POST` | `/auth/logout` | End session |
| `GET` | `/auth/session` | Get current session |
| `GET` | `/passport` | Topic mastery data for current user |
| `GET` | `/quiz` | Generate or fetch a quiz question (`?topic=`) |
| `POST` | `/quiz/evaluate` | Grade a student answer |
| `GET` | `/settings` | Read app settings |
| `POST` | `/settings` | Save a setting |
| `GET` | `/models` | List available `.gguf` model files |

---

## Project Structure

```
aristotle-ai/
│
├── api/
│   └── server.py              # FastAPI app — all endpoints
│
├── core/
│   ├── inference.py           # llama-cpp-python wrapper, singleton, streaming
│   ├── quiz_engine.py         # LLM question generation + answer evaluation
│   ├── benchmark.py           # Hardware detection → quantization tier
│   └── language_detector.py  # Urdu / English detection
│
├── auth/
│   └── auth_manager.py        # Register, login, bcrypt hashing, session
│
├── cache/
│   └── ghost_model.py         # Keyword analogy lookup, quiz question caching
│
├── passport/
│   └── mastery_store.py       # Per-user topic scores, quiz history
│
├── ui/                        # Legacy PyQt6 desktop UI (still functional)
│   ├── main_window.py
│   ├── chat_window.py
│   ├── login_screen.py
│   ├── register_screen.py
│   ├── onboarding_screen.py
│   ├── quiz_panel.py
│   ├── progress_panel.py
│   ├── benchmark_screen.py
│   └── settings_panel.py
│
├── tauri-ui/                  # Modern Tauri desktop frontend
│   ├── src/
│   │   ├── screens/           # 20 React screens (see tauri-ui/README.md)
│   │   ├── api.ts             # HTTP client for port 5748
│   │   ├── App.tsx            # Root + navigation state
│   │   └── index.css          # Global styles + animations
│   ├── src-tauri/
│   │   └── tauri.conf.json    # Window config (1100×720, min 900×600)
│   └── package.json
│
├── data/                      # Local JSON storage (git-ignored)
│   ├── users.json             # Accounts + bcrypt hashes
│   ├── passport.json          # Topic mastery per user
│   ├── session.json           # Current logged-in user
│   ├── settings.json          # App config (RAM tier, language, model path)
│   ├── analogies.json         # Pre-written CS analogy cache
│   └── quiz_questions.json    # Pre-written quiz question bank
│
├── models/                    # GGUF model files (git-ignored)
│
├── main.py                    # Legacy PyQt6 entry point
├── milestone_zero.py          # Core inference validation script
├── setup.py                   # Model auto-downloader
├── start.ps1                  # One-command dev launcher (Windows)
├── build.ps1                  # PyInstaller build script
├── requirements.txt
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Tauri 2](https://tauri.app/) (Rust) |
| UI framework | React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Build tool | Vite 7 |
| HTTP backend | [FastAPI](https://fastapi.tiangolo.com/) + Uvicorn |
| LLM inference | [llama-cpp-python](https://github.com/abetlen/llama-cpp-python) |
| Model format | GGUF (Q4_K_M default) |
| Auth | bcrypt password hashing |
| Data storage | Local JSON files |
| Packaging | PyInstaller (`aristotle.spec`) |
| Legacy UI | PyQt6 |

---

## Model Options

| Model | Size | RAM usage | Quality |
|---|---|---|---|
| TinyLlama Q4_K_M | 650 MB | ~900 MB | Good — **default, works on 8 GB** |
| Gemma 2B Q4_K_M | 1.6 GB | ~2 GB | Better — 12 GB devices |
| Phi-3 Mini Q4_K_M | 2.3 GB | ~3 GB | Best — 16 GB+ devices |

The app auto-detects your RAM on first run and picks the right quantization tier.

---

## Development Phases

- ✅ **Phase 1** — Milestone Zero: terminal inference validation (`milestone_zero.py`)
- ✅ **Phase 2** — Cache layer: keyword analogy lookup (`cache/ghost_model.py`)
- ✅ **Phase 3** — Authentication: bcrypt register/login (`auth/auth_manager.py`)
- ✅ **Phase 4** — Mastery Passport: per-user topic tracking (`passport/mastery_store.py`)
- ✅ **Phase 5** — UI Shell: PyQt6 legacy app + Tauri React app
- ✅ **Phase 6** — Quiz Engine: LLM question generation + evaluation (`core/quiz_engine.py`)
- ✅ **Phase 7** — Bilingual: Urdu/English detection (`core/language_detector.py`)
- ⬜ **Phase 8** — Hardware benchmark UI: auto-optimize model selection
- ⬜ **Phase 9** — Packaging: distributable installer via PyInstaller

---

## Troubleshooting

**Backend not starting**
```bash
# Make sure fastapi and uvicorn are installed (not in requirements.txt yet)
pip install fastapi "uvicorn[standard]"
python -m api.server
```

**Tauri window shows no data / blank screens**
```
The FastAPI backend must be running before you open the Tauri app.
Run python -m api.server first, then npm run tauri dev.
```

**Model file not found**
```
Error: Model file not found at ./models/model_new.gguf
Fix:  python setup.py   (auto-downloads the model)
```

**llama-cpp-python build fails on Windows**
```bash
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu
```

**Tauri dev fails (Rust errors)**
```bash
rustup update stable
```

**Node version too old**
```bash
node --version   # must be 18+
```

---

## Commit format

```
[module] short description

[inference] add streaming support
[ui] animate progress bars in ProgressScreen
[auth] implement session persistence
[api] add /quiz/evaluate endpoint
[docs] update README
```

---

## License

MIT — see [LICENSE](LICENSE)

---

## Contact

**Maintainer:** Muhammed Haider
**GitHub:** [@Muhammed-Haider](https://github.com/Muhammed-Haider)
**Repo:** [aristotle-ai](https://github.com/Muhammed-Haider/aristotle-ai)
