//+------------------------------------------------------------------+
//|                                              VantageBasketEA.mq5  |
//|   Produktionsreifer Basket-EA fuer Vantage / MT5 (Hedging)        |
//|                                                                   |
//|   - Jedes Signal oeffnet GENAU EINE neue Position                 |
//|   - Niemals Netting, niemals Schliessen einzelner Positionen      |
//|   - Lot = StartLot + (Counter x LotIncrement)                     |
//|   - Basket TP/SL, Equity-Schutz, Filter, Reset-Button, Recovery   |
//+------------------------------------------------------------------+
#property copyright "Vantage Basket EA"
#property version   "1.00"
#property strict
#property description "Basket-EA: 1 Signal = 1 Position, Hedging, Basket TP/SL, konfigurierbares Lot-Management."

#include "../Include/VantageBasket/Config.mqh"
#include "../Include/VantageBasket/Enums.mqh"
#include "../Include/VantageBasket/Logger.mqh"
#include "../Include/VantageBasket/PositionBook.mqh"
#include "../Include/VantageBasket/TradeCounter.mqh"
#include "../Include/VantageBasket/LotCalculator.mqh"
#include "../Include/VantageBasket/StateManager.mqh"
#include "../Include/VantageBasket/SignalReceiver.mqh"
#include "../Include/VantageBasket/Filters.mqh"
#include "../Include/VantageBasket/RiskManager.mqh"
#include "../Include/VantageBasket/BasketManager.mqh"
#include "../Include/VantageBasket/TradeEngine.mqh"
#include "../Include/VantageBasket/Dashboard.mqh"
#include "../Include/VantageBasket/Notifier.mqh"

//==================================================================//
//                         EINGABEPARAMETER                          //
//==================================================================//
input group "=== Identitaet ==="
input long              InpMagic              = 990101;      // Magic Number
input string            InpSymbol             = "";          // Symbol (leer = Chartsymbol)
input string            InpTradeComment       = "VantageBasket"; // Order-Kommentar

input group "=== Lot-Management ==="
input double            InpStartLot           = 0.10;        // Start-Lot
input double            InpLotIncrement        = 0.10;        // Lot-Increment je Trade
input double            InpMaxLotPerTrade      = 5.00;        // Max-Lot pro Einzeltrade (0 = aus)

input group "=== Signalquelle ==="
input ENUM_SIGNAL_SOURCE InpSignalSource      = SRC_FILE_QUEUE; // Signalquelle
input string            InpIndicatorName      = "VantageSignalStub"; // iCustom-Name (= .ex5-Dateiname im Indicators-Ordner)
input int               InpSignalBufferBuy    = 0;           // Buffer-Index Buy
input int               InpSignalBufferSell   = 1;           // Buffer-Index Sell
input bool              InpSignalOnBarCloseOnly = true;      // nur bestaetigte Kerze (kein Repainting)
input string            InpSignalFile         = "vbe_signals.jsonl"; // Queue-Datei (MQL5/Files)

input group "=== Ausfuehrung ==="
input int               InpSlippagePoints     = 20;          // Slippage (Points)
input int               InpMaxRetries         = 3;           // Order-Wiederholversuche
input int               InpRetryDelayMs       = 300;         // Basis-Retry-Wartezeit (ms)

input group "=== Basket Take Profit ==="
input bool              InpEnableBasketTP     = true;        // Basket TP aktiv
input ENUM_BASKET_BASIS InpBasketTPBasis      = BASIS_MONEY; // Basis (Geld/Prozent)
input double            InpBasketTPValue      = 100.0;       // TP-Wert

input group "=== Basket Stop Loss ==="
input bool              InpEnableBasketSL     = false;       // Basket SL aktiv
input ENUM_BASKET_BASIS InpBasketSLBasis      = BASIS_MONEY; // Basis (Geld/Prozent)
input double            InpBasketSLValue      = 300.0;       // SL-Wert (positiv)

input group "=== Nach Basket-Schliessung ==="
input bool              InpResetAfterBasketClose = true;     // Counter nach Close zuruecksetzen

