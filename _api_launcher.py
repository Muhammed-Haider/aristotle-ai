"""
PyInstaller entry point for the Aristotle AI FastAPI backend.
In frozen mode sys.executable points to the bundle dir, so we chdir there
to ensure all relative paths (./data/, ./models/) resolve correctly.
"""
import sys
import os
from pathlib import Path

if getattr(sys, "frozen", False):
    base = Path(sys.executable).parent
else:
    base = Path(__file__).parent

os.chdir(base)
sys.path.insert(0, str(base))

import uvicorn
from api.server import app

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5748, log_level="error")
