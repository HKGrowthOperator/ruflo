"""FastAPI endpoint tests for the webhook bridge.

Uses TestClient against an app built via ``create_app()`` with an
isolated ``Settings`` instance (tmp signal/seq files, a known test
secret) so tests never touch real env vars, a real ``.env``, or a real
MT5 ``Files`` directory.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app

TEST_SECRET = "unit-test-secret"


@pytest.fixture
def signal_paths(tmp_path: Path) -> tuple[Path, Path]:
    return tmp_path / "vbe_signals.jsonl", tmp_path / "vbe_signals.seq"


@pytest.fixture
def client(signal_paths: tuple[Path, Path]) -> TestClient:
    signal_file, seq_file = signal_paths
    settings = Settings(
        secret=TEST_SECRET,
        signal_file=signal_file,
        seq_file=seq_file,
        allow_duplicate_actions=True,
    )
    app = create_app(settings=settings)
    return TestClient(app)


# --- /health -----------------------------------------------------------


def test_health_shape(client: TestClient) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["last_id"] == 0
    assert isinstance(body["signal_file"], str) and body["signal_file"]


# --- authentication ------------------------------------------------------


def test_rejects_missing_secret(client: TestClient) -> None:
    resp = client.post("/webhook", json={"action": "buy"})
    assert resp.status_code == 401


def test_rejects_wrong_secret(client: TestClient) -> None:
    resp = client.post("/webhook", json={"action": "buy", "token": "wrong-secret"})
    assert resp.status_code == 401


def test_token_via_authorization_header(client: TestClient) -> None:
    resp = client.post(
        "/webhook",
        json={"action": "buy"},
        headers={"Authorization": f"Bearer {TEST_SECRET}"},
    )
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "id": 1}


def test_token_via_body_token_field(client: TestClient) -> None:
    resp = client.post("/webhook", json={"action": "buy", "token": TEST_SECRET})
    assert resp.status_code == 200


def test_token_via_body_secret_field(client: TestClient) -> None:
    resp = client.post("/webhook", json={"action": "buy", "secret": TEST_SECRET})
    assert resp.status_code == 200


def test_token_via_query_param(client: TestClient) -> None:
    resp = client.post(f"/webhook?token={TEST_SECRET}", json={"action": "buy"})
    assert resp.status_code == 200


# --- happy path / body parsing -------------------------------------------


def test_accepts_valid_json_buy(client: TestClient) -> None:
    resp = client.post("/webhook", json={"action": "buy", "token": TEST_SECRET})
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "id": 1}


def test_accepts_valid_json_sell_case_insensitive(client: TestClient) -> None:
    resp = client.post("/webhook", json={"action": "SELL", "token": TEST_SECRET})
    assert resp.status_code == 200
    assert resp.json()["id"] == 1


def test_ids_increment_across_requests(client: TestClient) -> None:
    first = client.post("/webhook", json={"action": "buy", "token": TEST_SECRET})
    second = client.post("/webhook", json={"action": "sell", "token": TEST_SECRET})
    assert first.json()["id"] == 1
    assert second.json()["id"] == 2


def test_plain_text_body_exact_action_accepted(client: TestClient) -> None:
    resp = client.post(
        "/webhook",
        content=b"buy",
        headers={"Content-Type": "text/plain", "Authorization": f"Bearer {TEST_SECRET}"},
    )
    assert resp.status_code == 200
    assert resp.json()["id"] == 1


def test_plain_text_body_with_leading_keyword_accepted(client: TestClient) -> None:
    resp = client.post(
        "/webhook",
        content=b"SELL EURUSD strong signal",
        headers={"Content-Type": "text/plain", "Authorization": f"Bearer {TEST_SECRET}"},
    )
    assert resp.status_code == 200
    assert resp.json()["id"] == 1


# --- rejections ------------------------------------------------------------


def test_unknown_action_rejected_422(client: TestClient) -> None:
    resp = client.post("/webhook", json={"action": "close", "token": TEST_SECRET})
    assert resp.status_code == 422


def test_malformed_empty_body_rejected_422_not_500(client: TestClient) -> None:
    resp = client.post(
        "/webhook",
        content=b"",
        headers={"Authorization": f"Bearer {TEST_SECRET}"},
    )
    assert resp.status_code == 422


def test_json_array_body_rejected_422_not_500(client: TestClient) -> None:
    resp = client.post(
        "/webhook",
        content=b"[1, 2, 3]",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TEST_SECRET}",
        },
    )
    assert resp.status_code == 422


def test_json_missing_action_field_rejected_422_not_500(client: TestClient) -> None:
    # Auth via header (not the body) so authentication succeeds even
    # though the body itself fails to parse -- isolating this test to the
    # "missing action" 422 path rather than the 401 path.
    resp = client.post(
        "/webhook",
        json={"price": 1.0},
        headers={"Authorization": f"Bearer {TEST_SECRET}"},
    )
    assert resp.status_code == 422


# --- signal file contents ---------------------------------------------------


def test_signal_file_contains_expected_line(
    client: TestClient, signal_paths: tuple[Path, Path]
) -> None:
    signal_file, _seq_file = signal_paths

    resp = client.post(
        "/webhook", json={"action": "buy", "token": TEST_SECRET, "price": 1.2345}
    )
    assert resp.status_code == 200

    lines = signal_file.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 1

    record = json.loads(lines[0])
    assert record["id"] == 1
    assert record["action"] == "buy"
    assert record["price"] == 1.2345
    assert isinstance(record["time"], int)


def test_health_last_id_reflects_writes(
    client: TestClient, signal_paths: tuple[Path, Path]
) -> None:
    client.post("/webhook", json={"action": "buy", "token": TEST_SECRET})
    client.post("/webhook", json={"action": "sell", "token": TEST_SECRET})

    resp = client.get("/health")
    assert resp.json()["last_id"] == 2


# --- VBE_ALLOW_DUPLICATE_ACTIONS = false -----------------------------------


def test_duplicate_action_rejected_when_configured(signal_paths: tuple[Path, Path]) -> None:
    signal_file, seq_file = signal_paths
    settings = Settings(
        secret=TEST_SECRET,
        signal_file=signal_file,
        seq_file=seq_file,
        allow_duplicate_actions=False,
    )
    strict_client = TestClient(create_app(settings=settings))

    first = strict_client.post("/webhook", json={"action": "buy", "token": TEST_SECRET})
    second = strict_client.post("/webhook", json={"action": "buy", "token": TEST_SECRET})

    assert first.status_code == 200
    assert second.status_code == 422
