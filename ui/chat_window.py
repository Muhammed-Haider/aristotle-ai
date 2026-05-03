"""
Chat Window - Aristotle AI
==========================
Main chat interface for interacting with the AI tutor.
As per CONSTITUTION.md: No business logic here, only UI.
Calls core/inference.ask() for responses.
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QTextEdit,
    QLineEdit, QPushButton, QLabel, QScrollArea
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtGui import QFont, QTextCursor
import time

# Import inference module (business logic)
import core.inference as inference


class InferenceWorker(QThread):
    """
    Background thread for AI inference to keep UI responsive.
    """
    response_ready = pyqtSignal(str, float)  # response, inference_time

    def __init__(self, prompt, history):
        super().__init__()
        self.prompt = prompt
        self.history = history

    def run(self):
        """Run inference in background thread."""
        start = time.perf_counter()
        response = inference.ask(self.prompt, self.history)
        elapsed = time.perf_counter() - start
        self.response_ready.emit(response, elapsed)


class ChatWindow(QWidget):
    """
    Main chat interface widget.
    """

    def __init__(self, username: str):
        super().__init__()
        self.username = username
        self.conversation_history = []
        self.current_worker = None
        self.init_ui()

    def init_ui(self):
        """Initialize the chat UI."""
        self.setWindowTitle(f"Aristotle AI - Chat ({self.username})")
        self.setMinimumSize(800, 600)

        # Main layout
        layout = QVBoxLayout()
        layout.setSpacing(10)
        layout.setContentsMargins(10, 10, 10, 10)

        # Header
        header = self._create_header()
        layout.addWidget(header)

        # Chat display area
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        self.chat_display.setStyleSheet("""
            QTextEdit {
                background-color: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 10px;
                font-size: 13px;
            }
        """)
        layout.addWidget(self.chat_display)

        # Status label
        self.status_label = QLabel("Ready to learn! Ask me anything about Computer Science.")
        self.status_label.setStyleSheet("color: #666; font-size: 11px;")
        layout.addWidget(self.status_label)

        # Input area
        input_layout = QHBoxLayout()
        input_layout.setSpacing(10)

        self.input_field = QLineEdit()
        self.input_field.setPlaceholderText("Ask a CS question... (e.g., 'What is a linked list?')")
        self.input_field.setMinimumHeight(40)
        self.input_field.returnPressed.connect(self.send_message)
        self.input_field.setStyleSheet("""
            QLineEdit {
                border: 2px solid #ddd;
                border-radius: 5px;
                padding: 8px;
                font-size: 13px;
            }
            QLineEdit:focus {
                border: 2px solid #4CAF50;
            }
        """)
        input_layout.addWidget(self.input_field)

        self.send_btn = QPushButton("Send")
        self.send_btn.setMinimumSize(80, 40)
        self.send_btn.clicked.connect(self.send_message)
        self.send_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 13px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
            QPushButton:pressed {
                background-color: #3d8b40;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
        """)
        input_layout.addWidget(self.send_btn)

        layout.addLayout(input_layout)

        self.setLayout(layout)

        # Welcome message
        self._add_system_message(
            f"Welcome, {self.username}! I'm Aristotle, your AI CS tutor.\n"
            "I use the Socratic method to help you learn. Ask me anything!"
        )

        # Focus on input
        self.input_field.setFocus()

    def _create_header(self) -> QWidget:
        """Create the header section."""
        header = QWidget()
        header_layout = QHBoxLayout()
        header_layout.setContentsMargins(0, 0, 0, 10)

        title = QLabel("🎓 Aristotle AI Tutor")
        title_font = QFont()
        title_font.setPointSize(16)
        title_font.setBold(True)
        title.setFont(title_font)
        header_layout.addWidget(title)

        header_layout.addStretch()

        user_label = QLabel(f"👤 {self.username}")
        user_label.setStyleSheet("color: #666;")
        header_layout.addWidget(user_label)

        header.setLayout(header_layout)
        return header

    def send_message(self):
        """Handle sending a message."""
        message = self.input_field.text().strip()

        if not message:
            return

        # Disable input while processing
        self.input_field.setEnabled(False)
        self.send_btn.setEnabled(False)
        self.status_label.setText("🤔 Thinking...")

        # Display user message
        self._add_user_message(message)

        # Clear input
        self.input_field.clear()

        # Add to history
        self.conversation_history.append({"role": "user", "content": message})

        # Start inference in background thread
        self.current_worker = InferenceWorker(message, self.conversation_history)
        self.current_worker.response_ready.connect(self.handle_response)
        self.current_worker.start()

    def handle_response(self, response: str, inference_time: float):
        """Handle AI response from background thread."""
        # Display AI response
        self._add_ai_message(response)

        # Add to history
        self.conversation_history.append({"role": "assistant", "content": response})

        # Re-enable input
        self.input_field.setEnabled(True)
        self.send_btn.setEnabled(True)
        self.status_label.setText(f"Ready! (Response time: {inference_time:.2f}s)")

        # Focus back on input
        self.input_field.setFocus()

    def _add_user_message(self, message: str):
        """Add a user message to the chat display."""
        self.chat_display.append(
            f'<div style="margin: 10px 0;">'
            f'<b style="color: #2196F3;">You:</b><br>'
            f'<span style="color: #333;">{self._escape_html(message)}</span>'
            f'</div>'
        )
        self._scroll_to_bottom()

    def _add_ai_message(self, message: str):
        """Add an AI message to the chat display."""
        self.chat_display.append(
            f'<div style="margin: 10px 0; background-color: #e8f5e9; '
            f'padding: 10px; border-radius: 5px;">'
            f'<b style="color: #4CAF50;">Aristotle:</b><br>'
            f'<span style="color: #333;">{self._escape_html(message)}</span>'
            f'</div>'
        )
        self._scroll_to_bottom()

    def _add_system_message(self, message: str):
        """Add a system message to the chat display."""
        self.chat_display.append(
            f'<div style="margin: 10px 0; text-align: center; color: #666; '
            f'font-style: italic; font-size: 12px;">'
            f'{self._escape_html(message)}'
            f'</div>'
        )
        self._scroll_to_bottom()

    def _escape_html(self, text: str) -> str:
        """Escape HTML characters in text."""
        return (text.replace('&', '&amp;')
                   .replace('<', '&lt;')
                   .replace('>', '&gt;')
                   .replace('\n', '<br>'))

    def _scroll_to_bottom(self):
        """Scroll chat display to bottom."""
        scrollbar = self.chat_display.verticalScrollBar()
        scrollbar.setValue(scrollbar.maximum())
