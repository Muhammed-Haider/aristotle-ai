"""
Progress Panel - Aristotle AI
Displays per-topic mastery scores from the Mastery Passport.
Embedded in ChatWindow right panel stack (Phase 6).
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame,
    QScrollArea, QProgressBar
)
from PyQt6.QtCore import Qt

import passport.mastery_store as mastery

BG_DARK    = "#0F172B"
BG_PANEL   = "#1D293D"
BG_BAR     = "#0F1F35"
BORDER     = "#314158"
WHITE      = "#FFFFFF"
TEXT_MAIN  = "#E2E8F0"
LABEL      = "#CAD5E2"
MUTED      = "#62748E"
GREEN      = "#22c55e"
YELLOW     = "#f59e0b"
RED        = "#ef4444"
FONT       = "'Arimo', 'Arial', sans-serif"


def _score_color(score: int) -> str:
    if score >= 80:
        return GREEN
    if score >= 60:
        return YELLOW
    return RED


class ProgressPanel(QWidget):
    def __init__(self, email: str):
        super().__init__()
        self.email = email
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setStyleSheet(f"background-color: {BG_DARK};")
        self._build()

    def showEvent(self, event):
        super().showEvent(event)
        self._refresh()

    # ─────────────────────────────────────────────────────── layout ──

    def _build(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)
        root.addWidget(self._build_header())
        root.addWidget(self._build_scroll(), stretch=1)

    def _build_header(self) -> QWidget:
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

        title = QLabel("Mastery Passport")
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 18px;
            font-weight: 700;
            background: transparent;
        """)
        sub = QLabel("Your topic mastery scores")
        sub.setStyleSheet(
            f"color: {MUTED}; font-family: {FONT}; font-size: 13px; background: transparent;"
        )
        lay.addWidget(title)
        lay.addWidget(sub)
        lay.addStretch()
        return hdr

    def _build_scroll(self) -> QScrollArea:
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll.setStyleSheet(f"""
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

        self._container = QWidget()
        self._container.setStyleSheet(f"background-color: {BG_DARK};")
        self._list_lay = QVBoxLayout(self._container)
        self._list_lay.setContentsMargins(48, 32, 48, 32)
        self._list_lay.setSpacing(12)
        self._list_lay.setAlignment(Qt.AlignmentFlag.AlignTop)

        scroll.setWidget(self._container)
        return scroll

    # ──────────────────────────────────────────────── refresh ──

    def _refresh(self):
        while self._list_lay.count():
            item = self._list_lay.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        all_data = mastery.get_all(self.email)

        if not all_data:
            placeholder = QLabel(
                "No quiz results yet.\n"
                "Complete some quizzes to see your progress here."
            )
            placeholder.setAlignment(Qt.AlignmentFlag.AlignCenter)
            placeholder.setWordWrap(True)
            placeholder.setStyleSheet(f"""
                color: {MUTED};
                font-family: {FONT};
                font-size: 15px;
                font-style: italic;
                background: transparent;
            """)
            self._list_lay.addWidget(placeholder)
            return

        for topic, data in sorted(all_data.items()):
            self._list_lay.addWidget(self._topic_card(topic, data))

    def _topic_card(self, topic: str, data: dict) -> QFrame:
        best     = data.get("best", 0)
        attempts = data.get("attempts", 0)
        color    = _score_color(best)

        card = QFrame()
        card.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        card.setStyleSheet(f"""
            QFrame {{
                background-color: {BG_PANEL};
                border: 0.667px solid {BORDER};
                border-radius: 12px;
            }}
        """)
        lay = QVBoxLayout(card)
        lay.setContentsMargins(24, 18, 24, 18)
        lay.setSpacing(10)

        top_row = QHBoxLayout()
        topic_lbl = QLabel(topic)
        topic_lbl.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 15px;
            font-weight: 700;
            background: transparent;
        """)
        att_lbl = QLabel(f"{attempts} attempt{'s' if attempts != 1 else ''}")
        att_lbl.setStyleSheet(
            f"color: {MUTED}; font-family: {FONT}; font-size: 12px; background: transparent;"
        )
        top_row.addWidget(topic_lbl)
        top_row.addStretch()
        top_row.addWidget(att_lbl)

        bar_row = QHBoxLayout()
        bar_row.setSpacing(12)

        bar = QProgressBar()
        bar.setFixedHeight(8)
        bar.setRange(0, 100)
        bar.setValue(best)
        bar.setTextVisible(False)
        bar.setStyleSheet(f"""
            QProgressBar {{
                background-color: {BG_BAR};
                border-radius: 4px;
                border: none;
            }}
            QProgressBar::chunk {{
                background-color: {color};
                border-radius: 4px;
            }}
        """)

        score_lbl = QLabel(f"{best}/100")
        score_lbl.setFixedWidth(52)
        score_lbl.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
        score_lbl.setStyleSheet(f"""
            color: {color};
            font-family: {FONT};
            font-size: 13px;
            font-weight: 700;
            background: transparent;
        """)

        bar_row.addWidget(bar, stretch=1)
        bar_row.addWidget(score_lbl)

        lay.addLayout(top_row)
        lay.addLayout(bar_row)
        return card
