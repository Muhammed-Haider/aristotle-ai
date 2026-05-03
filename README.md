# Aristotle AI - Offline Socratic CS Tutor

<div align="center">

🎓 **An intelligent, offline AI tutor for Computer Science education**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![PyQt6](https://img.shields.io/badge/PyQt6-6.6+-green.svg)](https://www.riverbankcomputing.com/software/pyqt/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Phase%205-brightgreen.svg)](#development-phases)

</div>

---

## 📖 Overview

Aristotle AI is a **fully offline desktop application** that uses artificial intelligence to teach Computer Science concepts through Socratic dialogue. Unlike traditional online tutors, Aristotle runs entirely on your local machine with **zero internet dependency** after initial setup.

### Why Aristotle AI?

- 🔒 **100% Offline** - Works without internet connection
- 🧠 **Socratic Method** - Teaches through guided questioning
- ⚡ **Lightweight** - Runs on modest hardware (8 GB RAM)
- 🎯 **CS-Focused** - Specialized for Computer Science education
- 🔐 **Privacy-First** - All data stays on your machine
- 🆓 **Free & Open Source** - No subscriptions, no API costs

---

## ✨ Features

### Current (Phase 5)
- ✅ **Desktop Application** - Native PyQt6 GUI
- ✅ **AI-Powered Chat** - Real-time CS tutoring conversations
- ✅ **Offline Inference** - Local LLM using llama.cpp
- ✅ **Conversation History** - Context-aware responses
- ✅ **Clean UI** - Professional, distraction-free interface
- ✅ **Background Processing** - Non-blocking UI during inference

### Coming Soon
- 🔜 **Quiz Engine** - Interactive assessments (Phase 6)
- 🔜 **Mastery Passport** - Track learning progress (Phase 4)
- 🔜 **Bilingual Support** - English & Urdu (Phase 7)
- 🔜 **User Authentication** - Secure multi-user support (Phase 3)
- 🔜 **Concept Mapper** - Visual learning paths (Phase 7)

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+**
- **8 GB RAM** (minimum)
- **10 GB free disk space**
- **OS:** Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Muhammed-Haider/aristotle-ai.git
cd aristotle-ai
```

**2. Create virtual environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

**3. Install dependencies**
```bash
# Fast installation (prebuilt wheels)
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu
pip install PyQt6 psutil

# Or install everything
pip install -r requirements.txt
```

**4. Download AI Model**

Download **TinyLlama Q4_K_M** (~650 MB):
- Visit: [TinyLlama-1.1B-GGUF](https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF)
- Download: `tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf`
- Place as: `./models/model_new.gguf`

**5. Run the application**
```bash
python main.py
```

---

## 📸 Screenshots

### Login Screen
Clean, simple authentication (Phase 3 will add real auth)

### Chat Interface
Real-time AI tutoring with conversation history

---

## 🏗️ Project Structure

```
aristotle-ai/
├── core/                   # AI inference engine
│   └── inference.py        # Model loading & response generation
├── ui/                     # PyQt6 interface
│   ├── login_screen.py     # Login UI
│   ├── chat_window.py      # Main chat interface
│   └── main_window.py      # Application orchestrator
├── cache/                  # Response caching (Phase 2)
├── auth/                   # Authentication (Phase 3)
├── passport/               # Progress tracking (Phase 4)
├── models/                 # GGUF models (not in git)
├── data/                   # User data & cache
├── main.py                 # Application entry point
├── milestone_zero.py       # Terminal inference test
├── chat_test.py            # Terminal chat interface
└── requirements.txt        # Python dependencies
```

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **AI Inference** | [llama.cpp](https://github.com/ggerganov/llama.cpp) | Fast, CPU-only LLM inference |
| **Model Format** | GGUF (Q4_K_M) | Quantized models for low RAM usage |
| **UI Framework** | [PyQt6](https://www.riverbankcomputing.com/software/pyqt/) | Native cross-platform desktop GUI |
| **Language** | Python 3.9+ | Core application logic |
| **Packaging** | PyInstaller (Phase 9) | Standalone executable |

---

## 📋 Development Phases

Based on our [Constitution](.specify/memory/constitution.md):

- ✅ **Phase 1:** Milestone Zero - Terminal inference validation
- ⬜ **Phase 2:** Cache Layer - Pre-cached common questions
- ⬜ **Phase 3:** Authentication - Secure user management
- ⬜ **Phase 4:** Mastery Passport - Learning progress tracking
- ✅ **Phase 5:** UI Shell - PyQt6 desktop application ← **CURRENT**
- ⬜ **Phase 6:** Quiz Engine - Interactive assessments
- ⬜ **Phase 7:** Bilingual + Concept Mapper - English/Urdu support
- ⬜ **Phase 8:** Hardware Benchmark - Auto-optimize for device
- ⬜ **Phase 9:** Packaging - Distributable executable

---

## 🎯 Usage Examples

### Ask CS Questions
```
You: What is a linked list?
Aristotle: A linked list is a collection of nodes that are linked
together by references to the next node in the list...
```

### Get Code Examples
```
You: Explain pointers in C
Aristotle: In C, pointers are used to refer to the addresses of
data items in memory. They are represented as int* for example...
```

### Socratic Learning
```
You: How does recursion work?
Aristotle: Let me help you understand. First, what happens when
a function calls itself?
```

---

## 🔧 Configuration

### Model Options

| Model | Size | RAM Usage | Quality | Use Case |
|-------|------|-----------|---------|----------|
| TinyLlama Q4_K_M | 650 MB | ~900 MB | Good | **Recommended** - Minimum viable |
| Gemma 2B Q4_K_M | 1.6 GB | ~2 GB | Better | Mid-range hardware |
| Phi-3 Mini Q4_K_M | 2.3 GB | ~3 GB | Best | High-end tutoring |

### Performance Targets (from Constitution)

| Metric | Target | How Tested |
|--------|--------|------------|
| Model RAM Usage | < 1.5 GB | Task Manager during inference |
| Response Time | < 15s | Stopwatch on Core i5, 8GB RAM |
| App Startup | < 10s | Launch to ready state |
| UI Response | < 200ms | All button/navigation actions |

---

## 🐛 Troubleshooting

### Model not found
```
❌ ERROR: Model file not found at ./models/model_new.gguf
```
**Solution:** Download model and place at `./models/model_new.gguf`

### llama-cpp-python installation fails (Windows)
```
ERROR: Could not build wheels for llama-cpp-python
```
**Solution:** Use prebuilt wheel:
```bash
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu
```

### Response quality is poor
**Solution:** Upgrade to Q4_K_M quantization (minimum). Q2_K is too compressed.

---

## 🤝 Contributing

Contributions are welcome! Please read our [Constitution](.specify/memory/constitution.md) first.

### Guidelines
1. Follow the defined build phases
2. Respect the **offline-first** principle
3. Keep changes small and testable
4. Use atomic commits with clear messages
5. No internet dependencies during tutoring

### Commit Format
```
[module] short description

Examples:
[inference] add streaming support to ask()
[ui] wire chat input to ghost_model lookup
[auth] implement Argon2 password hashing
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **llama.cpp** - Georgii Gerganov and contributors
- **PyQt6** - Riverbank Computing
- **TinyLlama** - Model by TinyLlama team
- **Community** - All open-source contributors

---

## 📧 Contact

**Project Maintainer:** Muhammed Haider
**GitHub:** [@Muhammed-Haider](https://github.com/Muhammed-Haider)
**Repository:** [aristotle-ai](https://github.com/Muhammed-Haider/aristotle-ai)

---

## 🗺️ Roadmap

### Version 1.0 (Target: Q2 2026)
- [ ] Complete all 9 phases
- [ ] Full quiz engine with adaptive difficulty
- [ ] Bilingual support (English/Urdu)
- [ ] Mastery tracking with visual progress
- [ ] Windows/Mac/Linux installers

### Version 2.0 (Future)
- [ ] Plugin system for custom topics
- [ ] Advanced analytics dashboard
- [ ] Peer-to-peer study sessions
- [ ] More language support

---

<div align="center">

**Built with ❤️ for Computer Science students everywhere**

⭐ Star this repo if you find it helpful!

</div>
