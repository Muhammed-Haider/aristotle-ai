"""
Register Screen - Aristotle AI
Split layout: left branding panel + right registration form.
Exact colours and spacing from Figma CSS.
"""

from PyQt6.QtWidgets import (
    QWidget, QHBoxLayout, QVBoxLayout, QLabel,
    QLineEdit, QPushButton
)
from PyQt6.QtCore import Qt, pyqtSignal

import auth.auth_manager as auth

# ── Exact Figma values ────────────────────────────────────────────────────────
BG_DARK      = "#0F172B"
BG_INPUT     = "#1D293D"
INPUT_BORDER = "#314158"
BLUE         = "#155DFC"
BLUE_LIGHT   = "#51A2FF"
WHITE        = "#FFFFFF"
LABEL_COLOR  = "#CAD5E2"
SUBTITLE     = "#90A1B9"
LEFT_TEXT    = "#BEDBFF"
MUTED        = "#62748E"
FONT         = "'Arimo', 'Arial', sans-serif"

_INPUT_STYLE = f"""
    QLineEdit {{
        background-color: {BG_INPUT};
        border: 0.667px solid {INPUT_BORDER};
        border-radius: 10px;
        padding: 4px 12px;
        color: {WHITE};
        font-family: {FONT};
        font-size: 14px;
    }}
    QLineEdit:focus {{
        border: 1px solid {BLUE_LIGHT};
        outline: none;
    }}
"""