input group "=== Equity-Schutz ==="
input bool              InpEnableEquityStop   = false;       // Equity-Stop aktiv
input double            InpEquityMinAbsolute  = 0.0;         // Mindest-Equity absolut (0=aus)
input double            InpEquityMaxLossPct   = 0.0;         // Max-Verlust vom Start-Balance % (0=aus)
input bool              InpDisableEAOnEquityStop = true;     // EA nach Equity-Stop deaktivieren

input group "=== Risiko-Filter ==="
input bool              InpEnableMaxTrades    = false;       // Max offene Trades aktiv
input int               InpMaxOpenTrades      = 20;          // Max offene EA-Positionen
input bool              InpEnableMaxMargin    = false;       // Max Margin-Auslastung aktiv
input double            InpMaxMarginUsagePct  = 80.0;        // Max Margin-Auslastung %
input bool              InpEnableMaxDrawdown  = false;       // Max Drawdown aktiv
input double            InpMaxDrawdownPct     = 30.0;        // Max Drawdown %

input group "=== Marktfilter ==="
input bool              InpEnableSpreadFilter = true;        // Spread-Filter aktiv
input double            InpMaxSpreadPoints    = 40.0;        // Max Spread (Points)
input bool              InpEnableATRFilter    = false;       // ATR/Volatilitaets-Filter aktiv
input int               InpATRPeriod          = 14;          // ATR-Periode
input double            InpATRMinPoints       = 0.0;         // Min ATR (Points)
input double            InpATRMaxPoints       = 0.0;         // Max ATR (Points, 0=aus)
input bool              InpEnableTrendFilter  = false;       // Trend-Filter aktiv
input int               InpTrendMAPeriod      = 200;         // Trend-MA-Periode
input ENUM_MA_METHOD    InpTrendMAMethod      = MODE_EMA;    // Trend-MA-Methode
input ENUM_TIMEFRAMES   InpTrendMATimeframe   = PERIOD_CURRENT; // Trend-MA-Timeframe

input group "=== Zeit-/Tagesfilter ==="
input bool              InpEnableTimeFilter   = false;       // Handelszeiten aktiv
input int               InpTradeStartHour     = 0;           // Start-Stunde
input int               InpTradeStartMinute   = 0;           // Start-Minute
input int               InpTradeEndHour       = 23;          // Ende-Stunde
input int               InpTradeEndMinute     = 59;          // Ende-Minute
input bool              InpEnableDayFilter    = false;       // Handelstage aktiv
input bool              InpTradeMonday        = true;
input bool              InpTradeTuesday       = true;
input bool              InpTradeWednesday     = true;
input bool              InpTradeThursday      = true;
input bool              InpTradeFriday        = true;
input bool              InpTradeSaturday      = false;
input bool              InpTradeSunday        = false;

input group "=== News-Filter ==="
input bool              InpEnableNewsFilter   = false;       // News-Filter aktiv
input int               InpNewsPauseBefore    = 15;          // Pause vor News (min)
input int               InpNewsPauseAfter     = 15;          // Pause nach News (min)
input string            InpNewsFile           = "vbe_news.txt"; // News-Zeiten-Datei

input group "=== Logging ==="
input bool              InpLogToFile          = true;        // in Datei loggen
input ENUM_VBE_LOG_LEVEL InpLogLevel          = VBE_LOG_INFO;// Log-Level
input string            InpLogPrefix          = "VBE";       // Log-Dateipraefix

input group "=== Dashboard ==="
input bool              InpShowDashboard      = true;        // Dashboard anzeigen
input bool              InpShowResetButton    = true;        // Reset-Button anzeigen

input group "=== Benachrichtigungen ==="
input bool              InpEnablePush         = false;       // Push-Nachrichten
input bool              InpEnableEmail        = false;       // E-Mail
input bool              InpEnableTelegram     = false;       // Telegram
input string            InpTelegramToken      = "";          // Telegram Bot-Token
input string            InpTelegramChatId     = "";          // Telegram Chat-ID

input group "=== Timer ==="
input int               InpTimerIntervalMs    = 250;         // Polling-Intervall (ms)

