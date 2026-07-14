//+------------------------------------------------------------------+
//|                                                VBE_LogicTests.mq5 |
//|   Vantage Basket EA - Logik-Unit-Tests (als Script ausfuehren)    |
//|                                                                   |
//|   Testet die reinen Domain-Module ohne Handel:                   |
//|     - CTradeCounter (Zaehler/Zyklus/Reset/Restore)               |
//|     - CLotCalculator (Formel, Increment, Clamping)              |
//|                                                                   |
//|   Ausfuehren: Script auf einen Chart ziehen; Ergebnisse im        |
//|   "Experten"-Journal (PASS/FAIL + Zusammenfassung).              |
//+------------------------------------------------------------------+
#property copyright "HK Growth Operator"
#property version   "1.00"
#property strict
#property script_show_inputs

#include "../mql5/Include/VantageBasket/Config.mqh"
#include "../mql5/Include/VantageBasket/TradeCounter.mqh"
#include "../mql5/Include/VantageBasket/LotCalculator.mqh"

int g_pass = 0;
int g_fail = 0;

void Check(const string name, bool cond)
  {
   if(cond) { g_pass++; PrintFormat("PASS: %s", name); }
   else     { g_fail++; PrintFormat("FAIL: %s", name); }
  }

void CheckEqI(const string name, long got, long exp)
  {
   Check(StringFormat("%s (got=%I64d exp=%I64d)", name, got, exp), got == exp);
  }

//+------------------------------------------------------------------+
void TestTradeCounter()
  {
   CTradeCounter c;
   CheckEqI("Counter initial value", c.Value(), 0);
   CheckEqI("Counter initial cycle", c.CycleId(), 1);

   c.Increment(); c.Increment(); c.Increment();
   CheckEqI("Counter after 3 increments", c.Value(), 3);

   c.ResetCycle();
   CheckEqI("Counter after ResetCycle value", c.Value(), 0);
   CheckEqI("Counter after ResetCycle cycle", c.CycleId(), 2);

   c.Increment(); c.Increment();
   c.ResetCounterOnly();
   CheckEqI("ResetCounterOnly value", c.Value(), 0);
   CheckEqI("ResetCounterOnly keeps cycle", c.CycleId(), 2);

   c.Restore(5, 3);
   CheckEqI("Restore value", c.Value(), 5);
   CheckEqI("Restore cycle", c.CycleId(), 3);

   c.Restore(-4, 0);   // defensive: negatives -> geklemmt
   CheckEqI("Restore clamps negative counter", c.Value(), 0);
   CheckEqI("Restore clamps cycle to >=1", c.CycleId(), 1);
  }

//+------------------------------------------------------------------+
void TestLotCalculator()
  {
   SConfig cfg;
   cfg.symbol       = _Symbol;
   cfg.startLot     = 0.05;
   cfg.lotIncrement = 0.02;
   cfg.maxLot       = 0.0;      // keine User-Grenze

   CLotCalculator lot;
   lot.Init(cfg);

   double l0 = lot.LotFor(0);
   double l1 = lot.LotFor(1);
   double l2 = lot.LotFor(2);
   double l5 = lot.LotFor(5);

   Check("Lot monotonic non-decreasing (l0<=l1)", l0 <= l1 + 1e-9);
   Check("Lot monotonic non-decreasing (l1<=l2)", l1 <= l2 + 1e-9);
   Check("Lot increases with counter (l0<l5)",    l0 <  l5 + 1e-9);
   Check("Lot >= symbol volume min",              l0 >= lot.VolumeMin() - 1e-9);

   // erwarteter Rohwert vor Normalisierung
   double rawExpected = cfg.startLot + 2 * cfg.lotIncrement; // 0.09
   Check("Lot near formula value at counter=2",
         MathAbs(l2 - rawExpected) <= lot.VolumeStep() + 1e-9);

   // User-Max testen
   SConfig cfg2 = cfg;
   cfg2.maxLot = 0.10;
   CLotCalculator lot2;
   lot2.Init(cfg2);
   double capped = lot2.LotFor(100);   // weit ueber max
   Check("Lot capped at user maxLot", capped <= cfg2.maxLot + 1e-9);
   Check("ExceedsUserMax true at high counter", lot2.ExceedsUserMax(100));
   Check("ExceedsUserMax false at counter=0",  !lot2.ExceedsUserMax(0));
  }

//+------------------------------------------------------------------+
void OnStart()
  {
   Print("===== Vantage Basket EA - Logik-Unit-Tests =====");
   TestTradeCounter();
   TestLotCalculator();
   PrintFormat("===== Ergebnis: %d PASS / %d FAIL =====", g_pass, g_fail);
   if(g_fail == 0)
      Print("ALLE TESTS BESTANDEN");
   else
      Print("ES GIBT FEHLGESCHLAGENE TESTS - siehe oben");
  }
//+------------------------------------------------------------------+
