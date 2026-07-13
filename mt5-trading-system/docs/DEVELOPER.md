# Entwicklerhandbuch – Vantage Basket EA

> Für Entwickler, die den EA warten, erweitern oder testen. Architekturüberblick:
> [`ARCHITECTURE.md`](ARCHITECTURE.md). Ablauf: [`FLOWCHART.md`](FLOWCHART.md). Parameter:
> [`CONFIGURATION.md`](CONFIGURATION.md).

---

## 1. Modulübersicht (eine Verantwortung pro Modul)

Alle Module liegen unter `mql5/Include/VantageBasket/` und werden ausschließlich vom
Haupt-EA `mql5/Experts/VantageBasketEA.mq5` instanziiert und verdrahtet — Module kennen sich
untereinander nur über explizit übergebene Zeiger/Referenzen, nie über globale Zustände.

| Modul | Datei | Verantwortung (SRP) | Wichtige Methoden |
|---|---|---|---|
| **Config** | `Config.mqh` | Zentrale `SConfig`-Struktur + `ConfigValidate()`. Einziger Ort, an dem `input`-Parameter in Domänenwerte überführt werden. | `ConfigValidate()` |
| **Enums** | `Enums.mqh` | Gemeinsame Enums/Structs (`ENUM_SIGNAL_TYPE`, `ENUM_SIGNAL_SOURCE`, `ENUM_BASKET_BASIS`, `ENUM_BASKET_CLOSE_REASON`, `SSignal`, `SBookSnapshot`). | — |
| **Logger** | `Logger.mqh` | Terminal- + Dateilogging, tägliche Rotation, strukturierte Trade-/Event-Logs. | `Event()`, `Trade()`, `Warn()`, `Error()` |
| **PositionBook** | `PositionBook.mqh` | Reine Lesekomponente: aggregiert EA-eigene Positionen nach Magic+Symbol. Kein Trading, keine Seiteneffekte. | `Snapshot()`, `CountOwn()`, `CollectTickets()` |
| **TradeCounter** | `TradeCounter.mqh` | Reines Domänenobjekt für den Zyklus-Zähler. Kennt keine Persistenz. | `Increment()`, `ResetCycle()`, `ResetCounterOnly()`, `Restore()` |
| **LotCalculator** | `LotCalculator.mqh` | `Lot = StartLot + Counter × Increment`, Normalisierung auf Volumenschritte, Clamping auf Min/Max. | `LotFor(counter)` |
| **StateManager** | `StateManager.mqh` | Persistenz-Repository: GlobalVariables (primär) + JSON-Backup-Datei. | `Save()`, `Load()`, `Clear()` |
| **SignalReceiver** | `SignalReceiver.mqh` | Signalaufnahme aus Indikator/Datei-Queue/Manuell, jeweils eigene Dedup-Strategie. | `Poll()`, `InjectManual()` |
| **Filters** | `Filters.mqh` | Unabhängig aktivierbare Marktfilter (Spread, ATR, Zeit, Tag, Trend, News). | `Allow(dir, reason)` |
| **RiskManager** | `RiskManager.mqh` | Trennt „darf neuer Trade eröffnet werden“ (`CanOpen`) von „muss Basket sofort geschlossen werden“ (`EquityBreached`). | `CanOpen()`, `EquityBreached()`, `Heartbeat()` |
| **BasketManager** | `BasketManager.mqh` | Überwacht Floating-P/L, meldet TP/SL-Erreichung. Schließt **nicht selbst** — das entscheidet der EA. | `Check()` |
| **TradeEngine** | `TradeEngine.mqh` | Kapselt `CTrade`. Öffnet je Signal genau eine Position (Hedging), Retry mit linearem Backoff, `CloseAll()`. | `Open()`, `CloseAll()` |
| **Dashboard** | `Dashboard.mqh` | On-Chart-Panel + Buttons (`BTN_RESET`, `BTN_CLOSE`, `BTN_BUY`, `BTN_SELL`). Reine Darstellung, keine Trading-Logik. | `Update()`, `BtnReset()`, `BtnClose()` |
| **Notifier** | `Notifier.mqh` | Push/E-Mail/Telegram, jeder Kanal unabhängig, Fehler blockieren nie die Handelslogik. | `Notify()` |

Der Haupt-EA (`VantageBasketEA.mq5`) selbst enthält **keine** fachliche Logik außer der
Orchestrierung (`BuildConfig()`, `RestoreState()`, `Process()`, `HandleSignal()`,
`CloseBasket()`, `UpdateDashboard()`, `OnChartEvent()`) — jede Entscheidung wird an das
zuständige Modul delegiert.

---

## 2. Eine neue Filterregel hinzufügen

Beispiel: ein neuer „Mindest-Volumen“-Filter (rein illustrativ).

