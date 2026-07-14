# VBE MT5 Webhook Bridge (Fallback Signal Path)

A small FastAPI service that receives TradingView webhook alerts,
validates them, and appends them to the JSON-Lines signal file that the
Vantage Basket EA (`mql5/Experts/VantageBasketEA.mq5`) polls via
`CSignalReceiver::PollFileQueue`.

**This bridge places no orders.** Its entire responsibility ends at
appending one validated line to `vbe_signals.jsonl`. All trade logic —
lot sizing, basket management, risk filters, order execution — lives in
the EA.

## Where this fits in the architecture

See [`../../docs/LATENCY_ANALYSIS.md`](../../docs/LATENCY_ANALYSIS.md)
for the full latency breakdown. Short version: this bridge is **Option
A / the fallback path**, used only when the TradingView Pine indicator's
logic cannot be ported natively into MQL5 (Option D, the primary
recommendation — no network hop, no TradingView alert-queue latency
floor). Whenever a native port is possible, prefer it; this bridge exists
so a webhook-based signal source is still available when it isn't.

Because this path inherits TradingView's server-side alert queue latency
regardless of how fast the bridge itself is, the only latency this
service *can* control is the hop from "webhook received" to "line
appended to disk" — so **run it locally, on (or as close as possible to)
the same host as the MT5 terminal**. Do not put this behind a remote
cloud host if you can avoid it.

## How it works

```
TradingView alert  --POST-->  /webhook  --validate-->  vbe_signals.jsonl  <--poll--  MT5 EA
                                  |
                                  +--> 401 if secret doesn't match
                                  +--> 422 if body/action is invalid
                                  +--> 200 {"status":"ok","id":<n>} on success
```

Each accepted alert becomes one line:

```json
{"id": 42, "action": "buy", "time": 1719840000, "price": 1.2345}
```

- `id` is a strictly monotonic integer, persisted to a sidecar
  `vbe_signals.seq` file so it survives bridge restarts. The EA dedups
  by only processing ids greater than the last one it saw
  (`m_lastSeq` in `SignalReceiver.mqh`) — never rewrite or reuse an id.
- Appends are append-only: open in append mode, write one line, `flush()`
  + `os.fsync()`. Existing lines are never touched.

## Project layout

```
app/
  __init__.py
  config.py          # pydantic-settings Settings (env / .env)
  models.py          # AlertPayload, SignalRecord, body parsing
  security.py        # constant-time secret comparison, token extraction
  signal_writer.py    # thread-safe, restart-safe JSONL writer
  main.py             # FastAPI app (create_app factory), logging
tests/
  test_signal_writer.py
  test_webhook.py
requirements.txt
run.sh
Dockerfile
.env.example
```

## Endpoints

### `POST /webhook`

Accepts **either**:
- JSON body: `{"action": "buy" | "sell", "token": "...", "price": 1.2345}`
  (`action` is case-insensitive; `token` may be named `secret` instead;
  `price`/`time` are optional)
- Plain text body: exactly `buy` / `sell` (any case), or text that
  *starts* with that keyword (e.g. `BUY EURUSD strong signal`)

The shared secret can be supplied any of three ways:
- `Authorization: Bearer <secret>` header
- `token` or `secret` field in a JSON body
- `?token=<secret>` query parameter

Responses:
| Status | Meaning |
|---|---|
| `200` | `{"status": "ok", "id": <n>}` — signal appended |
| `401` | secret missing or incorrect |
| `422` | malformed body, unrecognized action, or (if `VBE_ALLOW_DUPLICATE_ACTIONS=false`) a repeated consecutive action |

Every rejected request is logged with its reason; every request logs one
line with method, path, status, and latency in ms.

### `GET /health`

```json
{"status": "ok", "last_id": 42, "signal_file": "/path/to/vbe_signals.jsonl"}
```

## Environment variables

See [`.env.example`](.env.example) for the full documented list. The
only required one is `VBE_SECRET`; the app fails to start without it.

| Variable | Default | Purpose |
|---|---|---|
| `VBE_SECRET` | *(required)* | Shared secret for webhook auth |
| `VBE_SIGNAL_FILE` | `./vbe_signals.jsonl` | Output signal file (point at `MQL5/Files/vbe_signals.jsonl`) |
| `VBE_SEQ_FILE` | `<signal file>.seq` | Sidecar id-sequence file |
| `VBE_HOST` | `0.0.0.0` | Bind host |
| `VBE_PORT` | `8080` | Bind port |
| `VBE_ALLOW_DUPLICATE_ACTIONS` | `true` | If `false`, reject repeated consecutive actions |

## Running locally

```bash
cd mt5-trading-system/bridge/python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: set VBE_SECRET, and point VBE_SIGNAL_FILE at your MT5
# terminal's MQL5/Files/vbe_signals.jsonl

./run.sh
# or directly:
# uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### Running the tests

```bash
pip install -r requirements.txt
pytest
```

## Running with Docker

```bash
cd mt5-trading-system/bridge/python
docker build -t vbe-webhook-bridge .

docker run -d \
  --name vbe-bridge \
  -p 8080:8080 \
  -e VBE_SECRET="$(openssl rand -hex 32)" \
  -v /path/to/MT5/MQL5/Files:/data \
  vbe-webhook-bridge
```

The image writes to `/data/vbe_signals.jsonl` / `/data/vbe_signals.seq`
by default (see the `Dockerfile`'s `ENV`) — bind-mount your MT5
terminal's `MQL5/Files` directory there so the EA sees new signals
immediately. This only works cleanly if the container runs on the same
host as the terminal; see the latency note above.

## Pointing this at the MT5 terminal

1. Find your MT5 terminal's data folder: in the terminal, **File → Open
   Data Folder**, then navigate to `MQL5/Files`.
2. Set `VBE_SIGNAL_FILE` (native run) or the bind mount (Docker run) to
   `.../MQL5/Files/vbe_signals.jsonl`.
3. In the EA's inputs (or `config/ea-config.example.set`), confirm
   `InpSignalFile=vbe_signals.jsonl` and `InpSignalSource=1` (file
   queue) match the filename you configured here.
4. Restart the EA (or wait for its next poll cycle, `InpTimerIntervalMs`)
   after the bridge writes its first signal.

## TradingView alert setup

In your TradingView alert's **Webhook URL**, point at
`http://<bridge-host>:8080/webhook`, and use this as the alert **Message**
(JSON):

```json
{"action":"buy","token":"YOUR_SECRET"}
```

or, for a sell alert:

```json
{"action":"sell","token":"YOUR_SECRET"}
```

Replace `YOUR_SECRET` with the value of `VBE_SECRET`. A plain-text
message body of just `buy` or `sell` also works, as long as the
`Authorization: Bearer YOUR_SECRET` header or a `?token=` query
parameter is configured instead (TradingView's alert webhook UI supports
custom headers).
