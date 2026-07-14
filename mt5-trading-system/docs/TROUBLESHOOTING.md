# Troubleshooting – Vantage Basket EA

> Praktische Fehlerdiagnose. Für den normalen Ablauf siehe [`FLOWCHART.md`](FLOWCHART.md),
> für Parameter siehe [`CONFIGURATION.md`](CONFIGURATION.md), für den Webhook-Pfad
> [`WEBHOOK.md`](WEBHOOK.md).

Alle Ereignisse werden im Terminal-Journal (Reiter „Experten“) sowie – bei
`InpLogToFile = true` – in der Logdatei protokolliert:

```
MQL5/Files/<InpLogPrefix>_<Symbol>_<Magic>_YYYYMMDD.log
```

Diese Logdatei ist immer die erste Anlaufstelle bei jedem der folgenden Probleme.

---

## 1. EA handelt nicht (keine Positionen werden eröffnet)

Prüfschritte in dieser Reihenfolge:

| Ursache | Prüfung | Lösung |
|---|---|---|
| **Algo Trading global deaktiviert** | Symbol im Chart oben rechts: rotes Kreuz statt grünem Lächeln-Symbol. | „Algo Trading“-Button in der MT5-Symbolleiste aktivieren. |
| **Algo Trading im EA-Dialog nicht erlaubt** | EA-Eigenschaften → Reiter „Allgemein“. | Checkbox „Algo Trading erlauben“ setzen (Chart neu anhängen). |
| **Falsches Symbol** | `InpSymbol` gesetzt, aber Chart zeigt ein anderes Symbol; oder Symbol im Market Watch nicht sichtbar/handelbar. | `InpSymbol` leer lassen (= Chartsymbol) oder korrektes Symbol eintragen; Symbol im Market Watch sichtbar machen. |
| **Handel für Symbol/Konto deaktiviert** | Broker/Symbol-Handelsmodus prüfen (`SYMBOL_TRADE_MODE`), z. B. außerhalb der Handelszeiten des Instruments oder Konto im Nur-Lese-Modus. | Handelszeiten des Symbols bei Vantage prüfen; Kontostatus prüfen. |
| **Ein Filter blockiert jedes Signal** | Log nach `SIGNAL_BLOCKED` durchsuchen — die Meldung enthält den konkreten Grund (Spread/ATR/Zeit/Tag/Trend/News bzw. Risk-Grund). | Betroffenen Filter in [`CONFIGURATION.md`](CONFIGURATION.md) nachschlagen und Schwellenwert/Zeitfenster anpassen oder Filter deaktivieren. |
| **Handel dauerhaft angehalten nach Equity-Stop** | Log nach `EQUITY_STOP` und `g_tradingHalted` suchen; Dashboard zeigt weiterhin Kennzahlen, aber keine neuen Trades. | Ursache des Equity-Stops klären, danach EA vom Chart entfernen und neu anhängen (setzt `g_tradingHalted` zurück, da es nicht persistiert wird). |
| **`InpSignalSource = SRC_MANUAL`, aber keine Buttons geklickt** | Erwartetes Verhalten — in diesem Modus kommen Signale ausschließlich über die Chart-Buttons. | Passende Quelle (`SRC_INTERNAL_INDICATOR`/`SRC_FILE_QUEUE`) wählen oder bewusst manuell klicken. |

---

## 2. Keine Signale kommen an (`SRC_FILE_QUEUE`)