//==================================================================//
//                          GLOBALE OBJEKTE                          //
//==================================================================//
SConfig          g_cfg;
CLogger          g_log;
CPositionBook    g_book;
CTradeCounter    g_counter;
CLotCalculator   g_lot;
CStateManager    g_state;
CSignalReceiver  g_receiver;
CFilters         g_filters;
CRiskManager     g_risk;
CBasketManager   g_basket;
CTradeEngine     g_engine;
CDashboard       g_dash;
CNotifier        g_notify;

bool             g_busy         = false;   // Re-Entrancy-Sperre (Tick/Timer)
bool             g_tradingHalted= false;   // nach Equity-Stop
datetime         g_lastDashUpd  = 0;

//+------------------------------------------------------------------+
//| Config aus inputs bauen                                          |
//+------------------------------------------------------------------+
void BuildConfig()
  {
   g_cfg.magic            = InpMagic;
   g_cfg.symbol           = (InpSymbol == "" ? _Symbol : InpSymbol);
   g_cfg.tradeComment     = InpTradeComment;

   g_cfg.startLot         = InpStartLot;
   g_cfg.lotIncrement     = InpLotIncrement;
   g_cfg.maxLot           = InpMaxLotPerTrade;

   g_cfg.signalSource     = InpSignalSource;
   g_cfg.indicatorName    = InpIndicatorName;
   g_cfg.signalBufferBuy  = InpSignalBufferBuy;
   g_cfg.signalBufferSell = InpSignalBufferSell;
   g_cfg.signalOnBarCloseOnly = InpSignalOnBarCloseOnly;
   g_cfg.signalFile       = InpSignalFile;

   g_cfg.slippagePoints   = InpSlippagePoints;
   g_cfg.maxRetries       = InpMaxRetries;
   g_cfg.retryDelayMs     = InpRetryDelayMs;

   g_cfg.enableBasketTP   = InpEnableBasketTP;
   g_cfg.basketTPBasis    = InpBasketTPBasis;
   g_cfg.basketTPValue    = InpBasketTPValue;

   g_cfg.enableBasketSL   = InpEnableBasketSL;
   g_cfg.basketSLBasis    = InpBasketSLBasis;
   g_cfg.basketSLValue    = InpBasketSLValue;

   g_cfg.resetAfterBasketClose = InpResetAfterBasketClose;

   g_cfg.enableEquityStop = InpEnableEquityStop;
   g_cfg.equityMinAbsolute= InpEquityMinAbsolute;
   g_cfg.equityMaxLossPct = InpEquityMaxLossPct;
   g_cfg.disableEAOnEquityStop = InpDisableEAOnEquityStop;

   g_cfg.enableMaxTrades  = InpEnableMaxTrades;
   g_cfg.maxOpenTrades    = InpMaxOpenTrades;
   g_cfg.enableMaxMargin  = InpEnableMaxMargin;
   g_cfg.maxMarginUsagePct= InpMaxMarginUsagePct;
   g_cfg.enableMaxDrawdown= InpEnableMaxDrawdown;
   g_cfg.maxDrawdownPct   = InpMaxDrawdownPct;

   g_cfg.enableSpreadFilter = InpEnableSpreadFilter;
   g_cfg.maxSpreadPoints  = InpMaxSpreadPoints;
   g_cfg.enableATRFilter  = InpEnableATRFilter;
   g_cfg.atrPeriod        = InpATRPeriod;
   g_cfg.atrMinPoints     = InpATRMinPoints;
   g_cfg.atrMaxPoints     = InpATRMaxPoints;
   g_cfg.enableTrendFilter= InpEnableTrendFilter;
   g_cfg.trendMAPeriod    = InpTrendMAPeriod;
   g_cfg.trendMAMethod    = InpTrendMAMethod;
   g_cfg.trendMATimeframe = InpTrendMATimeframe;

   g_cfg.enableTimeFilter = InpEnableTimeFilter;
   g_cfg.tradeStartHour   = InpTradeStartHour;
   g_cfg.tradeStartMinute = InpTradeStartMinute;
   g_cfg.tradeEndHour     = InpTradeEndHour;
   g_cfg.tradeEndMinute   = InpTradeEndMinute;
   g_cfg.enableDayFilter  = InpEnableDayFilter;
   g_cfg.tradeMonday      = InpTradeMonday;
   g_cfg.tradeTuesday     = InpTradeTuesday;
   g_cfg.tradeWednesday   = InpTradeWednesday;
   g_cfg.tradeThursday    = InpTradeThursday;
   g_cfg.tradeFriday      = InpTradeFriday;
   g_cfg.tradeSaturday    = InpTradeSaturday;
   g_cfg.tradeSunday      = InpTradeSunday;

   g_cfg.enableNewsFilter = InpEnableNewsFilter;
   g_cfg.newsPauseMinutesBefore = InpNewsPauseBefore;
   g_cfg.newsPauseMinutesAfter  = InpNewsPauseAfter;
   g_cfg.newsFile         = InpNewsFile;

   g_cfg.logToFile        = InpLogToFile;
   g_cfg.logLevel         = InpLogLevel;
   g_cfg.logFilePrefix    = InpLogPrefix;

   g_cfg.showDashboard    = InpShowDashboard;
   g_cfg.showResetButton  = InpShowResetButton;

   g_cfg.enablePushNotify = InpEnablePush;
   g_cfg.enableEmailNotify= InpEnableEmail;
   g_cfg.enableTelegram   = InpEnableTelegram;
   g_cfg.telegramToken    = InpTelegramToken;
   g_cfg.telegramChatId   = InpTelegramChatId;

   g_cfg.timerIntervalMs  = InpTimerIntervalMs;
  }

