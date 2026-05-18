# -*- mode: python ; coding: utf-8 -*-
# Aristotle AI — PyInstaller spec (Phase 9)
# Build: pyinstaller aristotle.spec
# Output: dist/aristotle/aristotle.exe
#
# After building, copy your models/ folder into dist/aristotle/ before distributing.

block_cipher = None

a = Analysis(
    ["main.py"],
    pathex=["."],
    binaries=[],
    datas=[
        # Read-only cache files bundled into the package
        ("cache/analogies.json",    "cache"),
        ("cache/quiz_questions.json", "cache"),
        # Placeholder so the data/ dir is created on first run
        ("data/.gitkeep", "data"),
    ],
    hiddenimports=[
        # llama-cpp-python loads its C extension dynamically
        "llama_cpp",
        "llama_cpp.llama",
        "llama_cpp.llama_cpp",
        # PyQt6 platform plugins
        "PyQt6",
        "PyQt6.QtWidgets",
        "PyQt6.QtCore",
        "PyQt6.QtGui",
        # Other deps
        "bcrypt",
        "psutil",
        "psutil._pswindows",
    ],
    hookspath=["hooks"],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Never needed at runtime
        "tkinter",
        "matplotlib",
        "numpy",
        "pandas",
        "scipy",
        "PIL",
        "cv2",
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="aristotle",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,          # No terminal window — desktop app
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,              # Add an .ico path here if you have one
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="aristotle",
)
