# Installation – Vantage Basket EA

> Zielgruppe: Trader/Administratoren, die den Vantage Basket EA auf einem MT5-Terminal
> (Broker Vantage, Hedging-Konto) produktiv in Betrieb nehmen wollen.
> Architekturhintergrund: [`ARCHITECTURE.md`](ARCHITECTURE.md). Alle Parameter: [`CONFIGURATION.md`](CONFIGURATION.md).

---

## 1. Voraussetzungen

| Voraussetzung | Details |
|---|---|
| MetaTrader 5 Terminal | Aktuelle Version, Login bei **Vantage** auf einem **Hedging-Konto** (nicht Netting). |
| „Algo Trading“ Recht | Konto/Terminal muss automatisierten Handel erlauben. |
| MetaEditor | Wird mit MT5 mitinstalliert, dient zum Kompilieren des `.mq5`-Quellcodes. |
| Optional: Python 3.10+ | Nur nötig, wenn die Webhook-Bridge (`bridge/python`) für TradingView-Signale betrieben werden soll. Siehe [`WEBHOOK.md`](WEBHOOK.md). |
| Optional: Telegram-Bot | Nur nötig, wenn Telegram-Benachrichtigungen aktiviert werden sollen. |

**Wichtig – Hedging vs. Netting:** Der EA öffnet pro Signal immer eine neue, eigenständige
Position und schließt niemals einzelne Positionen automatisch gegen ein Gegensignal. Das
funktioniert korrekt **nur auf einem Hedging-Konto**. Auf einem Netting-Konto würde jede
Gegenposition automatisch mit einer bestehenden verrechnet werden – das widerspricht der
Basket-Logik des EA und ist nicht unterstützt.

---

## 2. Verzeichnisstruktur der Auslieferung

```
mt5-trading-system/
├── mql5/
│   ├── Experts/VantageBasketEA.mq5          # Haupt-EA (wird kompiliert & auf den Chart gezogen)
│   ├── Include/VantageBasket/*.mqh          # Module (werden vom Haupt-EA per #include eingebunden)
│   └── Indicators/VantageSignalStub.mq5     # Vorlage für den nativen Signal-Indikator (SRC_INTERNAL_INDICATOR)
├── bridge/python/                           # Optional: TradingView-Webhook-Bridge (FastAPI)
├── config/                                  # Empfohlener Ablageort für Parameter-Presets (.set-Dateien)
└── docs/                                    # Diese Dokumentation
```

Alle `.mqh`-Module (`Config`, `Enums`, `Logger`, `PositionBook`, `TradeCounter`,
`LotCalculator`, `StateManager`, `SignalReceiver`, `Filters`, `RiskManager`,
`BasketManager`, `TradeEngine`, `Dashboard`, `Notifier`) müssen **gemeinsam** in
`MQL5/Include/VantageBasket/` liegen, da `VantageBasketEA.mq5` sie relativ einbindet.

---

## 3. MT5-Datenordner finden

Der EA muss in den **Datenordner** des MT5-Terminals kopiert werden, nicht in das
Installationsverzeichnis des Programms.

1. MT5 öffnen.
2. Menü **Datei → Datenordner öffnen** (bzw. *File → Open Data Folder*).
3. Es öffnet sich ein Explorer-/Finder-Fenster mit dem Ordner `MQL5/` als Unterordner.

Dieser Datenordner ist **terminal-instanzspezifisch** – bei mehreren parallel installierten
MT5-Terminals (z. B. mehrere Broker) hat jede Instanz ihren eigenen Datenordner mit eigenem
`MQL5/`-Baum.

---

## 4. Dateien kopieren

Aus diesem Repository in den MT5-Datenordner kopieren:

| Quelle (Repository) | Ziel (MT5-Datenordner) |
|---|---|
| `mql5/Experts/VantageBasketEA.mq5` | `MQL5/Experts/VantageBasketEA.mq5` |
| `mql5/Include/VantageBasket/*.mqh` (alle Dateien) | `MQL5/Include/VantageBasket/*.mqh` |
| `mql5/Indicators/VantageSignalStub.mq5` (nur bei `SRC_INTERNAL_INDICATOR`) | `MQL5/Indicators/VantageSignalStub.mq5` |

Der Ordner `MQL5/Include/VantageBasket/` muss ggf. neu angelegt werden, falls er nicht
existiert.

---

## 5. Kompilieren (MetaEditor)

1. MT5-Menü **Werkzeuge → MetaQuotes Language Editor** öffnen (oder `F4` im Terminal).
2. Im Navigator-Baum von MetaEditor zu `Experts/VantageBasketEA.mq5` navigieren und öffnen.
3. Mit `F7` (**Compile**) kompilieren.
4. Im Reiter „Fehler“ (Errors) unten prüfen: **0 Fehler, 0 Warnungen** (Warnungen zu
   ungenutzten Includes sind unkritisch, Fehler müssen jedoch behoben werden – üblicherweise
   deutet ein Fehler auf ein fehlendes/verschobenes `.mqh`-Modul aus Schritt 4 hin).
5. Bei Nutzung von `SRC_INTERNAL_INDICATOR`: `VantageSignalStub.mq5` im Ordner
   `Indicators/` ebenfalls öffnen und mit `F7` kompilieren.

