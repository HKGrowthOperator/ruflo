# Vantage Basket EA — Automatisiertes MT5 Trading-System

Produktionsreifer Expert Advisor für **MetaTrader 5** / Broker **Vantage** (Hedging-Konto).
Führt Buy-/Sell-Signale automatisch aus, mit frei konfigurierbarem Lot-Management,
Basket-Take-Profit/Stop-Loss, Equity-Schutz, umfangreichen Filtern, manuellem Reset,
vollständiger Zustandswiederherstellung und Logging.

> **Signalquelle:** Bevorzugt wird der **native MQL5-Indikator-Port** (niedrigste Latenz,
> keine Netzwerk-Abhängigkeit). Als Fallback dient eine lokal gehostete **TradingView-Webhook-Bridge**.
> Die vollständige Latenz- und Architekturbegründung steht in
> [`docs/LATENCY_ANALYSIS.md`](docs/LATENCY_ANALYSIS.md).

---

## Kernverhalten (Kurzfassung)

| Regel | Verhalten |
|-------|-----------|
| Jedes Signal | öffnet **genau eine** neue Position (Buy→Buy, Sell→Sell). |
| Bestehende Positionen | werden **niemals** durch Gegensignale geschlossen, **niemals** genettet. |
| Lotgröße | `Lot = StartLot + (TradeCounter × LotIncrement)` — Richtung egal. |
| Trade Counter | zählt nur **eröffnete** Trades im aktuellen Zyklus. |
| Basket TP/SL | schließt **alle** Positionen gleichzeitig, danach Counter-Reset + neuer Zyklus. |
| Equity-Schutz | optional: alle Positionen schließen, Counter-Reset, EA optional stoppen. |
| Reset-Button | setzt **nur den Counter** zurück — offene Positionen bleiben unverändert. |
| Neustart | Zustand aus GlobalVariable/Datei/Positionen vollständig wiederhergestellt. |

Beispiel Lot-Progression (`StartLot=0.05`, `Increment=0.02`): `0.05 → 0.07 → 0.09 → 0.11 → 0.13 …`
Richtungsunabhängig, z. B. Sell 0.10 · Buy 0.20 · Sell 0.30 · Buy 0.40 · Sell 0.50.

---

## Projektstruktur

```
mt5-trading-system/
├── README.md                          # dieses Dokument
├── mql5/
│   ├── Experts/VantageBasketEA.mq5     # Haupt-EA (Orchestrator)
│   ├── Include/VantageBasket/          # 13 Module (ein Modul = eine Verantwortung)
│   │   ├── Config.mqh   Enums.mqh   Logger.mqh   PositionBook.mqh
│   │   ├── TradeCounter.mqh  LotCalculator.mqh  StateManager.mqh
│   │   ├── SignalReceiver.mqh  Filters.mqh  RiskManager.mqh
│   │   └── BasketManager.mqh  TradeEngine.mqh  Dashboard.mqh  Notifier.mqh
│   └── Indicators/VantageSignalStub.mq5  # Buffer-Contract für nativen Signal-Port
├── bridge/python/                     # Fallback: TradingView-Webhook → Signal-Queue (FastAPI)
├── config/ea-config.example.set       # Beispiel-Preset
├── tests/                             # MQL5-Unit-Tests (Logik) + Python-Tests in bridge/
└── docs/
    ├── ARCHITECTURE.md                # Modul- & Datenflussarchitektur, Zustandsmodell
    ├── LATENCY_ANALYSIS.md            # Signalquellen-Vergleich + Pine→MQL5 Portierungsguide
    ├── INSTALLATION.md   CONFIGURATION.md   WEBHOOK.md
    ├── FLOWCHART.md      TROUBLESHOOTING.md
    └── DEVELOPER.md      BENUTZERHANDBUCH.md
```

---

## Schnellstart

1. **Kopieren:** `mql5/Experts/VantageBasketEA.mq5` → `<MT5-Datenordner>/MQL5/Experts/`
   und `mql5/Include/VantageBasket/` → `<MT5-Datenordner>/MQL5/Include/VantageBasket/`.
   (MT5 → Datei → Datenordner öffnen.)
2. **Kompilieren:** `VantageBasketEA.mq5` in MetaEditor öffnen, **F7**.
3. **Anhängen:** EA auf einen Chart des Zielsymbols ziehen, **Algo Trading** aktivieren.
4. **Signalquelle wählen** (`InpSignalSource`):
   - `SRC_INTERNAL_INDICATOR` — nativer Indikator (bevorzugt). Siehe `VantageSignalStub.mq5`.
   - `SRC_FILE_QUEUE` — TradingView-Webhook via Python-Bridge (`bridge/python/`).
   - `SRC_MANUAL` — On-Chart Buy/Sell-Buttons (Test).