1. **`Enums.mqh`**: Falls der Filter einen neuen Enum-Wert benötigt (z. B. eine neue Basis),
   dort ergänzen — sonst überspringen.
2. **`Config.mqh`** (`SConfig`): neue Felder ergänzen, z. B.
   ```cpp
   bool   enableMyFilter;
   double myFilterThreshold;
   ```
   und bei Bedarf eine Plausibilitätsprüfung in `ConfigValidate()` ergänzen.
3. **`Filters.mqh`** (`CFilters`):
   - Private Prüfmethode nach dem bestehenden Muster ergänzen, z. B. `MyFilterOK(string &reason)`,
     die `true` zurückgibt, wenn der Filter **nicht** blockiert (Konvention: `false` = blockiert,
     `reason` beschreibt den Grund für das Log).
   - In `Allow()` an der gewünschten Stelle in die bestehende Prüfkette einreihen:
     ```cpp
     if(!MyFilterOK(reason)) return(false);
     ```
     Die Reihenfolge in `Allow()` bestimmt, welcher Grund zuerst geloggt wird, falls mehrere
     Filter gleichzeitig blockieren würden — neue Filter üblicherweise ans Ende anhängen,
     sofern keine fachliche Priorität dagegenspricht.
4. **`VantageBasketEA.mq5`** (`BuildConfig()`): die neuen `Inp*`-Parameter deklarieren
   (`input group "=== ... ==="` beachten, siehe bestehende Gruppen) und in `SConfig`
   übertragen.
5. **[`CONFIGURATION.md`](CONFIGURATION.md)**: neuen Parameter in der passenden Gruppentabelle
   dokumentieren (Default + Bedeutung).
6. Kompilieren (`F7`) und auf einem Demokonto verifizieren, dass `SIGNAL_BLOCKED`-Log-Einträge
   mit dem neuen Grund erscheinen, wenn der Filter aktiv blockiert.

Filter sind bewusst **unabhängig voneinander** und rein additiv (jeder blockierende Filter
kann für sich allein ein Signal verwerfen) — ein neuer Filter darf niemals das Verhalten
bestehender Filter verändern.

---

## 3. Eine neue Signalquelle hinzufügen

Beispiel: ein hypothetischer neuer Weg, z. B. ein lokaler Socket-Server statt Datei-Queue.

1. **`Enums.mqh`**: neuen Wert in `ENUM_SIGNAL_SOURCE` ergänzen, z. B.
   ```cpp
   enum ENUM_SIGNAL_SOURCE
     {
      SRC_INTERNAL_INDICATOR = 0,
      SRC_FILE_QUEUE         = 1,
      SRC_MANUAL             = 2,
      SRC_SOCKET             = 3   // neu
     };
   ```
2. **`Config.mqh`**: bei Bedarf zusätzliche Konfigurationsfelder für die neue Quelle ergänzen
   (analog zu `indicatorName`/`signalFile`).
3. **`SignalReceiver.mqh`** (`CSignalReceiver`):
   - Neue private Poll-Methode nach dem bestehenden Muster ergänzen (z. B. `PollSocket(SSignal &out)`),
     die `SSignal` befüllt (`type`, `id`, `time`, `price`, `source`) und eine **eigene
     Dedup-Strategie** für diese Quelle mitbringt (Datei-Queue: monotone `id`; Indikator:
     Bar+Richtung; Manuell: einmalige Injektion) — Dedup ist zwingend, da `HandleSignal()`
     selbst keine erneute Prüfung vornimmt.
   - In `Poll()` den neuen `case` im `switch(m_cfg.signalSource)` ergänzen:
     ```cpp
     case SRC_SOCKET: return(PollSocket(out));
     ```
   - Falls die Quelle eine Init-Ressource benötigt (Handle, Verbindung), analog zu
     `m_indHandle` in `Init()`/`Release()` behandeln.
4. **`VantageBasketEA.mq5`**: `InpSignalSource`-Dropdown zeigt automatisch den neuen Enum-Wert
   an, sobald `Enums.mqh` aktualisiert ist — kein weiterer Code nötig, sofern keine
   zusätzlichen `Inp*`-Parameter für die neue Quelle benötigt werden (siehe Schritt 2).
5. **Dokumentation**: neue Quelle in [`CONFIGURATION.md`](CONFIGURATION.md) (Gruppe
   „Signalquelle“) und ggf. in einer eigenen Anleitung analog zu [`WEBHOOK.md`](WEBHOOK.md)
   beschreiben.

Wichtig: `HandleSignal()` im Haupt-EA behandelt **jede** Quelle identisch — Filter,
Risk-Gates, Lotberechnung, Order-Ausführung und Persistenz sind quellenunabhängig. Eine neue
Quelle muss also ausschließlich ein korrektes `SSignal` liefern, nicht mehr.

