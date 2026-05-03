# CONSTITUTION.md — Aristotle AI System
> **This document is the single source of truth for all architectural, technical, and process decisions.
> No code is written, no dependency is added, and no design is changed without consulting this file first.**

---

## 0. North Star

Aristotle AI is an offline, locally running, Socratic CS tutoring desktop application.
The system must be fully functional with zero internet connection after initial setup.
Every decision in this document serves that constraint.

---

## 1. Milestone Zero (The Only Thing That Matters First)

> **Nothing else is built until Milestone Zero is complete and verified.**

Milestone Zero is defined as:

1. A GGUF model is loaded into memory via `llama.cpp` (Python binding: `llama-cpp-python`)
2. A hardcoded CS question is passed to the model
3. A coherent answer is streamed back to the terminal
4. RAM usage is confirmed to be under **1.5 GB** on the test machine
5. Response is generated in **under 15 seconds** on minimum-spec hardware (Core i5, 8 GB RAM)

**Milestone Zero is a terminal script. No UI. No database. No auth. Just inference.**

### Acceptance check (run this, it must pass):
```python
# milestone_zero.py
from llama_cpp import Llama

llm = Llama(model_path="./models/model.gguf", n_ctx=2048, n_threads=4)
output = llm("Q: What is a pointer in C? A:", max_tokens=200, stop=["Q:"])
print(output["choices"][0]["text"])
```
If this script runs, returns a sensible answer, and stays under 1.5 GB RAM — Milestone Zero is done.
Commit it. Tag it `v0.1-milestone-zero`. Then and only then move forward.

---

## 2. Non-Negotiable Technical Decisions

These are locked. They are not open for discussion during the project.

| Decision | Value | Reason |
|---|---|---|
| Inference runtime | `llama-cpp-python` | Only mature Python binding for llama.cpp |
| Model format | GGUF only | Required by llama.cpp |
| Minimum quantization | Q4_K_M | Fits under 1.5 GB RAM on 8 GB devices |
| Mid-range quantization | Q5_K_M or Q6_K | 12–16 GB RAM devices |
| High-spec quantization | Q8_0 | >16 GB RAM devices |
| UI framework | PyQt6 | Cross-platform, no Electron, no web tech |
| Packaging | PyInstaller | Zero-dependency portable binary |
| Password hashing | bcrypt or Argon2 | Never store plaintext passwords |
| Local data encryption | AES-256 | Mastery Passport + session history |
| Cache format | YAML or JSON | Human-readable, editable without recompilation |
| Target platforms | Windows 10/11, macOS 11–14, Ubuntu 20.04+, Fedora 36+, Debian 11+ | Defined in SRS §2.3 |
| Minimum hardware | Core i5 (6th gen), 8 GB RAM, 10 GB disk | Defined in SRS §2.3 |

---

## 3. Architecture — Module Boundaries

The codebase is split into **five independent modules**. They communicate through defined interfaces only.
No module imports internals of another module.

```
aristotle-ai/
│
├── core/
│   └── inference.py        # ONLY place llama-cpp-python is called
│                           # Exposes: ask(prompt, history) -> str
│
├── cache/
│   └── ghost_model.py      # Loads YAML/JSON cache, checks query match
│                           # Exposes: lookup(query) -> str | None
│
├── auth/
│   └── auth_manager.py     # Registration, login, session, bcrypt hashing
│                           # Exposes: register(), login(), logout(), session_active()
│
├── passport/
│   └── mastery_store.py    # Encrypted local file, topic scores, quiz history
│                           # Exposes: update(topic, score), get(topic), reset(topic)
│
├── ui/
│   └── main_window.py      # PyQt6 UI only — no business logic here
│                           # Calls core/, cache/, auth/, passport/ only
│
├── models/                 # GGUF model files live here — never committed to git
├── data/                   # Ghost-Model cache YAML/JSON files
├── milestone_zero.py       # The first script ever run
├── CONSTITUTION.md         # This file
└── requirements.txt
```

### Hard rules:
- `ui/` **never** calls `llama_cpp` directly
- `core/inference.py` **never** reads the UI state
- `cache/` **never** writes to `passport/`
- Business logic **never** lives in a PyQt6 slot or signal handler

---

## 4. Build Order — The Sequence That Must Be Followed

```
Phase 1 — Inference (Milestone Zero)
  └── milestone_zero.py works in terminal ✓

Phase 2 — Cache Layer
  └── ghost_model.py loads YAML, matches query, returns cached string
  └── Unit test: known query returns cached response in <100ms ✓

Phase 3 — Auth
  └── auth_manager.py: register, login, logout, bcrypt hash, local session file
  └── No UI yet — test via Python script ✓

Phase 4 — Mastery Passport
  └── mastery_store.py: encrypted JSON file, CRUD for topic scores
  └── Unit test: write score, restart process, read score back ✓

Phase 5 — UI Shell
  └── PyQt6 window: login screen → home → chat interface
  └── Chat wired to ghost_model first, then core/inference as fallback ✓

Phase 6 — Quiz Engine
  └── LLM-generated questions, answer evaluation, passport write-back ✓

Phase 7 — Bilingual + Concept Mapper
  └── Language detection, Urdu response toggle, analogy glossary ✓

Phase 8 — Hardware Benchmark + Settings
  └── First-launch benchmark, quantization tier selection, settings panel ✓

Phase 9 — Packaging
  └── PyInstaller build, test on clean machine with no Python installed ✓
```

---

## 5. Performance Contracts

These are testable. Every phase must not break them.

| Metric | Target | How to test |
|---|---|---|
| Ghost-Model cache response | < 100ms | `time.perf_counter()` around `lookup()` |
| LLM response (≤200 tokens) | < 15s on min-spec | Stopwatch on Core i5, 8 GB RAM machine |
| App cold start to ready | < 10s | Time from launch to chat input active |
| UI interaction response | < 200ms | All button/nav actions |
| RAM for model inference | < 1.5 GB | Task Manager / `psutil` during inference |

If any contract is broken by a commit, that commit is reverted before anything else.

---

## 6. What Is Explicitly Out of Scope

Never build these. If a feature request touches one of these, reject it.

- Any internet API call during tutoring (the only allowed internet use: initial registration + password reset email)
- Cloud sync of any student data
- Mobile (iOS/Android) build
- Multi-user or server deployment
- Admin or teacher dashboard
- Payment or subscription system
- Electron or web-based UI

---

## 7. Git Discipline

```
main          — working code only, always passes Milestone Zero script
dev           — integration branch
feature/xxx   — one feature per branch, named after the module
```

### Commit message format:
```
[module] short description

e.g.
[inference] add streaming support to ask()
[cache] fix YAML unicode handling for Urdu keys
[ui] wire chat input to ghost_model lookup
[auth] implement Argon2 password hashing
```

### Never commit:
- GGUF model files (add `models/` to `.gitignore`)
- Plaintext passwords or API keys
- PyInstaller build artifacts (`dist/`, `build/`)

---

## 8. Definition of Done

A feature is **Done** when:
1. It works on Windows and Linux (macOS if available)
2. It does not increase RAM usage beyond the Phase contract
3. It has at least one passing test (even a simple script)
4. It does not break Milestone Zero (the inference script still runs)
5. The relevant SRS requirement (FR-XX) is noted in the PR/commit

---

## 9. The One Rule That Overrides Everything

> **If it requires internet during tutoring, it does not ship.**

When in doubt, re-read Section 0.
