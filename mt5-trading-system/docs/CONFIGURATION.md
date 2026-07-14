# Konfiguration – Vantage Basket EA

> Vollständige Referenz aller `input`-Parameter des Vantage Basket EA, gruppiert wie im
> Eigenschaften-Dialog von MT5. Für die Installation siehe [`INSTALLATION.md`](INSTALLATION.md),
> für die Signalquellen siehe [`WEBHOOK.md`](WEBHOOK.md), für den Ablauf siehe
> [`FLOWCHART.md`](FLOWCHART.md).

---

## Grundprinzip: Lotgrößen-Formel

Der zentrale Mechanismus des EA:

```
Lot = StartLot + (TradeCounter × LotIncrement)
```

- `TradeCounter` zählt ausschließlich die im **aktuellen Zyklus tatsächlich eröffneten**
  Trades – **unabhängig von der Richtung** (Buy und Sell zählen gleichermaßen zum selben
  Zähler).
- Nach einem Basket-Close beginnt (sofern `InpResetAfterBasketClose = true`) ein neuer
  Zyklus mit `TradeCounter = 0`, d. h. der nächste Trade nutzt wieder `InpStartLot`.
- Der manuelle **RESET**-Button setzt **ausschließlich** `TradeCounter` auf 0 zurück –
  offene Positionen bleiben davon vollständig unberührt.
- Jedes Buy-Signal öffnet genau eine neue Buy-Position, jedes Sell-Signal genau eine neue
  Sell-Position. Es wird niemals genettet und niemals eine einzelne Position aufgrund eines
  Gegensignals geschlossen.

---

## Gruppe: Identität

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpMagic` | `990101` | Magic Number. Isoliert die Positionen und den persistierten Zustand dieser EA-Instanz von anderen EAs/Instanzen. Muss bei mehreren Instanzen eindeutig sein. |
| `InpSymbol` | `""` (= Chartsymbol) | Handelssymbol. Leer lassen, um automatisch das Symbol des Charts zu verwenden, an den der EA angehängt ist. |
| `InpTradeComment` | `"VantageBasket"` | Kommentar, der jeder eröffneten Order mitgegeben wird (sichtbar im Terminal-Journal und in der Historie). |

---

## Gruppe: Lot-Management

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpStartLot` | `0.10` | Lotgröße des ersten Trades in einem neuen Zyklus (`TradeCounter = 0`). |
| `InpLotIncrement` | `0.10` | Erhöhung der Lotgröße je zusätzlichem, im aktuellen Zyklus eröffnetem Trade. |
| `InpMaxLotPerTrade` | `5.00` (`0` = aus) | Harte Obergrenze für die Lotgröße eines **einzelnen** Trades. Verhindert, dass die Formel bei vielen Trades im Zyklus unkontrolliert große Einzelpositionen erzeugt. `0` deaktiviert die Grenze (nur noch das Symbol-Maximalvolumen greift). |

Die berechnete Lotgröße wird zusätzlich immer auf die Symbol-Volumenschritte
(`SYMBOL_VOLUME_MIN`/`MAX`/`STEP`) normalisiert und geklemmt.

---

## Gruppe: Signalquelle

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpSignalSource` | `SRC_FILE_QUEUE` | Herkunft der Handelssignale: `SRC_INTERNAL_INDICATOR` (nativer MQL5-Indikator, niedrigste Latenz, bevorzugt), `SRC_FILE_QUEUE` (TradingView-Webhook → lokale Bridge → Datei-Queue), `SRC_MANUAL` (nur On-Chart-Testbuttons). |
| `InpIndicatorName` | `"VantageSignal"` | Name des per `iCustom()` geladenen Indikators (nur bei `SRC_INTERNAL_INDICATOR` relevant). |
| `InpSignalBufferBuy` | `0` | Pufferindex des Indikators, der ein Buy-Signal signalisiert (Wert ≠ 0/`EMPTY_VALUE`). |
| `InpSignalBufferSell` | `1` | Pufferindex des Indikators, der ein Sell-Signal signalisiert. |
| `InpSignalOnBarCloseOnly` | `true` | `true` = Signal wird nur einmal je abgeschlossener Kerze ausgewertet (stabil, kein Repainting). `false` = Auswertung bei jedem Tick auf der offenen Kerze (schneller, aber potenziell instabiles Signal). Details: [`LATENCY_ANALYSIS.md`](LATENCY_ANALYSIS.md) Abschnitt 3.2. |
| `InpSignalFile` | `"vbe_signals.jsonl"` | Dateiname der Signal-Queue in `MQL5/Files/` (nur bei `SRC_FILE_QUEUE` relevant). Siehe [`WEBHOOK.md`](WEBHOOK.md) für das Dateiformat. |

---

## Gruppe: Ausführung

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpSlippagePoints` | `20` | Maximal erlaubte Kursabweichung (in Points) bei der Orderausführung. |
| `InpMaxRetries` | `3` | Anzahl zusätzlicher Wiederholungsversuche bei wiederholbaren Fehlern (Requote, Timeout, Verbindungsabbruch etc.). |
| `InpRetryDelayMs` | `300` | Basis-Wartezeit zwischen Wiederholungsversuchen in Millisekunden (linearer Backoff: Versuch × `InpRetryDelayMs`). |