//+------------------------------------------------------------------+
//| Persistierten Zustand wiederherstellen (oder rekonstruieren)     |
//+------------------------------------------------------------------+
void RestoreState(ulong &restoredSeq)
  {
   int   counter = 0;
   int   cycle   = 1;
   ulong seq     = 0;

   if(g_state.Load(counter, cycle, seq))
     {
      g_counter.Restore(counter, cycle);
      restoredSeq = seq;
     }
   else
     {
      // Fallback: aus offenen EA-Positionen rekonstruieren
      int openCount = g_book.CountOwn();
      g_counter.Restore(openCount, 1);
      restoredSeq = 0;
      g_state.Save(openCount, 1, 0);
      g_log.Event("STATE_RESTORE",
                  StringFormat("Quelle=Positionsrekonstruktion counter=%d", openCount));
     }
  }

//+------------------------------------------------------------------+
//| Expert initialization                                            |
//+------------------------------------------------------------------+
int OnInit()
  {
   BuildConfig();

   g_log.Init(g_cfg.logLevel, g_cfg.logToFile, g_cfg.logFilePrefix, g_cfg.symbol, g_cfg.magic);

   string err;
   if(!ConfigValidate(g_cfg, err))
     {
      g_log.Error("Konfiguration ungueltig: " + err);
      return(INIT_PARAMETERS_INCORRECT);
     }

   if(!SymbolInfoInteger(g_cfg.symbol, SYMBOL_SELECT))
      SymbolSelect(g_cfg.symbol, true);

   g_book.Init(g_cfg.magic, g_cfg.symbol);
   g_state.Init(g_cfg.magic, g_cfg.symbol, GetPointer(g_log));

   ulong restoredSeq = 0;
   RestoreState(restoredSeq);

   if(!g_lot.Init(g_cfg))
     { g_log.Error("LotCalculator-Init fehlgeschlagen"); return(INIT_FAILED); }

   if(!g_receiver.Init(g_cfg, GetPointer(g_log), restoredSeq))
     {
      // Indikator fehlt -> harter Fehler nur bei Indikatorquelle
      if(g_cfg.signalSource == SRC_INTERNAL_INDICATOR)
         return(INIT_FAILED);
     }

   g_filters.Init(g_cfg, GetPointer(g_log));
   g_risk.Init(g_cfg, GetPointer(g_log));
   g_basket.Init(g_cfg, GetPointer(g_log), GetPointer(g_book));
   g_engine.Init(g_cfg, GetPointer(g_log), GetPointer(g_book));
   g_dash.Init(g_cfg);
   g_notify.Init(g_cfg, GetPointer(g_log));

   EventSetMillisecondTimer(g_cfg.timerIntervalMs);

   g_log.Event("INIT", StringFormat("EA gestartet | Symbol=%s Magic=%I64d Counter=%d StartLot=%.2f Inc=%.2f",
               g_cfg.symbol, g_cfg.magic, g_counter.Value(), g_cfg.startLot, g_cfg.lotIncrement));
   UpdateDashboard();
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization                                          |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   g_receiver.Release();
   g_filters.Release();
   g_dash.Destroy();
   g_log.Event("DEINIT", StringFormat("EA gestoppt (reason=%d)", reason));
  }

