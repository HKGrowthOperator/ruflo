"""FastAPI application wiring for the MT5 webhook bridge.

This process's entire job: accept a TradingView webhook alert, validate
it, and append it to the JSON-Lines signal file the MT5 EA polls. It
never talks to a broker and never places an order -- that responsibility
lives entirely in the EA (``mql5/Experts/VantageBasketEA.mq5``).
"""

from __future__ import annotations

import logging
import time
from typing import Optional

from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse

from app.config import Settings
from app.models import VALID_ACTIONS, HealthResponse, WebhookResponse, parse_alert_body
from app.security import constant_time_eq, resolve_token
from app.signal_writer import DuplicateActionError, SignalWriter

logger = logging.getLogger("vbe_bridge")


def _configure_logging() -> None:
    """Attach a single stream handler, idempotently.

    Guards against duplicate log lines if ``create_app`` is called more
    than once in the same process (e.g. across tests).
    """
    if logger.handlers:
        return
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False


def create_app(settings: Optional[Settings] = None) -> FastAPI:
    """Build and return the FastAPI application.

    Args:
        settings: Optional pre-built ``Settings`` (used by tests to inject
            a temp signal file / secret without touching real env vars or
            a real ``.env``). Falls back to ``Settings()`` (env / .env)
            when omitted.
    """
    _configure_logging()
    resolved_settings = settings or Settings()
    writer = SignalWriter(
        signal_file=resolved_settings.signal_file,
        seq_file=resolved_settings.resolved_seq_file(),
        allow_duplicate_actions=resolved_settings.allow_duplicate_actions,
    )

    app = FastAPI(title="VBE MT5 Webhook Bridge", version="1.0.0")
    app.state.settings = resolved_settings
    app.state.writer = writer

    @app.middleware("http")
    async def log_requests(request: Request, call_next):  # type: ignore[no-untyped-def]
        """Log one line per request: method, path, status, latency."""
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s -> %d (%.2fms)",
            request.method,
            request.url.path,
            response.status_code,
            elapsed_ms,
        )
        return response

    @app.get("/health", response_model=HealthResponse)
    async def health() -> HealthResponse:
        """Liveness/readiness probe reporting the last written signal id."""
        return HealthResponse(
            status="ok",
            last_id=writer.last_id,
            signal_file=str(writer.signal_file),
        )

    @app.post("/webhook")
    async def webhook(
        request: Request,
        token: Optional[str] = Query(default=None),
    ) -> JSONResponse:
        """Receive a TradingView alert, authenticate it, and append a signal.

        Accepts both ``application/json`` and raw ``text/plain`` bodies.
        The shared secret may be supplied via the ``Authorization: Bearer``
        header, a ``token``/``secret`` field in a JSON body, or a
        ``?token=`` query parameter.
        """
        raw_body = await request.body()

        alert = None
        parse_error: Optional[str] = None
        try:
            alert = parse_alert_body(raw_body)
        except ValueError as exc:
            parse_error = str(exc)

        # Authenticate before revealing anything about body validity, so an
        # unauthenticated caller learns nothing beyond "unauthorized".
        candidate_token = resolve_token(
            header_value=request.headers.get("authorization"),
            query_value=token,
            body_token=alert.token if alert else None,
            body_secret=alert.secret if alert else None,
        )
        if candidate_token is None or not constant_time_eq(
            candidate_token, resolved_settings.secret
        ):
            logger.warning("rejected webhook: invalid or missing secret")
            return JSONResponse(
                status_code=401, content={"status": "error", "reason": "unauthorized"}
            )

        if alert is None:
            logger.warning("rejected webhook: malformed body (%s)", parse_error)
            return JSONResponse(
                status_code=422,
                content={"status": "error", "reason": f"malformed body: {parse_error}"},
            )

        if alert.action not in VALID_ACTIONS:
            logger.warning("rejected webhook: unknown action %r", alert.action)
            return JSONResponse(
                status_code=422,
                content={"status": "error", "reason": f"unknown action: {alert.action!r}"},
            )

        try:
            new_id = writer.write(
                action=alert.action,
                price=alert.price if alert.price is not None else 0.0,
                ts=alert.time,
            )
        except DuplicateActionError as exc:
            logger.warning("rejected webhook: %s", exc)
            return JSONResponse(status_code=422, content={"status": "error", "reason": str(exc)})

        logger.info("accepted webhook: action=%s id=%d", alert.action, new_id)
        response_body = WebhookResponse(status="ok", id=new_id)
        return JSONResponse(status_code=200, content=response_body.model_dump())

    return app


app = create_app()