---

## 4. Persistenz- und Zustandsmodell

Zentraler Zustand: `CTradeCounter` (Zähler + Zyklus-ID), verwaltet über `CStateManager`
(Repository-Pattern — `CTradeCounter` selbst kennt keine Persistenz-Details).

**Speicherorte (mehrschichtig, Magic-scoped über `VBE_<magic>_...`):**

| Ebene | Ort | Schlüssel/Datei | Überlebt |
|---|---|---|---|
| 1 (primär) | MT5 `GlobalVariable` | `VBE_<magic>_counter`, `VBE_<magic>_cycle`, `VBE_<magic>_seq` | EA-Reload, Terminal-Neustart (nicht: „Alle GlobalVariables löschen“) |
| 2 (Backup) | Datei | `MQL5/Files/VBE_state_<magic>.json` | auch den Verlust der GlobalVariables |
| 3 (Fallback) | Berechnung | `PositionBook.CountOwn()` — Anzahl offener Positionen mit passender Magic-Number | jeden Zustandsverlust, sofern die Positionen selbst noch existieren |

`CStateManager.Save()` schreibt **immer beide** Ebenen (GlobalVariable + Backup-Datei)
atomar nacheinander und wird nach **jeder** zustandsverändernden Aktion aufgerufen: nach
erfolgreichem Order-Open (`HandleSignal`), nach Zyklus-Reset (`CloseBasket`) und nach
manuellem Reset (`OnChartEvent`/`BTN_RESET`).

`CStateManager.Load()` prüft die Ebenen in der genannten Reihenfolge; wird auf Ebene 2
zurückgegriffen, schreibt `Load()` den Wert sofort auf Ebene 1 zurück. Liefert keine der
beiden Ebenen einen Zustand, rekonstruiert `RestoreState()` im Haupt-EA (Ebene 3) den
Zähler aus der aktuellen Positionslage und persistiert ihn sofort wieder auf allen Ebenen.

Das Backup-JSON hat das Format:
```json
{"magic":990101,"counter":3,"cycleId":2,"lastSeq":1042,"ts":1752400000}
```
Der eingebaute JSON-Parser in `StateManager.mqh`/`SignalReceiver.mqh` ist bewusst minimal
(naiver Feldextraktor per `StringFind`) und **nicht** für beliebiges externes JSON gedacht —
nur für das exakt selbst erzeugte, eigene Format bzw. das eng spezifizierte Signal-Schema
(siehe [`WEBHOOK.md`](WEBHOOK.md)).

**Dedup-Historie für `SRC_FILE_QUEUE`:** `m_lastSeq` in `CSignalReceiver` wird ebenfalls über
`StateManager.Load()`/`Save()` restauriert/persistiert (als drittes Feld `lastSeq`), damit
ein Neustart kein bereits verarbeitetes Datei-Queue-Signal erneut ausführt.

---

## 5. Coding-Konventionen

- **Dateigröße:** jede Datei bleibt unter 500 Zeilen (aktuell größte Datei:
  `VantageBasketEA.mq5` mit ca. 516 Zeilen inkl. Kommentaren/Leerzeilen — bei Erweiterungen
  darauf achten, ggf. weitere Orchestrierungslogik in ein zusätzliches `.mqh`-Modul
  auszulagern statt den Haupt-EA weiter wachsen zu lassen).
- **Single Responsibility:** ein Modul = eine fachliche Verantwortung (siehe Tabelle in
  Abschnitt 1). Neue Funktionalität in ein passendes bestehendes Modul einordnen oder ein
  neues, klar abgegrenztes Modul anlegen — keine Vermischung (z. B. keine Trading-Aufrufe in
  `Filters.mqh` oder `Dashboard.mqh`).
- **Typisierung:** `SConfig` als einzige Quelle der Wahrheit für Laufzeitparameter; Module
  erhalten sie by-value oder als `const &`-Referenz in `Init()`, keine eigenen globalen
  Zustände außer der eigenen Instanzmembervariablen.
- **Include-Guards:** jede `.mqh`-Datei nutzt `#ifndef __VBE_<NAME>_MQH__` /
  `#define ... MQH__` / `#endif` — bei neuen Modulen dieses Muster übernehmen.
- **Fehlerkonvention:** Prüfmethoden, die eine Erlaubnis/Zulässigkeit prüfen, geben `bool`
  zurück (`true` = erlaubt) und liefern bei `false` einen Grund über `string &reason` —
  konsistent über `Filters`, `RiskManager` hinweg beibehalten.
- **Keine impliziten globalen Seiteneffekte** außerhalb von `StateManager` (GlobalVariables)
  und `Logger`/`TradeEngine` (Dateisystem/Handel) — alle anderen Module sind reine
  Rechen-/Entscheidungsobjekte und dadurch isoliert testbar.
