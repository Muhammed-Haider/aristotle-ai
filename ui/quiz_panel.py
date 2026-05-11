"""
Quiz Panel - Aristotle AI
LLM-generated questions, answer input, evaluation, and passport write-back.
Embedded in ChatWindow right panel stack (Phase 6).
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QTextEdit, QComboBox, QScrollArea, QFrame
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal

import core.quiz_engine as quiz_engine
import passport.mastery_store as mastery
import auth.auth_manager as auth

# ── Figma values ──────────────────────────────────────────────────────────────
BG_DARK    = "#0F172B"
BG_PANEL   = "#1D293D"
BORDER     = "#314158"
BLUE       = "#155DFC"
BLUE_LIGHT = "#51A2FF"
WHITE      = "#FFFFFF"
TEXT_MAIN  = "#E2E8F0"
LABEL      = "#CAD5E2"
MUTED      = "#62748E"
GREEN      = "#22c55e"
YELLOW     = "#f59e0b"
RED        = "#ef4444"
FONT       = "'Arimo', 'Arial', sans-serif"

_FALLBACK_TOPICS = [
    "Data Structures", "Algorithms", "Operating Systems",
    "Computer Networks", "Databases", "OOP",
    "Software Engineering", "Computer Architecture",
    "Discrete Math", "Programming Languages",
]


class _Worker(QThread):
    result_ready = pyqtSignal(dict)

    def __init__(self, mode: str, **kwargs):
        super().__init__()
        self._mode = mode
        self._kw = kwargs

    def run(self):
        if self._mode == "generate":
            result = quiz_engine.generate_question(self._kw["topic"], self._kw["level"])
        else:
            result = quiz_engine.evaluate_answer(
                self._kw["question"], self._kw["answer"], self._kw["topic"]
            )
        self.result_ready.emit(result)


class QuizPanel(QWidget):
    def __init__(self, email: str):
        super().__init__()
        self.email = email
        self._question: str | None = None
        self._topic: str | None = None
        self._worker: _Worker | None = None

        profile = auth.get_profile(email)
        self._subjects = profile.get("subjects", _FALLBACK_TOPICS)
        self._level    = profile.get("level", "Intermediate")

        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setStyleSheet(f"background-color: {BG_DARK};")
        self._build()

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
        lay.setSpacing(16)

        title = QLabel("Quiz Mode")
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 18px;
            font-weight: 700;
            background: transparent;
        """)

        topic_lbl = QLabel("Topic:")
        topic_lbl.setStyleSheet(
            f"color: {MUTED}; font-family: {FONT}; font-size: 13px; background: transparent;"
        )

        self._topic_combo = QComboBox()
        self._topic_combo.addItems(self._subjects)
        self._topic_combo.setFixedHeight(32)
        self._topic_combo.setMinimumWidth(180)
        self._topic_combo.setStyleSheet(f"""
            QComboBox {{
                background-color: {BG_PANEL};
                border: 0.667px solid {BORDER};
                border-radius: 8px;
                padding: 4px 12px;
                color: {WHITE};
                font-family: {FONT};
                font-size: 13px;
            }}
            QComboBox::drop-down {{ border: none; width: 24px; }}
            QComboBox QAbstractItemView {{
                background-color: {BG_PANEL};
                border: 0.667px solid {BORDER};
                color: {WHITE};
                selection-background-color: {BLUE};
            }}
        """)

        self._status_lbl = QLabel("")
        self._status_lbl.setStyleSheet(
            f"color: {MUTED}; font-family: {FONT}; font-size: 13px; background: transparent;"
        )

        lay.addWidget(title)
        lay.addStretch()
        lay.addWidget(topic_lbl)
        lay.addWidget(self._topic_combo)
        lay.addWidget(self._status_lbl)
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

        container = QWidget()
        container.setStyleSheet(f"background-color: {BG_DARK};")
        self._content_lay = QVBoxLayout(container)
        self._content_lay.setContentsMargins(48, 40, 48, 40)
        self._content_lay.setSpacing(20)
        self._content_lay.setAlignment(Qt.AlignmentFlag.AlignTop)

        self._idle_card     = self._build_idle_card()
        self._question_card = self._build_question_card()
        self._answer_area   = self._build_answer_area()
        self._feedback_card = self._build_feedback_card()

        self._question_card.setVisible(False)
        self._answer_area.setVisible(False)
        self._feedback_card.setVisible(False)

        for w in [self._idle_card, self._question_card,
                  self._answer_area, self._feedback_card]:
            self._content_lay.addWidget(w)

        scroll.setWidget(container)
        return scroll

    # ─────────────────────────────────────────────── card widgets ──

    def _build_idle_card(self) -> QFrame:
        card = self._card()
        lay = QVBoxLayout(card)
        lay.setContentsMargins(40, 40, 40, 40)
        lay.setSpacing(16)
        lay.setAlignment(Qt.AlignmentFlag.AlignCenter)

        icon = QLabel("◎")
        icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon.setStyleSheet(f"color: {BLUE_LIGHT}; font-size: 40px; background: transparent;")

        title = QLabel("Test Your Knowledge")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 22px;
            font-weight: 700;
            background: transparent;
        """)

        sub = QLabel(
            "Select a topic above and generate a question.\n"
            "Scores are saved to your Mastery Passport."
        )
        sub.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sub.setWordWrap(True)
        sub.setStyleSheet(f"""
            color: {MUTED};
            font-family: {FONT};
            font-size: 14px;
            line-height: 22px;
            background: transparent;
        """)

        self._gen_btn = QPushButton("Generate Question")
        self._gen_btn.setFixedSize(180, 40)
        self._gen_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self._gen_btn.setStyleSheet(self._blue_btn_style())
        self._gen_btn.clicked.connect(self._on_generate)

        lay.addWidget(icon)
        lay.addWidget(title)
        lay.addWidget(sub)
        lay.addSpacing(8)
        lay.addWidget(self._gen_btn, alignment=Qt.AlignmentFlag.AlignCenter)
        return card

    def _build_question_card(self) -> QFrame:
        card = self._card()
        lay = QVBoxLayout(card)
        lay.setContentsMargins(32, 28, 32, 28)
        lay.setSpacing(12)

        meta_row = QHBoxLayout()
        self._q_topic_lbl = QLabel("")
        self._q_topic_lbl.setStyleSheet(f"""
            color: {BLUE_LIGHT};
            font-family: {FONT};
            font-size: 12px;
            font-weight: 700;
            background: transparent;
        """)
        self._q_level_lbl = QLabel("")
        self._q_level_lbl.setStyleSheet(
            f"color: {MUTED}; font-family: {FONT}; font-size: 12px; background: transparent;"
        )
        meta_row.addWidget(self._q_topic_lbl)
        meta_row.addStretch()
        meta_row.addWidget(self._q_level_lbl)

        self._question_lbl = QLabel("")
        self._question_lbl.setWordWrap(True)
        self._question_lbl.setTextInteractionFlags(
            Qt.TextInteractionFlag.TextSelectableByMouse
        )
        self._question_lbl.setStyleSheet(f"""
            color: {TEXT_MAIN};
            font-family: {FONT};
            font-size: 16px;
            line-height: 26px;
            background: transparent;
        """)

        lay.addLayout(meta_row)
        lay.addWidget(self._question_lbl)
        return card

    def _build_answer_area(self) -> QWidget:
        area = QWidget()
        area.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(area)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(12)

        ans_lbl = QLabel("Your Answer")
        ans_lbl.setStyleSheet(
            f"color: {LABEL}; font-family: {FONT}; font-size: 14px; background: transparent;"
        )

        self._answer_input = QTextEdit()
        self._answer_input.setPlaceholderText("Type your answer here...")
        self._answer_input.setFixedHeight(120)
        self._answer_input.setStyleSheet(f"""
            QTextEdit {{
                background-color: {BG_PANEL};
                border: 0.667px solid {BORDER};
                border-radius: 12px;
                padding: 12px;
                color: {WHITE};
                font-family: {FONT};
                font-size: 14px;
            }}
            QTextEdit:focus {{ border: 1px solid {BLUE_LIGHT}; }}
        """)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(12)

        skip_btn = QPushButton("Skip")
        skip_btn.setFixedSize(80, 36)
        skip_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        skip_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: {MUTED};
                border: 0.667px solid {BORDER};
                border-radius: 8px;
                font-family: {FONT};
                font-size: 13px;
            }}
            QPushButton:hover {{ color: {LABEL}; border-color: {LABEL}; }}
        """)
        skip_btn.clicked.connect(self._show_idle)

        self._submit_btn = QPushButton("Submit Answer")
        self._submit_btn.setFixedSize(140, 36)
        self._submit_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self._submit_btn.setStyleSheet(self._blue_btn_style(w=140))
        self._submit_btn.clicked.connect(self._on_submit)

        btn_row.addWidget(skip_btn)
        btn_row.addStretch()
        btn_row.addWidget(self._submit_btn)

        lay.addWidget(ans_lbl)
        lay.addWidget(self._answer_input)
        lay.addLayout(btn_row)
        return area

    def _build_feedback_card(self) -> QFrame:
        card = self._card()
        lay = QVBoxLayout(card)
        lay.setContentsMargins(32, 28, 32, 28)
        lay.setSpacing(16)

        score_row = QHBoxLayout()
        score_row.setSpacing(16)

        self._score_badge = QLabel("0")
        self._score_badge.setFixedSize(64, 64)
        self._score_badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._score_badge.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 24px;
            font-weight: 700;
            background-color: {GREEN};
            border-radius: 32px;
        """)

        score_info = QWidget()
        score_info.setStyleSheet("background: transparent;")
        si_lay = QVBoxLayout(score_info)
        si_lay.setContentsMargins(0, 0, 0, 0)
        si_lay.setSpacing(4)

        self._result_title = QLabel("Great answer!")
        self._result_title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 18px;
            font-weight: 700;
            background: transparent;
        """)
        self._result_sub = QLabel("Saved to your Mastery Passport")
        self._result_sub.setStyleSheet(
            f"color: {MUTED}; font-family: {FONT}; font-size: 13px; background: transparent;"
        )
        si_lay.addWidget(self._result_title)
        si_lay.addWidget(self._result_sub)

        score_row.addWidget(self._score_badge)
        score_row.addWidget(score_info)
        score_row.addStretch()

        self._feedback_lbl = QLabel("")
        self._feedback_lbl.setWordWrap(True)
        self._feedback_lbl.setStyleSheet(f"""
            color: {TEXT_MAIN};
            font-family: {FONT};
            font-size: 14px;
            line-height: 22px;
            background: transparent;
        """)

        next_btn = QPushButton("Next Question")
        next_btn.setFixedSize(140, 36)
        next_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        next_btn.setStyleSheet(self._blue_btn_style(w=140))
        next_btn.clicked.connect(self._on_generate)

        btn_row = QHBoxLayout()
        btn_row.addStretch()
        btn_row.addWidget(next_btn)

        lay.addLayout(score_row)
        lay.addWidget(self._feedback_lbl)
        lay.addLayout(btn_row)
        return card

    # ──────────────────────────────────────────────── quiz logic ──

    def _on_generate(self):
        if self._worker:
            return
        topic = self._topic_combo.currentText()
        self._topic = topic
        self._set_status("Generating question...")
        self._gen_btn.setEnabled(False)

        self._worker = _Worker("generate", topic=topic, level=self._level)
        self._worker.result_ready.connect(self._on_question_ready)
        self._worker.start()

    def _on_question_ready(self, result: dict):
        self._worker = None
        self._set_status("")
        self._question = result["question"]

        self._q_topic_lbl.setText(result["topic"])
        self._q_level_lbl.setText(result["level"])
        self._question_lbl.setText(result["question"])
        self._answer_input.clear()
        self._submit_btn.setEnabled(True)
        self._show_question()

    def _on_submit(self):
        answer = self._answer_input.toPlainText().strip()
        if not answer or self._worker:
            return

        self._set_status("Evaluating...")
        self._submit_btn.setEnabled(False)

        self._worker = _Worker(
            "evaluate",
            question=self._question,
            answer=answer,
            topic=self._topic,
        )
        self._worker.result_ready.connect(self._on_result_ready)
        self._worker.start()

    def _on_result_ready(self, result: dict):
        self._worker = None
        self._set_status("")

        score = result["score"]
        mastery.update(self.email, self._topic, score)

        if score >= 80:
            color, title = GREEN, "Excellent!"
        elif score >= 60:
            color, title = YELLOW, "Good effort!"
        else:
            color, title = RED, "Keep practicing"

        self._score_badge.setText(str(score))
        self._score_badge.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 24px;
            font-weight: 700;
            background-color: {color};
            border-radius: 32px;
        """)
        self._result_title.setText(title)
        self._feedback_lbl.setText(result["feedback"])
        self._show_result()

    # ─────────────────────────────────── state switches ──

    def _show_idle(self):
        self._gen_btn.setEnabled(True)
        self._idle_card.setVisible(True)
        self._question_card.setVisible(False)
        self._answer_area.setVisible(False)
        self._feedback_card.setVisible(False)

    def _show_question(self):
        self._idle_card.setVisible(False)
        self._question_card.setVisible(True)
        self._answer_area.setVisible(True)
        self._feedback_card.setVisible(False)

    def _show_result(self):
        self._idle_card.setVisible(False)
        self._question_card.setVisible(True)
        self._answer_area.setVisible(False)
        self._feedback_card.setVisible(True)

    def _set_status(self, msg: str):
        self._status_lbl.setText(msg)

    # ──────────────────────────────────── style helpers ──

    def _card(self) -> QFrame:
        f = QFrame()
        f.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        f.setStyleSheet(f"""
            QFrame {{
                background-color: {BG_PANEL};
                border: 0.667px solid {BORDER};
                border-radius: 16px;
            }}
        """)
        return f

    def _blue_btn_style(self, w: int = 180) -> str:
        return f"""
            QPushButton {{
                background-color: {BLUE};
                color: {WHITE};
                border: none;
                border-radius: 8px;
                font-family: {FONT};
                font-size: 13px;
            }}
            QPushButton:hover   {{ background-color: #1a67ff; }}
            QPushButton:pressed {{ background-color: #1050d0; }}
            QPushButton:disabled {{ background-color: {BG_PANEL}; color: {MUTED}; }}
        """
