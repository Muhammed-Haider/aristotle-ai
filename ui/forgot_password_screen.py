"""
Forgot Password Screen - Aristotle AI
Split layout matching Figma CSS exactly.
Offline: stores a reset token locally instead of sending email.
"""

from PyQt6.QtWidgets import (
    QWidget, QHBoxLayout, QVBoxLayout, QLabel,
    QLineEdit, QPushButton
)
from PyQt6.QtCore import Qt, pyqtSignal
import json, secrets
from pathlib import Path

# ── Figma values (shared with Login/Register) ─────────────────────────────────
BG_DARK      = "#0F172B"
BG_ICON      = "#1D293D"     # icon box bg — dark, NOT blue
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
    }}
"""


class ForgotPasswordScreen(QWidget):
    go_to_login = pyqtSignal()
    go_to_home  = pyqtSignal()

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

    # ──────────────────────────────────────── left panel — "Need Help?" ──

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

        # "Need Help?" — Arimo 36px #FFFFFF
        title = QLabel("Need Help?")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 36px;
            font-weight: 400;
            background: transparent;
        """)

        # Subtitle — Arimo 18px #BEDBFF
        sub = QLabel(
            "Don't worry! We'll send you a secure link to reset\n"
            "your password and get you back to learning."
        )
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

    # ───────────────────────────────────────────────── right form panel ──

    def _right_panel(self) -> QWidget:
        panel = QWidget()
        panel.setStyleSheet(f"background-color: {BG_DARK};")

        outer = QVBoxLayout(panel)
        outer.setAlignment(Qt.AlignmentFlag.AlignCenter)
        outer.setContentsMargins(0, 0, 0, 0)

        col = QWidget()
        col.setFixedWidth(424)
        col.setStyleSheet("background: transparent;")

        lay = QVBoxLayout(col)
        lay.setContentsMargins(0, 16, 0, 16)
        lay.setSpacing(0)

        # ── Email icon — 64×64, #1D293D, border-radius 14px ──
        icon_box = QWidget()
        icon_box.setFixedSize(64, 64)
        icon_box.setStyleSheet(f"background-color: {BG_ICON}; border-radius: 14px;")
        icon_inner = QVBoxLayout(icon_box)
        icon_inner.setContentsMargins(0, 0, 0, 0)
        envelope = QLabel("✉")
        envelope.setAlignment(Qt.AlignmentFlag.AlignCenter)
        envelope.setStyleSheet(f"color: {BLUE_LIGHT}; font-size: 26px; background: transparent;")
        icon_inner.addWidget(envelope)
        lay.addWidget(icon_box, alignment=Qt.AlignmentFlag.AlignHCenter)
        lay.addSpacing(16)

        # ── "Forgot Password" — 30px ──
        h_title = self._lbl("Forgot Password", 30, WHITE)
        h_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.addWidget(h_title)
        lay.addSpacing(12)

        # ── Subtitle ──
        h_sub = QLabel(
            "Enter your email and we'll send you instructions\n"
            "to reset your password"
        )
        h_sub.setAlignment(Qt.AlignmentFlag.AlignCenter)
        h_sub.setWordWrap(True)
        h_sub.setStyleSheet(f"""
            color: {SUBTITLE};
            font-family: {FONT};
            font-size: 16px;
            line-height: 24px;
            background: transparent;
        """)
        lay.addWidget(h_sub)
        lay.addSpacing(32)

        # ── Email field ──
        self._email_w = self._field("Email Address", "you@example.com")
        lay.addWidget(self._email_w)
        lay.addSpacing(16)

        # ── Send Reset Link — 48px tall (Figma), full width ──
        self._send_btn = QPushButton("Send Reset Link")
        self._send_btn.setFixedHeight(48)
        self._send_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self._send_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {BLUE};
                color: {WHITE};
                border: none;
                border-radius: 14px;
                font-family: {FONT};
                font-size: 16px;
            }}
            QPushButton:hover   {{ background-color: #1a67ff; }}
            QPushButton:pressed {{ background-color: #1050d0; }}
        """)
        self._send_btn.clicked.connect(self._on_send)
        lay.addWidget(self._send_btn)
        lay.addSpacing(16)

        # ── "Remember your password? Back to Sign In" ──
        sign_row = QHBoxLayout()
        sign_row.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sign_row.setSpacing(4)

        remember = self._lbl("Remember your password?", 14, SUBTITLE)
        back_sign = QPushButton("Back to Sign In")
        back_sign.setFlat(True)
        back_sign.setCursor(Qt.CursorShape.PointingHandCursor)
        back_sign.setStyleSheet(f"""
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
        back_sign.clicked.connect(self.go_to_login)
        sign_row.addWidget(remember)
        sign_row.addWidget(back_sign)
        lay.addLayout(sign_row)

        # ── Status/error message ──
        self._status = QLabel("")
        self._status.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._status.setWordWrap(True)
        self._status.setStyleSheet("font-size: 13px; background: transparent;")
        lay.addSpacing(8)
        lay.addWidget(self._status)

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

    def _field(self, label_text: str, placeholder: str) -> QWidget:
        container = QWidget()
        container.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(container)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(8)

        label = QLabel(label_text)
        label.setStyleSheet(
            f"color: {LABEL_COLOR}; font-family: {FONT}; font-size: 14px; background: transparent;"
        )

        self._email_inp = QLineEdit()
        self._email_inp.setPlaceholderText(placeholder)
        self._email_inp.setFixedHeight(48)
        self._email_inp.setStyleSheet(_INPUT_STYLE)

        lay.addWidget(label)
        lay.addWidget(self._email_inp)
        return container

    def _on_send(self):
        """Store a reset token locally (offline — no actual email sent)."""
        self._status.setText("")
        email = self._email_inp.text().strip().lower()

        if not email or "@" not in email:
            self._status.setStyleSheet("color: #ff4d4d; font-size: 13px; background: transparent;")
            self._status.setText("Enter a valid email address")
            return

        # Check user exists
        users_file = Path("./data/users.json")
        if users_file.exists():
            with open(users_file, "r") as f:
                users = json.load(f)
            if email not in users:
                # Don't reveal whether email exists — show same success message
                pass
            else:
                token = secrets.token_urlsafe(32)
                users[email]["reset_token"] = token
                with open(users_file, "w") as f:
                    json.dump(users, f, indent=2)

        # Always show success (security best practice)
        self._status.setStyleSheet("color: #4ade80; font-size: 13px; background: transparent;")
        self._status.setText(
            "If an account exists for that email, a reset link has been saved locally.\n"
            "Use the token in data/users.json to reset your password."
        )
        self._send_btn.setEnabled(False)