//+------------------------------------------------------------------+
//| Tick                                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
   Process();
  }

//+------------------------------------------------------------------+
//| Timer (Basket-/Queue-Polling auch ohne Ticks)                    |
//+------------------------------------------------------------------+
void OnTimer()
  {
   Process();
  }

//+------------------------------------------------------------------+
//| Zentrale, serialisierte Verarbeitung                             |
//+------------------------------------------------------------------+
void Process()
  {
   if(g_busy)
      return;                 // Re-Entrancy verhindern
   g_busy = true;

   g_risk.Heartbeat();

   // 1) Equity-Schutz hat hoechste Prioritaet
   string eqReason;
   if(!g_tradingHalted && g_risk.EquityBreached(eqReason))
     {
      // nur schliessen, wenn ueberhaupt EA-Positionen offen sind (kein Spam)
      if(g_book.CountOwn() > 0)
         CloseBasket(CLOSE_EQUITY, eqReason);
      if(g_cfg.disableEAOnEquityStop)
        {
         g_tradingHalted = true;
         g_notify.Notify("Vantage Basket EA", "Equity-Stop ausgeloest: " + eqReason + " -> Handel gestoppt");
        }
      UpdateDashboard();
      g_busy = false;
      return;
     }

   // 2) Basket TP/SL
   double floatingPL;
   ENUM_BASKET_CLOSE_REASON br = g_basket.Check(floatingPL);
   if(br == CLOSE_TP || br == CLOSE_SL)
     {
      CloseBasket(br, StringFormat("Floating P/L=%.2f", floatingPL));
      UpdateDashboard();
      g_busy = false;
      return;
     }

   // 3) neues Signal verarbeiten (sofern Handel nicht gestoppt)
   if(!g_tradingHalted)
     {
      SSignal sig;
      if(g_receiver.Poll(sig) && sig.type != SIGNAL_NONE)
         HandleSignal(sig);
     }

   UpdateDashboard();
   g_busy = false;
  }

//+------------------------------------------------------------------+
//| Ein Signal -> genau eine neue Position (mit Filter/Risk-Gates)   |
//+------------------------------------------------------------------+
void HandleSignal(const SSignal &sig)
  {
   string reason;

   if(!g_filters.Allow(sig.type, reason))
     {
      g_log.Event("SIGNAL_BLOCKED", StringFormat("src=%s dir=%d Grund=%s (Filter)",
                  sig.source, sig.type, reason));
      return;
     }

   double nextLot = g_lot.LotFor(g_counter.Value());

   if(!g_risk.CanOpen(g_book.CountOwn(), sig.type, nextLot, reason))
     {
      g_log.Event("SIGNAL_BLOCKED", StringFormat("src=%s dir=%d Grund=%s (Risk)",
                  sig.source, sig.type, reason));
      return;
     }

   ulong ticket; uint retcode; long latency;
   if(g_engine.Open(sig.type, nextLot, ticket, retcode, latency))
     {
      g_counter.Increment();
      g_state.Save(g_counter.Value(), g_counter.CycleId(), g_receiver.LastSeq());
      g_log.Trade("OPEN", sig.type, nextLot, g_counter.Value(), ticket, sig.id, retcode, latency);
      g_notify.Notify("Vantage Basket EA",
                      StringFormat("%s %.2f Lot (Counter %d) Ticket %I64u",
                      (sig.type == SIGNAL_BUY ? "BUY" : "SELL"), nextLot, g_counter.Value(), ticket));
     }
   else
     {
      g_log.Trade("OPEN_FAIL", sig.type, nextLot, g_counter.Value(), 0, sig.id, retcode, latency);
     }
  }

