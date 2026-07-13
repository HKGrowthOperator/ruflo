# Architektur – Vantage Basket EA (MT5 Trading-System)

> Produktionsreifes, automatisiertes Trading-System für MetaTrader 5 / Broker Vantage (Hedging-Konto).
> Ausführung von Buy/Sell-Signalen mit konfigurierbarem Lot-Management, Basket-TP/SL, Equity-Schutz,
> umfangreichen Filtern, Reset-Funktion, Zustandswiederherstellung und Logging.

---

## 1. Designziele

| Ziel | Umsetzung |
|------|-----------|
| **Niedrige Latenz** | Bevorzugt nativer MQL5-Indikator-Port (kein Netzwerk-Hop). Fallback: lokale Webhook-Bridge → dateibasierte Signal-Queue. Siehe [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md). |
| **Zuverlässigkeit** | Idempotente Signalverarbeitung (Dedup per Signal-ID), Reconnect/Retry, vollständige Zustandswiederherstellung nach Neustart. |
| **Hedging-korrekt** | Jedes Signal öffnet **genau eine** neue Position. Niemals Netting, niemals automatisches Schließen bestehender Positionen. |
| **Erweiterbarkeit** | Modulare `.mqh`-Includes mit jeweils einer Verantwortung (SOLID SRP), Konfiguration über eine zentrale `SConfig`-Struktur. |
| **Wartbarkeit** | Jede Datei < 500 Zeilen, klare Namenskonventionen, dokumentierte Entscheidungen, keine Copy-Paste-Logik. |

---

## 2. Signalquelle – Entscheidung

Die technisch beste Lösung ist die **direkte Portierung des Pine-Script-Indikators nach MQL5**:

- **Keine Netzwerk-Latenz** – die Signal-Logik läuft im selben Prozess wie die Order-Ausführung.
- **Intrabar-Signale möglich** – Auswertung auf jedem Tick (`OnTick`) statt erst bei Kerzenschluss.
- **Keine externe Abhängigkeit** – kein TradingView-Server, kein Cloud-Relay, keine verlorenen Alerts.

Da der Pine-Quellcode aktuell nicht vorliegt, ist das System **dual-fähig** aufgebaut:

```
                 ┌─────────────────────────────────────────────┐
                 │              Vantage Basket EA               │
                 │                                              │
  (bevorzugt)    │   ┌──────────────────────────────────────┐  │
  Nativer   ─────┼──▶│  SignalReceiver: SRC_INTERNAL_IND.    │  │
  MQL5-Ind.      │   │  liest iCustom()-Buffer intrabar      │  │
                 │   └──────────────────────────────────────┘  │
                 │                                              │
  (Fallback)     │   ┌──────────────────────────────────────┐  │
  TradingView    │   │  SignalReceiver: SRC_FILE_QUEUE       │  │
  → lokale   ────┼──▶│  liest signals.jsonl aus MQL5/Files   │  │
  Bridge         │   │  (Dedup per Signal-ID)                │  │
                 │   └──────────────────────────────────────┘  │
                 └─────────────────────────────────────────────┘
```

Beide Quellen münden in dieselbe idempotente Verarbeitung. Umschaltung über den Parameter
`InpSignalSource`. Begründung und Latenzvergleich: [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md).

---

## 3. Modulübersicht

Alle Module liegen unter `mql5/Include/VantageBasket/` und werden vom Haupt-EA
`mql5/Experts/VantageBasketEA.mq5` orchestriert.

