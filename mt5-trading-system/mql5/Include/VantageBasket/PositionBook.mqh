//+------------------------------------------------------------------+
//|                                                 PositionBook.mqh  |
//|   Vantage Basket EA - Aggregation der EA-eigenen Positionen       |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_POSITIONBOOK_MQH__
#define __VBE_POSITIONBOOK_MQH__

#include "Enums.mqh"

//+------------------------------------------------------------------+
//| Liest ausschliesslich Positionen mit passender Magic + Symbol.   |
//| Reine Lesekomponente (kein Trading) -> testbar & seiteneffektfrei.|
//+------------------------------------------------------------------+
class CPositionBook
  {
private:
   long     m_magic;
   string   m_symbol;

   bool     IsOwn(ulong ticket) const
     {
      if(!PositionSelectByTicket(ticket))
         return(false);
      if((long)PositionGetInteger(POSITION_MAGIC) != m_magic)
         return(false);
      if(PositionGetString(POSITION_SYMBOL) != m_symbol)
         return(false);
      return(true);
     }

public:
                     CPositionBook() : m_magic(0), m_symbol("") {}

   void              Init(long magic, const string symbol)
     {
      m_magic  = magic;
      m_symbol = symbol;
     }

   //--- Momentaufnahme aller EA-Positionen
   SBookSnapshot     Snapshot() const
     {
      SBookSnapshot s;
      s.buyCount=0; s.sellCount=0; s.buyLots=0; s.sellLots=0;
      s.totalLots=0; s.floatingPL=0; s.floatingGross=0;

      int total = PositionsTotal();
      for(int i = 0; i < total; i++)
        {
         ulong ticket = PositionGetTicket(i);
         if(ticket == 0)
            continue;
         if(!IsOwn(ticket))
            continue;

         double vol    = PositionGetDouble(POSITION_VOLUME);
         double profit = PositionGetDouble(POSITION_PROFIT);
         double swap   = PositionGetDouble(POSITION_SWAP);
         long   type   = PositionGetInteger(POSITION_TYPE);

         s.totalLots     += vol;
         s.floatingGross += profit;
         s.floatingPL    += profit + swap;

         if(type == POSITION_TYPE_BUY)
           { s.buyCount++;  s.buyLots  += vol; }
         else
           { s.sellCount++; s.sellLots += vol; }
        }
      return(s);
     }

   //--- Anzahl offener EA-Positionen (fuer Zaehler-Rekonstruktion & MaxTrades)
   int               CountOwn() const
     {
      int count = 0;
      int total = PositionsTotal();
      for(int i = 0; i < total; i++)
        {
         ulong ticket = PositionGetTicket(i);
         if(ticket != 0 && IsOwn(ticket))
            count++;
        }
      return(count);
     }

   //--- fuellt tickets[] mit allen EA-Tickets; gibt Anzahl zurueck
   int               CollectTickets(ulong &tickets[]) const
     {
      ArrayResize(tickets, 0);
      int total = PositionsTotal();
      for(int i = 0; i < total; i++)
        {
         ulong ticket = PositionGetTicket(i);
         if(ticket != 0 && IsOwn(ticket))
           {
            int n = ArraySize(tickets);
            ArrayResize(tickets, n + 1);
            tickets[n] = ticket;
           }
        }
      return(ArraySize(tickets));
     }
  };

#endif // __VBE_POSITIONBOOK_MQH__
//+------------------------------------------------------------------+
