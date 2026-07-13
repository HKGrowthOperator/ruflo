//+------------------------------------------------------------------+
//|                                                  TradeEngine.mqh  |
//|   Vantage Basket EA - Order-Ausfuehrung (Hedging) + Retry         |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_TRADEENGINE_MQH__
#define __VBE_TRADEENGINE_MQH__

#include <Trade/Trade.mqh>
#include "Config.mqh"
#include "Logger.mqh"
#include "Enums.mqh"
#include "PositionBook.mqh"

//+------------------------------------------------------------------+
//| Kapselt CTrade. Oeffnet je Signal GENAU EINE neue Position       |
//| (Hedging) und schliesst niemals einzelne Positionen aufgrund     |
//| eines Gegensignals. CloseAll() nur fuer Basket/Equity/Reset.     |
//+------------------------------------------------------------------+
class CTradeEngine
  {
private:
   SConfig        m_cfg;
   CLogger       *m_log;
   CPositionBook *m_book;
   CTrade         m_trade;

   //--- transienter Fehler -> lohnt Retry?
   bool              IsRetryable(uint rc) const
     {
      switch(rc)
        {
         case TRADE_RETCODE_REQUOTE:
         case TRADE_RETCODE_PRICE_CHANGED:
         case TRADE_RETCODE_PRICE_OFF:
         case TRADE_RETCODE_REJECT:
         case TRADE_RETCODE_TIMEOUT:
         case TRADE_RETCODE_CONNECTION:
            return(true);
        }
      return(false);
     }

   bool              Connected() const
     {
      return((bool)TerminalInfoInteger(TERMINAL_CONNECTED));
     }

public:
                     CTradeEngine() : m_log(NULL), m_book(NULL) {}

   void              Init(const SConfig &cfg, CLogger *logger, CPositionBook *book)
     {
      m_cfg  = cfg;
      m_log  = logger;
      m_book = book;

      m_trade.SetExpertMagicNumber(m_cfg.magic);
      m_trade.SetDeviationInPoints(m_cfg.slippagePoints);
      m_trade.SetTypeFillingBySymbol(m_cfg.symbol);
      m_trade.SetAsyncMode(false);
     }

   //--- neue Position eroeffnen; gibt true bei Erfolg               |
   //--- setzt ticket, retcode, latencyMs (Round-Trip zur Ausfuehrung)|
   bool              Open(ENUM_SIGNAL_TYPE dir, double lot,
                          ulong &ticket, uint &retcode, long &latencyMs)
     {
      ticket = 0; retcode = 0; latencyMs = 0;
      if(dir != SIGNAL_BUY && dir != SIGNAL_SELL)
         return(false);

      for(int attempt = 0; attempt <= m_cfg.maxRetries; attempt++)
        {
         if(!Connected())
           {
            if(m_log != NULL) m_log.Warn("TradeEngine: keine Broker-Verbindung, warte...");
            Sleep(m_cfg.retryDelayMs * (attempt + 1));
            continue;
           }

         double price = (dir == SIGNAL_BUY
                         ? SymbolInfoDouble(m_cfg.symbol, SYMBOL_ASK)
                         : SymbolInfoDouble(m_cfg.symbol, SYMBOL_BID));

         uint t0 = GetTickCount();
         bool ok;
         if(dir == SIGNAL_BUY)
            ok = m_trade.Buy(lot, m_cfg.symbol, price, 0.0, 0.0, m_cfg.tradeComment);
         else
            ok = m_trade.Sell(lot, m_cfg.symbol, price, 0.0, 0.0, m_cfg.tradeComment);
         latencyMs = (long)(GetTickCount() - t0);

         retcode = m_trade.ResultRetcode();
         ticket  = m_trade.ResultOrder();

         if(ok && (retcode == TRADE_RETCODE_DONE || retcode == TRADE_RETCODE_PLACED))
            return(true);

         if(!IsRetryable(retcode))
           {
            if(m_log != NULL)
               m_log.Error(StringFormat("TradeEngine: Order fehlgeschlagen (nicht wiederholbar) ret=%u %s",
                           retcode, m_trade.ResultRetcodeDescription()));
            return(false);
           }

         if(m_log != NULL)
            m_log.Warn(StringFormat("TradeEngine: Retry %d/%d ret=%u %s",
                       attempt + 1, m_cfg.maxRetries, retcode, m_trade.ResultRetcodeDescription()));
         Sleep(m_cfg.retryDelayMs * (attempt + 1)); // linearer Backoff
        }
      return(false);
     }

   //--- alle EA-Positionen schliessen; gibt Anzahl geschlossener zurueck
   int               CloseAll(double &realizedProfit)
     {
      realizedProfit = 0.0;
      if(m_book == NULL)
         return(0);

      ulong tickets[];
      int n = m_book.CollectTickets(tickets);
      int closed = 0;

      for(int i = 0; i < n; i++)
        {
         ulong tk = tickets[i];
         if(!PositionSelectByTicket(tk))
            continue;
         double posProfit = PositionGetDouble(POSITION_PROFIT) + PositionGetDouble(POSITION_SWAP);

         bool done = false;
         for(int attempt = 0; attempt <= m_cfg.maxRetries && !done; attempt++)
           {
            if(m_trade.PositionClose(tk, m_cfg.slippagePoints))
              {
               uint rc = m_trade.ResultRetcode();
               if(rc == TRADE_RETCODE_DONE || rc == TRADE_RETCODE_PLACED)
                  done = true;
              }
            if(!done)
               Sleep(m_cfg.retryDelayMs * (attempt + 1));
           }

         if(done)
           {
            closed++;
            realizedProfit += posProfit;
           }
         else if(m_log != NULL)
            m_log.Error(StringFormat("TradeEngine: Position %I64u konnte nicht geschlossen werden", tk));
        }
      return(closed);
     }
  };

#endif // __VBE_TRADEENGINE_MQH__
//+------------------------------------------------------------------+
