//+------------------------------------------------------------------+
//|                                                LotCalculator.mqh  |
//|   Vantage Basket EA - Lotgroessen-Berechnung & Normalisierung     |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_LOTCALCULATOR_MQH__
#define __VBE_LOTCALCULATOR_MQH__

#include "Config.mqh"

//+------------------------------------------------------------------+
//| Formel:  Lot = StartLot + (TradeCounter x LotIncrement)          |
//| Richtung (Buy/Sell) ist irrelevant. Ergebnis wird an die         |
//| Symbol-Volumenschritte angepasst und auf [min, max] geklemmt.    |
//+------------------------------------------------------------------+
class CLotCalculator
  {
private:
   string   m_symbol;
   double   m_volMin;
   double   m_volMax;
   double   m_volStep;
   double   m_startLot;
   double   m_increment;
   double   m_userMaxLot;   // harte Obergrenze aus Config (0 = aus)

   //--- auf Volumenschritt runden (kaufmaennisch)
   double            NormalizeVolume(double vol) const
     {
      if(m_volStep <= 0.0)
         return(vol);
      double steps = MathRound(vol / m_volStep);
      double norm  = steps * m_volStep;
      // Fliesskomma-Rest bereinigen
      int digits = 0;
      double s = m_volStep;
      while(s < 1.0 && digits < 8) { s *= 10.0; digits++; }
      return(NormalizeDouble(norm, digits));
     }

public:
                     CLotCalculator() : m_symbol(""), m_volMin(0.01), m_volMax(100.0),
                                        m_volStep(0.01), m_startLot(0.01),
                                        m_increment(0.0), m_userMaxLot(0.0) {}

   //--- true, wenn Symboldaten gelesen werden konnten
   bool              Init(const SConfig &cfg)
     {
      m_symbol     = cfg.symbol;
      m_startLot   = cfg.startLot;
      m_increment  = cfg.lotIncrement;
      m_userMaxLot = cfg.maxLot;

      m_volMin  = SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_MIN);
      m_volMax  = SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_MAX);
      m_volStep = SymbolInfoDouble(m_symbol, SYMBOL_VOLUME_STEP);

      if(m_volStep <= 0.0)
         m_volStep = 0.01;
      if(m_volMin <= 0.0)
         m_volMin = m_volStep;
      if(m_volMax <= 0.0)
         m_volMax = 100.0;
      return(true);
     }

   //--- Lotgroesse fuer den naechsten Trade (bei gegebenem Zaehlerstand)
   double            LotFor(int counter) const
     {
      double raw = m_startLot + (double)counter * m_increment;

      // Obergrenzen anwenden
      double cap = m_volMax;
      if(m_userMaxLot > 0.0 && m_userMaxLot < cap)
         cap = m_userMaxLot;
      if(raw > cap)
         raw = cap;

      // Untergrenze
      if(raw < m_volMin)
         raw = m_volMin;

      return(NormalizeVolume(raw));
     }

   //--- Getter fuer Filter/Risk
   double            VolumeMin()  const { return(m_volMin);  }
   double            VolumeMax()  const { return(m_volMax);  }
   double            VolumeStep() const { return(m_volStep); }

   //--- prueft, ob die berechnete Lot die (optionale) User-Grenze exakt trifft
   bool              ExceedsUserMax(int counter) const
     {
      if(m_userMaxLot <= 0.0)
         return(false);
      double raw = m_startLot + (double)counter * m_increment;
      return(raw > m_userMaxLot + 1e-9);
     }
  };

#endif // __VBE_LOTCALCULATOR_MQH__
//+------------------------------------------------------------------+
