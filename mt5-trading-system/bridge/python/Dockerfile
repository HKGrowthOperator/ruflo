# VBE MT5 webhook bridge -- fallback signal path.
#
# This image only receives TradingView webhooks and appends validated
# signals to a JSON-Lines file; it never places trades. For lowest
# latency, run the container on (or very near) the host that runs the
# MT5 terminal, and bind-mount the terminal's MQL5/Files directory to
# /data so the EA can see the signal file directly.

FROM python:3.12-slim

WORKDIR /app

# --- runtime dependencies -------------------------------------------------
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- application code ------------------------------------------------------
COPY app ./app
COPY run.sh ./run.sh
RUN chmod +x run.sh

# --- non-root user -----------------------------------------------------
RUN useradd --create-home --shell /usr/sbin/nologin vbe \
    && mkdir -p /data \
    && chown -R vbe:vbe /app /data
USER vbe

# Defaults; VBE_SECRET has no default and MUST be supplied at `docker run`
# time via -e or --env-file, never baked into the image.
ENV VBE_HOST=0.0.0.0 \
    VBE_PORT=8080 \
    VBE_SIGNAL_FILE=/data/vbe_signals.jsonl \
    VBE_SEQ_FILE=/data/vbe_signals.seq

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "\
import os, urllib.request; \
port = os.environ.get('VBE_PORT', '8080'); \
urllib.request.urlopen(f'http://127.0.0.1:{port}/health', timeout=2).read()" \
    || exit 1

CMD ["./run.sh"]
