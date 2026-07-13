# Benutzerhandbuch – Vantage Basket EA

> Freundliche Einführung für den täglichen Gebrauch. Für technische Details siehe
> [`CONFIGURATION.md`](CONFIGURATION.md) (alle Parameter), [`INSTALLATION.md`](INSTALLATION.md)
> (Ersteinrichtung) und [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) (Problemlösung).

---

## Was macht dieser EA?

Der Vantage Basket EA handelt vollautomatisch auf Basis eingehender Kauf-/Verkaufssignale.
Die Grundlogik in einfachen Worten:

- **Jedes Kauf-Signal öffnet eine neue Kauf-Position.** Jedes Verkauf-Signal öffnet eine neue
  Verkauf-Position. Es wird **nie** eine bestehende Position wegen eines Gegensignals
  geschlossen.
- Die Positionsgröße (Lot) **wächst mit jedem Trade** im aktuellen Zyklus, nach einer festen
  Formel (siehe unten).
- **Alle** offenen Positionen werden immer **gemeinsam** geschlossen – nie einzeln – und zwar
  entweder automatisch (Basket-Gewinnziel, Basket-Verlustlimit, Kontoschutz) oder manuell über
  den „CLOSE ALL“-Button.
- Ein „RESET“-Button setzt nur den internen Zähler zurück, ohne offene Positionen anzufassen.

---

## 1. Erste Schritte

1. Der EA muss zunächst installiert und kompiliert sein – siehe
   [`INSTALLATION.md`](INSTALLATION.md), falls das noch nicht geschehen ist.
2. MT5 öffnen und bei **Vantage** auf dem gewünschten **Hedging-Konto** einloggen.
3. Sicherstellen, dass der grüne „Algo Trading“-Button in der Symbolleiste aktiviert ist.
4. Chart des gewünschten Symbols öffnen (z. B. `EURUSD`).

---

## 2. EA aufs Chart ziehen

1. Im linken Navigator-Fenster (Menü **Ansicht → Navigator**, falls nicht sichtbar) den
   Ordner **Experten** aufklappen.
2. **VantageBasketEA** per Drag & Drop auf den Chart ziehen.
3. Im sich öffnenden Dialog:
   - Reiter **„Allgemein“**: Häkchen bei „Algo Trading erlauben“ setzen.
   - Reiter **„Eingabeparameter“**: hier werden alle Einstellungen vorgenommen (siehe
     Abschnitt 3).
4. Mit **OK** bestätigen.

Läuft der EA korrekt, erscheint sein Name oben rechts im Chart mit einem lächelnden Symbol,
und links auf dem Chart erscheint das Dashboard-Panel (siehe Abschnitt 4).

---

## 3. Die wichtigsten Parameter auf einen Blick

Die vollständige Liste steht in [`CONFIGURATION.md`](CONFIGURATION.md). Für den Einstieg sind
diese am wichtigsten:

| Parameter | Wozu? |
|---|---|
| `InpMagic` | Eindeutige Kennung dieser EA-„Instanz“. Bei mehreren EAs gleichzeitig muss jede Instanz eine andere Nummer bekommen. |
| `InpStartLot` | Lotgröße des ersten Trades in einem neuen Zyklus. |
| `InpLotIncrement` | Um wie viel die Lotgröße mit jedem weiteren Trade im Zyklus wächst. |
| `InpSignalSource` | Woher die Signale kommen: nativer Indikator, Datei-Queue (Webhook-Bridge) oder nur manuelle Buttons. |
| `InpEnableBasketTP` / `InpBasketTPValue` | Ab welchem Gewinn (in Geld oder Prozent) alle Positionen automatisch geschlossen werden. |
| `InpEnableBasketSL` / `InpBasketSLValue` | Ab welchem Verlust alle Positionen automatisch geschlossen werden (standardmäßig deaktiviert). |
| `InpEnableEquityStop` | Zusätzlicher, übergeordneter Kontoschutz – unabhängig vom Basket-TP/SL. |
| `InpShowDashboard` / `InpShowResetButton` | Steuert, ob das Info-Panel bzw. der RESET-Button auf dem Chart erscheint. |

**Die Lotgrößen-Formel** dahinter:

```
Nächste Lotgröße = StartLot + (Anzahl bereits im Zyklus eröffneter Trades × LotIncrement)
```

Beispiel mit `InpStartLot = 0.05` und `InpLotIncrement = 0.02`: Der 1. Trade im Zyklus nutzt
0.05 Lot, der 2. Trade 0.07 Lot, der 3. Trade 0.09 Lot usw. — dabei zählt **jeder** eröffnete
Trade zum selben Zähler, egal ob Kauf oder Verkauf.

---

## 4. Das Dashboard ablesen

Das Panel oben links auf dem Chart zeigt (von oben nach unten):