//+------------------------------------------------------------------+
//| Alle Positionen schliessen + ggf. Zaehler zuruecksetzen          |
//+------------------------------------------------------------------+
void CloseBasket(ENUM_BASKET_CLOSE_REASON reason, const string detail)
  {
   double realized;
   int closed = g_engine.CloseAll(realized);

   string rtxt = (reason == CLOSE_TP ? "BASKET_TP" :
                 (reason == CLOSE_SL ? "BASKET_SL" :
                 (reason == CLOSE_EQUITY ? "EQUITY_STOP" : "MANUAL")));

   // nur zuruecksetzen, wenn der Basket wirklich flach ist (Teil-Schliessungen
   // duerfen den Zaehler NICHT auf 0 setzen, sonst mischen sich alte + neue Zyklen)
   bool allClosed = (g_book.CountOwn() == 0);

   g_log.Event(rtxt, StringFormat("%s | geschlossen=%d realized=%.2f flach=%s",
               detail, closed, realized, (allClosed ? "ja" : "NEIN")));

   if(!allClosed)
      g_log.Warn(StringFormat("%s: nicht alle Positionen geschlossen (%d verbleibend) - Counter NICHT zurueckgesetzt",
                 rtxt, g_book.CountOwn()));

   // Reset des Zaehlers -> neuer Zyklus mit Start-Lot
   bool doReset = allClosed &&
                  ((reason == CLOSE_EQUITY) ||
                   ((reason == CLOSE_TP || reason == CLOSE_SL) && g_cfg.resetAfterBasketClose));
   if(doReset)
     {
      g_counter.ResetCycle();
      g_state.Save(g_counter.Value(), g_counter.CycleId(), g_receiver.LastSeq());
      g_log.Event("COUNTER_RESET", StringFormat("neuer Zyklus %d (nach %s)", g_counter.CycleId(), rtxt));
     }

   g_notify.Notify("Vantage Basket EA",
                   StringFormat("%s: %d Positionen geschlossen, realized %.2f", rtxt, closed, realized));
  }

//+------------------------------------------------------------------+
//| Dashboard aktualisieren (gedrosselt)                             |
//+------------------------------------------------------------------+
void UpdateDashboard()
  {
   if(!g_cfg.showDashboard)
      return;
   SBookSnapshot snap = g_book.Snapshot();
   double nextLot = g_lot.LotFor(g_counter.Value());
   g_dash.Update(snap, g_counter.Value(), g_counter.CycleId(), nextLot,
                 g_basket.TPMoney(), g_basket.SLMoney(), g_risk.PeakEquity());
   ChartRedraw();
  }

//+------------------------------------------------------------------+
//| Chart-Events (Buttons)                                           |
//+------------------------------------------------------------------+
void OnChartEvent(const int id, const long &lparam, const double &dparam, const string &sparam)
  {
   if(id != CHARTEVENT_OBJECT_CLICK)
      return;

   if(sparam == g_dash.BtnReset())
     {
      g_counter.ResetCounterOnly();
      g_state.Save(g_counter.Value(), g_counter.CycleId(), g_receiver.LastSeq());
      g_log.Event("MANUAL_RESET", "Counter manuell zurueckgesetzt (Positionen unveraendert)");
      ObjectSetInteger(ChartID(), g_dash.BtnReset(), OBJPROP_STATE, false);
      UpdateDashboard();
     }
   else if(sparam == g_dash.BtnClose())
     {
      CloseBasket(CLOSE_MANUAL, "manueller Close-All-Button");
      ObjectSetInteger(ChartID(), g_dash.BtnClose(), OBJPROP_STATE, false);
      UpdateDashboard();
     }
   else if(sparam == g_dash.BtnBuy())
     {
      g_receiver.InjectManual(SIGNAL_BUY);
      ObjectSetInteger(ChartID(), g_dash.BtnBuy(), OBJPROP_STATE, false);
      Process();
     }
   else if(sparam == g_dash.BtnSell())
     {
      g_receiver.InjectManual(SIGNAL_SELL);
      ObjectSetInteger(ChartID(), g_dash.BtnSell(), OBJPROP_STATE, false);
      Process();
     }
  }
//+------------------------------------------------------------------+