| Ursache | Prüfung | Lösung |
|---|---|---|
| **Falscher Dateipfad** | Die Bridge muss exakt in `<MT5-Datenordner>/MQL5/Files/<InpSignalFile>` schreiben. Ein falscher/relativer Pfad landet oft im Arbeitsverzeichnis der Bridge statt im MT5-Datenordner. | Datenordner über MT5 „Datei → Datenordner öffnen“ verifizieren (siehe [`INSTALLATION.md`](INSTALLATION.md)); Bridge-Konfiguration entsprechend anpassen. |
| **Bridge läuft nicht** | Kein Prozess der Python-Bridge (`bridge/python`) aktiv; TradingView-Webhook läuft ins Leere (Verbindungsfehler/Timeout in TradingViews Alert-Log). | Bridge starten und Erreichbarkeit lokal testen (z. B. per `curl` gegen den Webhook-Endpunkt). |
| **Datei-Name stimmt nicht überein** | `InpSignalFile` im EA weicht vom tatsächlichen Ausgabedateinamen der Bridge ab. | Beide Werte angleichen (Standard: `vbe_signals.jsonl`). |
| **`id` nicht monoton / bereits kleiner als `lastSeq`** | Der EA ignoriert jede Zeile mit `id ≤ lastSeq` (Dedup). Nach einem manuellen Zurücksetzen der Bridge-ID-Sequenz werden neue Signale mit alten IDs stillschweigend verworfen. | Bridge so konfigurieren, dass `id` dauerhaft monoton steigt (nicht bei jedem Bridge-Neustart auf 0 zurücksetzen), oder EA-Zustand (siehe Abschnitt 3) gezielt zurücksetzen, falls ein bewusster Neustart der Sequenz gewünscht ist. |
| **JSON-Zeile fehlerhaft** | `action` fehlt oder ist weder `"buy"`/`"sell"` noch `"BUY"`/`"SELL"` — Zeile wird ignoriert. | Bridge-Ausgabeformat exakt gegen das in [`WEBHOOK.md`](WEBHOOK.md) Abschnitt 4 dokumentierte Schema prüfen. |
| **TradingView-Alert feuert nicht** | Alert-Log in TradingView prüfen („Keine Zustellung“, Webhook-URL nicht erreichbar). | Webhook-URL, Erreichbarkeit der Bridge von außen (Port-Freigabe/Firewall) und Alert-Konfiguration gemäß [`WEBHOOK.md`](WEBHOOK.md) Abschnitt 3 prüfen. |
| **`SRC_INTERNAL_INDICATOR` aktiv, aber `iCustom` schlägt fehl** | Log-Eintrag „`iCustom(...) fehlgeschlagen`“ direkt nach Start; `OnInit` gibt `INIT_FAILED` zurück. | `InpIndicatorName` prüfen, Indikator kompiliert und in `MQL5/Indicators/` vorhanden? Puffer-Indizes `InpSignalBufferBuy`/`Sell` gegen den tatsächlichen Indikator abgleichen. |

---

## 3. Telegram-Benachrichtigungen werden nicht gesendet

| Ursache | Prüfung | Lösung |
|---|---|---|
| **WebRequest-URL nicht freigegeben** | Log-Warnung „`Telegram WebRequest fehlgeschlagen ... URL in Terminal-Optionen erlauben?`“. | Extras → Optionen → Expert Advisors → „WebRequest für folgende URLs zulassen“ → `https://api.telegram.org` eintragen, EA neu starten (siehe [`INSTALLATION.md`](INSTALLATION.md) Abschnitt 8). |
| **Token/Chat-ID fehlt** | Log-Warnung „`Telegram-Token/ChatId fehlt`“. | `InpTelegramToken` und `InpTelegramChatId` korrekt setzen. |
| **`InpEnableTelegram = false`** | Kein Versand-Versuch im Log sichtbar. | Parameter aktivieren. |
| **Bot nicht mit dem Chat verknüpft** | Telegram-API liefert Fehlercode zurück (in Antwort-Body, nicht immer im EA-Log sichtbar). | Bot muss dem Ziel-Chat hinzugefügt sein bzw. der Nutzer muss zuvor `/start` mit dem Bot ausgeführt haben. |

Push- und E-Mail-Kanäle scheitern analog „leise“ (nur Log-Warnung, kein Trading-Abbruch):
Push benötigt eine hinterlegte MetaQuotes-ID, E-Mail einen konfigurierten SMTP-Server
(jeweils Extras → Optionen).

---

## 4. Zähler (TradeCounter) nach Neustart falsch

Der Zähler wird nach folgender Reihenfolge wiederhergestellt (siehe
[`FLOWCHART.md`](FLOWCHART.md) Abschnitt 6):

1. MT5-`GlobalVariable` (`VBE_<magic>_counter` u. a.)
2. Backup-Datei `MQL5/Files/VBE_state_<magic>.json`
3. Rekonstruktion aus der Anzahl offener EA-Positionen mit dieser Magic-Number

| Symptom | Wahrscheinliche Ursache | Lösung |
|---|---|---|
| Zähler startet nach Neustart bei 0, obwohl vorher Trades offen waren | GlobalVariables wurden gelöscht (z. B. „Alle GlobalVariables löschen“ im Terminal, oder Terminal-Datenordner wurde bereinigt) **und** die Backup-JSON-Datei fehlt ebenfalls. | Der EA rekonstruiert den Zähler automatisch aus der Zahl offener Positionen mit der EA-Magic-Number — prüfen, ob das im Log als `STATE_RESTORE | Quelle=Positionsrekonstruktion` erscheint. Ist die Zahl falsch, war vermutlich auch die Positionslage bereits inkonsistent (z. B. Positionen ohne passende Magic-Number). |
| Zähler weicht von der tatsächlichen Trade-Historie ab | Zwei EA-Instanzen mit **derselben** `InpMagic` auf demselben/verschiedenen Symbolen laufen parallel und schreiben sich gegenseitig den Zustand. | Jeder EA-Instanz eine eindeutige Magic Number geben. |
| Zähler „springt“ nach manuellem Reset wieder hoch | Nach `BTN_RESET` wurde kein neuer Trade eröffnet, aber ein GlobalVariable-Backup aus einer älteren Sitzung wurde durch ein externes Tool wiederhergestellt. | Reset-Button erneut betätigen; grundsätzlich keine externen Tools verwenden, um GlobalVariables des EA manuell zu setzen. |