| Modul | Datei | Verantwortung |
|-------|-------|---------------|
| **Config** | `Config.mqh` | Zentrale `SConfig`-Struktur, Validierung der Eingabeparameter. |
| **Enums** | `Enums.mqh` | Signal-Typen, Log-Level, Signalquellen, Close-Gründe. |
| **Logger** | `Logger.mqh` | Terminal- + Datei-Logging, strukturierte Trade-/Event-Logs, Latenzmessung. |
| **TradeCounter** | `TradeCounter.mqh` | Persistenter Zyklus-Zähler (GlobalVariable), Reset, Rekonstruktion. |
| **LotCalculator** | `LotCalculator.mqh` | `Lot = StartLot + Counter × Increment`, Normalisierung & Clamping. |
| **SignalReceiver** | `SignalReceiver.mqh` | Signalaufnahme aus Indikator/Datei/Manuell, Dedup per ID. |
| **Filters** | `Filters.mqh` | Spread-, ATR-, Zeit-, Tages-, News-, Volatilitäts-, Trendfilter. |
| **RiskManager** | `RiskManager.mqh` | Equity-Schutz, Max-Trades, Max-Lot, Margin, Drawdown. |
| **BasketManager** | `BasketManager.mqh` | Floating-P/L-Überwachung, Basket-TP/SL, Close-All. |
| **TradeEngine** | `TradeEngine.mqh` | Order-Ausführung (Hedging), Retry, Broker-Antwort-Handling. |
| **StateManager** | `StateManager.mqh` | Persistenz + Wiederherstellung von Zähler, Zyklus, Signal-IDs. |
| **PositionBook** | `PositionBook.mqh` | Aggregation der EA-eigenen Positionen (Buy/Sell/Lots/P&L). |
| **Dashboard** | `Dashboard.mqh` | On-Chart-Panel (Live-Kennzahlen) + Reset-Button. |
| **Notifier** | `Notifier.mqh` | Telegram / Push / E-Mail Benachrichtigungen. |

---

## 4. Datenfluss (Happy Path)

```
OnTick / OnTimer
     │
     ▼
1. SignalReceiver.Poll() ──▶ neues Signal? (mit eindeutiger ID, noch nicht verarbeitet?)
     │ ja
     ▼
2. Filters.Allow(signal)  ──▶ Spread/ATR/Zeit/Trend/... ok?
     │ ja
     ▼
3. RiskManager.CanOpen()  ──▶ Max-Trades/Lot/Margin/Drawdown ok?
     │ ja
     ▼
4. LotCalculator.Next()   ──▶ Lot = StartLot + Counter × Increment
     │
     ▼
5. TradeEngine.Open(dir, lot) ──▶ neue Position (Magic, Comment, Slippage, Retry)
     │ Erfolg
     ▼
6. TradeCounter.Increment() + StateManager.Persist() + Logger.Trade(...) + Notifier
     │
     ▼
── parallel, jeder Tick/Timer ──
7. BasketManager.Check() ──▶ Floating-P/L ≥ TP  oder ≤ -SL ? ──▶ CloseAll() + Reset()
8. RiskManager.CheckEquity() ──▶ Equity-Limit unterschritten? ──▶ CloseAll() + optional EA aus
```

Ablaufdiagramm im Detail: [`FLOWCHART.md`](FLOWCHART.md).

---

## 5. Zustandsmodell & Wiederherstellung

Der **Trade-Zähler** (`TradeCounter`) ist der zentrale Zustand. Er zählt ausschließlich
im aktuellen Zyklus **eröffnete** Trades und bestimmt die nächste Lotgröße.

**Persistenz-Strategie (mehrschichtig):**

1. **Primär:** MT5 `GlobalVariable` `VBE_<magic>_counter` – überlebt EA-Reload und Terminal-Neustart.
2. **Backup:** `state_<magic>.json` in `MQL5/Files` – überlebt auch das Löschen der GlobalVariables.
3. **Sanity/Fallback:** Bei fehlendem persistiertem Zustand (z. B. nach Crash) wird der Zähler aus
   der Anzahl offener Positionen mit der EA-Magic-Number rekonstruiert (`PositionBook.CountOwn()`).

**Reihenfolge in `OnInit`:**

```
GlobalVariable vorhanden? ──ja──▶ Zähler = GV
        │ nein
        ▼
State-Datei vorhanden? ────ja──▶ Zähler = Datei, GV neu setzen
        │ nein
        ▼
Rekonstruktion aus offenen EA-Positionen (Fallback)
```

Die **Signal-Dedup-Historie** (Ring-Puffer verarbeiteter Signal-IDs) wird ebenfalls persistiert,
damit ein Neustart nicht ein bereits ausgeführtes Signal erneut ausführt.

