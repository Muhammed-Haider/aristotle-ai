#!/usr/bin/env python3
"""
Aristotle AI - Setup Script
===========================
Automatically downloads the AI model required for the application.

Run this once after cloning the repository:
    python setup.py

This will download TinyLlama Q4_K_M (~650 MB) from HuggingFace.
"""

import urllib.request
import sys
from pathlib import Path


# Model configuration
MODEL_URL = "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
MODEL_PATH = Path("models/model_new.gguf")
MODEL_SIZE_MB = 650


def download_progress(block_num, block_size, total_size):
    """Show download progress bar."""
    downloaded = block_num * block_size
    percent = min(100, (downloaded / total_size) * 100)
    bar_length = 50
    filled = int(bar_length * percent / 100)
    bar = '█' * filled + '-' * (bar_length - filled)

    mb_downloaded = downloaded / (1024 * 1024)
    mb_total = total_size / (1024 * 1024)

    sys.stdout.write(f'\r[{bar}] {percent:.1f}% ({mb_downloaded:.1f}/{mb_total:.1f} MB)')
    sys.stdout.flush()


def main():
    """Download the AI model."""
    print("=" * 60)
    print("Aristotle AI - Setup")
    print("=" * 60)
    print()

    # Check if model already exists
    if MODEL_PATH.exists():
        print(f"✅ Model already exists at: {MODEL_PATH}")
        print("   No download needed.")
        print()
        print("Run the app with: python main.py")
        return

    # Create models directory
    MODEL_PATH.parent.mkdir(exist_ok=True)

    print(f"📥 Downloading TinyLlama Q4_K_M (~{MODEL_SIZE_MB} MB)")
    print(f"   From: HuggingFace")
    print(f"   To: {MODEL_PATH}")
    print()
    print("⏳ This may take a few minutes depending on your connection...")
    print()

    try:
        # Download with progress bar
        urllib.request.urlretrieve(
            MODEL_URL,
            MODEL_PATH,
            reporthook=download_progress
        )

        print("\n")
        print("=" * 60)
        print("✅ Setup Complete!")
        print("=" * 60)
        print()
        print(f"Model downloaded successfully: {MODEL_PATH}")
        print(f"Size: {MODEL_PATH.stat().st_size / (1024*1024):.1f} MB")
        print()
        print("Next steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Run the app: python main.py")
        print()

    except KeyboardInterrupt:
        print("\n")
        print("❌ Download cancelled by user")
        # Clean up partial download
        if MODEL_PATH.exists():
            MODEL_PATH.unlink()
        sys.exit(1)

    except Exception as e:
        print("\n")
        print(f"❌ Error downloading model: {e}")
        print()
        print("Manual download:")
        print(f"1. Visit: {MODEL_URL}")
        print(f"2. Save as: {MODEL_PATH}")
        sys.exit(1)


if __name__ == "__main__":
    main()
