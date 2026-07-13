"""Shared-secret authentication helpers.

TradingView alerts can present the shared secret in three different
places (Authorization header, JSON body field, or query string), and
this module is the single place that knows how to find and compare it.
"""

from __future__ import annotations

import hmac
from typing import Optional


def constant_time_eq(candidate: str, expected: str) -> bool:
    """Compare two secrets in constant time to avoid timing side-channels."""
    return hmac.compare_digest(candidate.encode("utf-8"), expected.encode("utf-8"))


def extract_bearer_token(authorization_header: Optional[str]) -> Optional[str]:
    """Extract the token from an ``Authorization: Bearer <token>`` header.

    Returns None if the header is absent or not a well-formed Bearer value.
    """
    if not authorization_header:
        return None
    scheme, _, value = authorization_header.partition(" ")
    if scheme.lower() != "bearer" or not value.strip():
        return None
    return value.strip()


def resolve_token(
    *,
    header_value: Optional[str],
    query_value: Optional[str],
    body_token: Optional[str],
    body_secret: Optional[str],
) -> Optional[str]:
    """Resolve the caller-presented secret from all supported locations.

    Precedence: ``Authorization: Bearer`` header, then JSON body
    ``token``/``secret`` fields, then the ``?token=`` query parameter.
    The precedence order is arbitrary in practice (only one is normally
    used at a time) but is kept deterministic for testability.
    """
    bearer = extract_bearer_token(header_value)
    if bearer:
        return bearer
    if body_token:
        return body_token
    if body_secret:
        return body_secret
    if query_value:
        return query_value
    return None