5. **Konfigurieren:** Preset `config/ea-config.example.set` laden oder Parameter direkt setzen.

Details: [`docs/INSTALLATION.md`](docs/INSTALLATION.md) · [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md)

---

## Signalpfade

### Bevorzugt — Nativer MQL5-Indikator (niedrigste Latenz)
Kein Netzwerk-Hop, Tick-genaue Auswertung, keine externe Abhängigkeit. Der EA liest zwei
Buffer des Indikators (`Buffer 0 = BUY`, `Buffer 1 = SELL`). `VantageSignalStub.mq5` zeigt
den Contract anhand eines EMA-Crossovers — für den Produktivbetrieb die aus Pine portierte
Logik einsetzen. Portierungs-Leitfaden: [`docs/LATENCY_ANALYSIS.md`](docs/LATENCY_ANALYSIS.md) §4.

### Fallback — TradingView-Webhook → lokale Bridge → Datei-Queue
Wenn der Pine-Quellcode nicht portierbar ist. Die FastAPI-Bridge (`bridge/python/`) empfängt
den Webhook und schreibt eine Zeile in `vbe_signals.jsonl` (im `MQL5/Files`-Ordner), die der
EA pollt. Format je Zeile:

```json
{"id": 1, "action": "buy", "time": 1720000000, "price": 0.0}
```

Die Bridge **platziert keine Orders** — die gesamte Handelslogik liegt im EA.
Setup: [`docs/WEBHOOK.md`](docs/WEBHOOK.md) und `bridge/python/README.md`.

---

## Dashboard & Bedienung

Das On-Chart-Panel zeigt live: Trade Counter & Zyklus, nächste Lotgröße, Anzahl/Volumen der
Buy- und Sell-Positionen, gesamte Lots, Floating P/L, Basket TP/SL, Equity, Balance, Margin
und Drawdown. Buttons:

- **RESET COUNTER** — setzt nur den Zähler zurück (Positionen bleiben offen).
- **CLOSE ALL** — schließt alle EA-Positionen manuell.
- **MANUAL BUY / SELL** — nur bei `SRC_MANUAL` (Test).

---

## Sicherheit & Robustheit

- **Idempotenz:** Jedes Signal trägt eine ID; Duplikate werden ignoriert (Queue-Sequenz bzw.
  Bar+Richtung beim Indikator).
- **Keine Race Conditions:** Re-Entrancy-Sperre serialisiert Tick-/Timer-Verarbeitung; der
  Counter wird erst **nach** bestätigter Order erhöht und sofort persistiert.
- **Recovery:** Zustand überlebt Reload/Neustart (GlobalVariable + JSON-Backup + Positions-
  Rekonstruktion als Fallback).
- **Retry:** Order-Ausführung mit Backoff bei Requote/Preisänderung/Verbindungsverlust.
- **Keine Secrets im Code:** Telegram-Token & Bridge-Secret werden ausschließlich als
  Parameter/Umgebungsvariablen gesetzt.

---

## Dokumentation

| Dokument | Inhalt |
|----------|--------|
| [QUICKSTART.md](docs/QUICKSTART.md) | In 15 Minuten live über den Webhook-Pfad (Schritt für Schritt) |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Module, Datenfluss, Zustands-/Recovery-Modell, Race-Condition-Schutz |
| [LATENCY_ANALYSIS.md](docs/LATENCY_ANALYSIS.md) | Signalquellen-Vergleich, Empfehlung, Pine→MQL5 Portierungsguide |
| [INSTALLATION.md](docs/INSTALLATION.md) | Installation & Kompilierung |
| [CONFIGURATION.md](docs/CONFIGURATION.md) | Vollständige Parameterreferenz + Beispiel-Presets |
| [WEBHOOK.md](docs/WEBHOOK.md) | TradingView-Alert & Bridge-Setup |
| [FLOWCHART.md](docs/FLOWCHART.md) | Ablaufdiagramme |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Fehlerdiagnose |
| [DEVELOPER.md](docs/DEVELOPER.md) | Entwicklerdoku, Erweiterung |
| [BENUTZERHANDBUCH.md](docs/BENUTZERHANDBUCH.md) | Endanwender-Handbuch |

---

## Haftungsausschluss

Automatisierter Handel ist mit erheblichem Risiko verbunden. Diese Software wird ohne
Gewähr bereitgestellt. Vor dem Live-Einsatz **ausführlich auf einem Demokonto** und im
Strategy Tester validieren. Der Betrieb erfolgt auf eigenes Risiko.
