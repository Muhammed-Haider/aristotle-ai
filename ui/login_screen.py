"""
Login Screen - Aristotle AI
===========================
Simple login interface (Phase 3 Auth not yet implemented).
Currently: Just asks for username to proceed.
Future: Will integrate with auth/auth_manager.py
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QLineEdit, QPushButton, QMessageBox
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont


class LoginScreen(QWidget):
    """
    Login screen widget.
    Emits login_successful signal with username when user logs in.
    """

    login_successful = pyqtSignal(str)  # Emits username

    def __init__(self):
        super().__init__()
        self.init_ui()

    def init_ui(self):
        """Initialize the login UI."""
        self.setWindowTitle("Aristotle AI - Login")
        self.setMinimumSize(400, 300)

        # Main layout
        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setSpacing(20)

        # Title
        title = QLabel("🎓 Aristotle AI")
        title_font = QFont()
        title_font.setPointSize(24)
        title_font.setBold(True)
        title.setFont(title_font)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)

        # Subtitle
        subtitle = QLabel("Offline Socratic CS Tutor")
        subtitle_font = QFont()
        subtitle_font.setPointSize(12)
        subtitle.setFont(subtitle_font)
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setStyleSheet("color: #666;")
        layout.addWidget(subtitle)

        # Spacer
        layout.addSpacing(30)

        # Username label
        username_label = QLabel("Username:")
        layout.addWidget(username_label)

        # Username input
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Enter your username")
        self.username_input.setMinimumHeight(35)
        self.username_input.returnPressed.connect(self.handle_login)
        layout.addWidget(self.username_input)

        # Note (since no auth yet)
        note = QLabel("Note: Authentication not yet implemented (Phase 3)")
        note.setStyleSheet("color: #999; font-size: 10px;")
        note.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(note)

        # Login button
        login_btn = QPushButton("Start Learning")
        login_btn.setMinimumHeight(40)
        login_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
            QPushButton:pressed {
                background-color: #3d8b40;
            }
        """)
        login_btn.clicked.connect(self.handle_login)
        layout.addWidget(login_btn)

        # Spacer at bottom
        layout.addStretch()

        self.setLayout(layout)

        # Focus on username input
        self.username_input.setFocus()

    def handle_login(self):
        """Handle login button click."""
        username = self.username_input.text().strip()

        if not username:
            QMessageBox.warning(
                self,
                "Input Required",
                "Please enter a username to continue."
            )
            return

        # Future: Will call auth/auth_manager.login() here
        # For now, just emit success
        self.login_successful.emit(username)