---

## Gruppe: Basket Take Profit

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpEnableBasketTP` | `true` | Aktiviert die Basket-Take-Profit-Überwachung. |
| `InpBasketTPBasis` | `BASIS_MONEY` | Basis der Schwelle: `BASIS_MONEY` (absoluter Betrag in Kontowährung) oder `BASIS_PERCENT` (Prozent der aktuellen Balance). |
| `InpBasketTPValue` | `100.0` | Zielwert. Sobald der schwebende Gesamtgewinn (Floating P/L, inkl. Swap/Kommission) über allen offenen EA-Positionen ≥ diesem Wert ist, wird der gesamte Basket geschlossen. |

---

## Gruppe: Basket Stop Loss

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpEnableBasketSL` | `false` | Aktiviert die Basket-Stop-Loss-Überwachung. |
| `InpBasketSLBasis` | `BASIS_MONEY` | Basis wie bei Basket TP. |
| `InpBasketSLValue` | `300.0` | **Positiver** Verlustschwellenwert. Sobald der schwebende Gesamtverlust ≤ `-InpBasketSLValue` ist, wird der gesamte Basket geschlossen. |

---

## Gruppe: Nach Basket-Close

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpResetAfterBasketClose` | `true` | Steuert, ob `TradeCounter` nach einem durch Basket-TP oder Basket-SL ausgelösten Close automatisch auf 0 zurückgesetzt wird (neuer Zyklus). Bei einem Equity-Stop-Close wird der Zähler **immer** zurückgesetzt, unabhängig von diesem Schalter. |

---

## Gruppe: Equity-Schutz

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpEnableEquityStop` | `false` | Aktiviert die Kontoschutz-Überwachung (unabhängig von Basket-TP/SL, höchste Priorität in jedem Tick/Timer-Zyklus). |
| `InpEquityMinAbsolute` | `0.0` (aus) | Absolute Mindest-Equity. Fällt die Equity darunter, wird der Basket sofort geschlossen. |
| `InpEquityMaxLossPct` | `0.0` (aus) | Maximaler Verlust in Prozent, bezogen auf die Balance beim EA-Start. Wird überschritten, wird der Basket sofort geschlossen. |
| `InpDisableEAOnEquityStop` | `true` | Wenn `true`, wird der Handel (Signalverarbeitung) nach einem Equity-Stop-Close dauerhaft angehalten, bis der EA neu gestartet wird. Basket-TP/SL-Überwachung und Dashboard bleiben aktiv. |

---

## Gruppe: Risiko-Filter

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpEnableMaxTrades` | `false` | Begrenzt die Anzahl gleichzeitig offener EA-Positionen. |
| `InpMaxOpenTrades` | `20` | Obergrenze, ab der neue Signale abgelehnt werden (bestehende Positionen bleiben unangetastet). |
| `InpEnableMaxMargin` | `false` | Prüft vor jeder neuen Order die projizierte Margin-Auslastung. |
| `InpMaxMarginUsagePct` | `80.0` | Maximale (genutzte + für den neuen Trade benötigte) Margin in Prozent der Equity. |
| `InpEnableMaxDrawdown` | `false` | Blockiert neue Trades, wenn der Drawdown vom bisherigen Equity-Höchststand (Peak) zu groß ist. |
| `InpMaxDrawdownPct` | `30.0` | Maximaler Drawdown in Prozent vom Peak-Equity, ab dem keine neuen Trades mehr eröffnet werden. |

Diese Risiko-Filter verhindern **neue** Trades (`RiskManager.CanOpen`) — sie schließen keine
bestehenden Positionen. Ein sofortiges Schließen erfolgt ausschließlich über Basket-TP/SL
oder den Equity-Schutz.

---

## Gruppe: Marktfilter

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpEnableSpreadFilter` | `true` | Blockiert neue Trades bei zu hohem Spread. |
| `InpMaxSpreadPoints` | `40.0` | Maximal erlaubter Spread in Points. |
| `InpEnableATRFilter` | `false` | Aktiviert einen Volatilitätsfilter auf Basis des ATR. |
| `InpATRPeriod` | `14` | ATR-Periode. |
| `InpATRMinPoints` | `0.0` | Mindest-ATR in Points, unterhalb dessen kein Trade eröffnet wird (0 = keine Untergrenze). |
| `InpATRMaxPoints` | `0.0` (aus) | Maximal-ATR in Points, oberhalb dessen kein Trade eröffnet wird (0 = keine Obergrenze). |
| `InpEnableTrendFilter` | `false` | Aktiviert einen Trendfilter auf Basis eines gleitenden Durchschnitts. |
| `InpTrendMAPeriod` | `200` | Periode des Trend-MA. |
| `InpTrendMAMethod` | `MODE_EMA` | Glättungsmethode des Trend-MA. |
| `InpTrendMATimeframe` | `PERIOD_CURRENT` | Zeitebene, auf der der Trend-MA berechnet wird. |