Die Backup-Datei kann bei Bedarf manuell inspiziert werden (reiner JSON-Text mit den Feldern
`counter`, `cycleId`, `lastSeq`), sollte aber nicht von Hand editiert werden, während der EA
läuft.

---

## 5. Doppelte Trades

| Ursache | Erklärung | Lösung |
|---|---|---|
| **Doppelte Signal-ID von der Bridge** | Der EA dedupliziert Datei-Queue-Signale strikt über `id > lastSeq`. Schreibt die Bridge versehentlich dieselbe `id` zweimal, wird die zweite Zeile korrekt verworfen — ein doppelter Trade aus dieser Quelle ist damit ausgeschlossen, solange `id` konsistent monoton bleibt. | Bridge-seitige ID-Vergabe prüfen (persistenter, monoton steigender Zähler, kein Reset bei Bridge-Neustart). |
| **Indikator feuert mehrfach auf derselben Bar** | Bei `SRC_INTERNAL_INDICATOR` wird pro Bar und Richtung nur einmal ein Signal emittiert (`m_lastBarTime`/`m_lastBarDir`-Vergleich). Ein scheinbar „doppelter“ Trade auf derselben Bar ist damit ausgeschlossen — wohl aber sind ein Buy **und** ein Sell auf derselben Bar möglich, falls beide Puffer gleichzeitig ein Signal liefern. | Indikatorlogik prüfen: Buy- und Sell-Puffer sollten sich nicht gleichzeitig auslösen, sonst werden bewusst zwei Positionen (eine je Richtung) eröffnet — das ist kein Fehler des EA, sondern Folge der Indikatorwerte. |
| **Zwei EA-Instanzen mit identischer Magic-Number auf demselben Symbol** | Beide Instanzen verarbeiten dasselbe Signal unabhängig voneinander → zwei Positionen statt einer. | Eindeutige `InpMagic` je Instanz vergeben (siehe [`CONFIGURATION.md`](CONFIGURATION.md)). |
| **Manueller Button mehrfach geklickt** | Jeder Klick auf „MANUAL BUY“/„MANUAL SELL“ injiziert ein eigenständiges Signal — das ist beabsichtigtes Verhalten, kein Fehler. | Bei Tests bewusst nur einmal klicken. |

---

## 6. Order-Fehler (Retcodes)

`TradeEngine` unterscheidet **wiederholbare** und **endgültige** Fehler. Wiederholbare
Fehler werden bis zu `InpMaxRetries`-mal mit linearem Backoff (`InpRetryDelayMs × Versuch`)
erneut versucht:

| Retcode | Typ | Bedeutung | Typische Ursache / Lösung |
|---|---|---|---|
| `TRADE_RETCODE_DONE`, `TRADE_RETCODE_PLACED` | Erfolg | Order ausgeführt bzw. platziert. | — |
| `TRADE_RETCODE_REQUOTE` | wiederholbar | Broker bietet einen neuen Preis an. | Retry mit aktuellem Preis; bei anhaltenden Requotes `InpSlippagePoints` erhöhen. |
| `TRADE_RETCODE_PRICE_CHANGED` | wiederholbar | Preis hat sich zwischen Anfrage und Ausführung geändert. | Meist selbstheilend durch Retry; bei volatilen Marktphasen normal. |
| `TRADE_RETCODE_PRICE_OFF` | wiederholbar | Kein aktueller Kurs für das Symbol verfügbar (z. B. Markt geschlossen/Feed-Aussetzer). | Retry; falls dauerhaft: Symbol-Handelszeiten und Broker-Feed prüfen. |
| `TRADE_RETCODE_REJECT` | wiederholbar | Order vom Server pauschal abgelehnt. | Retry; bei dauerhaftem Auftreten: Konto-/Symbolberechtigungen bei Vantage prüfen. |
| `TRADE_RETCODE_TIMEOUT` | wiederholbar | Keine Antwort innerhalb des Zeitlimits. | Retry; bei häufigem Auftreten: Netzwerkverbindung zum Broker-Server prüfen. |
| `TRADE_RETCODE_CONNECTION` | wiederholbar | Keine Verbindung zum Handelsserver. | `TerminalInfoInteger(TERMINAL_CONNECTED)` wird zusätzlich geprüft; EA wartet und versucht erneut. Bei Dauerausfall: MT5-Verbindungsstatus (unten rechts) prüfen. |
| Alle anderen Retcodes (z. B. ungültiges Volumen, Handel deaktiviert, unzureichende Mittel) | **endgültig** | Order wird sofort verworfen, kein Retry. | Im Log erscheint `TradeEngine: Order fehlgeschlagen (nicht wiederholbar) ret=... <Retcode-Beschreibung>` mit der von MT5 gelieferten Klartext-Beschreibung — direkt danach vorgehen (z. B. Lot unterhalb `SYMBOL_VOLUME_MIN`, `InpMaxLotPerTrade` zu niedrig, Symbol-Handel deaktiviert, nicht ausreichende Margin). |

