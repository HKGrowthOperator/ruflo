# Schnellstart — in 15 Minuten live (Webhook-Pfad)

Diese Anleitung bringt das System **sofort** zum Laufen, ohne dass der Pine-Quellcode
portiert werden muss. Sie nutzt den **Fallback-Signalpfad**: TradingView-Alert → lokale
Python-Bridge → Datei-Queue → EA. (Der latenzärmere native MQL5-Port ist die spätere,
bevorzugte Option — siehe [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md).)

> **Voraussetzung:** MT5 (Vantage, Hedging-Konto) installiert; Python 3.11+ auf demselben
> Rechner wie MT5 (für geringste Latenz). Zuerst **immer auf einem Demokonto** testen.

---

## Schritt 1 — EA installieren & kompilieren

1. In MT5: **Datei → Datenordner öffnen**. Dort liegt der Ordner `MQL5/`.
2. Kopiere:
   - `mql5/Experts/VantageBasketEA.mq5` → `MQL5/Experts/`
   - den kompletten Ordner `mql5/Include/VantageBasket/` → `MQL5/Include/VantageBasket/`
3. Öffne `VantageBasketEA.mq5` in **MetaEditor** und drücke **F7** (kompilieren).
   Erwartung: `0 errors, 0 warnings`.
4. Ziehe den EA auf einen Chart des Zielsymbols und aktiviere **Algo Trading** (Button oben).

Details & Screenshots: [`INSTALLATION.md`](INSTALLATION.md).

---

## Schritt 2 — Signal-Datei-Pfad festlegen

Der EA liest die Queue-Datei aus `MQL5/Files/`. Standardname: `vbe_signals.jsonl`
(Parameter `InpSignalFile`). Setze im EA:

| Parameter | Wert |
|-----------|------|
| `InpSignalSource` | `SRC_FILE_QUEUE` |
| `InpSignalFile`   | `vbe_signals.jsonl` |

Der volle Pfad ist typischerweise:
`C:\Users\<du>\AppData\Roaming\MetaQuotes\Terminal\<HASH>\MQL5\Files\vbe_signals.jsonl`
(genau der Ordner, der sich über **Datei → Datenordner öffnen → MQL5 → Files** öffnet).

---

## Schritt 3 — Bridge starten

```bash
cd bridge/python
cp .env.example .env
# .env bearbeiten:
#   VBE_SECRET=<ein-langes-zufaelliges-geheimnis>
#   VBE_SIGNAL_FILE=<voller Pfad zu ...\MQL5\Files\vbe_signals.jsonl>
pip install -r requirements.txt
bash run.sh          # startet uvicorn auf VBE_HOST:VBE_PORT (Default 0.0.0.0:8080)
```

Test, dass sie läuft:

```bash
curl http://127.0.0.1:8080/health
# -> {"status":"ok","last_id":0,"signal_file":"...vbe_signals.jsonl"}
```

Damit TradingView die Bridge erreicht, muss der Port **von außen erreichbar** sein
(Portfreigabe/Reverse-Proxy mit HTTPS, oder ein Tunnel). Die Bridge selbst sollte
**lokal beim MT5** laufen — nur der eingehende Webhook kommt von außen.

---

## Schritt 4 — TradingView-Alert einrichten

1. Indikator auf den Chart, Alarm erstellen.
2. **Webhook-URL:** `https://<deine-adresse>:<port>/webhook`
3. **Nachricht (Alert message)** — exakt dieses JSON:

   Für Buy-Signale:
   ```json
   {"action":"buy","token":"DEIN_VBE_SECRET"}
   ```
   Für Sell-Signale:
   ```json
   {"action":"sell","token":"DEIN_VBE_SECRET"}
   ```

   `token` muss mit `VBE_SECRET` aus der `.env` übereinstimmen. Alternativ kann das
   Secret als `Authorization: Bearer …`-Header oder `?token=…`-Query gesendet werden.

Empfehlung in TradingView: **„Once Per Bar Close"**, um Repainting zu vermeiden
(Hintergrund: [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md) §1.4).

---

## Schritt 5 — Lot- & Basket-Regeln setzen

Minimal sinnvolle Startkonfiguration (Rest siehe [`CONFIGURATION.md`](CONFIGURATION.md)):

| Parameter | Beispielwert | Bedeutung |
|-----------|--------------|-----------|
| `InpStartLot` | `0.10` | erstes Lot im Zyklus |
| `InpLotIncrement` | `0.10` | Erhöhung je Trade (`0.10, 0.20, 0.30 …`) |
| `InpMaxLotPerTrade` | `5.00` | harte Obergrenze pro Trade |
| `InpEnableBasketTP` | `true` | Basket-Gewinnziel aktiv |
| `InpBasketTPValue` | `100.0` | alle Positionen schließen bei +100 (Kontowährung) |
| `InpResetAfterBasketClose` | `true` | danach Counter-Reset → neuer Zyklus mit Start-Lot |
| `InpEnableSpreadFilter` | `true` | Trades bei zu hohem Spread blocken |

---

## Schritt 6 — Verifizieren

1. **Manueller End-to-End-Test ohne TradingView:**
   ```bash
   curl -X POST "http://127.0.0.1:8080/webhook?token=DEIN_VBE_SECRET" \
        -H "Content-Type: application/json" -d '{"action":"buy"}'
   # -> {"status":"ok","id":1}
   ```
   In `vbe_signals.jsonl` erscheint eine Zeile; der EA öffnet innerhalb von
   `InpTimerIntervalMs` (Default 250 ms) genau eine Buy-Position mit `InpStartLot`.
2. **Dashboard prüfen:** Counter = 1, Buys = 1, nächste Lot = Start + Increment.
3. **Reset-Button** testen: Counter → 0, Position bleibt offen.
4. **Basket-TP** testen (auf Demo): mehrere Signale senden, bei Erreichen von
   `InpBasketTPValue` werden alle Positionen geschlossen und der Counter zurückgesetzt.

Fehlersuche: [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md).

---

## Wichtige Hinweise

- **Nur Demokonto**, bis du das Verhalten vollständig verstanden und über mehrere
  Basket-Zyklen beobachtet hast.
- Die Bridge **platziert keine Orders** — die gesamte Handelslogik (Lot, Counter,
  Basket, Filter) liegt im EA.
- Bei Neustart von MT5 wird der Zähler automatisch wiederhergestellt (GlobalVariable +
  Backup-Datei + Positionsrekonstruktion) — kein manuelles Eingreifen nötig.
- Sobald der Pine-Quellcode verfügbar ist: auf `SRC_INTERNAL_INDICATOR` umsteigen
  (native Logik in `VantageSignalStub.mq5` ersetzen) für minimale Latenz.
- **Signal-Datei rotieren:** `vbe_signals.jsonl` wird nur angehängt und wächst über lange
  Laufzeiten. Der EA liest sie effizient (Neu-Parsen nur bei Änderung), aber die Datei
  sollte periodisch rotiert werden (z. B. wöchentlich bei gestopptem Handel neu anlegen).
  Da die Bridge die Sequenz-ID in `vbe_signals.seq` persistiert, bleiben die IDs auch nach
  Rotation monoton — die Dedup-Logik des EA bleibt korrekt.
