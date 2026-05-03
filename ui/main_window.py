"""
Main Window - Aristotle AI
==========================
Application main window that manages screen transitions.
Login -> Chat workflow
"""

from PyQt6.QtWidgets import QMainWindow, QStackedWidget, QMessageBox
from PyQt6.QtCore import QThread, pyqtSignal
from ui.login_screen import LoginScreen
from ui.chat_window import ChatWindow
import core.inference as inference


class ModelLoaderThread(QThread):
    """Background thread for loading the AI model."""
    load_complete = pyqtSignal(bool)  # success/failure

    def run(self):
        """Load model in background."""
        success = inference.load_model()
        self.load_complete.emit(success)


class MainWindow(QMainWindow):
    """
    Main application window.
    Manages transitions between login and chat screens.
    """

    def __init__(self):
        super().__init__()
        self.current_username = None
        self.model_loader = None
        self.init_ui()
        self.load_model_async()

    def init_ui(self):
        """Initialize the main window UI."""
        self.setWindowTitle("Aristotle AI")
        self.setMinimumSize(800, 600)

        # Stacked widget to switch between screens
        self.stacked_widget = QStackedWidget()
        self.setCentralWidget(self.stacked_widget)

        # Create login screen
        self.login_screen = LoginScreen()
        self.login_screen.login_successful.connect(self.on_login_success)
        self.stacked_widget.addWidget(self.login_screen)

        # Chat window will be created after login
        self.chat_window = None

        # Show login screen
        self.stacked_widget.setCurrentWidget(self.login_screen)

        # Center window on screen
        self.center_on_screen()

    def center_on_screen(self):
        """Center the window on the screen."""
        screen = self.screen().geometry()
        window_geometry = self.frameGeometry()
        center_point = screen.center()
        window_geometry.moveCenter(center_point)
        self.move(window_geometry.topLeft())

    def load_model_async(self):
        """Load the AI model in background thread."""
        self.statusBar().showMessage("Loading AI model...")

        self.model_loader = ModelLoaderThread()
        self.model_loader.load_complete.connect(self.on_model_loaded)
        self.model_loader.start()

    def on_model_loaded(self, success: bool):
        """Handle model loading completion."""
        if success:
            self.statusBar().showMessage("AI model ready!", 3000)
        else:
            self.statusBar().showMessage("Warning: Model failed to load", 5000)
            QMessageBox.warning(
                self,
                "Model Load Error",
                "Failed to load the AI model. Please check:\n"
                "1. Model file exists at ./models/model.gguf\n"
                "2. Model file is a valid GGUF format\n\n"
                "You can still use the app, but responses may not work."
            )

    def on_login_success(self, username: str):
        """
        Handle successful login.
        Transition from login screen to chat window.
        """
        self.current_username = username

        # Create chat window
        self.chat_window = ChatWindow(username)
        self.stacked_widget.addWidget(self.chat_window)

        # Switch to chat window
        self.stacked_widget.setCurrentWidget(self.chat_window)

        # Update status
        self.statusBar().showMessage(f"Welcome, {username}!", 3000)

    def closeEvent(self, event):
        """Handle application close event."""
        reply = QMessageBox.question(
            self,
            "Exit Aristotle AI",
            "Are you sure you want to exit?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No
        )

        if reply == QMessageBox.StandardButton.Yes:
            # Clean up (unload model, save session, etc.)
            self.statusBar().showMessage("Shutting down...")
            event.accept()
        else:
            event.ignore()