class RegisterScreen(QWidget):
    go_to_login  = pyqtSignal()
    go_to_home   = pyqtSignal()
    register_ok  = pyqtSignal(str)   # emits email on success

    def __init__(self):
        super().__init__()
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setStyleSheet(f"background-color: {BG_DARK};")
        self._build()

    # ─────────────────────────────────────────────────────────────── layout ──

    def _build(self):
        root = QHBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)
        root.addWidget(self._left_panel(),  stretch=50)
        root.addWidget(self._right_panel(), stretch=50)

    # ─────────────────────────────────────────────────── left branding panel ──

    def _left_panel(self) -> QWidget:
        panel = QWidget()
        panel.setStyleSheet("""
            background: qlineargradient(
                x1:0, y1:0, x2:1, y2:1,
                stop:0 rgba(28, 57, 142, 204),
                stop:1 rgba(15, 23, 43, 204)
            );
        """)
        lay = QVBoxLayout(panel)
        lay.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.setSpacing(24)
        lay.setContentsMargins(48, 48, 48, 48)

        # Logo — 80×80, #155DFC, border-radius 16px
        logo = QWidget()
        logo.setFixedSize(80, 80)
        logo.setStyleSheet(f"background-color: {BLUE}; border-radius: 16px;")
        logo_lay = QVBoxLayout(logo)
        logo_lay.setContentsMargins(0, 0, 0, 0)
        icon = QLabel("✦")
        icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon.setStyleSheet("color: white; font-size: 30px; background: transparent;")
        logo_lay.addWidget(icon)

        # "Welcome to Aristotle" — Arimo 36px #FFFFFF
        title = QLabel("Welcome to Aristotle")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setWordWrap(True)
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 36px;
            font-weight: 400;
            background: transparent;
        """)

        # Subtitle — Arimo 18px #BEDBFF
        sub = QLabel("Learn with Reason. Your AI-powered\nstudy companion for smarter learning.")
        sub.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sub.setWordWrap(True)
        sub.setStyleSheet(f"""
            color: {LEFT_TEXT};
            font-family: {FONT};
            font-size: 18px;
            line-height: 28px;
            background: transparent;
        """)

        lay.addWidget(logo, alignment=Qt.AlignmentFlag.AlignHCenter)
        lay.addWidget(title)
        lay.addWidget(sub)
        return panel

    # ──────────────────────────────────────────────────── right form panel ──

    def _right_panel(self) -> QWidget:
        panel = QWidget()
        panel.setStyleSheet(f"background-color: {BG_DARK};")

        outer = QVBoxLayout(panel)
        outer.setAlignment(Qt.AlignmentFlag.AlignCenter)
        outer.setContentsMargins(0, 0, 0, 0)

        # Content column — 424px wide (≈ Figma 423.67px)
        col = QWidget()
        col.setFixedWidth(424)
        col.setStyleSheet("background: transparent;")

        lay = QVBoxLayout(col)
        lay.setContentsMargins(0, 16, 0, 16)
        lay.setSpacing(0)

        # ── Header ──
        h_title = self._lbl("Create Account", 30, WHITE)
        h_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        h_sub = self._lbl("Start your learning journey today", 16, SUBTITLE)
        h_sub.setAlignment(Qt.AlignmentFlag.AlignCenter)

        lay.addWidget(h_title)
        lay.addSpacing(8)
        lay.addWidget(h_sub)
        lay.addSpacing(32)

        # ── Fields ──
        self._email_w   = self._field("Email",            "you@example.com", False)
        self._pass_w    = self._field("Password",         "••••••••",        True)
        self._confirm_w = self._field("Confirm Password", "••••••••",        True)

        for w in [self._email_w, self._pass_w, self._confirm_w]:
            lay.addWidget(w)
            lay.addSpacing(16)

        lay.addSpacing(4)

        # ── Create Account button — full width 36px tall, #155DFC ──
        self._create_btn = QPushButton("Create Account")
        self._create_btn.setFixedHeight(36)
        self._create_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self._create_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {BLUE};
                color: {WHITE};
                border: none;
                border-radius: 14px;
                font-family: {FONT};
                font-size: 14px;
            }}
            QPushButton:hover   {{ background-color: #1a67ff; }}
            QPushButton:pressed {{ background-color: #1050d0; }}
        """)
        self._create_btn.clicked.connect(self._on_register)
        lay.addWidget(self._create_btn)
        lay.addSpacing(16)

        # ── "Already have an account? Sign In" ──
        sign_row = QHBoxLayout()
        sign_row.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sign_row.setSpacing(4)

        already = self._lbl("Already have an account?", 14, SUBTITLE)
        sign_in = QPushButton("Sign In")
        sign_in.setFlat(True)
        sign_in.setCursor(Qt.CursorShape.PointingHandCursor)
        sign_in.setStyleSheet(f"""
            QPushButton {{
                color: {BLUE_LIGHT};
                font-family: {FONT};
                font-size: 16px;
                background: transparent;
                border: none;
                padding: 0;
            }}
            QPushButton:hover {{ text-decoration: underline; }}
        """)
        sign_in.clicked.connect(self.go_to_login)
        sign_row.addWidget(already)
        sign_row.addWidget(sign_in)
        lay.addLayout(sign_row)

        # ── Error label ──
        self._error = QLabel("")
        self._error.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._error.setWordWrap(True)
        self._error.setStyleSheet("color: #ff4d4d; font-size: 13px; background: transparent;")
        lay.addSpacing(8)
        lay.addWidget(self._error)

        lay.addStretch()

        # ── Back to home ──
        back = QPushButton("← Back to home")
        back.setFlat(True)
        back.setCursor(Qt.CursorShape.PointingHandCursor)
        back.setStyleSheet(f"""
            QPushButton {{
                color: {MUTED};
                font-family: {FONT};
                font-size: 14px;
                background: transparent;
                border: none;
                text-align: left;
            }}
            QPushButton:hover {{ color: {BLUE_LIGHT}; }}
        """)
        back.clicked.connect(self.go_to_home)
        lay.addWidget(back)

        outer.addWidget(col, alignment=Qt.AlignmentFlag.AlignCenter)
        return panel

    # ─────────────────────────────────────────────────────────────── helpers ──

    def _lbl(self, text: str, size: int, color: str) -> QLabel:
        lbl = QLabel(text)
        lbl.setStyleSheet(
            f"color: {color}; font-family: {FONT}; font-size: {size}px; background: transparent;"
        )
        return lbl

    def _field(self, label_text: str, placeholder: str, secret: bool) -> QWidget:
        """Label + QLineEdit pair styled to Figma spec."""
        container = QWidget()
        container.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(container)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(8)

        label = QLabel(label_text)
        label.setStyleSheet(
            f"color: {LABEL_COLOR}; font-family: {FONT}; font-size: 14px; background: transparent;"
        )

        inp = QLineEdit()
        inp.setPlaceholderText(placeholder)
        inp.setFixedHeight(48)
        inp.setStyleSheet(_INPUT_STYLE)
        if secret:
            inp.setEchoMode(QLineEdit.EchoMode.Password)

        lay.addWidget(label)
        lay.addWidget(inp)
        return container

    def _get_text(self, field_widget: QWidget) -> str:
        return field_widget.findChild(QLineEdit).text()

    def _on_register(self):
        self._error.setText("")
        email    = self._get_text(self._email_w).strip()
        password = self._get_text(self._pass_w)
        confirm  = self._get_text(self._confirm_w)

        if password != confirm:
            self._error.setText("Passwords do not match")
            return

        success, msg = auth.register(email, password)
        if success:
            self.register_ok.emit(email)
        else:
            self._error.setText(msg)
