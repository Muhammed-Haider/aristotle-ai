"""
Home Screen - Aristotle AI
Landing page with Login and Register entry points.
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton
)
from PyQt6.QtCore import Qt, pyqtSignal

# Exact values from Figma CSS
LOGO_BG       = "#155DFC"
TITLE_COLOR   = "#FFFFFF"
BLUE_ACCENT   = "#51A2FF"
FEATURE_COLOR = "#CAD5E2"
BUTTON_BORDER = "#45556C"
FOOTER_COLOR  = "#62748E"
FONT          = "'Arimo', 'Arial', sans-serif"


class HomeScreen(QWidget):
    go_to_login    = pyqtSignal()
    go_to_register = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        # Figma gradient: 135deg, #0F172B → #1C398E
        self.setStyleSheet("""
            HomeScreen {
                background: qlineargradient(
                    x1:0, y1:0, x2:1, y2:1,
                    stop:0   rgba(15, 23, 43, 242),
                    stop:0.5 rgba(15, 23, 43, 230),
                    stop:1   rgba(28, 57, 142, 230)
                );
            }
        """)
        self._build()

    # ------------------------------------------------------------------ layout

    def _build(self):
        root = QVBoxLayout(self)
        root.setAlignment(Qt.AlignmentFlag.AlignCenter)
        root.setContentsMargins(0, 0, 0, 0)

        # Content column — 456px wide, matching Figma artboard
        col = QWidget()
        col.setFixedWidth(456)
        col.setStyleSheet("background: transparent;")

        lay = QVBoxLayout(col)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(0)

        # Logo
        lay.addWidget(self._logo(), alignment=Qt.AlignmentFlag.AlignHCenter)
        lay.addSpacing(16)

        # Title — 60px Arimo, letter-spacing -1.5px, weight 400
        title = QLabel("Aristotle")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet(f"""
            color: {TITLE_COLOR};
            font-family: {FONT};
            font-size: 60px;
            font-weight: 400;
            letter-spacing: -1px;
            background: transparent;
        """)
        lay.addWidget(title)
        lay.addSpacing(76)   # gap kept proportional to Figma (features at top:216)

        # Feature badges
        lay.addLayout(self._features())
        lay.addSpacing(32)

        # Buttons
        lay.addLayout(self._buttons())
        lay.addSpacing(48)

        # Footer
        footer = QLabel("Transform your study sessions with AI-driven focus and insights")
        footer.setAlignment(Qt.AlignmentFlag.AlignCenter)
        footer.setWordWrap(True)
        footer.setStyleSheet(f"""
            color: {FOOTER_COLOR};
            font-family: {FONT};
            font-size: 14px;
            line-height: 20px;
            background: transparent;
        """)
        lay.addWidget(footer)

        root.addWidget(col, alignment=Qt.AlignmentFlag.AlignCenter)

    # ------------------------------------------------------------------ widgets

    def _logo(self) -> QWidget:
        """64×64 blue box with sparkle icon, border-radius 14px."""
        box = QWidget()
        box.setFixedSize(64, 64)
        box.setStyleSheet(f"""
            background-color: {LOGO_BG};
            border-radius: 14px;
        """)
        inner = QVBoxLayout(box)
        inner.setContentsMargins(0, 0, 0, 0)
        icon = QLabel("✦")
        icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon.setStyleSheet("color: #ffffff; font-size: 26px; background: transparent;")
        inner.addWidget(icon)
        return box

    def _features(self) -> QHBoxLayout:
        """Three feature badges — gap: 32px, icon colour #51A2FF, text #CAD5E2."""
        row = QHBoxLayout()
        row.setAlignment(Qt.AlignmentFlag.AlignCenter)
        row.setSpacing(32)

        for icon_char, label_text in [
            ("✦", "Adaptive Learning"),
            ("⊙", "Goal Tracking"),
            ("✦", "AI Coaching"),
        ]:
            badge = QWidget()
            badge.setStyleSheet("background: transparent;")
            b_lay = QHBoxLayout(badge)
            b_lay.setContentsMargins(0, 0, 0, 0)
            b_lay.setSpacing(8)

            icon_lbl = QLabel(icon_char)
            icon_lbl.setFixedSize(20, 20)
            icon_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
            icon_lbl.setStyleSheet(
                f"color: {BLUE_ACCENT}; font-size: 11px; background: transparent;"
            )

            text_lbl = QLabel(label_text)
            text_lbl.setStyleSheet(f"""
                color: {FEATURE_COLOR};
                font-family: {FONT};
                font-size: 16px;
                background: transparent;
            """)

            b_lay.addWidget(icon_lbl)
            b_lay.addWidget(text_lbl)
            row.addWidget(badge)

        return row

    def _buttons(self) -> QHBoxLayout:
        """Login + Register buttons — 52px tall, border 2px solid #45556C, radius 14px."""
        row = QHBoxLayout()
        row.setAlignment(Qt.AlignmentFlag.AlignCenter)
        row.setSpacing(16)

        btn_login    = self._btn("Login",    109)
        btn_register = self._btn("Register", 127)

        btn_login.clicked.connect(self.go_to_login)
        btn_register.clicked.connect(self.go_to_register)

        row.addWidget(btn_login)
        row.addWidget(btn_register)
        return row

    def _btn(self, text: str, width: int) -> QPushButton:
        b = QPushButton(text)
        b.setFixedSize(width, 52)
        b.setCursor(Qt.CursorShape.PointingHandCursor)
        b.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: {TITLE_COLOR};
                border: 2px solid {BUTTON_BORDER};
                border-radius: 14px;
                font-family: {FONT};
                font-size: 16px;
            }}
            QPushButton:hover {{
                background-color: rgba(69, 85, 108, 0.25);
                border-color: {BLUE_ACCENT};
            }}
            QPushButton:pressed {{
                background-color: rgba(69, 85, 108, 0.45);
            }}
        """)
        return b
