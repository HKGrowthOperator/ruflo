//+------------------------------------------------------------------+
//|                                                      Filters.mqh  |
//|   Vantage Basket EA - unabhaengig aktivierbare Handelsfilter      |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_FILTERS_MQH__
#define __VBE_FILTERS_MQH__

#include "Config.mqh"
#include "Logger.mqh"
#include "Enums.mqh"

//+------------------------------------------------------------------+
//| Jeder Filter ist einzeln per Config-Flag aktivierbar. Allow()    |
//| gibt false + Grund zurueck, sobald ein aktiver Filter blockt.    |
//+------------------------------------------------------------------+
class CFilters
  {
private:
   SConfig    m_cfg;
   CLogger   *m_log;
   int        m_atrHandle;
   int        m_maHandle;
   double     m_point;

   double            AtrPoints()
     {
      if(m_atrHandle == INVALID_HANDLE)
         return(-1.0);
      double buf[1];
      if(CopyBuffer(m_atrHandle, 0, 1, 1, buf) != 1)
         return(-1.0);
      if(m_point <= 0.0)
         return(-1.0);
      return(buf[0] / m_point);   // ATR in Points
     }

   double            TrendMA()
     {
      if(m_maHandle == INVALID_HANDLE)
         return(0.0);
      double buf[1];
      if(CopyBuffer(m_maHandle, 0, 1, 1, buf) != 1)
         return(0.0);
      return(buf[0]);
     }

   bool              SpreadOK(string &reason)
     {
      if(!m_cfg.enableSpreadFilter)
         return(true);
      double spread = (double)SymbolInfoInteger(m_cfg.symbol, SYMBOL_SPREAD);
      if(spread > m_cfg.maxSpreadPoints)
        {
         reason = StringFormat("Spread %.0f > max %.0f", spread, m_cfg.maxSpreadPoints);
         return(false);
        }
      return(true);
     }

   bool              ATROK(string &reason)
     {
      if(!m_cfg.enableATRFilter)
         return(true);
      double atr = AtrPoints();
      if(atr < 0.0)
        { reason = "ATR nicht verfuegbar"; return(false); }
      if(atr < m_cfg.atrMinPoints)
        { reason = StringFormat("ATR %.1f < min %.1f", atr, m_cfg.atrMinPoints); return(false); }
      if(m_cfg.atrMaxPoints > 0.0 && atr > m_cfg.atrMaxPoints)
        { reason = StringFormat("ATR %.1f > max %.1f", atr, m_cfg.atrMaxPoints); return(false); }
      return(true);
     }

   bool              TimeOK(string &reason)
     {
      if(!m_cfg.enableTimeFilter)
         return(true);
      MqlDateTime dt;
      TimeToStruct(TimeCurrent(), dt);
      int nowMin   = dt.hour * 60 + dt.min;
      int startMin = m_cfg.tradeStartHour * 60 + m_cfg.tradeStartMinute;
      int endMin   = m_cfg.tradeEndHour   * 60 + m_cfg.tradeEndMinute;

      bool inWindow;
      if(startMin <= endMin)
         inWindow = (nowMin >= startMin && nowMin <= endMin);
      else // Fenster ueber Mitternacht
         inWindow = (nowMin >= startMin || nowMin <= endMin);

      if(!inWindow)
        { reason = StringFormat("ausserhalb Handelszeit (%02d:%02d)", dt.hour, dt.min); return(false); }
      return(true);
     }

   bool              DayOK(string &reason)
     {
      if(!m_cfg.enableDayFilter)
         return(true);
      MqlDateTime dt;
      TimeToStruct(TimeCurrent(), dt);
      bool allowed = false;
      switch(dt.day_of_week)
        {
         case 0: allowed = m_cfg.tradeSunday;    break;
         case 1: allowed = m_cfg.tradeMonday;    break;
         case 2: allowed = m_cfg.tradeTuesday;   break;
         case 3: allowed = m_cfg.tradeWednesday; break;
         case 4: allowed = m_cfg.tradeThursday;  break;
         case 5: allowed = m_cfg.tradeFriday;    break;
         case 6: allowed = m_cfg.tradeSaturday;  break;
        }
      if(!allowed)
        { reason = "Handelstag deaktiviert"; return(false); }
      return(true);
     }

   bool              TrendOK(ENUM_SIGNAL_TYPE dir, string &reason)
     {
      if(!m_cfg.enableTrendFilter)
         return(true);
      double ma = TrendMA();
      if(ma <= 0.0)
        { reason = "Trend-MA nicht verfuegbar"; return(false); }
      double price = SymbolInfoDouble(m_cfg.symbol, SYMBOL_BID);
      if(dir == SIGNAL_BUY && price < ma)
        { reason = "Trendfilter: Preis unter MA (kein Long)"; return(false); }
      if(dir == SIGNAL_SELL && price > ma)
        { reason = "Trendfilter: Preis ueber MA (kein Short)"; return(false); }
      return(true);
     }

   bool              NewsOK(string &reason)
     {
      if(!m_cfg.enableNewsFilter)
         return(true);
      if(!FileIsExist(m_cfg.newsFile))
         return(true);   // keine News-Datei -> nicht blockieren
      int h = FileOpen(m_cfg.newsFile, FILE_READ | FILE_TXT | FILE_ANSI | FILE_SHARE_READ);
      if(h == INVALID_HANDLE)
         return(true);
      datetime now = TimeCurrent();
      long before = (long)m_cfg.newsPauseMinutesBefore * 60;
      long after  = (long)m_cfg.newsPauseMinutesAfter  * 60;
      bool blocked = false;
      while(!FileIsEnding(h))
        {
         string line = FileReadString(h);
         if(StringLen(line) == 0) continue;
         // Format: epoch-Sekunden pro Zeile ODER "YYYY.MM.DD HH:MM"
         datetime t = (StringFind(line, ".") >= 0 ? StringToTime(line) : (datetime)StringToInteger(line));
         if(t <= 0) continue;
         if(now >= (t - before) && now <= (t + after))
           { blocked = true; break; }
        }
      FileClose(h);
      if(blocked)
        { reason = "News-Fenster aktiv"; return(false); }
      return(true);
     }

public:
                     CFilters() : m_log(NULL), m_atrHandle(INVALID_HANDLE),
                                  m_maHandle(INVALID_HANDLE), m_point(0.0) {}

   bool              Init(const SConfig &cfg, CLogger *logger)
     {
      m_cfg   = cfg;
      m_log   = logger;
      m_point = SymbolInfoDouble(m_cfg.symbol, SYMBOL_POINT);

      if(m_cfg.enableATRFilter)
        {
         m_atrHandle = iATR(m_cfg.symbol, PERIOD_CURRENT, m_cfg.atrPeriod);
         if(m_atrHandle == INVALID_HANDLE && m_log != NULL)
            m_log.Warn("Filters: iATR-Handle ungueltig");
        }
      if(m_cfg.enableTrendFilter)
        {
         m_maHandle = iMA(m_cfg.symbol, m_cfg.trendMATimeframe, m_cfg.trendMAPeriod,
                          0, m_cfg.trendMAMethod, PRICE_CLOSE);
         if(m_maHandle == INVALID_HANDLE && m_log != NULL)
            m_log.Warn("Filters: iMA-Handle ungueltig");
        }
      return(true);
     }

   //--- Gesamtpruefung; reason enthaelt den ersten blockierenden Grund
   bool              Allow(ENUM_SIGNAL_TYPE dir, string &reason)
     {
      reason = "";
      if(!SpreadOK(reason)) return(false);
      if(!ATROK(reason))    return(false);
      if(!TimeOK(reason))   return(false);
      if(!DayOK(reason))    return(false);
      if(!TrendOK(dir, reason)) return(false);
      if(!NewsOK(reason))   return(false);
      return(true);
     }

   void              Release()
     {
      if(m_atrHandle != INVALID_HANDLE) { IndicatorRelease(m_atrHandle); m_atrHandle = INVALID_HANDLE; }
      if(m_maHandle  != INVALID_HANDLE) { IndicatorRelease(m_maHandle);  m_maHandle  = INVALID_HANDLE; }
     }
  };

#endif // __VBE_FILTERS_MQH__
//+------------------------------------------------------------------+
