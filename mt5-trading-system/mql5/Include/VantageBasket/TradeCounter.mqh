//+------------------------------------------------------------------+
//|                                                 TradeCounter.mqh  |
//|   Vantage Basket EA - Zyklus-Zaehler (reines Domain-Objekt)       |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_TRADECOUNTER_MQH__
#define __VBE_TRADECOUNTER_MQH__

//+------------------------------------------------------------------+
//| Zaehlt ausschliesslich im aktuellen Zyklus EROEFFNETE Trades.    |
//| Bestimmt die naechste Lotgroesse. Persistenz uebernimmt der      |
//| StateManager (Repository-Muster) - dieses Objekt ist zustandslos |
//| bzgl. Speicherung und damit isoliert testbar.                    |
//+------------------------------------------------------------------+
class CTradeCounter
  {
private:
   int   m_counter;   // Anzahl eroeffneter Trades im aktuellen Zyklus
   int   m_cycleId;   // fortlaufende Zyklus-Nummer (fuer Logging/Analyse)

public:
                     CTradeCounter() : m_counter(0), m_cycleId(1) {}

   //--- Getter
   int               Value()   const { return(m_counter); }
   int               CycleId() const { return(m_cycleId); }

   //--- ein Trade wurde erfolgreich eroeffnet
   void              Increment() { m_counter++; }

   //--- neuer Zyklus: Zaehler auf 0, Zyklus-Nummer +1
   void              ResetCycle()
     {
      m_counter = 0;
      m_cycleId++;
     }

   //--- manueller Reset (nur Zaehler, Positionen bleiben offen)
   void              ResetCounterOnly() { m_counter = 0; }

   //--- Zustand wiederherstellen (vom StateManager aufgerufen)
   void              Restore(int counter, int cycleId)
     {
      m_counter = (counter < 0 ? 0 : counter);
      m_cycleId = (cycleId  < 1 ? 1 : cycleId);
     }
  };

#endif // __VBE_TRADECOUNTER_MQH__
//+------------------------------------------------------------------+