Trendfilter-Logik: Buy-Signale werden nur zugelassen, wenn der aktuelle Bid-Preis über dem
Trend-MA liegt; Sell-Signale nur, wenn er darunter liegt.

---

## Gruppe: Zeit-/Tagesfilter

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpEnableTimeFilter` | `false` | Aktiviert ein tägliches Handelszeitfenster. |
| `InpTradeStartHour` | `0` | Start-Stunde (0–23). |
| `InpTradeStartMinute` | `0` | Start-Minute. |
| `InpTradeEndHour` | `23` | Ende-Stunde (0–23). |
| `InpTradeEndMinute` | `59` | Ende-Minute. |
| `InpEnableDayFilter` | `false` | Aktiviert die Filterung nach Wochentagen. |
| `InpTradeMonday` | `true` | Handel an Montagen erlaubt. |
| `InpTradeTuesday` | `true` | Handel an Dienstagen erlaubt. |
| `InpTradeWednesday` | `true` | Handel an Mittwochen erlaubt. |
| `InpTradeThursday` | `true` | Handel an Donnerstagen erlaubt. |
| `InpTradeFriday` | `true` | Handel an Freitagen erlaubt. |
| `InpTradeSaturday` | `false` | Handel an Samstagen erlaubt. |
| `InpTradeSunday` | `false` | Handel an Sonntagen erlaubt. |

> **Wichtig:** Alle Zeitangaben (`InpTradeStartHour`/`Minute`, `InpTradeEndHour`/`Minute`,
> sowie die Wochentagsprüfung) beziehen sich auf die **Broker-/Serverzeit** von MT5
> (`TimeCurrent()`), **nicht** auf die lokale Zeit des Rechners. Ein über Mitternacht
> reichendes Fenster (z. B. Start 22:00, Ende 03:00) wird korrekt behandelt.

---

## Gruppe: News

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpEnableNewsFilter` | `false` | Aktiviert eine Handelspause um definierte News-Zeitpunkte herum. |
| `InpNewsPauseBefore` | `15` | Pause vor jedem News-Zeitpunkt in Minuten. |
| `InpNewsPauseAfter` | `15` | Pause nach jedem News-Zeitpunkt in Minuten. |
| `InpNewsFile` | `"vbe_news.txt"` | Datei mit News-Zeitpunkten in `MQL5/Files/`, **eine Zeit pro Zeile**. Zulässige Formate je Zeile: Unix-Epoch-Sekunden (z. B. `1735689600`) **oder** `YYYY.MM.DD HH:MM` (z. B. `2026.07.14 14:30`). Existiert die Datei nicht, blockiert der Filter nichts (fail-open). |

---

## Gruppe: Logging

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpLogToFile` | `true` | Zusätzlich zum Terminal-Journal in eine Logdatei schreiben. |
| `InpLogLevel` | `VBE_LOG_INFO` | Minimales Log-Level: `VBE_LOG_DEBUG`, `VBE_LOG_INFO`, `VBE_LOG_WARN`, `VBE_LOG_ERROR`. |
| `InpLogPrefix` | `"VBE"` | Präfix der Logdateien. |

Logdateien werden **täglich rotiert** und liegen unter `MQL5/Files/` mit dem Muster:

```
<InpLogPrefix>_<Symbol>_<Magic>_YYYYMMDD.log
```

Beispiel: `VBE_EURUSD_990101_20260713.log`.

---

## Gruppe: Dashboard

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpShowDashboard` | `true` | Zeigt das On-Chart-Panel mit Live-Kennzahlen an. |
| `InpShowResetButton` | `true` | Zeigt den RESET-Button auf dem Dashboard an (Close-All-Button ist immer sichtbar, sofern das Dashboard aktiv ist). |

---