---

## 6. Idempotenz & Race Conditions

| Risiko | Gegenmaßnahme |
|--------|---------------|
| Doppeltes Signal | Jedes Signal trägt eine eindeutige ID; `SignalReceiver` hält einen Ring-Puffer verarbeiteter IDs und ignoriert Duplikate. |
| Doppelte Order durch Re-Entry | `OnTick`/`OnTimer` sind durch eine `m_busy`-Sperre (Mutex-Semantik im Single-Thread-EA) serialisiert; ein Signal wird erst nach vollständiger Verarbeitung als „verarbeitet" markiert. |
| Inkonsistenter Zähler | Zähler wird **nach** bestätigter Order-Ausführung erhöht und sofort persistiert (Write-After-Commit). |
| Basket schließt während Order öffnet | Basket-Close und Order-Open teilen sich dieselbe Serialisierung; niemals gleichzeitig. |
| Verlorene GlobalVariable | Backup-Datei + Positionsrekonstruktion. |

MT5-EAs laufen single-threaded pro Chart – echte Threads gibt es nicht. Die Serialisierung
schützt gegen re-entrante Event-Aufrufe (z. B. Timer feuert während OnTick noch läuft).

---

## 7. Fehlerbehandlung

| Szenario | Verhalten |
|----------|-----------|
| MT5 geschlossen / neu gestartet | Zustand aus GV/Datei/Positionen wiederhergestellt (Abschnitt 5). |
| Broker-Verbindung weg | `TradeEngine` erkennt `TRADE_RETCODE_*`/`!TerminalInfoInteger(TERMINAL_CONNECTED)`, Retry mit Backoff, Logging. |
| Requote / Preis geändert | CTrade-Retry mit aktualisiertem Preis, begrenzte Versuche. |
| Doppeltes Signal | Ignoriert (Dedup). |
| Verlorenes Signal | Geloggt; bei Datei-Queue bleibt die Zeile erhalten, bis verarbeitet. |
| Order teilweise gefüllt | Über tatsächliches `Deal`-Volumen erkannt und geloggt. |

---

## 8. Konfigurationsprinzip

Alle Eingaben sind `input`-Parameter im Haupt-EA und werden in `OnInit` in eine validierte
`SConfig`-Struktur überführt. Module erhalten die Konfiguration by-reference und besitzen
keine eigenen globalen Zustände außer ihrer Instanz. Das erlaubt späteres Testen,
Mehrfach-Instanzen (mehrere Symbole/Charts mit unterschiedlicher Magic) und klare Abhängigkeiten.

---

## 9. Erweiterbarkeit

- **Mehrere Symbole/Accounts:** je Chart eine EA-Instanz mit eigener Magic-Number; Zustand ist Magic-scoped.
- **Weitere Signalquellen:** neue `ENUM_SIGNAL_SOURCE` + Implementierung in `SignalReceiver`.
- **Cloud/VPS/Docker:** Die Python-Bridge (`bridge/python`) ist container-fähig; der EA selbst läuft
  auf jedem MT5 (Windows/VPS oder Wine/Linux).
- **REST/Web-Dashboard:** Die Bridge kann Zustände exportieren (P&L, Zähler) für ein späteres Web-UI.

---

## 10. Verzeichnisstruktur

```
mt5-trading-system/
├── mql5/
│   ├── Experts/VantageBasketEA.mq5          # Haupt-EA (Orchestrator)
│   ├── Include/VantageBasket/*.mqh          # Module (ein Modul = eine Verantwortung)
│   └── Indicators/VantageSignalStub.mq5     # Vorlage für nativen Signal-Indikator
├── bridge/python/                           # Fallback: TradingView-Webhook → Signal-Queue
│   ├── app/ (webhook_server, signal_writer, models, config, security)
│   └── tests/
├── config/ea-config.example.set             # Beispiel-Presets
└── docs/                                     # Architektur, Installation, Konfiguration, Webhook,
                                              # Latenzanalyse, Troubleshooting, Ablaufdiagramm
```
