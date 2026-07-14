#!/usr/bin/env bash
# Starts the VBE MT5 webhook bridge with uvicorn.
#
# Configuration comes entirely from the environment (see .env.example).
# VBE_SECRET is required -- app/config.py fails fast at startup if it's
# missing, rather than silently accepting unauthenticated requests.
set -euo pipefail

: "${VBE_HOST:=0.0.0.0}"
: "${VBE_PORT:=8080}"

exec uvicorn app.main:app --host "${VBE_HOST}" --port "${VBE_PORT}"