## Gruppe: Benachrichtigungen

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpEnablePush` | `false` | Push-Benachrichtigung an die MetaTrader-Mobile-App. **Voraussetzung:** MetaQuotes-ID im Terminal hinterlegt (Extras → Optionen → Benachrichtigungen). |
| `InpEnableEmail` | `false` | E-Mail-Benachrichtigung. **Voraussetzung:** SMTP-Server im Terminal konfiguriert (Extras → Optionen → E-Mail). |
| `InpEnableTelegram` | `false` | Telegram-Benachrichtigung via Bot-API. |
| `InpTelegramToken` | `""` | Bot-Token des Telegram-Bots. |
| `InpTelegramChatId` | `""` | Ziel-Chat-ID für Telegram-Nachrichten. |

Bei aktivem Telegram-Kanal muss `https://api.telegram.org` unter Extras → Optionen →
Expert Advisors → „WebRequest für folgende URLs zulassen“ eingetragen sein, siehe
[`INSTALLATION.md`](INSTALLATION.md) Abschnitt 8. Alle drei Kanäle sind unabhängig
voneinander aktivierbar und blockieren im Fehlerfall niemals die Handelslogik.

---

## Gruppe: Timer

| Parameter | Standardwert | Bedeutung |
|---|---|---|
| `InpTimerIntervalMs` | `250` | Intervall (in Millisekunden) für `OnTimer()` — steuert, wie oft unabhängig von eingehenden Ticks auf neue Signale (Datei-Queue) gepollt und Basket-TP/SL/Equity geprüft wird. Minimum: 10 ms. |

---

## Beispiel-Presets

Die folgenden drei Presets sind Ausgangspunkte, keine Anlageberatung. Sie sollten vor dem
Live-Einsatz auf einem Demokonto validiert werden. Presets können als `.set`-Datei unter
`config/` abgelegt und im Eigenschaften-Dialog des EA über „Laden“ eingespielt werden.

### Preset 1 – Konservativ, fixe Lotgröße, nur Basket-TP

Ziel: einfache, planbare Basket-Strategie ohne Progression und ohne Stop-Loss-Basket.

| Parameter | Wert |
|---|---|
| `InpStartLot` | `0.10` |
| `InpLotIncrement` | `0.00` (jeder Trade nutzt dieselbe Lotgröße) |
| `InpEnableBasketTP` | `true` |
| `InpBasketTPBasis` | `BASIS_MONEY` |
| `InpBasketTPValue` | `50.0` |
| `InpEnableBasketSL` | `false` |
| `InpResetAfterBasketClose` | `true` |

Ergebnis: Jeder Trade hat konstant `0.10` Lot. Sobald der Floating-P/L des Baskets 50
Einheiten der Kontowährung erreicht, wird alles geschlossen und ein neuer Zyklus beginnt
bei Zähler 0.

### Preset 2 – Progressive Lotgröße (Increment-Beispiel)

Ziel: mit jedem im Zyklus eröffneten Trade die Positionsgröße leicht erhöhen.

| Parameter | Wert |
|---|---|
| `InpStartLot` | `0.05` |
| `InpLotIncrement` | `0.02` |
| `InpMaxLotPerTrade` | `1.00` |

Ergebnis der Formel `Lot = StartLot + (Counter × Increment)`:

| Trade Nr. im Zyklus | Counter zu Beginn | Lot |
|---|---|---|
| 1. | 0 | 0.05 |
| 2. | 1 | 0.07 |
| 3. | 2 | 0.09 |
| 4. | 3 | 0.11 |
| … | … | … |

Der Counter zählt dabei **jeden geöffneten Trade**, egal ob Buy oder Sell — eine Folge aus
Buy, Sell, Buy erzeugt also `0.05` → `0.07` → `0.09`, genauso wie drei Buys hintereinander.

### Preset 3 – Prozentbasiertes Basket-TP mit Equity-Schutz

Ziel: TP relativ zur Kontogröße definieren und einen harten Kapitalschutz aktivieren.

| Parameter | Wert |
|---|---|
| `InpEnableBasketTP` | `true` |
| `InpBasketTPBasis` | `BASIS_PERCENT` |
| `InpBasketTPValue` | `2.0` (entspricht 2 % der aktuellen Balance) |
| `InpEnableEquityStop` | `true` |
| `InpEquityMaxLossPct` | `10.0` (Handel stoppt bei 10 % Verlust ggü. Start-Balance) |
| `InpDisableEAOnEquityStop` | `true` |
| `InpResetAfterBasketClose` | `true` |

Ergebnis: Der Basket wird geschlossen, sobald der Floating-Gewinn 2 % der aktuellen Balance
erreicht. Verliert das Konto gleichzeitig 10 % gegenüber der Balance beim EA-Start, wird der
Basket sofort zwangsweise geschlossen und die Signalverarbeitung dauerhaft angehalten (bis
zu einem manuellen EA-Neustart) — unabhängig vom `InpResetAfterBasketClose`-Schalter wird der
Zähler in diesem Fall immer zurückgesetzt.