- **Deutsch in Kommentaren/Logs, Englisch in Bezeichnern:** bestehendes Muster (Klassen-,
  Methoden- und Parameternamen englisch/MQL5-üblich, Kommentare und Log-Texte deutsch)
  konsistent fortführen.

---

## 6. Test-Harness (konzeptionell)

Es gibt zwei komplementäre Testebenen, die unterschiedliche Teile des Systems abdecken:

**a) Bridge-seitige, automatisierte Tests (`bridge/python/tests`)**
Die Python-Bridge (`bridge/python/app`) ist als normale FastAPI-Anwendung strukturiert und
damit mit Standard-Python-Testwerkzeugen (z. B. `pytest` + `httpx`/`TestClient`) testbar:
Webhook-Payload-Validierung (Token-Prüfung, `action`-Whitelist), korrekte Erzeugung
monoton steigender `id`-Werte, korrektes Schreiben der JSONL-Zeilen im in
[`WEBHOOK.md`](WEBHOOK.md) dokumentierten Format. Diese Ebene läuft vollständig ohne MT5 und
eignet sich für CI.

**b) MQL5-seitiger manueller/struktureller Test-Harness**
MQL5 selbst hat kein natives Unit-Test-Framework für beliebigen Code außerhalb des
Strategy Testers. Der EA ist deshalb bewusst so gebaut, dass er sich manuell und
halb-strukturiert verifizieren lässt:

- **`SRC_MANUAL` + Dashboard-Buttons** (`BTN_BUY`/`BTN_SELL`/`BTN_RESET`/`BTN_CLOSE`) dienen
  als eingebauter, interaktiver Test-Harness: Jeder Klick durchläuft exakt denselben
  Code-Pfad wie ein reales Signal (`HandleSignal()`), erlaubt aber gezielte,
  reproduzierbare Einzelschritte ohne echte Signalquelle — ideal, um Filter-, Risiko- und
  Lotberechnungslogik auf einem Demokonto Schritt für Schritt zu verifizieren.
- **MT5 Strategy Tester** (Einzeltick- oder „Jeder Tick basierend auf echten Kursen“-Modus)
  eignet sich für Regressionsläufe der Gesamtlogik über historische Daten, insbesondere um
  die Lot-Progression, Basket-TP/SL-Auslösung und Zustandswiederherstellung nach simuliertem
  Neustart zu prüfen.
- **Isolierte Modul-Verifikation:** Da Module wie `CLotCalculator`, `CTradeCounter` und
  `CFilters` zustandsarm und ohne globale Abhängigkeiten sind (siehe Abschnitt 5), lassen sie
  sich auch außerhalb eines vollständigen EA-Laufs in einem minimalen Test-Skript
  (`Script`/`Indicator` mit `Print()`-Ausgaben) gegen erwartete Werte prüfen — z. B.
  `CLotCalculator::LotFor()` für eine Reihe von Counter-Werten gegen die in
  [`CONFIGURATION.md`](CONFIGURATION.md) dokumentierten Beispiel-Presets.

Der übergeordnete Grundsatz: Da fachliche Logik konsequent aus dem Haupt-EA in eigenständige,
zustandsarme `.mqh`-Module ausgelagert ist (Abschnitt 1), lässt sich der überwiegende Teil des
Systems auch ohne vollständigen Trading-Kontext manuell nachvollziehen und verifizieren —
echte automatisierte MQL5-Unit-Tests sind nur für den bridge-seitigen Python-Anteil sinnvoll
umsetzbar.

---

## 7. Checkliste vor einem Release

1. `VantageBasketEA.mq5` und alle `.mqh`-Module kompilieren ohne Fehler (MetaEditor `F7`).
2. Alle neuen/geänderten `Inp*`-Parameter sind in [`CONFIGURATION.md`](CONFIGURATION.md)
   dokumentiert (Default + Bedeutung, korrekte Gruppe).
3. Neue Verhaltensänderungen sind in [`FLOWCHART.md`](FLOWCHART.md) nachgezogen, falls sie
   den Ablauf in `Process()`/`HandleSignal()`/`CloseBasket()` betreffen.
4. Manueller Testlauf auf einem Demokonto: mindestens ein vollständiger Zyklus
   (Signal → Order → Counter-Increment → Basket-Close → Reset) über die Dashboard-Buttons.
5. Neustart-Test: EA vom Chart entfernen und neu anhängen bei offenen Positionen — Zähler
   muss korrekt aus GlobalVariable/Backup-Datei wiederhergestellt werden
   (`STATE_RESTORE`-Log prüfen).
6. Bei Änderungen an `Filters.mqh`/`RiskManager.mqh`: gezielt jeden neuen Blockierungsgrund
   im Log provozieren und die Meldung auf Klarheit/Korrektheit prüfen.