Nach erfolgreichem Kompilieren erscheint der EA im MT5-Navigator unter
**Experten → VantageBasketEA**.

---

## 6. Algo Trading aktivieren

Automatisierter Handel ist in MT5 standardmäßig **deaktiviert** und muss explizit erlaubt
werden – ohne diesen Schritt eröffnet der EA keine einzige Position, selbst wenn er korrekt
auf dem Chart läuft.

1. In der MT5-Symbolleiste den Button **„Algo Trading“** aktivieren (grün/aktiv).
2. Beim Anhängen des EA an den Chart (Schritt 7) im Reiter **„Allgemein“** zusätzlich die
   Checkbox **„Algo Trading erlauben“** setzen.

Ein grünes Lächeln-Symbol oben rechts im Chart (statt eines roten Kreuzes) zeigt an, dass
der EA aktiv läuft und Algo Trading global erlaubt ist.

---

## 7. EA auf den Chart ziehen

1. Chart des **Zielsymbols** öffnen (z. B. `EURUSD`), auf dem gehandelt werden soll.
2. Im Navigator unter **Experten** den `VantageBasketEA` per Drag & Drop auf den Chart ziehen.
3. Im Eigenschaften-Dialog:
   - Reiter **„Eingabeparameter“**: gewünschte Werte setzen (siehe [`CONFIGURATION.md`](CONFIGURATION.md)
     für die vollständige Parameterreferenz und Beispiel-Presets).
   - Reiter **„Allgemein“**: „Algo Trading erlauben“ aktivieren, „DLL-Importe erlauben“ ist
     **nicht** erforderlich (der EA nutzt keine externen DLLs).
4. Mit **OK** bestätigen.

**Hinweis zu Magic Number:** `InpMagic` isoliert die Positionen und den persistierten
Zustand dieser EA-Instanz. Bei mehreren EA-Instanzen (z. B. mehrere Symbole oder mehrere
parallele Baskets auf demselben Symbol) muss jede Instanz eine **eindeutige** Magic Number
erhalten, sonst vermischen sich Zähler und Positionsbestand.

---

## 8. WebRequest-URLs freigeben (nur bei Telegram)

Telegram-Benachrichtigungen (`InpEnableTelegram = true`) werden über `WebRequest()`
versendet. MT5 blockiert `WebRequest()` standardmäßig gegen nicht freigegebene URLs.

1. MT5-Menü **Extras → Optionen** (bzw. *Tools → Options*).
2. Reiter **„Expert Advisors“**.
3. Checkbox **„WebRequest für folgende URLs zulassen“** aktivieren.
4. URL eintragen: `https://api.telegram.org`
5. Mit **OK** bestätigen. Ein bereits laufender EA muss danach neu gestartet werden
   (Chart neu laden oder EA entfernen/erneut anhängen), damit die Freigabe wirksam wird.

Fehlt dieser Eintrag, schlägt der Telegram-Versand fehl und im EA-Log erscheint eine
Warnung à la *„Telegram WebRequest fehlgeschlagen“* mit einem Hinweis auf die
Terminal-Optionen (siehe [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)).

Für den dateibasierten Signalweg (`SRC_FILE_QUEUE`) ist **keine** WebRequest-Freigabe nötig,
da die Signalübergabe rein dateibasiert über `MQL5/Files/` erfolgt (siehe
[`WEBHOOK.md`](WEBHOOK.md)).

---

## 9. Optional: Push- und E-Mail-Benachrichtigungen

- **Push (`InpEnablePush`):** Erfordert eine hinterlegte MetaQuotes-ID im Terminal
  (Extras → Optionen → Benachrichtigungen) sowie die MetaTrader-App auf dem Mobilgerät.
- **E-Mail (`InpEnableEmail`):** Erfordert einen konfigurierten SMTP-Server im Terminal
  (Extras → Optionen → E-Mail).

Beide Kanäle sind rein optional und blockieren im Fehlerfall niemals die Handelslogik –
ein fehlgeschlagener Versand wird nur als Warnung geloggt.

---

## 10. Installation der Webhook-Bridge (optional, nur für `SRC_FILE_QUEUE`)

Falls TradingView-Signale statt eines nativen Indikators genutzt werden sollen, muss
zusätzlich die Python-Bridge in `bridge/python` eingerichtet werden. Vollständige Anleitung:
[`WEBHOOK.md`](WEBHOOK.md).

---

## 11. Installationscheck

Nach den obigen Schritten sollte gelten:

- [ ] Chart zeigt ein grünes Algo-Trading-Symbol.
- [ ] Dashboard (`InpShowDashboard = true`) ist als Panel oben links/rechts auf dem Chart sichtbar.
- [ ] Im „Experten“-Log-Tab (unten im Terminal) erscheint eine Zeile `INIT | EA gestartet | Symbol=... Magic=... Counter=0 ...`.
- [ ] Bei `SRC_FILE_QUEUE`: Bridge läuft und schreibt in `MQL5/Files/vbe_signals.jsonl`.
- [ ] Bei `SRC_INTERNAL_INDICATOR`: `VantageSignalStub` ist kompiliert und liefert Werte in den konfigurierten Puffern (`InpSignalBufferBuy`/`InpSignalBufferSell`).

Bei Problemen: [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md).
