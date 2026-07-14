"""Unit tests for app.signal_writer.SignalWriter.

Covers the properties the MT5 EA depends on: strictly monotonic ids,
restart-safety (ids resume correctly across process restarts), correct
JSONL formatting, append-only semantics, and thread-safety under
concurrent writers.
"""

from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Tuple

import pytest

from app.signal_writer import DuplicateActionError, SignalWriter


def _paths(tmp_path: Path) -> Tuple[Path, Path]:
    return tmp_path / "vbe_signals.jsonl", tmp_path / "vbe_signals.seq"


def test_ids_are_monotonic_from_one(tmp_path: Path) -> None:
    signal_file, seq_file = _paths(tmp_path)
    writer = SignalWriter(signal_file=signal_file, seq_file=seq_file)

    ids = [writer.write(action="buy", price=1.1, ts=1_700_000_000 + i) for i in range(5)]

    assert ids == [1, 2, 3, 4, 5]
    assert writer.last_id == 5


def test_new_instance_starts_at_zero_when_no_seq_file(tmp_path: Path) -> None:
    signal_file, seq_file = _paths(tmp_path)
    writer = SignalWriter(signal_file=signal_file, seq_file=seq_file)

    assert writer.last_id == 0


def test_ids_persist_and_resume_across_restart(tmp_path: Path) -> None:
    signal_file, seq_file = _paths(tmp_path)

    first = SignalWriter(signal_file=signal_file, seq_file=seq_file)
    for _ in range(3):
        first.write(action="buy", price=0.0, ts=1_700_000_000)
    assert first.last_id == 3

    # Simulate a process restart: a brand-new instance over the same files.
    second = SignalWriter(signal_file=signal_file, seq_file=seq_file)
    assert second.last_id == 3

    next_id = second.write(action="sell", price=0.0, ts=1_700_000_001)
    assert next_id == 4


def test_seq_file_corruption_falls_back_to_zero(tmp_path: Path) -> None:
    signal_file, seq_file = _paths(tmp_path)
    seq_file.write_text("not-an-int", encoding="utf-8")

    writer = SignalWriter(signal_file=signal_file, seq_file=seq_file)

    assert writer.last_id == 0
    assert writer.write(action="buy") == 1


def test_concurrent_writes_produce_unique_increasing_ids(tmp_path: Path) -> None:
    signal_file, seq_file = _paths(tmp_path)
    writer = SignalWriter(signal_file=signal_file, seq_file=seq_file)

    num_threads = 25
    results: list[int] = []
    results_lock = threading.Lock()

    def _worker() -> None:
        new_id = writer.write(action="buy", price=0.0, ts=1_700_000_000)
        with results_lock:
            results.append(new_id)

    threads = [threading.Thread(target=_worker) for _ in range(num_threads)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert len(results) == num_threads
    assert len(set(results)) == num_threads, "ids must be unique under concurrency"
    assert sorted(results) == list(range(1, num_threads + 1))
    assert writer.last_id == num_threads

    # Every id 1..num_threads must appear exactly once on disk too.
    lines = signal_file.read_text(encoding="utf-8").splitlines()
    written_ids = sorted(json.loads(line)["id"] for line in lines)
    assert written_ids == list(range(1, num_threads + 1))


def test_jsonl_format_matches_ea_contract(tmp_path: Path) -> None:
    signal_file, seq_file = _paths(tmp_path)
    writer = SignalWriter(signal_file=signal_file, seq_file=seq_file)

    writer.write(action="buy", price=1.2345, ts=1_700_000_123)
    writer.write(action="sell", price=0.0, ts=1_700_000_456)

    lines = signal_file.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 2

    raw_text = signal_file.read_text(encoding="utf-8")
    assert raw_text.endswith("\n")

    first = json.loads(lines[0])
    assert first == {"id": 1, "action": "buy", "time": 1_700_000_123, "price": 1.2345}

    second = json.loads(lines[1])
    assert second == {"id": 2, "action": "sell", "time": 1_700_000_456, "price": 0.0}


def test_append_never_rewrites_existing_lines(tmp_path: Path) -> None:
    signal_file, seq_file = _paths(tmp_path)
    writer = SignalWriter(signal_file=signal_file, seq_file=seq_file)

    writer.write(action="buy", ts=1_700_000_000)
    first_line = signal_file.read_text(encoding="utf-8").splitlines()[0]

    writer.write(action="sell", ts=1_700_000_001)
    lines_after = signal_file.read_text(encoding="utf-8").splitlines()

    assert lines_after[0] == first_line
    assert len(lines_after) == 2


def test_duplicate_action_rejected_when_disallowed(tmp_path: Path) -> None:
    signal_file, seq_file = _paths(tmp_path)
    writer = SignalWriter(
        signal_file=signal_file, seq_file=seq_file, allow_duplicate_actions=False
    )

    writer.write(action="buy", ts=1_700_000_000)
    with pytest.raises(DuplicateActionError):
        writer.write(action="buy", ts=1_700_000_001)

    # A different action right after the rejection is fine.
    assert writer.write(action="sell", ts=1_700_000_002) == 2


def test_duplicate_action_allowed_by_default(tmp_path: Path) -> None:
    signal_file, seq_file = _paths(tmp_path)
    writer = SignalWriter(signal_file=signal_file, seq_file=seq_file)

    first_id = writer.write(action="buy", ts=1_700_000_000)
    second_id = writer.write(action="buy", ts=1_700_000_001)

    assert (first_id, second_id) == (1, 2)


def test_defaults_price_and_time_when_omitted(tmp_path: Path) -> None:
    signal_file, seq_file = _paths(tmp_path)
    writer = SignalWriter(signal_file=signal_file, seq_file=seq_file)

    new_id = writer.write(action="buy")

    line = signal_file.read_text(encoding="utf-8").splitlines()[0]
    record = json.loads(line)
    assert record["id"] == new_id
    assert record["price"] == 0.0
    assert isinstance(record["time"], int)
