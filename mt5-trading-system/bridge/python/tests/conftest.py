"""Shared pytest setup for the webhook bridge test suite.

``app.main`` builds a throwaway module-level ``app = create_app()`` at
import time (so ``uvicorn app.main:app`` works out of the box). That call
constructs a ``Settings()`` from the real environment, which would
otherwise (a) fail collection entirely if ``VBE_SECRET`` isn't set, and
(b) default to writing ``./vbe_signals.jsonl`` into whatever directory
pytest is invoked from.

Setting placeholder ``VBE_*`` env vars here, before any test module
imports ``app.main``, avoids both problems. Individual tests never rely
on these values -- each test builds its own isolated ``Settings`` /
``SignalWriter`` via the ``tmp_path`` fixture instead.
"""

from __future__ import annotations

import os
import tempfile

_import_tmp_dir = tempfile.mkdtemp(prefix="vbe-bridge-import-")
os.environ.setdefault("VBE_SECRET", "conftest-placeholder-secret")
os.environ.setdefault("VBE_SIGNAL_FILE", os.path.join(_import_tmp_dir, "vbe_signals.jsonl"))
os.environ.setdefault("VBE_SEQ_FILE", os.path.join(_import_tmp_dir, "vbe_signals.seq"))
