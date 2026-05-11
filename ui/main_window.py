"""
Main Window - Aristotle AI
Manages all screen transitions across the full app flow.
"""

from PyQt6.QtWidgets import QMainWindow, QStackedWidget, QMessageBox
from PyQt6.QtCore import QThread, pyqtSignal

from ui.home_screen import HomeScreen
from ui.login_screen import LoginScreen
from ui.register_screen import RegisterScreen
from ui.forgot_password_screen import ForgotPasswordScreen
from ui.chat_window import ChatWindow
import core.inference as inference


class ModelLoaderThread(QThread):
    load_complete = pyqtSignal(bool)

    def run(self):
        self.load_complete.emit(inference.load_model())


class MainWindow(QMainWindow):

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Aristotle AI")
        self.setMinimumSize(1024, 700)
        self._model_loader = None

        self.stack = QStackedWidget()
        self.setCentralWidget(self.stack)

        self._build_home()
        self.center()
        self._load_model_async()

    # ------------------------------------------------------------------  screens

    def _build_home(self):
        self.home = HomeScreen()
        self.home.go_to_login.connect(self._show_login)
        self.home.go_to_register.connect(self._show_register)
        self.stack.addWidget(self.home)
        self.stack.setCurrentWidget(self.home)

    def _show_login(self):
        if not hasattr(self, "_login_screen"):
            self._login_screen = LoginScreen()
            self._login_screen.login_successful.connect(self._on_login)
            self._login_screen.go_to_register.connect(self._show_register)
            self._login_screen.go_to_home.connect(
                lambda: self.stack.setCurrentWidget(self.home)
            )
            self._login_screen.go_to_forgot.connect(self._show_forgot)
            self.stack.addWidget(self._login_screen)
        self.stack.setCurrentWidget(self._login_screen)

    def _show_register(self):
        if not hasattr(self, "_register_screen"):
            self._register_screen = RegisterScreen()
            self._register_screen.register_ok.connect(self._on_login)
            self._register_screen.go_to_login.connect(self._show_login)
            self._register_screen.go_to_home.connect(
                lambda: self.stack.setCurrentWidget(self.home)
            )
            self.stack.addWidget(self._register_screen)
        self.stack.setCurrentWidget(self._register_screen)

    def _show_forgot(self):
        if not hasattr(self, "_forgot_screen"):
            self._forgot_screen = ForgotPasswordScreen()
            self._forgot_screen.go_to_login.connect(self._show_login)
            self._forgot_screen.go_to_home.connect(
                lambda: self.stack.setCurrentWidget(self.home)
            )
            self.stack.addWidget(self._forgot_screen)
        self.stack.setCurrentWidget(self._forgot_screen)

    def _on_login(self, username: str):
        self._open_chat(username)

    def _open_chat(self, username: str):
        chat = ChatWindow(username)
        self.stack.addWidget(chat)
        self.stack.setCurrentWidget(chat)
        self.statusBar().showMessage(f"Welcome, {username}!", 3000)

    # ------------------------------------------------------------------  helpers

    def center(self):
        geo = self.screen().geometry()
        self.move(
            (geo.width()  - self.width())  // 2,
            (geo.height() - self.height()) // 2,
        )

    def _load_model_async(self):
        self.statusBar().showMessage("Loading AI model...")
        self._model_loader = ModelLoaderThread()
        self._model_loader.load_complete.connect(self._on_model_loaded)
        self._model_loader.start()

    def _on_model_loaded(self, success: bool):
        if success:
            self.statusBar().showMessage("AI model ready!", 3000)
        else:
            self.statusBar().showMessage("Warning: model failed to load", 5000)

    def closeEvent(self, event):
        reply = QMessageBox.question(
            self, "Exit Aristotle AI", "Are you sure you want to exit?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No,
        )
        event.accept() if reply == QMessageBox.StandardButton.Yes else event.ignore()
