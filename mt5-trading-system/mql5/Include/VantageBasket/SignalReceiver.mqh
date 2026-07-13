//+------------------------------------------------------------------+
//|                                                SignalReceiver.mqh |
//|   Vantage Basket EA - Signalaufnahme aus mehreren Quellen         |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_SIGNALRECEIVER_MQH__
#define __VBE_SIGNALRECEIVER_MQH__

#include "Config.mqh"
#include "Logger.mqh"
#include "Enums.mqh"

//+------------------------------------------------------------------+
//| Liefert genau ein neues, noch nicht verarbeitetes Signal pro     |
//| Poll(). Deduplizierung:                                          |
//|   - SRC_FILE_QUEUE:  monotone Sequenz-ID (id > lastSeq)          |
//|   - SRC_INTERNAL_IND: pro Bar + Richtung (kein Repainting-Fire)  |
//|   - SRC_MANUAL:       einmalige Injektion via Chart-Button       |
//+------------------------------------------------------------------+
class CSignalReceiver
  {
private:
   SConfig           m_cfg;
   CLogger          *m_log;
   int               m_indHandle;      // iCustom-Handle (interner Indikator)

   ulong             m_lastSeq;        // zuletzt verarbeitete File-Queue-ID
   ulong             m_localIdSeq;     // ID-Generator fuer Ind./Manual-Signale
   long              m_lastFileSize;   // Groesse der Queue-Datei beim letzten Lesen

   datetime          m_lastBarTime;    // fuer Bar-Close-Erkennung (Indikator)
   ENUM_SIGNAL_TYPE  m_lastBarDir;     // zuletzt emittierte Richtung dieser Bar

   ENUM_SIGNAL_TYPE  m_manualPending;  // via Button injiziertes Signal

   //--- Datei-Queue auslesen (JSONL, eine Zeile pro Signal)
   bool              PollFileQueue(SSignal &out)
     {
      if(!FileIsExist(m_cfg.signalFile))
         return(false);

      int h = FileOpen(m_cfg.signalFile, FILE_READ | FILE_TXT | FILE_ANSI | FILE_SHARE_READ | FILE_SHARE_WRITE);
      if(h == INVALID_HANDLE)
         return(false);

      bool found = false;
      ulong  bestId  = 0;
      ENUM_SIGNAL_TYPE bestType = SIGNAL_NONE;
      datetime bestTime = 0;
      double   bestPrice = 0.0;

      while(!FileIsEnding(h))
        {
         string line = FileReadString(h);
         if(StringLen(line) < 5)
            continue;

         ulong id = (ulong)ParseNumber(line, "\"id\":");
         if(id <= m_lastSeq)
            continue;                          // bereits verarbeitet

         string action = ParseString(line, "\"action\":");
         ENUM_SIGNAL_TYPE t = SIGNAL_NONE;
         if(action == "buy"  || action == "BUY")  t = SIGNAL_BUY;
         if(action == "sell" || action == "SELL") t = SIGNAL_SELL;
         if(t == SIGNAL_NONE)
            continue;

         // aeltestes unverarbeitetes Signal zuerst
         if(!found || id < bestId)
           {
            found     = true;
            bestId    = id;
            bestType  = t;
            bestTime  = (datetime)(long)ParseNumber(line, "\"time\":");
            bestPrice = ParseNumber(line, "\"price\":");
           }
        }
      FileClose(h);

      if(!found)
         return(false);

      out.type   = bestType;
      out.id     = bestId;
      out.time   = (bestTime > 0 ? bestTime : TimeCurrent());
      out.price  = bestPrice;
      out.source = "file_queue";
      m_lastSeq  = bestId;                      // als verarbeitet markieren
      return(true);
     }

   //--- interner Indikator (iCustom-Buffer)
   bool              PollIndicator(SSignal &out)
     {
      if(m_indHandle == INVALID_HANDLE)
         return(false);

      int shift = (m_cfg.signalOnBarCloseOnly ? 1 : 0); // 1 = letzte geschlossene Bar
      datetime barTime = iTime(m_cfg.symbol, PERIOD_CURRENT, shift);

      double bufBuy[1], bufSell[1];
      if(CopyBuffer(m_indHandle, m_cfg.signalBufferBuy,  shift, 1, bufBuy)  != 1) return(false);
      if(CopyBuffer(m_indHandle, m_cfg.signalBufferSell, shift, 1, bufSell) != 1) return(false);

      bool buySig  = (bufBuy[0]  != 0.0 && bufBuy[0]  != EMPTY_VALUE);
      bool sellSig = (bufSell[0] != 0.0 && bufSell[0] != EMPTY_VALUE);

      ENUM_SIGNAL_TYPE t = SIGNAL_NONE;
      if(buySig && !sellSig) t = SIGNAL_BUY;
      if(sellSig && !buySig) t = SIGNAL_SELL;
      if(t == SIGNAL_NONE)
         return(false);

      // Dedup: nicht dieselbe Richtung mehrfach auf derselben Bar feuern
      if(barTime == m_lastBarTime && t == m_lastBarDir)
         return(false);

      m_lastBarTime = barTime;
      m_lastBarDir  = t;

      out.type   = t;
      out.id     = ++m_localIdSeq;
      out.time   = TimeCurrent();
      out.price  = 0.0;
      out.source = (m_cfg.signalOnBarCloseOnly ? "indicator_barclose" : "indicator_intrabar");
      return(true);
     }

   //--- Zahlenfeld aus einer JSON-Zeile
   double            ParseNumber(const string s, const string key)
     {
      int p = StringFind(s, key);
      if(p < 0) return(0.0);
      p += StringLen(key);
      int len = StringLen(s);
      string num = "";
      while(p < len)
        {
         ushort c = StringGetCharacter(s, p);
         if((c >= '0' && c <= '9') || c == '-' || c == '.' || c == '+')
            num += ShortToString(c);
         else if(num != "")
            break;
         p++;
        }
      return(StringToDouble(num));
     }

   //--- String-Feld (bis zum naechsten Anfuehrungszeichen) aus JSON-Zeile
   string            ParseString(const string s, const string key)
     {
      int p = StringFind(s, key);
      if(p < 0) return("");
      p += StringLen(key);
      int len = StringLen(s);
      // fuehrendes Anfuehrungszeichen ueberspringen
      while(p < len && StringGetCharacter(s, p) != '"') p++;
      p++;
      string val = "";
      while(p < len)
        {
         ushort c = StringGetCharacter(s, p);
         if(c == '"') break;
         val += ShortToString(c);
         p++;
        }
      return(val);
     }

public:
                     CSignalReceiver() : m_log(NULL), m_indHandle(INVALID_HANDLE),
                                         m_lastSeq(0), m_localIdSeq(0), m_lastFileSize(-1),
                                         m_lastBarTime(0), m_lastBarDir(SIGNAL_NONE),
                                         m_manualPending(SIGNAL_NONE) {}

   bool              Init(const SConfig &cfg, CLogger *logger, ulong restoredSeq)
     {
      m_cfg     = cfg;
      m_log     = logger;
      m_lastSeq = restoredSeq;

      if(m_cfg.signalSource == SRC_INTERNAL_INDICATOR)
        {
         m_indHandle = iCustom(m_cfg.symbol, PERIOD_CURRENT, m_cfg.indicatorName);
         if(m_indHandle == INVALID_HANDLE)
           {
            if(m_log != NULL)
               m_log.Error("SignalReceiver: iCustom('" + m_cfg.indicatorName + "') fehlgeschlagen. Err=" + (string)GetLastError());
            return(false);
           }
        }
      return(true);
     }

   //--- vom Chart-Button gesetzt
   void              InjectManual(ENUM_SIGNAL_TYPE dir) { m_manualPending = dir; }

   //--- naechstes neues Signal holen; true wenn vorhanden
   bool              Poll(SSignal &out)
     {
      out.Reset();

      // 1) manuelle Injektion hat Vorrang (Test/Override)
      if(m_manualPending != SIGNAL_NONE)
        {
         out.type   = m_manualPending;
         out.id     = ++m_localIdSeq;
         out.time   = TimeCurrent();
         out.source = "manual";
         m_manualPending = SIGNAL_NONE;
         return(true);
        }

      switch(m_cfg.signalSource)
        {
         case SRC_INTERNAL_INDICATOR: return(PollIndicator(out));
         case SRC_FILE_QUEUE:         return(PollFileQueue(out));
         case SRC_MANUAL:             return(false); // nur ueber InjectManual
        }
      return(false);
     }

   ulong             LastSeq() const { return(m_lastSeq); }

   void              Release()
     {
      if(m_indHandle != INVALID_HANDLE)
        {
         IndicatorRelease(m_indHandle);
         m_indHandle = INVALID_HANDLE;
        }
     }
  };

#endif // __VBE_SIGNALRECEIVER_MQH__
//+------------------------------------------------------------------+
