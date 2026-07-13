//+------------------------------------------------------------------+
//|                                                       Logger.mqh  |
//|      Vantage Basket EA - Terminal- + Datei-Logging (SRP)          |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_LOGGER_MQH__
#define __VBE_LOGGER_MQH__

#include "Enums.mqh"

//+------------------------------------------------------------------+
//| Schreibt strukturierte Logs ins Terminal (Print) und optional    |
//| in eine taeglich rotierende Datei unter MQL5/Files.              |
//+------------------------------------------------------------------+
class CLogger
  {
private:
   ENUM_VBE_LOG_LEVEL m_level;
   bool               m_toFile;
   string             m_prefix;
   string             m_symbol;
   long               m_magic;

   string             LevelText(ENUM_VBE_LOG_LEVEL lvl) const
     {
      switch(lvl)
        {
         case VBE_LOG_DEBUG: return("DEBUG");
         case VBE_LOG_INFO:  return("INFO ");
         case VBE_LOG_WARN:  return("WARN ");
         case VBE_LOG_ERROR: return("ERROR");
        }
      return("?????");
     }

   string             CurrentFileName() const
     {
      // taegliche Rotation: <prefix>_<symbol>_<magic>_YYYYMMDD.log
      MqlDateTime dt;
      TimeToStruct(TimeCurrent(), dt);
      return(StringFormat("%s_%s_%I64d_%04d%02d%02d.log",
                          m_prefix, m_symbol, m_magic, dt.year, dt.mon, dt.day));
     }

   void               WriteFile(const string line)
     {
      if(!m_toFile)
         return;
      // FILE_COMMON nicht verwenden -> Logs liegen im Terminal-Sandbox-Ordner
      int h = FileOpen(CurrentFileName(),
                       FILE_WRITE | FILE_READ | FILE_TXT | FILE_ANSI | FILE_SHARE_READ);
      if(h == INVALID_HANDLE)
         return;
      FileSeek(h, 0, SEEK_END);
      FileWriteString(h, line + "\r\n");
      FileClose(h);
     }

public:
                     CLogger() : m_level(VBE_LOG_INFO), m_toFile(false),
                                 m_prefix("VBE"), m_symbol(""), m_magic(0) {}

   void              Init(ENUM_VBE_LOG_LEVEL level, bool toFile,
                          const string prefix, const string symbol, long magic)
     {
      m_level  = level;
      m_toFile = toFile;
      m_prefix = prefix;
      m_symbol = symbol;
      m_magic  = magic;
     }

   void              Log(ENUM_VBE_LOG_LEVEL lvl, const string msg)
     {
      if(lvl < m_level)
         return;
      string ts   = TimeToString(TimeCurrent(), TIME_DATE | TIME_SECONDS);
      string line = StringFormat("[%s] [%s] %s", ts, LevelText(lvl), msg);
      Print(line);
      WriteFile(line);
     }

   void              Debug(const string msg) { Log(VBE_LOG_DEBUG, msg); }
   void              Info (const string msg) { Log(VBE_LOG_INFO,  msg); }
   void              Warn (const string msg) { Log(VBE_LOG_WARN,  msg); }
   void              Error(const string msg) { Log(VBE_LOG_ERROR, msg); }

   //--- strukturiertes Trade-Log
   void              Trade(const string action, ENUM_SIGNAL_TYPE dir, double lot,
                           int counter, ulong ticket, ulong signalId,
                           uint retcode, long latencyMs)
     {
      string dirText = (dir == SIGNAL_BUY ? "BUY" : (dir == SIGNAL_SELL ? "SELL" : "NONE"));
      string msg = StringFormat(
                      "TRADE %s | dir=%s lot=%.2f counter=%d ticket=%I64u signal=%I64u ret=%u latency=%Ims",
                      action, dirText, lot, counter, ticket, signalId, retcode, latencyMs);
      Log(VBE_LOG_INFO, msg);
     }

   //--- strukturiertes Event-Log (Basket/Reset/Reconnect)
   void              Event(const string name, const string detail)
     {
      Log(VBE_LOG_INFO, StringFormat("EVENT %s | %s", name, detail));
     }
  };

#endif // __VBE_LOGGER_MQH__
//+------------------------------------------------------------------+
