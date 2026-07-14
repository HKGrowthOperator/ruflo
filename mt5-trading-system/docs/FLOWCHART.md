# Ablaufdiagramm – Vantage Basket EA

> Detailliertes Pendant zu [`ARCHITECTURE.md`](ARCHITECTURE.md) Abschnitt 4 (Datenfluss) und
> Abschnitt 5 (Zustandsmodell & Wiederherstellung). Modulnamen und Verantwortlichkeiten:
> [`ARCHITECTURE.md`](ARCHITECTURE.md) Abschnitt 3. Parameter: [`CONFIGURATION.md`](CONFIGURATION.md).

---

## 1. Haupt-Ablauf: `OnTick()` / `OnTimer()`

Beide Event-Handler rufen dieselbe zentrale, durch eine Re-Entrancy-Sperre (`g_busy`)
serialisierte Funktion `Process()` auf. Dadurch ist es unerheblich, ob ein neuer Kurs-Tick
oder der Timer (`InpTimerIntervalMs`) die Verarbeitung auslöst.

```mermaid
flowchart TD
    A[OnTick / OnTimer] --> B{g_busy?}
    B -- ja, bereits in Verarbeitung --> Z[return, nichts tun]
    B -- nein --> C[g_busy = true]
    C --> D[RiskManager.Heartbeat<br/>Peak-Equity nachfuehren]
    D --> E{Equity-Schutz aktiv<br/>und verletzt?}
    E -- ja --> F[CloseBasket CLOSE_EQUITY]
    F --> G{InpDisableEAOnEquityStop?}
    G -- ja --> H[Handel dauerhaft anhalten<br/>g_tradingHalted = true]
    G -- nein --> I[weiter aktiv]
    H --> Y[g_busy = false, return]
    I --> Y
    E -- nein --> J[BasketManager.Check<br/>Floating P/L vs. TP/SL]
    J --> K{TP oder SL erreicht?}
    K -- ja --> L[CloseBasket CLOSE_TP / CLOSE_SL]
    L --> M[Dashboard aktualisieren]
    M --> Y
    K -- nein --> N{Handel angehalten?<br/>g_tradingHalted}
    N -- ja --> O[Dashboard aktualisieren]
    O --> Y
    N -- nein --> P[SignalReceiver.Poll<br/>neues Signal vorhanden?]
    P -- nein --> O
    P -- ja --> Q[HandleSignal]
    Q --> O
```

---

## 2. Signalverarbeitung: `HandleSignal()`

```mermaid
flowchart TD
    A[Signal von SignalReceiver.Poll] --> B[Filters.Allow<br/>Spread -> ATR -> Zeit -> Tag -> Trend -> News]
    B -- blockiert --> C[Log SIGNAL_BLOCKED Grund=Filter<br/>Signal verworfen]
    B -- ok --> D[LotCalculator.LotFor TradeCounter<br/>Lot = StartLot + Counter x Increment]
    D --> E[RiskManager.CanOpen<br/>MaxTrades -> MaxLot -> Drawdown -> Margin]
    E -- blockiert --> F[Log SIGNAL_BLOCKED Grund=Risk<br/>Signal verworfen]
    E -- ok --> G[TradeEngine.Open<br/>CTrade.Buy / CTrade.Sell, Retry bei transienten Fehlern]
    G -- Erfolg --> H[TradeCounter.Increment]
    H --> I[StateManager.Save<br/>counter, cycleId, lastSeq]
    I --> J[Logger.Trade OPEN + Notifier.Notify]
    G -- endgueltiger Fehler --> K[Logger.Trade OPEN_FAIL<br/>kein Counter-Increment, kein State-Save]
```

Die Filterreihenfolge (Spread → ATR → Zeit → Tag → Trend → News) entspricht exakt
`CFilters::Allow()` — der erste blockierende Filter liefert den Grund, alle nachfolgenden
Filter werden für dieses Signal nicht mehr geprüft.

**Wichtig:** Ein Buy-Signal führt immer zu einer neuen Buy-Position, ein Sell-Signal immer zu
einer neuen Sell-Position. Es gibt in `HandleSignal()` keinen Code-Pfad, der eine bestehende
Position aufgrund eines Gegensignals schließt oder nettet — das ist auf einem Hedging-Konto
auch technisch gar nicht vorgesehen.

---

## 3. Basket-Close: `CloseBasket()`

Wird ausgelöst durch Basket-TP, Basket-SL, Equity-Schutz **oder** den manuellen
„CLOSE ALL“-Button — in allen vier Fällen läuft derselbe Code-Pfad:

```mermaid
flowchart TD
    A["CloseBasket(reason, detail)"] --> B[TradeEngine.CloseAll<br/>alle EA-Positionen dieser Magic-Number schliessen, mit Retry]
    B --> C[Log Ereignis: BASKET_TP / BASKET_SL / EQUITY_STOP / MANUAL]
    C --> D{Reset noetig?}
    D -- "CLOSE_EQUITY, immer" --> E[TradeCounter.ResetCycle]
    D -- "CLOSE_TP/CLOSE_SL und InpResetAfterBasketClose=true" --> E
    D -- "CLOSE_MANUAL (Reset-Button separat, s.u.) oder ResetAfterBasketClose=false" --> F[Counter bleibt unveraendert]
    E --> G[StateManager.Save neuer Zyklus]
    G --> H[Notifier.Notify]
    F --> H
```

Auslöser im Überblick:

