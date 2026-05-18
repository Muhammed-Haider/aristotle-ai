"""
Chat Window - Aristotle AI
Two-panel layout: left sidebar + right chat area.
Dark theme matching Figma design system.
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QLineEdit, QScrollArea, QFrame, QSizePolicy, QStackedWidget
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QTimer
import time

import core.inference as inference
import core.language_detector as lang_detector
import cache.ghost_model as ghost_model

# ── Figma values (same across all screens) ───────────────────────────────────
BG_DARK    = "#0F172B"
BG_PANEL   = "#1D293D"
BORDER     = "#314158"
BLUE       = "#155DFC"
BLUE_LIGHT = "#51A2FF"
WHITE      = "#FFFFFF"
TEXT_MAIN  = "#E2E8F0"
LABEL      = "#CAD5E2"
MUTED      = "#62748E"
FONT       = "'Arimo', 'Arial', sans-serif"


class InferenceWorker(QThread):
    token_received = pyqtSignal(str)
    stream_done    = pyqtSignal(str, float)   # full text, elapsed seconds

    def __init__(self, prompt: str, history: list):
        super().__init__()
        self.prompt = prompt
        self.history = history

    def run(self):
        start     = time.perf_counter()
        full_text = ""
        for token in inference.ask_stream(self.prompt, self.history):
            full_text += token
            self.token_received.emit(token)
        elapsed = time.perf_counter() - start
        self.stream_done.emit(full_text, elapsed)


class _MessageBubble(QFrame):
    """Single chat message bubble — user right-aligned blue, AI left-aligned dark."""

    def __init__(self, text: str, is_user: bool):
        super().__init__()
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)

        if is_user:
            self.setStyleSheet(f"""
                _MessageBubble {{
                    background-color: {BLUE};
                    border-radius: 16px;
                    border-bottom-right-radius: 4px;
                }}
            """)
        else:
            self.setStyleSheet(f"""
                _MessageBubble {{
                    background-color: {BG_PANEL};
                    border: 0.667px solid {BORDER};
                    border-radius: 16px;
                    border-bottom-left-radius: 4px;
                }}
            """)

        lay = QVBoxLayout(self)
        lay.setContentsMargins(18, 13, 18, 13)

        lbl = QLabel(text)
        lbl.setWordWrap(True)
        lbl.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)
        lbl.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        lbl.setStyleSheet(f"""
            color: {WHITE if is_user else TEXT_MAIN};
            font-family: {FONT};
            font-size: 15px;
            line-height: 26px;
            background: transparent;
        """)
        lay.addWidget(lbl)


class _StreamingBubble(QFrame):
    """AI bubble that fills token-by-token with a blinking cursor."""

    def __init__(self):
        super().__init__()
        self._text = ""
        self._cursor_on = True
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
        self.setStyleSheet(f"""
            _StreamingBubble {{
                background-color: {BG_PANEL};
                border: 0.667px solid {BORDER};
                border-radius: 16px;
                border-bottom-left-radius: 4px;
            }}
        """)
        lay = QVBoxLayout(self)
        lay.setContentsMargins(18, 13, 18, 13)

        self._lbl = QLabel("")
        self._lbl.setWordWrap(True)
        self._lbl.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)
        self._lbl.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        self._lbl.setStyleSheet(f"""
            color: {TEXT_MAIN};
            font-family: {FONT};
            font-size: 15px;
            line-height: 26px;
            background: transparent;
        """)
        lay.addWidget(self._lbl)

        self._cursor_timer = QTimer()
        self._cursor_timer.timeout.connect(self._blink)
        self._cursor_timer.start(500)

    def _blink(self):
        self._cursor_on = not self._cursor_on
        self._render()

    def _render(self):
        cursor = "▋" if self._cursor_on else " "
        self._lbl.setText(self._text + cursor)

    def append_token(self, token: str):
        self._text += token
        self._render()

    def finalize(self):
        self._cursor_timer.stop()
        self._lbl.setText(self._text)

    def get_text(self) -> str:
        return self._text


class ChatWindow(QWidget):
    logout_requested = pyqtSignal()

    def __init__(self, email: str):
        super().__init__()
        self.email = email
        self.conversation_history: list = []
        self._worker: InferenceWorker | None = None
        self._urdu_mode: bool = False
        self._streaming_bubble: _StreamingBubble | None = None
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setStyleSheet(f"background-color: {BG_DARK};")
        self._build()

    # ─────────────────────────────────────────────────────────── layout ──

    def _build(self):
        from ui.quiz_panel import QuizPanel
        from ui.progress_panel import ProgressPanel
        from ui.settings_panel import SettingsPanel

        self._right_stack = QStackedWidget()
        self._right_stack.setStyleSheet(f"background-color: {BG_DARK};")
        self._right_stack.addWidget(self._build_chat_panel())   # index 0
        self._right_stack.addWidget(QuizPanel(self.email))      # index 1
        self._right_stack.addWidget(ProgressPanel(self.email))  # index 2
        self._right_stack.addWidget(SettingsPanel(self.email))  # index 3

        root = QHBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)
        root.addWidget(self._build_sidebar(), stretch=0)
        root.addWidget(self._right_stack, stretch=1)

    # ──────────────────────────────────────────────────────── sidebar ──

    def _build_sidebar(self) -> QWidget:
        sidebar = QWidget()
        sidebar.setFixedWidth(240)
        sidebar.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        sidebar.setStyleSheet(f"""
            background-color: {BG_PANEL};
            border-right: 0.667px solid {BORDER};
        """)

        lay = QVBoxLayout(sidebar)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(0)

        lay.addWidget(self._build_logo_bar())
        lay.addWidget(self._build_nav(), stretch=1)
        lay.addWidget(self._build_user_bar())
        return sidebar

    def _build_logo_bar(self) -> QWidget:
        bar = QWidget()
        bar.setFixedHeight(64)
        bar.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        bar.setStyleSheet(f"""
            background-color: {BG_PANEL};
            border-bottom: 0.667px solid {BORDER};
        """)

        lay = QHBoxLayout(bar)
        lay.setContentsMargins(20, 0, 20, 0)
        lay.setSpacing(10)

        icon_box = QWidget()
        icon_box.setFixedSize(32, 32)
        icon_box.setStyleSheet(f"background-color: {BLUE}; border-radius: 8px;")
        ib = QVBoxLayout(icon_box)
        ib.setContentsMargins(0, 0, 0, 0)
        icon_lbl = QLabel("✦")
        icon_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon_lbl.setStyleSheet("color: white; font-size: 14px; background: transparent;")
        ib.addWidget(icon_lbl)

        brand = QLabel("Aristotle")
        brand.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 18px;
            font-weight: 700;
            background: transparent;
        """)

        lay.addWidget(icon_box)
        lay.addWidget(brand)
        lay.addStretch()
        return bar

    def _build_nav(self) -> QWidget:
        nav = QWidget()
        nav.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(nav)
        lay.setContentsMargins(12, 16, 12, 16)
        lay.setSpacing(4)
        lay.setAlignment(Qt.AlignmentFlag.AlignTop)

        self._nav_buttons: list[QPushButton] = []
        for i, (icon, label) in enumerate([
            ("✦", "Chat"),
            ("◎", "Quiz"),
            ("◈", "Progress"),
            ("⚙", "Settings"),
        ]):
            btn = QPushButton(f"  {icon}   {label}")
            btn.setFixedHeight(40)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setStyleSheet(self._nav_style(active=(i == 0)))
            btn.clicked.connect(lambda _, idx=i: self._switch_panel(idx))
            self._nav_buttons.append(btn)
            lay.addWidget(btn)

        return nav

    def _switch_panel(self, index: int):
        self._right_stack.setCurrentIndex(index)
        for i, btn in enumerate(self._nav_buttons):
            btn.setStyleSheet(self._nav_style(active=(i == index)))

    def _nav_style(self, active: bool) -> str:
        if active:
            return f"""
                QPushButton {{
                    background-color: rgba(21, 93, 252, 0.15);
                    color: {BLUE_LIGHT};
                    border: none;
                    border-radius: 8px;
                    font-family: {FONT};
                    font-size: 14px;
                    text-align: left;
                    padding-left: 12px;
                }}
            """
        return f"""
            QPushButton {{
                background-color: transparent;
                color: {MUTED};
                border: none;
                border-radius: 8px;
                font-family: {FONT};
                font-size: 14px;
                text-align: left;
                padding-left: 12px;
            }}
            QPushButton:hover {{
                background-color: rgba(255, 255, 255, 0.04);
                color: {LABEL};
            }}
        """

    def _build_user_bar(self) -> QWidget:
        bar = QWidget()
        bar.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        bar.setStyleSheet(f"""
            background-color: {BG_PANEL};
            border-top: 0.667px solid {BORDER};
        """)

        lay = QVBoxLayout(bar)
        lay.setContentsMargins(16, 12, 16, 16)
        lay.setSpacing(8)

        user_lbl = QLabel(self.email)
        user_lbl.setWordWrap(True)
        user_lbl.setStyleSheet(f"""
            color: {LABEL};
            font-family: {FONT};
            font-size: 12px;
            background: transparent;
        """)

        logout_btn = QPushButton("Sign Out")
        logout_btn.setFixedHeight(32)
        logout_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        logout_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: {MUTED};
                border: 0.667px solid {BORDER};
                border-radius: 8px;
                font-family: {FONT};
                font-size: 13px;
            }}
            QPushButton:hover {{
                color: #ff6b6b;
                border-color: #ff6b6b;
            }}
        """)
        logout_btn.clicked.connect(self.logout_requested)

        lay.addWidget(user_lbl)
        lay.addWidget(logout_btn)
        return bar

    # ──────────────────────────────────────────────────── chat panel ──

    def _build_chat_panel(self) -> QWidget:
        panel = QWidget()
        panel.setStyleSheet(f"background-color: {BG_DARK};")

        lay = QVBoxLayout(panel)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(0)

        lay.addWidget(self._build_chat_header())
        lay.addWidget(self._build_messages_area(), stretch=1)
        lay.addWidget(self._build_input_bar())
        return panel

    def _build_chat_header(self) -> QWidget:
        hdr = QWidget()
        hdr.setFixedHeight(64)
        hdr.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        hdr.setStyleSheet(f"""
            background-color: {BG_DARK};
            border-bottom: 0.667px solid {BORDER};
        """)

        lay = QHBoxLayout(hdr)
        lay.setContentsMargins(24, 0, 24, 0)
        lay.setSpacing(12)

        title = QLabel("Chat with Aristotle")
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 18px;
            font-weight: 700;
            background: transparent;
        """)

        # Urdu language toggle
        self._lang_toggle = QPushButton("اردو")
        self._lang_toggle.setFixedSize(56, 30)
        self._lang_toggle.setCursor(Qt.CursorShape.PointingHandCursor)
        self._lang_toggle.setStyleSheet(self._urdu_btn_style(active=False))
        self._lang_toggle.clicked.connect(self._toggle_urdu)

        self._status_lbl = QLabel("Ready")
        self._status_lbl.setStyleSheet(f"""
            color: {MUTED};
            font-family: {FONT};
            font-size: 13px;
            background: transparent;
        """)

        lay.addWidget(title)
        lay.addStretch()
        lay.addWidget(self._lang_toggle)
        lay.addWidget(self._status_lbl)
        return hdr

    def _urdu_btn_style(self, active: bool) -> str:
        if active:
            return f"""
                QPushButton {{
                    background-color: {BLUE};
                    color: {WHITE};
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                }}
                QPushButton:hover {{ background-color: #1a67ff; }}
            """
        return f"""
            QPushButton {{
                background-color: transparent;
                color: {MUTED};
                border: 0.667px solid {BORDER};
                border-radius: 8px;
                font-size: 13px;
            }}
            QPushButton:hover {{
                color: {LABEL};
                border-color: {LABEL};
            }}
        """

    def _toggle_urdu(self):
        self._set_urdu_mode(not self._urdu_mode)
        mode = "Urdu" if self._urdu_mode else "English"
        self._add_system_msg(f"Switched to {mode} mode")

    def _set_urdu_mode(self, enabled: bool):
        self._urdu_mode = enabled
        self._lang_toggle.setStyleSheet(self._urdu_btn_style(active=enabled))

    def _build_messages_area(self) -> QScrollArea:
        self._scroll = QScrollArea()
        self._scroll.setWidgetResizable(True)
        self._scroll.setFrameShape(QFrame.Shape.NoFrame)
        self._scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self._scroll.setStyleSheet(f"""
            QScrollArea {{ background-color: {BG_DARK}; border: none; }}
            QScrollBar:vertical {{
                background: {BG_DARK};
                width: 6px;
                border-radius: 3px;
            }}
            QScrollBar::handle:vertical {{
                background: {BORDER};
                border-radius: 3px;
                min-height: 24px;
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{ height: 0; }}
        """)

        self._msgs_container = QWidget()
        self._msgs_container.setStyleSheet(f"background-color: {BG_DARK};")
        self._msgs_lay = QVBoxLayout(self._msgs_container)
        self._msgs_lay.setContentsMargins(28, 28, 28, 28)
        self._msgs_lay.setSpacing(12)
        self._msgs_lay.addStretch()

        self._scroll.setWidget(self._msgs_container)

        self._add_system_msg("I'm Aristotle — your Socratic CS tutor. Ask me anything.")
        return self._scroll

    def _build_input_bar(self) -> QWidget:
        bar = QWidget()
        bar.setFixedHeight(72)
        bar.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        bar.setStyleSheet(f"""
            background-color: {BG_DARK};
            border-top: 0.667px solid {BORDER};
        """)

        lay = QHBoxLayout(bar)
        lay.setContentsMargins(24, 16, 24, 16)
        lay.setSpacing(12)

        self._input = QLineEdit()
        self._input.setPlaceholderText("Ask a CS question...")
        self._input.setFixedHeight(40)
        self._input.returnPressed.connect(self.send_message)
        self._input.setStyleSheet(f"""
            QLineEdit {{
                background-color: {BG_PANEL};
                border: 0.667px solid {BORDER};
                border-radius: 10px;
                padding: 4px 14px;
                color: {WHITE};
                font-family: {FONT};
                font-size: 14px;
            }}
            QLineEdit:focus {{ border: 1px solid {BLUE_LIGHT}; }}
        """)

        self._send_btn = QPushButton("Send")
        self._send_btn.setFixedSize(72, 40)
        self._send_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self._send_btn.clicked.connect(self.send_message)
        self._send_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {BLUE};
                color: {WHITE};
                border: none;
                border-radius: 10px;
                font-family: {FONT};
                font-size: 14px;
            }}
            QPushButton:hover   {{ background-color: #1a67ff; }}
            QPushButton:pressed {{ background-color: #1050d0; }}
            QPushButton:disabled {{
                background-color: {BG_PANEL};
                color: {MUTED};
            }}
        """)

        lay.addWidget(self._input)
        lay.addWidget(self._send_btn)
        return bar

    # ──────────────────────────────────────────── message helpers ──

    def _add_system_msg(self, text: str):
        lbl = QLabel(text)
        lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lbl.setWordWrap(True)
        lbl.setStyleSheet(f"""
            color: {MUTED};
            font-family: {FONT};
            font-size: 13px;
            font-style: italic;
            background: transparent;
        """)
        self._msgs_lay.insertWidget(self._msgs_lay.count() - 1, lbl)
        self._scroll_to_bottom()

    def _add_bubble(self, text: str, is_user: bool):
        bubble = _MessageBubble(text, is_user)

        wrapper = QWidget()
        wrapper.setStyleSheet("background: transparent;")
        w_lay = QHBoxLayout(wrapper)
        w_lay.setContentsMargins(0, 0, 0, 0)
        w_lay.setSpacing(0)

        if is_user:
            w_lay.addStretch(30)        # 30% left spacer
            w_lay.addWidget(bubble, 70) # 70% bubble
        else:
            w_lay.addWidget(bubble, 82) # 82% bubble
            w_lay.addStretch(18)        # 18% right spacer

        self._msgs_lay.insertWidget(self._msgs_lay.count() - 1, wrapper)
        self._scroll_to_bottom()

    def _start_streaming_bubble(self) -> _StreamingBubble:
        bubble = _StreamingBubble()

        wrapper = QWidget()
        wrapper.setStyleSheet("background: transparent;")
        w_lay = QHBoxLayout(wrapper)
        w_lay.setContentsMargins(0, 0, 0, 0)
        w_lay.setSpacing(0)
        w_lay.addWidget(bubble, 82)
        w_lay.addStretch(18)

        self._msgs_lay.insertWidget(self._msgs_lay.count() - 1, wrapper)
        self._scroll_to_bottom()
        return bubble

    def _scroll_to_bottom(self):
        bar = self._scroll.verticalScrollBar()
        # Only auto-scroll if user is already near the bottom (within 120px)
        if bar.maximum() - bar.value() < 120 or bar.maximum() == 0:
            QTimer.singleShot(40, lambda: bar.setValue(bar.maximum()))

    # ──────────────────────────────────────────────── send / receive ──

    def send_message(self):
        text = self._input.text().strip()
        if not text or self._worker is not None:
            return

        # Auto-detect Urdu script and enable mode if needed
        if not self._urdu_mode and lang_detector.contains_urdu(text):
            self._set_urdu_mode(True)
            self._add_system_msg("Urdu detected — switched to Urdu mode")

        self._input.clear()

        # Ghost model: instant analogy cache hit — no LLM needed
        cached = ghost_model.lookup(text)
        if cached:
            self._add_bubble(text, is_user=True)
            self.conversation_history.append({"role": "user", "content": text})
            self._add_bubble(cached, is_user=False)
            self.conversation_history.append({"role": "assistant", "content": cached})
            self._status_lbl.setText("Answered from analogy glossary")
            return

        self._input.setEnabled(False)
        self._send_btn.setEnabled(False)
        self._status_lbl.setText("Thinking...")

        self._add_bubble(text, is_user=True)
        self.conversation_history.append({"role": "user", "content": text})

        # Create streaming bubble now so tokens fill it as they arrive
        self._streaming_bubble = self._start_streaming_bubble()
        self._force_scroll_bottom()

        # When Urdu mode is on, seed the history with a Urdu example exchange
        # so the model follows the pattern rather than being told in English.
        if self._urdu_mode:
            urdu_seed = [
                {"role": "user",      "content": "کیا آپ اردو میں جواب دے سکتے ہیں؟"},
                {"role": "assistant", "content": "جی ہاں، میں اردو میں جواب دیتا ہوں۔ CS کی technical terms جیسے array، pointer، function انگریزی میں رہیں گی۔"},
            ]
            history_for_model = urdu_seed + self.conversation_history
            prompt = "اردو میں جواب دیں: " + text
        else:
            history_for_model = self.conversation_history
            prompt = text

        self._worker = InferenceWorker(prompt, history_for_model)
        self._worker.token_received.connect(self._on_token)
        self._worker.stream_done.connect(self._on_stream_done)
        self._worker.start()

    def _on_token(self, token: str):
        if self._streaming_bubble:
            self._streaming_bubble.append_token(token)
            self._scroll_to_bottom()

    def _force_scroll_bottom(self):
        QTimer.singleShot(60, lambda: self._scroll.verticalScrollBar().setValue(
            self._scroll.verticalScrollBar().maximum()
        ))

    def _on_stream_done(self, full_text: str, elapsed: float):
        self.conversation_history.append({"role": "assistant", "content": full_text})
        if self._streaming_bubble:
            self._streaming_bubble.finalize()
        self._streaming_bubble = None
        self._worker = None
        self._input.setEnabled(True)
        self._send_btn.setEnabled(True)
        self._input.setFocus()
        self._status_lbl.setText(f"Response in {elapsed:.1f}s")
