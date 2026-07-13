"""Pydantic models and parsing helpers for the webhook bridge's request/
response contracts.

The ``SignalRecord`` field names, types, and semantics are a strict
contract with the MT5 EA's ``CSignalReceiver::PollFileQueue`` -- do not
rename or retype them without updating the EA reader in lockstep.
"""

from __future__ import annotations

import json
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

Action = Literal["buy", "sell"]
VALID_ACTIONS: frozenset[str] = frozenset({"buy", "sell"})


class AlertPayload(BaseModel):
    """Normalized view of a TradingView alert, from either JSON or plain text.

    ``action`` is lower-cased here but *not* restricted to buy/sell --
    validity against ``VALID_ACTIONS`` is checked at the API boundary
    (``app.main``) so the endpoint can return a precise 422 naming the
    offending value instead of a generic pydantic validation error.
    """

    action: str
    token: Optional[str] = None
    secret: Optional[str] = None
    price: Optional[float] = None
    time: Optional[int] = None

    @field_validator("action", mode="before")
    @classmethod
    def _normalize_action(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("action must be a string")
        return value.strip().lower()


class SignalRecord(BaseModel):
    """One line of the JSON-Lines signal file the MT5 EA polls.

    Field names/types are a strict contract with the EA -- do not change
    them without updating ``SignalReceiver.mqh`` in lockstep.
    """

    id: int = Field(..., description="Monotonic integer, strictly increasing")
    action: Action
    time: int = Field(..., description="Unix epoch seconds")
    price: float = Field(default=0.0, description="Reference price, 0.0 if unknown")


class WebhookResponse(BaseModel):
    """Response body for a successfully accepted webhook alert."""

    status: Literal["ok"] = "ok"
    id: int


class HealthResponse(BaseModel):
    """Response body for GET /health."""

    status: Literal["ok"] = "ok"
    last_id: int
    signal_file: str


def parse_alert_body(raw: bytes) -> AlertPayload:
    """Parse a TradingView alert body as JSON, falling back to plain text.

    TradingView lets users configure an alert to POST either a JSON
    object or an arbitrary text message, and frequently mislabels the
    Content-Type header regardless of which one is actually sent -- so
    this sniffs the body itself instead of trusting the header.

    Raises:
        ValueError: if the body is empty, or is JSON but not an object,
            or (via pydantic's ``ValidationError`` subclassing
            ``ValueError``) fails field validation.
    """
    text = raw.decode("utf-8", errors="replace").strip()
    if not text:
        raise ValueError("empty request body")

    parsed: object = None
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = None

    if isinstance(parsed, dict):
        return AlertPayload.model_validate(parsed)
    if parsed is not None:
        raise ValueError("JSON body must be an object")

    return AlertPayload(action=_extract_action_from_text(text))


def _extract_action_from_text(text: str) -> str:
    """Best-effort action extraction from a plain-text alert body.

    Accepts a body that is exactly "buy"/"sell" (any case) or one that
    merely starts with that keyword, e.g. "BUY EURUSD @ 1.2345".
    """
    lowered = text.strip().lower()
    if lowered in VALID_ACTIONS:
        return lowered
    tokens = lowered.split()
    first_token = tokens[0].strip(".,:;!") if tokens else lowered
    return first_token
