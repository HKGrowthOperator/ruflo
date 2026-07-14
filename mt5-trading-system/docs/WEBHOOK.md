# Webhook-Anbindung (TradingView → Vantage Basket EA)

> Beschreibt den Fallback-Signalweg `SRC_FILE_QUEUE`: TradingView-Alert → lokale Python-Bridge
> → dateibasierte Signal-Queue → EA. Für die technische Begründung und den Latenzvergleich
> gegenüber der nativen MQL5-Portierung siehe [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md).
> Parameterreferenz: [`CONFIGURATION.md`](CONFIGURATION.md).

---

## 1. Wann diesen Weg nutzen?

Der Vantage Basket EA unterstützt drei Signalquellen (`InpSignalSource`):

| Quelle | Wann nutzen |
|---|---|
| `SRC_INTERNAL_INDICATOR` | **Bevorzugt**, sofern der Pine-Script-Quellcode des TradingView-Indikators vorliegt. Kein Netzwerk-Hop, niedrigste Latenz, keine externe Abhängigkeit. Siehe [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md) Abschnitt 3 und 4. |
| `SRC_FILE_QUEUE` | **Dieser Dokument-Abschnitt.** Fallback, wenn der Pine-Quellcode (noch) nicht verfügbar ist oder die TradingView-Strategie weiter auf TradingView gepflegt werden soll. |
| `SRC_MANUAL` | Nur Test/Debug über die On-Chart-Buttons „MANUAL BUY“/„MANUAL SELL“. |

**Wichtiger Hinweis vorab:** Der Webhook-Weg erbt strukturell die Latenz von TradingViews
serverseitiger Alarm-Queue (siehe [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md) Abschnitt 1.3)
— das ist durch keine noch so schnelle eigene Bridge vollständig zu beheben. Steht der
Pine-Quellcode zur Verfügung, ist der native MQL5-Port (`SRC_INTERNAL_INDICATOR`) die
technisch überlegene, latenzärmere Lösung und sollte priorisiert werden.

---

## 2. Architekturüberblick

```
TradingView-Chart
      │  Alert-Bedingung erfüllt
      ▼
TradingView-Alert (Webhook-URL)
      │  HTTP POST (JSON-Body)
      ▼
Lokale Python-Bridge (bridge/python, FastAPI)
      │  validiert Token, parst Signal, schreibt Zeile
      ▼
MQL5/Files/vbe_signals.jsonl   (im MT5-Datenordner)
      │  OnTimer()-Polling, Intervall = InpTimerIntervalMs
      ▼
SignalReceiver (SRC_FILE_QUEUE) im EA
```

Die Bridge liegt im Repository unter `../bridge/python` (FastAPI-Anwendung). Sie nimmt den
TradingView-Webhook entgegen und schreibt jedes gültige Signal als eine Zeile im
JSON-Lines-Format in die Queue-Datei, die der EA per Timer pollt.

---

## 3. TradingView-Alert einrichten

1. Im TradingView-Chart die gewünschte Indikator-/Strategie-Bedingung als **Alert**
   anlegen (Uhr-Symbol → „Alarm erstellen“ bzw. `alertcondition()`/`alert()` im Pine-Skript).
2. Trigger-Häufigkeit wählen:
   - **„Once Per Bar Close“** für stabile, nicht-repaintende Signale (empfohlen als Start,
     entspricht `InpSignalOnBarCloseOnly = true` auf der EA-Seite).
   - **„Once Per Bar“**/`alert()` ohne Bar-Close-Einschränkung nur, wenn bewusst
     Intrabar-Geschwindigkeit gegen Signalstabilität eingetauscht werden soll (siehe
     [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md) Abschnitt 1.4 und 3.2).
3. Im Alert-Dialog unter **„Benachrichtigungen“** die Option **„Webhook-URL“** aktivieren
   und die URL der lokal gehosteten Bridge eintragen, z. B.:
   ```
   http://<bridge-host>:<port>/webhook/tradingview
   ```
   (genauer Pfad je nach Implementierung in `bridge/python/app`).
4. Im Feld **„Nachricht“** (Alert-Message) exakt eines der folgenden JSON-Payloads
   hinterlegen — für ein Buy-Signal:
   ```json
   {"action":"buy","token":"YOUR_SECRET"}
   ```
   für ein Sell-Signal:
   ```json
   {"action":"sell","token":"YOUR_SECRET"}
   ```
   `YOUR_SECRET` durch das mit der Bridge geteilte Secret ersetzen (siehe Abschnitt 5).
   TradingView-Platzhalter wie `{{close}}`, `{{time}}` können bei Bedarf ergänzt werden,
   sofern die Bridge sie auswertet — die beiden Pflichtfelder `action` und `token` müssen in
   jedem Fall vorhanden sein.

---

## 4. Ausgabeformat der Bridge (Datei-Queue)

