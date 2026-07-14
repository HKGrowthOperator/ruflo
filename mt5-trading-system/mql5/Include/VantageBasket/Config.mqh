//+------------------------------------------------------------------+
//|                                                       Config.mqh  |
//|         Vantage Basket EA - zentrale Konfigurationsstruktur       |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_CONFIG_MQH__
#define __VBE_CONFIG_MQH__

#include "Enums.mqh"

//+------------------------------------------------------------------+
//| Alle validierten Laufzeitparameter des EA an einem Ort.          |
//| Wird in OnInit aus den input-Parametern befuellt und             |
//| by-reference an die Module uebergeben.                           |
//+------------------------------------------------------------------+
struct SConfig
  {
   //--- Identitaet
   long              magic;             // Magic Number (isoliert EA-Positionen & Zustand)
   string            symbol;            // Handelssymbol (leer = Chartsymbol)
   string            tradeComment;      // Order-Kommentar

   //--- Lot-Management
   double            startLot;          // Start-Lotgroesse (frei waehlbar)
   double            lotIncrement;      // Erhoehung je Trade im Zyklus
   double            maxLot;            // harte Obergrenze pro Einzeltrade

   //--- Signalquelle
   ENUM_SIGNAL_SOURCE signalSource;     // Indikator / Datei-Queue / Manuell
   string            indicatorName;     // iCustom-Name (bei SRC_INTERNAL_INDICATOR)
   int               signalBufferBuy;   // Pufferindex fuer Buy-Signal
   int               signalBufferSell;  // Pufferindex fuer Sell-Signal
   bool              signalOnBarCloseOnly; // true = nur bestaetigte Kerze (kein Repainting)
   string            signalFile;        // Dateiname der Queue (SRC_FILE_QUEUE)

   //--- Ausfuehrung
   int               slippagePoints;    // max. Abweichung in Points
   int               maxRetries;        // Order-Wiederholversuche
   int               retryDelayMs;      // Basis-Wartezeit zwischen Retries

   //--- Basket Take Profit
   bool              enableBasketTP;
   ENUM_BASKET_BASIS basketTPBasis;     // Geld oder Prozent
   double            basketTPValue;     // Zielwert

   //--- Basket Stop Loss
   bool              enableBasketSL;
   ENUM_BASKET_BASIS basketSLBasis;
   double            basketSLValue;     // positiver Wert = Verlustschwelle

   //--- Verhalten nach Basket-Schliessung
   bool              resetAfterBasketClose; // Zaehler nach Close zuruecksetzen

   //--- Equity-Schutz
   bool              enableEquityStop;
   double            equityMinAbsolute; // absolute Mindest-Equity (0 = aus)
   double            equityMaxLossPct;  // max. Verlust vom Start-Balance in % (0 = aus)
   bool              disableEAOnEquityStop;

   //--- Risiko-Filter
   bool              enableMaxTrades;
   int               maxOpenTrades;     // max. gleichzeitig offene EA-Positionen
   bool              enableMaxMargin;
   double            maxMarginUsagePct; // max. genutzte Margin in % der Equity
   bool              enableMaxDrawdown;
   double            maxDrawdownPct;    // max. Drawdown vom Peak-Equity in %

   //--- Marktfilter
   bool              enableSpreadFilter;
   double            maxSpreadPoints;
   bool              enableATRFilter;
   int               atrPeriod;
   double            atrMinPoints;      // Mindest-ATR (Volatilitaet)
   double            atrMaxPoints;      // Max-ATR (0 = keine Obergrenze)
   bool              enableTrendFilter;
   int               trendMAPeriod;     // MA-Periode fuer Trendrichtung
   ENUM_MA_METHOD    trendMAMethod;
   ENUM_TIMEFRAMES   trendMATimeframe;

   //--- Zeit-/Tagesfilter
   bool              enableTimeFilter;
   int               tradeStartHour;    // 0-23 (Serverzeit)
   int               tradeStartMinute;
   int               tradeEndHour;
   int               tradeEndMinute;
   bool              enableDayFilter;
   bool              tradeMonday;
   bool              tradeTuesday;
   bool              tradeWednesday;
   bool              tradeThursday;
   bool              tradeFriday;
   bool              tradeSaturday;
   bool              tradeSunday;

   //--- News-Filter (einfach, zeitfensterbasiert)
   bool              enableNewsFilter;
   int               newsPauseMinutesBefore;
   int               newsPauseMinutesAfter;
   string            newsFile;          // Datei mit News-Zeiten (optional)

   //--- Logging
   bool              logToFile;
   ENUM_VBE_LOG_LEVEL logLevel;
   string            logFilePrefix;

   //--- Dashboard
   bool              showDashboard;
   bool              showResetButton;

   //--- Benachrichtigungen
   bool              enablePushNotify;
   bool              enableEmailNotify;
   bool              enableTelegram;
   string            telegramToken;
   string            telegramChatId;

   //--- Timer
   int               timerIntervalMs;   // Intervall fuer Basket-/Signal-Polling
  };

//+------------------------------------------------------------------+
//| Validierung: gibt true zurueck, wenn Konfiguration konsistent.   |
//| Fuellt 'err' mit einer Fehlerbeschreibung.                       |
//+------------------------------------------------------------------+
bool ConfigValidate(const SConfig &cfg, string &err)
  {
   err = "";
   if(cfg.startLot <= 0.0)
     { err = "StartLot muss > 0 sein"; return(false); }
   if(cfg.lotIncrement < 0.0)
     { err = "LotIncrement darf nicht negativ sein"; return(false); }
   if(cfg.maxLot > 0.0 && cfg.maxLot < cfg.startLot)
     { err = "MaxLot < StartLot"; return(false); }
   if(cfg.magic <= 0)
     { err = "Magic Number muss > 0 sein"; return(false); }
   if(cfg.enableBasketTP && cfg.basketTPValue <= 0.0)
     { err = "Basket TP aktiv, aber Wert <= 0"; return(false); }
   if(cfg.enableBasketSL && cfg.basketSLValue <= 0.0)
     { err = "Basket SL aktiv, aber Wert <= 0"; return(false); }
   if(cfg.enableMaxTrades && cfg.maxOpenTrades <= 0)
     { err = "MaxOpenTrades muss > 0 sein"; return(false); }
   if(cfg.timerIntervalMs < 10)
     { err = "TimerIntervalMs zu klein (min 10ms)"; return(false); }
   if(cfg.enableTimeFilter)
     {
      if(cfg.tradeStartHour < 0 || cfg.tradeStartHour > 23 ||
         cfg.tradeEndHour   < 0 || cfg.tradeEndHour   > 23)
        { err = "Handelszeiten ausserhalb 0-23"; return(false); }
     }
   return(true);
  }

#endif // __VBE_CONFIG_MQH__
//+------------------------------------------------------------------+
