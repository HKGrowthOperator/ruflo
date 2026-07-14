"""Thread-safe writer for the MT5 EA's JSON-Lines signal file.

The Expert Advisor polls a JSON-Lines file for new trading signals. Each
line is a single JSON object with a strictly monotonic increasing ``id``
(see ``SignalReceiver.mqh::PollFileQueue``, which skips any line whose id
is not greater than the last one it processed). This module owns the
entire lifecycle of that file: loading the last assigned id from a
sidecar sequence file on startup, appending new signal records
atomically, and persisting the new id so that process restarts never
reuse or go backwards on an id the EA may already have seen.
"""

from __future__ import annotations

import json
import os
import threading
import time
from pathlib import Path
from typing import Final, Optional

DEFAULT_PRICE: Final[float] = 0.0


class DuplicateActionError(RuntimeError):
    """Raised when a consecutive duplicate action is rejected.

    Only raised when the writer was constructed with
    ``allow_duplicate_actions=False`` and the requested action matches
    the immediately preceding one written by this process.
    """


class SignalWriter:
    """Appends trading signals to a JSON-Lines file with monotonic ids.

    Thread-safe: all state mutation happens under a single
    ``threading.Lock`` so concurrent webhook requests (FastAPI may
    dispatch handlers concurrently within one process) always produce
    unique, strictly increasing ids and never interleave partial writes.

    Restart-safety: the last assigned id is persisted to ``seq_file``
    after every successful write, via a write-to-temp-then-``os.replace``
    sequence so a crash mid-persist can never corrupt it. On
    construction, the writer reads that file to resume numbering, so a
    process restart never reuses an id already seen by the EA.
    """

    def __init__(
        self,
        signal_file: Path,
        seq_file: Path,
        *,
        allow_duplicate_actions: bool = True,
    ) -> None:
        self.signal_file = Path(signal_file)
        self.seq_file = Path(seq_file)
        self.allow_duplicate_actions = allow_duplicate_actions
        self._lock = threading.Lock()
        self.signal_file.parent.mkdir(parents=True, exist_ok=True)
        self.seq_file.parent.mkdir(parents=True, exist_ok=True)
        self._last_id = self._load_last_id()
        self._last_action: Optional[str] = None

    def _load_last_id(self) -> int:
        """Read the last assigned id from the sequence sidecar file.

        Returns 0 (no signals emitted yet) if the file is missing, empty,
        or corrupt -- corruption is treated conservatively as "start
        over" rather than crashing the bridge, since the EA only cares
        that ids keep increasing from whatever it last saw.
        """
        try:
            raw = self.seq_file.read_text(encoding="utf-8").strip()
        except FileNotFoundError:
            return 0
        if not raw:
            return 0
        try:
            return max(0, int(raw))
        except ValueError:
            return 0

    def _persist_last_id(self, new_id: int) -> None:
        """Atomically persist ``new_id`` to the sequence sidecar file.

        Writes to a temp file in the same directory and ``os.replace``s
        it into place so a crash mid-write can never leave a
        truncated/corrupt sequence file -- readers only ever observe the
        old or the new value, never a partial one.
        """
        tmp_path = self.seq_file.with_suffix(self.seq_file.suffix + ".tmp")
        with tmp_path.open("w", encoding="utf-8") as tmp_file:
            tmp_file.write(str(new_id))
            tmp_file.flush()
            os.fsync(tmp_file.fileno())
        os.replace(tmp_path, self.seq_file)

    def write(self, action: str, price: float = DEFAULT_PRICE, ts: Optional[int] = None) -> int:
        """Append one signal line and return its newly assigned id.

        Args:
            action: "buy" or "sell" (validity already checked by the caller).
            price: Optional reference price, 0.0 if unknown.
            ts: Unix epoch seconds; defaults to ``int(time.time())`` if omitted.

        Returns:
            The strictly monotonic id assigned to this signal.

        Raises:
            DuplicateActionError: if ``allow_duplicate_actions`` is False
                and ``action`` equals the action from this writer's
                immediately preceding write.
        """
        timestamp = int(ts) if ts is not None else int(time.time())
        with self._lock:
            if not self.allow_duplicate_actions and action == self._last_action:
                raise DuplicateActionError(
                    f"duplicate consecutive action {action!r} rejected "
                    "(VBE_ALLOW_DUPLICATE_ACTIONS=false)"
                )

            new_id = self._last_id + 1
            record = {
                "id": new_id,
                "action": action,
                "time": timestamp,
                "price": float(price),
            }
            line = json.dumps(record, separators=(",", ":")) + "\n"

            # Append-only, flush + fsync: never rewrites existing lines,
            # and the record is durable on disk before we report success.
            with self.signal_file.open("a", encoding="utf-8") as fh:
                fh.write(line)
                fh.flush()
                os.fsync(fh.fileno())

            self._persist_last_id(new_id)
            self._last_id = new_id
            self._last_action = action
            return new_id

    @property
    def last_id(self) -> int:
        """The most recently assigned signal id (0 if none written yet)."""
        with self._lock:
            return self._last_id
