"""
Settings Panel - Aristotle AI
Shows benchmark results, model tier override, and language preference.
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QComboBox, QScrollArea, QFrame
)
from PyQt6.QtCore import Qt, QTimer

import core.benchmark as benchmark

BG_DARK    = "#0F172B"
BG_PANEL   = "#1D293D"
BORDER     = "#314158"
BLUE       = "#155DFC"
BLUE_LIGHT = "#51A2FF"
WHITE      = "#FFFFFF"
TEXT_MAIN  = "#E2E8F0"
LABEL      = "#CAD5E2"
MUTED      = "#62748E"
GREEN      = "#22C55E"
FONT       = "'Arimo', 'Arial', sans-serif"

TIER_OPTIONS = ["Q4_K_M", "Q5_K_M", "Q8_0"]


def _section_label(text: str) -> QLabel:
    lbl = QLabel(text)
    lbl.setStyleSheet(f"""
        color: {MUTED};
        font-family: {FONT};
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1px;
        background: transparent;
    """)
    return lbl


def _value_label(text: str, muted: bool = False) -> QLabel:
    lbl = QLabel(text)
    lbl.setWordWrap(True)
    lbl.setStyleSheet(f"""
        color: {MUTED if muted else TEXT_MAIN};
        font-family: {FONT};
        font-size: 14px;
        background: transparent;
    """)
    return lbl


def _divider() -> QWidget:
    w = QWidget()
    w.setFixedHeight(1)
    w.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    w.setStyleSheet(f"background-color: {BORDER};")
    return w


class SettingsPanel(QWidget):

    def __init__(self, email: str):
        super().__init__()
        self.email = email
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setStyleSheet(f"background-color: {BG_DARK};")
        self._build()

    # ─────────────────────────────────────────────────────── layout ──

    def _build(self):
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll.setStyleSheet(f"""
            QScrollArea {{ background-color: {BG_DARK}; border: none; }}
            QScrollBar:vertical {{
                background: {BG_DARK}; width: 6px; border-radius: 3px;
            }}
            QScrollBar::handle:vertical {{
                background: {BORDER}; border-radius: 3px; min-height: 24px;
            }}
            QScrollBar::add-line:vertical,
            QScrollBar::sub-line:vertical {{ height: 0; }}
        """)

        content = QWidget()
        content.setStyleSheet(f"background-color: {BG_DARK};")
        lay = QVBoxLayout(content)
        lay.setContentsMargins(32, 32, 32, 32)
        lay.setSpacing(24)
        lay.setAlignment(Qt.AlignmentFlag.AlignTop)

        title = QLabel("Settings")
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 22px;
            font-weight: 700;
            background: transparent;
        """)
        lay.addWidget(title)
        lay.addWidget(_divider())

        lay.addWidget(self._build_system_card())
        lay.addWidget(_divider())
        lay.addWidget(self._build_tier_card())
        lay.addWidget(_divider())
        lay.addWidget(self._build_language_card())
        lay.addWidget(_divider())
        lay.addWidget(self._build_benchmark_card())
        lay.addStretch()

        scroll.setWidget(content)

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addWidget(scroll)

    # ──────────────────────────────────────────── system info card ──

    def _build_system_card(self) -> QWidget:
        s = benchmark.get_settings()
        card = QWidget()
        card.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(card)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(10)
        lay.addWidget(_section_label("SYSTEM"))

        if s.get("benchmark_done"):
            ram  = s.get("ram_gb", 0)
            tier = s.get("quantization_tier", "Q4_K_M")
            desc = benchmark.TIER_DESCS.get(tier, "")
            self._sys_ram_lbl  = _value_label(f"RAM detected:     {ram} GB")
            self._sys_tier_lbl = _value_label(f"Recommended tier:  {tier}")
            self._sys_desc_lbl = _value_label(f"  {desc}", muted=True)
            lay.addWidget(self._sys_ram_lbl)
            lay.addWidget(self._sys_tier_lbl)
            lay.addWidget(self._sys_desc_lbl)
        else:
            self._sys_ram_lbl  = _value_label("")
            self._sys_tier_lbl = _value_label("")
            self._sys_desc_lbl = _value_label("")
            note = _value_label("Hardware check not run yet. Run it below.", muted=True)
            lay.addWidget(note)

        return card

    # ──────────────────────────────────────── model tier override ──

    def _build_tier_card(self) -> QWidget:
        s = benchmark.get_settings()
        card = QWidget()
        card.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(card)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(10)
        lay.addWidget(_section_label("MODEL TIER OVERRIDE"))
        lay.addWidget(_value_label(
            "Override the automatically detected tier. Takes effect on next model reload.",
            muted=True,
        ))

        row = QHBoxLayout()
        row.setSpacing(12)

        self._tier_combo = QComboBox()
        self._tier_combo.addItems(TIER_OPTIONS)
        current = s.get("quantization_tier", "Q4_K_M")
        if current in TIER_OPTIONS:
            self._tier_combo.setCurrentText(current)
        self._tier_combo.setFixedHeight(38)
        self._tier_combo.setStyleSheet(f"""
            QComboBox {{
                background-color: {BG_PANEL};
                color: {TEXT_MAIN};
                border: 0.667px solid {BORDER};
                border-radius: 8px;
                padding: 4px 12px;
                font-family: {FONT};
                font-size: 14px;
            }}
            QComboBox::drop-down {{ border: none; width: 20px; }}
            QComboBox QAbstractItemView {{
                background-color: {BG_PANEL};
                color: {TEXT_MAIN};
                selection-background-color: {BLUE};
                border: 0.667px solid {BORDER};
            }}
        """)

        save_btn = QPushButton("Save")
        save_btn.setFixedSize(80, 38)
        save_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        save_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {BLUE};
                color: {WHITE};
                border: none;
                border-radius: 8px;
                font-family: {FONT};
                font-size: 13px;
            }}
            QPushButton:hover {{ background-color: #1a67ff; }}
        """)
        save_btn.clicked.connect(self._save_tier)

        row.addWidget(self._tier_combo, stretch=1)
        row.addWidget(save_btn)
        lay.addLayout(row)

        self._tier_saved_lbl = QLabel("")
        self._tier_saved_lbl.setStyleSheet(f"""
            color: {GREEN};
            font-family: {FONT};
            font-size: 12px;
            background: transparent;
        """)
        lay.addWidget(self._tier_saved_lbl)
        return card

    # ──────────────────────────────────────── language preference ──

    def _build_language_card(self) -> QWidget:
        s = benchmark.get_settings()
        card = QWidget()
        card.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(card)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(10)
        lay.addWidget(_section_label("LANGUAGE PREFERENCE"))

        row = QHBoxLayout()
        row.setSpacing(12)
        current_lang = s.get("language", "english")
        self._lang_btns: dict[str, QPushButton] = {}

        for lang, display in (("english", "English"), ("urdu", "اردو (Urdu)")):
            btn = QPushButton(display)
            btn.setFixedHeight(38)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setStyleSheet(self._lang_style(active=(lang == current_lang)))
            btn.clicked.connect(lambda _, l=lang: self._set_language(l))
            self._lang_btns[lang] = btn
            row.addWidget(btn)

        lay.addLayout(row)
        return card

    # ─────────────────────────────────────────── benchmark card ──

    def _build_benchmark_card(self) -> QWidget:
        card = QWidget()
        card.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(card)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(10)
        lay.addWidget(_section_label("HARDWARE CHECK"))
        lay.addWidget(_value_label(
            "Re-run the hardware check to update RAM detection and tier recommendation.",
            muted=True,
        ))

        btn = QPushButton("Run Hardware Check")
        btn.setFixedHeight(40)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: {BLUE_LIGHT};
                border: 0.667px solid {BLUE};
                border-radius: 8px;
                font-family: {FONT};
                font-size: 14px;
            }}
            QPushButton:hover {{ background-color: rgba(21, 93, 252, 0.1); }}
        """)
        btn.clicked.connect(self._rerun_benchmark)
        lay.addWidget(btn)
        return card

    # ───────────────────────────────────────────────── actions ──

    def _save_tier(self):
        tier = self._tier_combo.currentText()
        benchmark.save_setting("quantization_tier", tier)
        self._tier_saved_lbl.setText("Saved!")
        QTimer.singleShot(2000, lambda: self._tier_saved_lbl.setText(""))

    def _lang_style(self, active: bool) -> str:
        if active:
            return f"""
                QPushButton {{
                    background-color: rgba(21, 93, 252, 0.15);
                    color: {BLUE_LIGHT};
                    border: 0.667px solid {BLUE};
                    border-radius: 8px;
                    font-family: {FONT};
                    font-size: 14px;
                }}
            """
        return f"""
            QPushButton {{
                background-color: transparent;
                color: {MUTED};
                border: 0.667px solid {BORDER};
                border-radius: 8px;
                font-family: {FONT};
                font-size: 14px;
            }}
            QPushButton:hover {{ color: {LABEL}; border-color: {LABEL}; }}
        """

    def _set_language(self, lang: str):
        benchmark.save_setting("language", lang)
        for l, btn in self._lang_btns.items():
            btn.setStyleSheet(self._lang_style(active=(l == lang)))

    def _rerun_benchmark(self):
        from ui.benchmark_screen import BenchmarkDialog
        benchmark.save_setting("benchmark_done", False)
        dlg = BenchmarkDialog(self)
        dlg.exec()
        self._update_system_info()

    def _update_system_info(self):
        s = benchmark.get_settings()
        ram  = s.get("ram_gb", 0)
        tier = s.get("quantization_tier", "Q4_K_M")
        desc = benchmark.TIER_DESCS.get(tier, "")
        self._sys_ram_lbl.setText(f"RAM detected:     {ram} GB")
        self._sys_tier_lbl.setText(f"Recommended tier:  {tier}")
        self._sys_desc_lbl.setText(f"  {desc}")
        self._tier_combo.setCurrentText(tier)