| Reason | Ausgelöst durch | Counter-Reset? |
|---|---|---|
| `CLOSE_TP` | `BasketManager.Check()`: Floating P/L ≥ TP-Schwelle | Ja, wenn `InpResetAfterBasketClose = true` |
| `CLOSE_SL` | `BasketManager.Check()`: Floating P/L ≤ -SL-Schwelle | Ja, wenn `InpResetAfterBasketClose = true` |
| `CLOSE_EQUITY` | `RiskManager.EquityBreached()` | **Immer ja**, unabhängig von `InpResetAfterBasketClose` |
| `CLOSE_MANUAL` | Dashboard-Button „CLOSE ALL“ | Nein — der Counter wird durch den Close-All-Button **nicht** zurückgesetzt (nur `CloseBasket` selbst; ein separater Reset erfolgt nur über den RESET-Button, siehe Abschnitt 4) |

---

## 4. Reset-Button-Flow (`BTN_RESET`)

Der manuelle Reset ist bewusst von `CloseBasket()` getrennt: Er verändert **ausschließlich**
den Zähler, niemals offene Positionen.

```mermaid
flowchart TD
    A[Klick auf RESET-Button<br/>OnChartEvent CHARTEVENT_OBJECT_CLICK] --> B[TradeCounter.ResetCounterOnly<br/>counter = 0, cycleId unveraendert]
    B --> C[StateManager.Save<br/>counter=0 persistieren]
    C --> D[Log MANUAL_RESET<br/>Positionen unveraendert]
    D --> E[Button-Zustand zuruecksetzen]
    E --> F[Dashboard aktualisieren]
```

Nach einem RESET-Klick nutzt der **nächste** eröffnete Trade wieder `InpStartLot` — alle zu
diesem Zeitpunkt offenen Positionen bleiben exakt wie sie sind und werden weiterhin nur durch
Basket-TP/SL, Equity-Schutz oder den CLOSE-ALL-Button geschlossen.

---

## 5. Manuelle Test-Buttons (`BTN_BUY` / `BTN_SELL`)

Nur sichtbar, wenn `InpSignalSource = SRC_MANUAL` (bzw. für Debug-Zwecke). Ein Klick injiziert
ein synthetisches Signal, das denselben Weg wie ein reguläres Signal durchläuft (Filter,
Risk-Gates, Lotberechnung):

```mermaid
flowchart TD
    A[Klick auf MANUAL BUY / MANUAL SELL] --> B[SignalReceiver.InjectManual SIGNAL_BUY/SELL]
    B --> C[Process erneut aufgerufen]
    C --> D[Poll liefert injiziertes Signal zuerst<br/>Vorrang vor Indikator/Datei-Queue]
    D --> E[HandleSignal wie in Abschnitt 2]
```

---

## 6. Neustart / Zustandswiederherstellung (`OnInit`)

Deckt sich mit [`ARCHITECTURE.md`](ARCHITECTURE.md) Abschnitt 5. Reihenfolge in `RestoreState()`:

```mermaid
flowchart TD
    A[OnInit] --> B[BuildConfig + ConfigValidate]
    B --> C[PositionBook.Init / StateManager.Init]
    C --> D{StateManager.Load<br/>GlobalVariable vorhanden?}
    D -- ja --> E[Counter = GlobalVariable-Wert<br/>cycleId, lastSeq ebenfalls aus GV]
    D -- nein, GV fehlt --> F{Backup-Datei<br/>VBE_state_MAGIC.json vorhanden?}
    F -- ja --> G[Counter = Wert aus Backup-Datei<br/>GlobalVariable wird neu gesetzt]
    F -- nein --> H[Rekonstruktion aus offenen Positionen<br/>PositionBook.CountOwn nach Magic-Number]
    H --> I[Counter = Anzahl offener EA-Positionen<br/>cycleId = 1, lastSeq = 0]
    I --> J[StateManager.Save sofort persistieren]
    E --> K[weitere Module initialisieren:<br/>LotCalculator, SignalReceiver, Filters, RiskManager,<br/>BasketManager, TradeEngine, Dashboard, Notifier]
    G --> K
    J --> K
    K --> L[EventSetMillisecondTimer InpTimerIntervalMs]
    L --> M[Log INIT + Dashboard aktualisieren]
```

Die Signal-Dedup-Historie (`lastSeq` für `SRC_FILE_QUEUE`) wird auf demselben Weg persistiert
und wiederhergestellt, sodass ein Neustart kein bereits verarbeitetes Datei-Queue-Signal
erneut ausführt.

---

## 7. Zusammenfassung: Prioritäten pro Zyklus

Innerhalb eines einzelnen `Process()`-Durchlaufs gilt strikt folgende Reihenfolge — jeder
frühere Schritt kann den Rest des Durchlaufs abbrechen (`return`):

1. **Equity-Schutz** (höchste Priorität — schützt das Konto unabhängig von allem anderen)
2. **Basket-TP/SL** (schließt den kompletten Basket bei Zielerreichung)
3. **Signalverarbeitung** (nur wenn Handel nicht angehalten ist: Filter → Risk-Gates → Order → Counter/State)
4. **Dashboard-Aktualisierung** (immer am Ende, sofern `InpShowDashboard = true`)

Diese Reihenfolge stellt sicher, dass niemals ein neues Signal verarbeitet wird, während
gleichzeitig ein Kontoschutz- oder Basket-Close-Ereignis ansteht.