Die Bridge übersetzt jeden eingehenden, validierten Webhook-Aufruf in **eine Zeile** im
JSON-Lines-Format (`.jsonl`) und hängt sie an die Queue-Datei an:

```json
{"id": <monotonic int>, "action": "buy"|"sell", "time": <unix epoch>, "price": <float>}
```

| Feld | Bedeutung |
|---|---|
| `id` | Monoton steigende, eindeutige Signal-ID. Der EA verarbeitet nur Zeilen mit `id > letzte verarbeitete id` — das ist der zentrale Dedup-Mechanismus gegen doppelte Ausführung bei Neustart oder Mehrfachzustellung. |
| `action` | `"buy"` oder `"sell"` (auch `"BUY"`/`"SELL"` werden akzeptiert). Jeder andere Wert wird ignoriert. |
| `time` | Unix-Epoch-Sekunden des Signalzeitpunkts (informativ/Logging). |
| `price` | Optionaler Referenzpreis (informativ) — der EA handelt in jedem Fall zum aktuellen Marktpreis (Market-Order), `price` wird nicht als Limit verwendet. |

Beispiel-Datei `vbe_signals.jsonl` mit zwei Signalen:

```jsonl
{"id": 1001, "action": "buy", "time": 1752400000, "price": 1.08652}
{"id": 1002, "action": "sell", "time": 1752400300, "price": 1.08611}
```

---

## 5. Bridge-Ziel: MT5-Files-Ordner

Die Bridge muss so konfiguriert werden, dass sie die Queue-Datei **direkt in den
`MQL5/Files/`-Ordner** des Ziel-Terminals schreibt (siehe [`INSTALLATION.md`](INSTALLATION.md)
Abschnitt 3 zum Auffinden des Datenordners):

```
<MT5-Datenordner>/MQL5/Files/vbe_signals.jsonl
```

Der Dateiname muss mit `InpSignalFile` im EA übereinstimmen (Standard: `vbe_signals.jsonl`).
Die Bridge-Konfiguration (Ausgabepfad, Secret/Token, ggf. Port) erfolgt über die
Konfigurationsdateien/Umgebungsvariablen der FastAPI-Anwendung in `bridge/python/app` —
Details siehe deren eigene Konfiguration; sicherheitsrelevante Werte (Token, API-Keys)
gehören in `.env` und dürfen nicht ins Repository committet werden.

---

## 6. Empfehlung: Bridge lokal hosten

**Die Bridge sollte so nah wie möglich am MT5-Terminal betrieben werden** — idealerweise auf
derselben Maschine oder im selben lokalen Netz/VPS-Rechenzentrum wie das MT5-Terminal, statt
als entfernter Cloud-Dienst. Gründe (ausführlich in
[`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md) Abschnitt 3.3):

- Ein zusätzlicher entfernter Netzwerk-Hop zwischen Bridge und MT5 vergrößert die
  kontrollierbare Restlatenz unnötig.
- Lokales Hosting erlaubt Datei-basierte Signalübergabe ohne zusätzliche
  Netzwerk-/WebRequest-Freigaben.
- Debugging, Logging und Fehlerbehandlung liegen vollständig in eigener Hand, ohne
  Abhängigkeit von einem Drittanbieter-Relay (z. B. PineConnector).

Diese Lösung eliminiert **nicht** den TradingView-seitigen Latenzsockel (Alert-Queue,
siehe [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md) Abschnitt 1.3) — sie minimiert nur den
Teil der Kette, der tatsächlich in eigener Kontrolle liegt.

---

## 7. Bevorzugte Alternative: Nativer MQL5-Port

Sobald der Pine-Script-Quellcode des Original-Indikators verfügbar ist, wird empfohlen, auf
`InpSignalSource = SRC_INTERNAL_INDICATOR` umzusteigen. Dabei läuft die Signal-Logik als
nativer MQL5-Indikator (Vorlage: `mql5/Indicators/VantageSignalStub.mq5`) direkt im
MT5-Terminal — ganz ohne TradingView, Webhook oder Bridge im Signalpfad. Das eliminiert den
strukturellen Latenzsockel vollständig und entfernt jede externe Abhängigkeit. Die
vollständige Portierungs-Checkliste (Pine-Konstrukte → MQL5-Äquivalente, Umgang mit
Repainting) steht in [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md) Abschnitt 4.

Der Webhook-Weg kann während der Migration parallel als Fallback weiterlaufen (Signal-Log
statt Live-Order), bis die native Portierung gegen die Original-Signale validiert ist.

---

## 8. Fehlerdiagnose

Siehe [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) Abschnitt „Keine Signale kommen an“ für die
Prüfschritte (Dateipfad, Bridge-Prozess, Token/Secret, WebRequest-Freigabe bei Telegram-Kanal,
Dedup-Verhalten bei doppelten IDs).
