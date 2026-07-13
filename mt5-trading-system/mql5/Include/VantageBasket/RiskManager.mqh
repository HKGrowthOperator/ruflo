//+------------------------------------------------------------------+
//|                                                  RiskManager.mqh  |
//|   Vantage Basket EA - Equity-Schutz, Limits & Risiko-Gates        |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_RISKMANAGER_MQH__
#define __VBE_RISKMANAGER_MQH__

#include "Config.mqh"
#include "Logger.mqh"
#include "Enums.mqh"

//+------------------------------------------------------------------+
//| Trennt "darf ein neuer Trade eroeffnet werden?" (CanOpen) von    |
//| "muss der Basket sofort geschlossen werden?" (EquityBreached).   |
//+------------------------------------------------------------------+
class CRiskManager
  {
private:
   SConfig    m_cfg;
   CLogger   *m_log;
   double     m_startBalance;   // Balance beim Start (Basis fuer %-Verlust)
   double     m_peakEquity;     // hoechste beobachtete Equity (fuer Drawdown)

   double            Equity()  const { return(AccountInfoDouble(ACCOUNT_EQUITY));  }
   double            Balance() const { return(AccountInfoDouble(ACCOUNT_BALANCE)); }

   //--- projizierte Margin-Auslastung nach Oeffnen von 'lot'
   bool              MarginOK(ENUM_SIGNAL_TYPE dir, double lot, string &reason)
     {
      if(!m_cfg.enableMaxMargin)
         return(true);
      double eq = Equity();
      if(eq <= 0.0)
        { reason = "Equity <= 0"; return(false); }

      ENUM_ORDER_TYPE ot = (dir == SIGNAL_BUY ? ORDER_TYPE_BUY : ORDER_TYPE_SELL);
      double price = (dir == SIGNAL_BUY
                      ? SymbolInfoDouble(m_cfg.symbol, SYMBOL_ASK)
                      : SymbolInfoDouble(m_cfg.symbol, SYMBOL_BID));
      double reqMargin = 0.0;
      if(!OrderCalcMargin(ot, m_cfg.symbol, lot, price, reqMargin))
        { reason = "OrderCalcMargin fehlgeschlagen"; return(false); }

      double usedMargin = AccountInfoDouble(ACCOUNT_MARGIN);
      double projected  = (usedMargin + reqMargin) / eq * 100.0;
      if(projected > m_cfg.maxMarginUsagePct)
        {
         reason = StringFormat("Margin-Auslastung %.1f%% > max %.1f%%", projected, m_cfg.maxMarginUsagePct);
         return(false);
        }
      return(true);
     }

   bool              DrawdownOK(string &reason)
     {
      if(!m_cfg.enableMaxDrawdown)
         return(true);
      if(m_peakEquity <= 0.0)
         return(true);
      double dd = (m_peakEquity - Equity()) / m_peakEquity * 100.0;
      if(dd > m_cfg.maxDrawdownPct)
        {
         reason = StringFormat("Drawdown %.1f%% > max %.1f%%", dd, m_cfg.maxDrawdownPct);
         return(false);
        }
      return(true);
     }

public:
                     CRiskManager() : m_log(NULL), m_startBalance(0.0), m_peakEquity(0.0) {}

   void              Init(const SConfig &cfg, CLogger *logger)
     {
      m_cfg          = cfg;
      m_log          = logger;
      m_startBalance = Balance();
      m_peakEquity   = Equity();
     }

   //--- jeden Tick aufrufen: Peak-Equity nachfuehren
   void              Heartbeat()
     {
      double eq = Equity();
      if(eq > m_peakEquity)
         m_peakEquity = eq;
     }

   //--- darf ein neuer Trade eroeffnet werden?
   bool              CanOpen(int currentOpenCount, ENUM_SIGNAL_TYPE dir,
                             double nextLot, string &reason)
     {
      reason = "";
      if(m_cfg.enableMaxTrades && currentOpenCount >= m_cfg.maxOpenTrades)
        { reason = StringFormat("MaxOpenTrades erreicht (%d)", m_cfg.maxOpenTrades); return(false); }

      if(m_cfg.maxLot > 0.0 && nextLot > m_cfg.maxLot + 1e-9)
        { reason = StringFormat("Lot %.2f > MaxLot %.2f", nextLot, m_cfg.maxLot); return(false); }

      if(!DrawdownOK(reason))       return(false);
      if(!MarginOK(dir, nextLot, reason)) return(false);
      return(true);
     }

   //--- Equity-Schutz verletzt? -> Basket muss geschlossen werden
   bool              EquityBreached(string &reason)
     {
      if(!m_cfg.enableEquityStop)
         return(false);
      double eq = Equity();

      if(m_cfg.equityMinAbsolute > 0.0 && eq < m_cfg.equityMinAbsolute)
        {
         reason = StringFormat("Equity %.2f < Mindest-Equity %.2f", eq, m_cfg.equityMinAbsolute);
         return(true);
        }
      if(m_cfg.equityMaxLossPct > 0.0 && m_startBalance > 0.0)
        {
         double lossPct = (m_startBalance - eq) / m_startBalance * 100.0;
         if(lossPct > m_cfg.equityMaxLossPct)
           {
            reason = StringFormat("Kontoverlust %.1f%% > max %.1f%%", lossPct, m_cfg.equityMaxLossPct);
            return(true);
           }
        }
      return(false);
     }

   double            PeakEquity()   const { return(m_peakEquity);   }
   double            StartBalance() const { return(m_startBalance); }
  };

#endif // __VBE_RISKMANAGER_MQH__
//+------------------------------------------------------------------+
