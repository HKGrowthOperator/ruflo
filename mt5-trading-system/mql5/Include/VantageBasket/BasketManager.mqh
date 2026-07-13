//+------------------------------------------------------------------+
//|                                                BasketManager.mqh  |
//|   Vantage Basket EA - Floating-P/L-Ueberwachung & Basket-TP/SL    |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_BASKETMANAGER_MQH__
#define __VBE_BASKETMANAGER_MQH__

#include "Config.mqh"
#include "Logger.mqh"
#include "Enums.mqh"
#include "PositionBook.mqh"

//+------------------------------------------------------------------+
//| Ueberwacht den gesamten Floating-P/L aller EA-Positionen und     |
//| meldet, ob Basket-TP oder Basket-SL erreicht ist. Schliesst      |
//| NICHT selbst - das entscheidet der EA (klare Verantwortung).     |
//+------------------------------------------------------------------+
class CBasketManager
  {
private:
   SConfig        m_cfg;
   CLogger       *m_log;
   CPositionBook *m_book;

   //--- Schwelle in Geld aufloesen (Money oder Prozent der Balance)
   double            ResolveThreshold(ENUM_BASKET_BASIS basis, double value) const
     {
      if(basis == BASIS_PERCENT)
        {
         double bal = AccountInfoDouble(ACCOUNT_BALANCE);
         return(bal * value / 100.0);
        }
      return(value); // BASIS_MONEY
     }

public:
                     CBasketManager() : m_log(NULL), m_book(NULL) {}

   void              Init(const SConfig &cfg, CLogger *logger, CPositionBook *book)
     {
      m_cfg  = cfg;
      m_log  = logger;
      m_book = book;
     }

   //--- pruefen; gibt CLOSE_TP / CLOSE_SL / CLOSE_NONE zurueck
   ENUM_BASKET_CLOSE_REASON Check(double &floatingPL)
     {
      floatingPL = 0.0;
      if(m_book == NULL)
         return(CLOSE_NONE);

      SBookSnapshot snap = m_book.Snapshot();
      floatingPL = snap.floatingPL;

      // keine offenen Positionen -> nichts zu tun
      if(snap.buyCount + snap.sellCount == 0)
         return(CLOSE_NONE);

      if(m_cfg.enableBasketTP)
        {
         double tp = ResolveThreshold(m_cfg.basketTPBasis, m_cfg.basketTPValue);
         if(floatingPL >= tp)
            return(CLOSE_TP);
        }
      if(m_cfg.enableBasketSL)
        {
         double sl = ResolveThreshold(m_cfg.basketSLBasis, m_cfg.basketSLValue);
         if(floatingPL <= -sl)
            return(CLOSE_SL);
        }
      return(CLOSE_NONE);
     }

   //--- fuer Dashboard: aktuelle aufgeloeste Schwellen
   double            TPMoney() const { return(ResolveThreshold(m_cfg.basketTPBasis, m_cfg.basketTPValue)); }
   double            SLMoney() const { return(ResolveThreshold(m_cfg.basketSLBasis, m_cfg.basketSLValue)); }
  };

#endif // __VBE_BASKETMANAGER_MQH__
//+------------------------------------------------------------------+
