# Aristotle AI — Tauri Desktop Frontend

React 19 + TypeScript + Tailwind CSS desktop shell for Aristotle AI, built with Tauri 2.

---

## What this is

This is the desktop UI layer. It is a **pure frontend** — all AI inference and data logic lives in the FastAPI backend (`../api/`). The UI communicates with the backend over HTTP at `localhost:5748`.

---

## Screens

| Screen | Description |
|---|---|
| `HomeScreen` | Landing / splash with login, register, demo |
| `LoginScreen` / `RegisterScreen` | Auth forms |
| `OnboardingScreen` | First-run subject selection |
| `DashboardScreen` | Stats, quick actions, upcoming work |
| `ChatScreen` | Streaming Socratic AI tutor chat |
| `ProgressScreen` | Animated subject mastery bars, accuracy ring, weekly chart |
| `PracticeScreen` | Quiz-style question practice |
| `FocusModeScreen` | Distraction-free study timer |
| `ExamPlannerScreen` | Schedule topics and review sessions |
| `SubjectsScreen` | Manage CS subjects and topics |
| `ProfileScreen` / `SettingsScreen` | Account and app settings |

---

## Running in development

**Requirement:** The FastAPI backend must be running first on port 5748.

```bash
# From the repo root, start the backend:
python -m uvicorn api.main:app --port 5748 --reload

# Then, in a second terminal:
cd tauri-ui
npm install        # first time only
npm run tauri dev  # opens the native window
```

### Browser-only mode (no Tauri)

```bash
cd tauri-ui
npm run dev
# Open http://localhost:1420
```

---

## Building for production

```bash
cd tauri-ui
npm run tauri build
```

Outputs a platform-native installer to `src-tauri/target/release/bundle/`.

---

## Project structure

```
tauri-ui/
├── src/
│   ├── screens/          # One file per screen
│   ├── api.ts            # HTTP client (GET, POST, streamChat)
│   ├── App.tsx           # Root component + navigation state
│   ├── main.tsx          # React mount point
│   └── index.css         # Global styles, animations, component classes
├── src-tauri/
│   ├── tauri.conf.json   # Window config, bundle settings
│   └── src/main.rs       # Tauri entry point
├── package.json
└── vite.config.ts
```

---

## Key decisions

- **No router library** — navigation is a single `activeTab` state in `App.tsx`, keeping the bundle tiny and avoiding URL complexity in a desktop context.
- **Inline styles for dynamic values** — Tailwind is used for static layout; dynamic colors (gradients, glow colors) use inline `style` props with CSS variables.
- **`api.ts` is the only network layer** — all fetch calls go through the three exports: `apiGet`, `apiPost`, `streamChat`. No component fetches directly.
