# -*- mode: python ; coding: utf-8 -*-
# Aristotle AI — PyInstaller spec for the FastAPI backend (Phase 9)
# Produces: dist/aristotle-api/aristotle-api.exe
# Build:    pyinstaller aristotle-api.spec

block_cipher = None

a = Analysis(
    ["_api_launcher.py"],
    pathex=["."],
    binaries=[],
    datas=[
        ("cache/analogies.json",      "cache"),
        ("cache/quiz_questions.json", "cache"),
        ("data/.gitkeep",             "data"),
    ],
    hiddenimports=[
        # FastAPI / Uvicorn
        "uvicorn",
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.loops.asyncio",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.http.h11_impl",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
        "fastapi",
        "pydantic",
        "starlette",
        "starlette.routing",
        "starlette.middleware.cors",
        "anyio",
        "anyio._backends._asyncio",
        "h11",
        # LLM inference
        "llama_cpp",
        "llama_cpp.llama",
        "llama_cpp.llama_cpp",
        # Auth / system
        "bcrypt",
        "psutil",
        "psutil._pswindows",
        # App modules
        "api.server",
        "core.inference",
        "core.quiz_engine",
        "core.benchmark",
        "core.language_detector",
        "auth.auth_manager",
        "cache.ghost_model",
        "passport.mastery_store",
    ],
    hookspath=["hooks"],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        "tkinter", "matplotlib", "numpy", "pandas",
        "scipy", "PIL", "cv2", "PyQt6",
    ],
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="aristotle-api",
    debug=False,
    strip=False,
    upx=True,
    console=True,   # keep console so errors are visible during dev
    icon=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="aristotle-api",
)
