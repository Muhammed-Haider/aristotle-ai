"""
Onboarding Screen - Aristotle AI
3-step profile setup: CS Subjects → Skill Level → Learning Goals
Exact layout from Figma CSS. CS subjects replace generic ones per user requirement.
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QStackedWidget, QFrame, QLineEdit, QSizePolicy, QGridLayout,
    QProgressBar
)
from PyQt6.QtCore import Qt, pyqtSignal

import auth.auth_manager as auth

# ── Figma values ──────────────────────────────────────────────────────────────
BG           = "#0F172B"
BG_CHIP_OFF  = "#1D293D"
BORDER_OFF   = "#314158"
BLUE         = "#155DFC"
WHITE        = "#FFFFFF"
TEXT_MAIN    = "#E2E8F0"
LABEL        = "#CAD5E2"
MUTED        = "#90A1B9"
BORDER_HDR   = "#1D293D"
FONT         = "'Arimo', 'Arial', sans-serif"

# CS subjects replacing generic Figma subjects (user requirement)
CS_SUBJECTS = [
    "Data Structures", "Algorithms", "Operating Systems",
    "Computer Networks", "Databases",
    "OOP", "Software Engineering", "Comp. Architecture",
    "Discrete Math", "Prog. Languages",
]


# ─────────────────────────────────────────────────────── toggleable chip ──────
class _Chip(QPushButton):
    def __init__(self, text: str):
        super().__init__(text)
        self.setCheckable(True)
        self.setFixedHeight(52)
        self.setMinimumWidth(80)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self._refresh()
        self.toggled.connect(lambda _: self._refresh())

    def _refresh(self):
        if self.isChecked():
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: {BLUE};
                    border: 2px solid {BLUE};
                    border-radius: 12px;
                    color: {WHITE};
                    font-family: {FONT};
                    font-size: 13px;
                }}
            """)
        else:
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: {BG_CHIP_OFF};
                    border: 2px solid {BORDER_OFF};
                    border-radius: 12px;
                    color: {LABEL};
                    font-family: {FONT};
                    font-size: 13px;
                }}
                QPushButton:hover {{
                    border-color: {BLUE};
                    color: {WHITE};
                }}
            """)


# ─────────────────────────────────────────────────────────── main screen ──────
class OnboardingScreen(QWidget):
    onboarding_complete = pyqtSignal(dict)   # emits profile dict on finish

    def __init__(self, email: str):
        super().__init__()
        self.email = email
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setStyleSheet(f"background-color: {BG};")

        self._profile = {"subjects": [], "level": None, "goals": []}
        self._current_step = 0   # 0-indexed

        self._build()

    # ────────────────────────────────────────────────────────── layout ──

    def _build(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        root.addWidget(self._build_header())

        self._stack = QStackedWidget()
        self._stack.setStyleSheet("background: transparent;")
        self._stack.addWidget(self._build_step1())
        self._stack.addWidget(self._build_step2())
        self._stack.addWidget(self._build_step3())
        root.addWidget(self._stack, stretch=1)

    # ───────────────────────────────────────────────────────── header ──

    def _build_header(self) -> QWidget:
        header = QWidget()
        header.setFixedHeight(153)
        header.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        header.setStyleSheet(f"""
            background-color: {BG};
            border-bottom: 0.667px solid {BORDER_HDR};
        """)

        lay = QVBoxLayout(header)
        lay.setContentsMargins(72, 32, 72, 12)
        lay.setSpacing(16)

        # "Let's personalize your experience" — bold 30px
        title = QLabel("Let's personalize your experience")
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 30px;
            font-weight: 700;
            background: transparent;
        """)

        # Progress bar track + fill
        bar_container = QWidget()
        bar_container.setFixedHeight(8)
        bar_container.setStyleSheet("background: transparent;")
        bar_lay = QHBoxLayout(bar_container)
        bar_lay.setContentsMargins(0, 0, 0, 0)
        bar_lay.setSpacing(0)

        self._progress_bar = QProgressBar()
        self._progress_bar.setFixedHeight(8)
        self._progress_bar.setRange(0, 3)
        self._progress_bar.setValue(1)
        self._progress_bar.setTextVisible(False)
        self._progress_bar.setStyleSheet(f"""
            QProgressBar {{
                background-color: #1D293D;
                border-radius: 4px;
                border: none;
            }}
            QProgressBar::chunk {{
                background-color: {BLUE};
                border-radius: 4px;
            }}
        """)
        bar_lay.addWidget(self._progress_bar)

        # "Step X of 3"
        self._step_lbl = QLabel("Step 1 of 3")
        self._step_lbl.setStyleSheet(f"""
            color: {LABEL};
            font-family: {FONT};
            font-size: 14px;
            background: transparent;
        """)

        lay.addWidget(title)
        lay.addWidget(bar_container)
        lay.addWidget(self._step_lbl)
        return header

    # ─────────────────────────────────────────────────────────── step 1 ──

    def _build_step1(self) -> QWidget:
        page = QWidget()
        page.setStyleSheet("background: transparent;")

        outer = QVBoxLayout(page)
        outer.setContentsMargins(64, 80, 80, 0)
        outer.setSpacing(0)

        col = QWidget()
        col.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(col)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(32)

        # ── Title block ──
        title = QLabel("Which subjects are you studying?")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setWordWrap(True)
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 48px;
            font-weight: 700;
            background: transparent;
        """)

        subtitle = QLabel("Select all that apply or add your own")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setStyleSheet(f"""
            color: {TEXT_MAIN};
            font-family: {FONT};
            font-size: 20px;
            background: transparent;
        """)

        title_block = QWidget()
        title_block.setStyleSheet("background: transparent;")
        tb_lay = QVBoxLayout(title_block)
        tb_lay.setContentsMargins(0, 0, 0, 0)
        tb_lay.setSpacing(16)
        tb_lay.addWidget(title)
        tb_lay.addWidget(subtitle)

        # ── Subject chips — 5 per row, 2 rows, gap 12px ──
        self._subject_chips: list[_Chip] = []
        grid = QWidget()
        grid.setStyleSheet("background: transparent;")
        grid_lay = QGridLayout(grid)
        grid_lay.setContentsMargins(0, 0, 0, 0)
        grid_lay.setHorizontalSpacing(12)
        grid_lay.setVerticalSpacing(12)

        for i, subj in enumerate(CS_SUBJECTS):
            chip = _Chip(subj)
            self._subject_chips.append(chip)
            grid_lay.addWidget(chip, i // 5, i % 5)

        # ── "Add Custom Subject" button ──
        add_custom_container = QWidget()
        add_custom_container.setStyleSheet(f"border-top: 0.667px solid {BORDER_OFF}; background: transparent;")
        ac_lay = QVBoxLayout(add_custom_container)
        ac_lay.setContentsMargins(0, 24, 0, 0)
        ac_lay.setSpacing(8)

        self._add_btn = QPushButton("+ Add Custom Subject")
        self._add_btn.setFixedHeight(60)
        self._add_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self._add_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: rgba(29, 41, 61, 0.5);
                border: 2px solid #45556C;
                border-radius: 14px;
                color: {MUTED};
                font-family: {FONT};
                font-size: 16px;
            }}
            QPushButton:hover {{
                border-color: {BLUE};
                color: {WHITE};
            }}
        """)
        self._add_btn.clicked.connect(self._toggle_custom_input)

        self._custom_input = QLineEdit()
        self._custom_input.setPlaceholderText("Type subject name and press Enter")
        self._custom_input.setFixedHeight(48)
        self._custom_input.setVisible(False)
        self._custom_input.setStyleSheet(f"""
            QLineEdit {{
                background-color: {BG_CHIP_OFF};
                border: 0.667px solid {BORDER_OFF};
                border-radius: 10px;
                padding: 4px 12px;
                color: {WHITE};
                font-family: {FONT};
                font-size: 14px;
            }}
            QLineEdit:focus {{ border: 1px solid {BLUE}; }}
        """)
        self._custom_input.returnPressed.connect(self._add_custom_subject)

        ac_lay.addWidget(self._add_btn)
        ac_lay.addWidget(self._custom_input)

        # ── Back / Next ──
        nav = self._build_nav(back_enabled=False, next_slot=self._step1_next)

        lay.addWidget(title_block)
        lay.addWidget(grid)
        lay.addWidget(add_custom_container)
        lay.addLayout(nav)

        outer.addWidget(col)
        outer.addStretch()
        return page

    # ──────────────────────────────────────────────── navigation row ──

    def _build_nav(self, back_enabled: bool, next_slot, back_slot=None) -> QHBoxLayout:
        row = QHBoxLayout()
        row.setContentsMargins(0, 8, 0, 24)

        back_btn = QPushButton("← Back")
        back_btn.setFixedSize(87, 36)
        back_btn.setEnabled(back_enabled)
        back_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        back_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {WHITE};
                border: 0.667px solid {BORDER_OFF};
                border-radius: 8px;
                color: {BG};
                font-family: {FONT};
                font-size: 14px;
            }}
            QPushButton:disabled {{
                background-color: #1D293D;
                color: #45556C;
                border-color: #1D293D;
            }}
            QPushButton:hover:enabled {{
                background-color: #e2e8f0;
            }}
        """)
        if back_slot:
            back_btn.clicked.connect(back_slot)

        next_btn = QPushButton("Next →")
        next_btn.setFixedSize(86, 36)
        next_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        next_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {BLUE};
                border: none;
                border-radius: 8px;
                color: {WHITE};
                font-family: {FONT};
                font-size: 14px;
            }}
            QPushButton:hover {{ background-color: #1a67ff; }}
            QPushButton:pressed {{ background-color: #1050d0; }}
        """)
        next_btn.clicked.connect(next_slot)

        row.addWidget(back_btn)
        row.addStretch()
        row.addWidget(next_btn)
        return row

    # ───────────────────────────────────────────────────── step logic ──

    def _step1_next(self):
        selected = [c.text() for c in self._subject_chips if c.isChecked()]
        if not selected:
            return   # require at least one subject
        self._profile["subjects"] = selected
        self._go_to_step(1)

    def _go_to_step(self, index: int):
        self._current_step = index
        self._stack.setCurrentIndex(index)
        self._progress_bar.setValue(index + 1)
        self._step_lbl.setText(f"Step {index + 1} of 3")

    # ─────────────────────────────────────────────────────────── step 2 ──

    def _build_step2(self) -> QWidget:
        page = QWidget()
        page.setStyleSheet("background: transparent;")

        outer = QVBoxLayout(page)
        outer.setContentsMargins(64, 80, 80, 0)
        outer.setSpacing(0)

        col = QWidget()
        col.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(col)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(0)

        # ── Title + subtitle ──
        title = QLabel("What's your current level?")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 30px;
            font-weight: 400;
            background: transparent;
        """)

        subtitle = QLabel("Choose the level that best describes you")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setStyleSheet(f"""
            color: {MUTED};
            font-family: {FONT};
            font-size: 16px;
            background: transparent;
        """)

        lay.addWidget(title)
        lay.addSpacing(8)
        lay.addWidget(subtitle)
        lay.addSpacing(32)

        # ── 2×2 level cards — 328×108px each, gap 16px ──
        LEVELS = [
            ("Beginner",     "Just starting out",    0, 0),
            ("Intermediate", "Some experience",       0, 1),
            ("Advanced",     "Highly proficient",     1, 0),
            ("Expert",       "Mastery level",         1, 1),
        ]

        cards_container = QWidget()
        cards_container.setFixedWidth(672)
        cards_container.setStyleSheet("background: transparent;")
        grid = QGridLayout(cards_container)
        grid.setContentsMargins(0, 0, 0, 0)
        grid.setHorizontalSpacing(16)
        grid.setVerticalSpacing(16)

        self._level_cards: list[QPushButton] = []
        self._selected_level: str | None = None

        for label, desc, row, col_idx in LEVELS:
            card = self._level_card(label, desc)
            card.clicked.connect(lambda _, l=label: self._select_level(l))
            self._level_cards.append(card)
            grid.addWidget(card, row, col_idx)

        # Center the 672px card container within 896px content
        cards_row = QHBoxLayout()
        cards_row.setContentsMargins(112, 0, 112, 0)
        cards_row.addWidget(cards_container)
        lay.addLayout(cards_row)
        lay.addSpacing(24)

        # ── Previous / Next ──
        nav = self._build_nav(
            back_enabled=True,
            next_slot=self._step2_next,
            back_slot=lambda: self._go_to_step(0)
        )
        lay.addLayout(nav)
        lay.addStretch()

        outer.addWidget(col)
        return page

    def _level_card(self, label: str, desc: str) -> QPushButton:
        card = QPushButton()
        card.setFixedSize(328, 108)
        card.setCursor(Qt.CursorShape.PointingHandCursor)

        inner = QVBoxLayout(card)
        inner.setContentsMargins(26, 26, 26, 2)
        inner.setSpacing(4)

        lbl = QLabel(label)
        lbl.setStyleSheet(f"""
            color: {LABEL};
            font-family: {FONT};
            font-size: 20px;
            background: transparent;
        """)

        sub = QLabel(desc)
        sub.setStyleSheet(f"""
            color: #62748E;
            font-family: {FONT};
            font-size: 16px;
            background: transparent;
        """)

        inner.addWidget(lbl)
        inner.addWidget(sub)

        card.setStyleSheet(f"""
            QPushButton {{
                background-color: {BG_CHIP_OFF};
                border: 2px solid {BORDER_OFF};
                border-radius: 14px;
                text-align: left;
            }}
            QPushButton:hover {{
                border-color: {BLUE};
            }}
        """)
        card.setProperty("level_label", label)
        return card

    def _select_level(self, level: str):
        self._selected_level = level
        for card in self._level_cards:
            is_sel = card.property("level_label") == level
            lbl = card.findChild(QLabel)
            sub = card.findChildren(QLabel)[1] if len(card.findChildren(QLabel)) > 1 else None

            if is_sel:
                card.setStyleSheet(f"""
                    QPushButton {{
                        background-color: {BLUE};
                        border: 2px solid {BLUE};
                        border-radius: 14px;
                        text-align: left;
                    }}
                """)
                if lbl:
                    lbl.setStyleSheet(f"color: {WHITE}; font-family: {FONT}; font-size: 20px; background: transparent;")
                if sub:
                    sub.setStyleSheet("color: #DBEAFE; font-family: " + FONT + "; font-size: 16px; background: transparent;")
            else:
                card.setStyleSheet(f"""
                    QPushButton {{
                        background-color: {BG_CHIP_OFF};
                        border: 2px solid {BORDER_OFF};
                        border-radius: 14px;
                        text-align: left;
                    }}
                    QPushButton:hover {{ border-color: {BLUE}; }}
                """)
                if lbl:
                    lbl.setStyleSheet(f"color: {LABEL}; font-family: {FONT}; font-size: 20px; background: transparent;")
                if sub:
                    sub.setStyleSheet("color: #62748E; font-family: " + FONT + "; font-size: 16px; background: transparent;")

    def _step2_next(self):
        if not self._selected_level:
            return
        self._profile["level"] = self._selected_level
        self._go_to_step(2)

    # ─────────────────────────────────────────────────────────── step 3 ──

    def _build_step3(self) -> QWidget:
        page = QWidget()
        page.setStyleSheet("background: transparent;")

        outer = QVBoxLayout(page)
        outer.setContentsMargins(64, 80, 80, 0)
        outer.setSpacing(0)

        col = QWidget()
        col.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(col)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(32)

        # ── Title + subtitle ──
        title = QLabel("What are your learning goals?")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 30px;
            font-weight: 400;
            background: transparent;
        """)

        subtitle = QLabel("Select all that apply")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setStyleSheet(f"""
            color: {MUTED};
            font-family: {FONT};
            font-size: 16px;
            background: transparent;
        """)

        title_block = QWidget()
        title_block.setStyleSheet("background: transparent;")
        tb = QVBoxLayout(title_block)
        tb.setContentsMargins(0, 0, 0, 0)
        tb.setSpacing(8)
        tb.addWidget(title)
        tb.addWidget(subtitle)

        # ── Goal chips — 4 per row, 2 rows, 215×60px, gap 12px ──
        GOALS = [
            "Pass Exams", "Improve Grades", "Master Concepts", "Quick Review",
            "Competitive Exams", "Career Switch", "Personal Growth", "Teaching Others",
        ]

        self._goal_chips: list[_Chip] = []
        grid = QWidget()
        grid.setStyleSheet("background: transparent;")
        grid_lay = QGridLayout(grid)
        grid_lay.setContentsMargins(0, 0, 0, 0)
        grid_lay.setHorizontalSpacing(12)
        grid_lay.setVerticalSpacing(12)

        for i, goal in enumerate(GOALS):
            chip = _Chip(goal)
            chip.setFixedSize(215, 60)   # override from default 170px width
            self._goal_chips.append(chip)
            grid_lay.addWidget(chip, i // 4, i % 4)

        # ── Previous / Get Started ──
        nav = self._build_nav_final(
            back_slot=lambda: self._go_to_step(1),
            finish_slot=self._step3_finish
        )

        lay.addWidget(title_block)
        lay.addWidget(grid)
        lay.addLayout(nav)
        lay.addStretch()

        outer.addWidget(col)
        return page

    def _build_nav_final(self, back_slot, finish_slot) -> QHBoxLayout:
        """Navigation row for step 3 — Previous + Get Started."""
        row = QHBoxLayout()
        row.setContentsMargins(0, 8, 0, 24)

        back_btn = QPushButton("← Previous")
        back_btn.setFixedSize(111, 36)
        back_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        back_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {WHITE};
                border: 0.667px solid {BORDER_OFF};
                border-radius: 8px;
                color: {BG};
                font-family: {FONT};
                font-size: 14px;
            }}
            QPushButton:hover {{ background-color: #e2e8f0; }}
        """)
        back_btn.clicked.connect(back_slot)

        finish_btn = QPushButton("Get Started →")
        finish_btn.setFixedSize(128, 36)
        finish_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        finish_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {BLUE};
                border: none;
                border-radius: 8px;
                color: {WHITE};
                font-family: {FONT};
                font-size: 14px;
            }}
            QPushButton:hover   {{ background-color: #1a67ff; }}
            QPushButton:pressed {{ background-color: #1050d0; }}
        """)
        finish_btn.clicked.connect(finish_slot)

        row.addWidget(back_btn)
        row.addStretch()
        row.addWidget(finish_btn)
        return row

    def _step3_finish(self):
        selected = [c.text() for c in self._goal_chips if c.isChecked()]
        if not selected:
            return
        self._profile["goals"] = selected
        self.onboarding_complete.emit(self._profile)

    def _toggle_custom_input(self):
        visible = self._custom_input.isVisible()
        self._custom_input.setVisible(not visible)
        if not visible:
            self._custom_input.setFocus()

    def _add_custom_subject(self):
        text = self._custom_input.text().strip()
        if not text:
            return
        chip = _Chip(text)
        chip.setChecked(True)
        self._subject_chips.append(chip)
        # Find the grid and add the chip
        grid = self._stack.widget(0).findChild(QGridLayout)
        if grid:
            count = grid.count()
            grid.addWidget(chip, count // 5, count % 5)
        self._custom_input.clear()
        self._custom_input.setVisible(False)