| Anzeige | Bedeutung |
|---|---|
| `Symbol : ... Magic ...` | Handelssymbol und Magic Number dieser EA-Instanz. |
| `Counter: N (Zyklus M)` | Aktueller Zähler-Stand `N` (bestimmt die nächste Lotgröße) und die laufende Zyklus-Nummer `M`. |
| `Next Lot: X.XX` | Die Lotgröße, die der **nächste** Trade verwenden würde. |
| `Buys : N (X.XX lots)` | Anzahl und Gesamtvolumen aller offenen Kauf-Positionen dieser EA-Instanz. |
| `Sells: N (X.XX lots)` | Anzahl und Gesamtvolumen aller offenen Verkauf-Positionen. |
| `Total Lots: X.XX` | Summe aller offenen Lots (Kauf + Verkauf). |
| `Floating P/L: X.XX` | Schwebender Gewinn/Verlust über alle offenen Positionen (grün = positiv, rot = negativ). Dieser Wert wird gegen das Basket-TP/SL geprüft. |
| `Basket TP/SL: X.XX / -Y.YY` | Aktuell gültige Gewinn-/Verlustschwelle in Kontowährung (bereits umgerechnet, falls prozentual konfiguriert). |
| `Equity : X.XX` | Aktuelles Eigenkapital des Kontos. |
| `Balance: X.XX` | Aktueller Kontostand (ohne offene Positionen). |
| `Margin : X.XX Free: X.XX` | Genutzte bzw. freie Margin. |
| `Drawdown: X.XX%` | Abstand vom bisherigen Equity-Höchststand. |

Darunter befinden sich die Buttons **RESET COUNTER** und **CLOSE ALL** (und bei manueller
Signalquelle zusätzlich **MANUAL BUY**/**MANUAL SELL**), siehe Abschnitte 5 und 6.

---

## 5. Den RESET-Button nutzen

Der Button **„RESET COUNTER“** setzt **ausschließlich** den internen Zähler auf 0 zurück.

- Der **nächste** eröffnete Trade nutzt danach wieder die Start-Lotgröße (`InpStartLot`).
- **Alle aktuell offenen Positionen bleiben davon vollständig unberührt** – sie werden weder
  geschlossen noch verändert.
- Sinnvoll z. B., wenn man die Lot-Progression bewusst neu beginnen möchte, ohne die
  bestehenden Positionen anzutasten.

**Wichtig:** RESET ist nicht dasselbe wie ein Basket-Close. Wer die offenen Positionen
tatsächlich schließen möchte, muss den „CLOSE ALL“-Button verwenden (Abschnitt 6).

---

## 6. Basket schließen

Es gibt vier Wege, wie alle offenen Positionen dieser EA-Instanz **gemeinsam** geschlossen
werden – niemals einzeln:

1. **Basket Take Profit** – automatisch, sobald der schwebende Gesamtgewinn die konfigurierte
   Schwelle (`InpBasketTPValue`) erreicht.
2. **Basket Stop Loss** – automatisch, sobald der schwebende Gesamtverlust die konfigurierte
   Schwelle (`InpBasketSLValue`) erreicht (sofern aktiviert).
3. **Kontoschutz (Equity-Stop)** – automatisch, wenn das Konto die konfigurierte Mindest-Equity
   oder den maximalen Verlust in Prozent erreicht (sofern aktiviert). Danach kann der Handel
   je nach Einstellung dauerhaft pausiert werden, bis der EA neu gestartet wird.
4. **Manueller „CLOSE ALL“-Button** – sofortiges Schließen aller offenen Positionen dieser
   EA-Instanz auf Knopfdruck, unabhängig von Gewinn/Verlust.

Nach einem automatischen TP-/SL-Close beginnt üblicherweise ein neuer Zyklus mit
Zähler 0 (sofern `InpResetAfterBasketClose = true`) – der nächste Trade startet dann wieder
mit der Start-Lotgröße.

---

## 7. Was tun bei Problemen?

Wenn der EA nicht wie erwartet handelt, keine Signale ankommen, Benachrichtigungen ausbleiben
oder der Zähler nach einem Neustart falsch erscheint: Eine ausführliche, schrittweise
Fehlerdiagnose steht in [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md).

Als erster, schneller Check hilft fast immer:

1. Ist der grüne „Algo Trading“-Button in MT5 aktiv?
2. Steht im „Experten“-Log-Tab (unten im Terminal) eine Fehlermeldung?
3. Stimmt die konfigurierte Signalquelle (`InpSignalSource`) mit dem tatsächlich genutzten
   Signalweg überein (siehe [`WEBHOOK.md`](WEBHOOK.md) bei TradingView-Anbindung)?

Bei weiterhin ungeklärten Problemen die entsprechenden Abschnitte in
[`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) durchgehen – dort sind die häufigsten Ursachen
(Filter blockieren, Bridge läuft nicht, WebRequest-URL nicht freigegeben, doppelte Trades,
Order-Fehler) mit konkreten Lösungsschritten aufgeführt.
