"""Application configuration loaded from environment variables / .env.

All runtime configuration for the webhook bridge lives here as a single
pydantic-settings ``Settings`` object. Nothing else in the codebase should
read ``os.environ`` directly -- this module is the one seam.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-driven configuration for the webhook bridge.

    Every field is read from an environment variable prefixed with
    ``VBE_`` (e.g. ``VBE_SECRET``, ``VBE_SIGNAL_FILE``). See
    ``.env.example`` for a fully documented template. Values may also be
    passed as constructor keyword arguments (e.g. in tests), which take
    priority over the environment.
    """

    model_config = SettingsConfigDict(
        env_prefix="VBE_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    secret: str
    """Shared secret TradingView alerts must present. Required -- never defaulted
    or hardcoded, so a missing configuration fails fast at startup instead of
    silently accepting unauthenticated requests."""

    signal_file: Path = Path("./vbe_signals.jsonl")
    """JSON-Lines file the MT5 EA polls. Point this at the MT5 terminal's
    ``MQL5/Files/vbe_signals.jsonl`` for the EA to see it."""

    seq_file: Optional[Path] = None
    """Sidecar file persisting the last assigned signal id across restarts.
    Defaults to ``signal_file`` with a ``.seq`` suffix when left unset."""

    host: str = "0.0.0.0"
    port: int = 8080

    allow_duplicate_actions: bool = True
    """If False, reject two consecutive identical actions (buy after buy,
    sell after sell) with a 422 instead of writing a redundant signal."""

    @model_validator(mode="after")
    def _derive_seq_file(self) -> "Settings":
        """Fill in ``seq_file`` from ``signal_file`` when not explicitly set."""
        if self.seq_file is None:
            self.seq_file = self.signal_file.with_suffix(".seq")
        return self

    def resolved_seq_file(self) -> Path:
        """Return ``seq_file`` guaranteed non-None (set by the validator above)."""
        assert self.seq_file is not None, "seq_file must be resolved by validator"
        return self.seq_file
