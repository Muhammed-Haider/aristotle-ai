

#!/usr/bin/env python3
"""
Aristotle AI - Main Application Entry Point
===========================================
Phase 5: UI Shell (PyQt6 Desktop Application)

Run with: python main.py

As per CONSTITUTION.md:
- PyQt6 for cross-platform desktop UI
- No business logic in UI
- Offline-first operation
"""

import sys
from pathlib import Path
from PyQt6.QtWidgets import QApplication, QMessageBox
from PyQt6.QtCore import Qt
from ui.main_window import MainWindow


def check_model_exists() -> bool:
    """Check if model file exists."""
    model_path = Path("./models/model_new.gguf")
    return model_path.exists()


def show_model_missing_dialog():
    """Show dialog when model is missing."""
    msg = QMessageBox()
    msg.setIcon(QMessageBox.Icon.Warning)
    msg.setWindowTitle("Model File Missing")
    msg.setText("AI model file not found!")
    msg.setInformativeText(
        "The application needs a GGUF model file to work.\n\n"
        "Please download a model and place it at:\n"
        "./models/model.gguf\n\n"
        "Recommended: TinyLlama Q2_K (~400 MB)\n"
        "Download from: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF\n\n"
        "Continue anyway?"
    )
    msg.setStandardButtons(
        QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
    )
    msg.setDefaultButton(QMessageBox.StandardButton.No)
    return msg.exec() == QMessageBox.StandardButton.Yes


def main():
    """Main application entry point."""
    # Create Qt application
    app = QApplication(sys.argv)
    app.setApplicationName("Aristotle AI")
    app.setOrganizationName("Aristotle AI")

    # Set application-wide style
    app.setStyle("Fusion")

    # Check if model exists
    if not check_model_exists():
        if not show_model_missing_dialog():
            sys.exit(0)

    # Create and show main window
    window = MainWindow()
    window.show()

    # Run application event loop
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
