//+------------------------------------------------------------------+
//|                                                        Enums.mqh  |
//|                Vantage Basket EA - shared enumerations & structs  |
//+------------------------------------------------------------------+
#property copyright "HK Growth Operator"
#property strict
#ifndef __VBE_ENUMS_MQH__
#define __VBE_ENUMS_MQH__

//--- Signalrichtung
enum ENUM_SIGNAL_TYPE
  {
   SIGNAL_NONE = 0,     // kein Signal
   SIGNAL_BUY  = 1,     // Kauf-Signal -> neue Buy-Position
   SIGNAL_SELL = 2      // Verkauf-Signal -> neue Sell-Position
  };

//--- Signalquelle (Umschaltung per Input)
enum ENUM_SIGNAL_SOURCE
  {
   SRC_INTERNAL_INDICATOR = 0,  // nativer MQL5-Indikator (bevorzugt, niedrigste Latenz)
   SRC_FILE_QUEUE         = 1,  // dateibasierte Queue (TradingView-Webhook-Bridge)
   SRC_MANUAL             = 2   // nur manuelle Chart-Buttons (Test/Debug)
  };

//--- Log-Level
enum ENUM_VBE_LOG_LEVEL
  {
   VBE_LOG_DEBUG = 0,
   VBE_LOG_INFO  = 1,
   VBE_LOG_WARN  = 2,
   VBE_LOG_ERROR = 3
  };

//--- Grund fuer das Schliessen des Baskets
enum ENUM_BASKET_CLOSE_REASON
  {
   CLOSE_NONE     = 0,
   CLOSE_TP       = 1,   // Basket Take Profit erreicht
   CLOSE_SL       = 2,   // Basket Stop Loss erreicht
   CLOSE_EQUITY   = 3,   // Equity-Schutz ausgeloest
   CLOSE_MANUAL   = 4    // manuell / extern ausgeloest
  };

//--- Basiswert fuer Basket-Schwellen
enum ENUM_BASKET_BASIS
  {
   BASIS_MONEY   = 0,    // absoluter Betrag in Kontowaehrung
   BASIS_PERCENT = 1     // Prozent des Kontostands (Balance)
  };

//--- Ergebnis einer Signalabfrage
struct SSignal
  {
   ENUM_SIGNAL_TYPE  type;      // BUY / SELL / NONE
   ulong             id;        // eindeutige Signal-ID (Dedup)
   datetime          time;      // Zeitpunkt der Signalentstehung
   double            price;     // optionaler Referenzpreis (0 = Market)
   string            source;    // Herkunftsbezeichnung (Log)

   void Reset()
     {
      type   = SIGNAL_NONE;
      id     = 0;
      time   = 0;
      price  = 0.0;
      source = "";
     }
  };

//--- Aggregat der EA-eigenen Positionen
struct SBookSnapshot
  {
   int      buyCount;
   int      sellCount;
   double   buyLots;
   double   sellLots;
   double   totalLots;
   double   floatingPL;   // in Kontowaehrung (inkl. Swap + Commission)
   double   floatingGross;// nur Kursgewinn/-verlust
  };

#endif // __VBE_ENUMS_MQH__
//+------------------------------------------------------------------+
