"""
Benchmark Screen - Aristotle AI
First-launch hardware check: detects RAM, picks quantization tier.
Emits benchmark_complete when the user clicks Continue.
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QPushButton, QProgressBar,
    QDialog
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal

import core.benchmark as benchmark

BG_DARK    = "#0F172B"
BG_PANEL   = "#1D293D"
BORDER     = "#314158"
BLUE       = "#155DFC"
WHITE      = "#FFFFFF"
TEXT_MAIN  = "#E2E8F0"
LABEL      = "#CAD5E2"
MUTED      = "#62748E"
FONT       = "'Arimo', 'Arial', sans-serif"


class _BenchmarkWorker(QThread):
    progress = pyqtSignal(int, str)
    finished = pyqtSignal(dict)

    def run(self):
        result = benchmark.run_benchmark(
            progress_callback=lambda pct, msg: self.progress.emit(pct, msg)
        )
        self.finished.emit(result)


class BenchmarkScreen(QWidget):
    benchmark_complete = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setStyleSheet(f"background-color: {BG_DARK};")
        self._worker = None
        self._build()
        self._run()

    # ─────────────────────────────────────────────────────── layout ──

    def _build(self):
        outer = QVBoxLayout(self)
        outer.setAlignment(Qt.AlignmentFlag.AlignCenter)
        outer.setContentsMargins(0, 0, 0, 0)

        card = QWidget()
        card.setFixedWidth(520)
        card.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        card.setStyleSheet(f"""
            background-color: {BG_PANEL};
            border: 0.667px solid {BORDER};
            border-radius: 16px;
        """)

        lay = QVBoxLayout(card)
        lay.setContentsMargins(48, 48, 48, 48)
        lay.setSpacing(20)

        icon = QLabel("⚡")
        icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon.setStyleSheet("font-size: 40px; background: transparent;")
        lay.addWidget(icon)

        title = QLabel("Hardware Check")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet(f"""
            color: {WHITE};
            font-family: {FONT};
            font-size: 24px;
            font-weight: 700;
            background: transparent;
        """)
        lay.addWidget(title)

        subtitle = QLabel(
            "Aristotle is detecting your hardware to select\n"
            "the best AI model tier for your device."
        )
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setWordWrap(True)
        subtitle.setStyleSheet(f"""
            color: {MUTED};
            font-family: {FONT};
            font-size: 14px;
            background: transparent;
        """)
        lay.addWidget(subtitle)
        lay.addSpacing(8)

        self._bar = QProgressBar()
        self._bar.setRange(0, 100)
        self._bar.setValue(0)
        self._bar.setFixedHeight(8)
        self._bar.setTextVisible(False)
        self._bar.setStyleSheet(f"""
            QProgressBar {{
                background-color: {BG_DARK};
                border-radius: 4px;
                border: none;
            }}
            QProgressBar::chunk {{
                background-color: {BLUE};
                border-radius: 4px;
            }}
        """)
        lay.addWidget(self._bar)

        self._status = QLabel("Starting...")
        self._status.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._status.setStyleSheet(f"""
            color: {LABEL};
            font-family: {FONT};
            font-size: 13px;
            background: transparent;
        """)
        lay.addWidget(self._status)
        lay.addSpacing(8)

        # Results section — hidden until complete
        self._results = QWidget()
        self._results.setStyleSheet("background: transparent;")
        self._results.hide()
        r_lay = QVBoxLayout(self._results)
        r_lay.setContentsMargins(0, 0, 0, 0)
        r_lay.setSpacing(10)

        sep = QWidget()
        sep.setFixedHeight(1)
        sep.setStyleSheet(f"background-color: {BORDER};")
        r_lay.addWidget(sep)

        self._ram_lbl  = self._result_label("")
        self._tier_lbl = self._result_label("")
        self._desc_lbl = self._result_label("")
        self._desc_lbl.setStyleSheet(f"""
            color: {MUTED};
            font-family: {FONT};
            font-size: 13px;
            background: transparent;
        """)
        r_lay.addWidget(self._ram_lbl)
        r_lay.addWidget(self._tier_lbl)
        r_lay.addWidget(self._desc_lbl)
        r_lay.addSpacing(4)

        self._continue_btn = QPushButton("Continue  →")
        self._continue_btn.setFixedHeight(44)
        self._continue_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self._continue_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {BLUE};
                color: {WHITE};
                border: none;
                border-radius: 10px;
                font-family: {FONT};
                font-size: 15px;
                font-weight: 600;
            }}
            QPushButton:hover   {{ background-color: #1a67ff; }}
            QPushButton:pressed {{ background-color: #1050d0; }}
        """)
        self._continue_btn.clicked.connect(self.benchmark_complete)
        r_lay.addWidget(self._continue_btn)

        lay.addWidget(self._results)
        outer.addWidget(card)

    @staticmethod
    def _result_label(text: str) -> QLabel:
        lbl = QLabel(text)
        lbl.setWordWrap(True)
        lbl.setStyleSheet(f"""
            color: {TEXT_MAIN};
            font-family: {FONT};
            font-size: 14px;
            background: transparent;
        """)
        return lbl

    # ─────────────────────────────────────────────────── benchmark ──

    def _run(self):
        self._worker = _BenchmarkWorker()
        self._worker.progress.connect(self._on_progress)
        self._worker.finished.connect(self._on_finished)
        self._worker.start()

    def _on_progress(self, pct: int, msg: str):
        self._bar.setValue(pct)
        self._status.setText(msg)

    def _on_finished(self, result: dict):
        self._bar.setValue(100)
        self._status.setText("Hardware check complete!")
        ram  = result.get("ram_gb", 0)
        tier = result.get("quantization_tier", "Q4_K_M")
        desc = benchmark.TIER_DESCS.get(tier, "")
        self._ram_lbl.setText(f"RAM detected:     {ram} GB")
        self._tier_lbl.setText(f"Model tier:          {tier}")
        self._desc_lbl.setText(f"  {desc}")
        self._results.show()


# ── Reusable dialog wrapper for re-running from Settings ────────────────────

class BenchmarkDialog(QDialog):
    """Modal dialog that runs the benchmark and closes on Continue."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Hardware Check")
        self.setFixedSize(580, 500)
        self.setModal(True)
        self.setStyleSheet(f"background-color: {BG_DARK};")

        screen = BenchmarkScreen()
        screen.benchmark_complete.connect(self.accept)

        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.addWidget(screen)