**Filling-Modus:** `TradeEngine` setzt den Filling-Modus automatisch passend zum Symbol
(`SetTypeFillingBySymbol`) — ein manuelles Eingreifen ist normalerweise nicht nötig. Schlägt
jede Order mit einem Filling-bezogenen Fehler fehl, prüfen, ob Vantage für das Symbol einen
abweichenden, vom Broker vorgegebenen Modus verlangt.

**Teilausführung:** Wird eine Order nur teilweise gefüllt, erkennt der EA dies über das
tatsächliche `Deal`-Volumen und protokolliert es; die Positionsgröße entspricht dann dem
tatsächlich gefüllten Volumen, nicht zwingend der angeforderten Lotgröße.

---

## 7. Hoher Spread / Trades werden abgelehnt

| Symptom | Ursache | Lösung |
|---|---|---|
| Log zeigt wiederholt `SIGNAL_BLOCKED ... Spread ... > max ...` | `InpEnableSpreadFilter = true` und der aktuelle Spread liegt über `InpMaxSpreadPoints`. | Spread-Schwelle in [`CONFIGURATION.md`](CONFIGURATION.md) an die tatsächliche Symbol-/Marktphasen-Volatilität anpassen (z. B. rund um Handelseröffnung/News ist der Spread strukturell höher). |
| Spread wirkt dauerhaft zu hoch, obwohl der sichtbare Chart-Spread niedrig erscheint | Symbol-Spread wird über `SYMBOL_SPREAD` (Points) gelesen — bei Symbolen mit unüblicher Punktdefinition (z. B. 5-stellige vs. 3-stellige Kursnotierung) kann der numerische Wert irreführend wirken. | `InpMaxSpreadPoints` unter Berücksichtigung der tatsächlichen Digits/Point-Größe des Symbols kalibrieren, nicht anhand der Pip-Anzeige des Charts. |
| Basket wird bei volatilen Phasen nicht rechtzeitig geschlossen | Kein Zusammenhang mit dem Spread-Filter — Basket-TP/SL wird unabhängig vom Spread-Filter geprüft (Abschnitt „Basket-TP/SL“ in [`FLOWCHART.md`](FLOWCHART.md)). | Falls unerwünscht verzögert, `InpTimerIntervalMs` verringern (Minimum 10 ms) für häufigeres Polling. |

---

## 8. Allgemeine Diagnose-Checkliste

1. Terminal-Journal (Reiter „Experten“) und Logdatei (`MQL5/Files/<Prefix>_<Symbol>_<Magic>_YYYYMMDD.log`) parallel prüfen.
2. Nach den strukturierten Ereignis-Tags suchen: `INIT`, `DEINIT`, `SIGNAL_BLOCKED`, `OPEN`, `OPEN_FAIL`, `BASKET_TP`, `BASKET_SL`, `EQUITY_STOP`, `MANUAL`, `COUNTER_RESET`, `MANUAL_RESET`, `STATE_RESTORE`.
3. Dashboard auf dem Chart mit dem Log abgleichen (Counter, Zyklus, nächste Lotgröße, TP/SL-Schwellen, Peak-Equity).
4. Bei jedem Problem, das mit der Signalquelle zusammenhängt, zuerst `InpSignalSource` verifizieren — viele „EA reagiert nicht“-Fälle sind schlicht eine falsch konfigurierte Quelle.
5. Weiterführend: [`CONFIGURATION.md`](CONFIGURATION.md) für Parameterdetails, [`FLOWCHART.md`](FLOWCHART.md) für den erwarteten Ablauf, [`WEBHOOK.md`](WEBHOOK.md) für die Bridge-Anbindung.
