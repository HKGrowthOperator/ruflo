//+------------------------------------------------------------------+
//|                                                    Dashboard.mqh  |
//|   Vantage Basket EA - On-Chart-Panel + Reset-/Manual-Buttons      |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_DASHBOARD_MQH__
#define __VBE_DASHBOARD_MQH__

#include "Config.mqh"
#include "Enums.mqh"

//+------------------------------------------------------------------+
//| Reines UI-Modul. Objektnamen sind Magic-scoped, damit mehrere    |
//| Instanzen auf verschiedenen Charts nicht kollidieren.            |
//+------------------------------------------------------------------+
class CDashboard
  {
private:
   SConfig    m_cfg;
   long       m_chart;
   string     m_pfx;          // Objekt-Namenspraefix
   int        m_x;
   int        m_y;
   int        m_lineH;
   bool       m_created;

   string            N(const string id) const { return(m_pfx + id); }

   void              MakeLabel(const string id, int row, color clr, int fontSize)
     {
      string name = N(id);
      if(ObjectFind(m_chart, name) < 0)
         ObjectCreate(m_chart, name, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(m_chart, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(m_chart, name, OBJPROP_XDISTANCE, m_x + 8);
      ObjectSetInteger(m_chart, name, OBJPROP_YDISTANCE, m_y + 8 + row * m_lineH);
      ObjectSetInteger(m_chart, name, OBJPROP_COLOR, clr);
      ObjectSetInteger(m_chart, name, OBJPROP_FONTSIZE, fontSize);
      ObjectSetString (m_chart, name, OBJPROP_FONT, "Consolas");
      ObjectSetInteger(m_chart, name, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(m_chart, name, OBJPROP_HIDDEN, true);
     }

   void              SetLabel(const string id, const string text)
     {
      ObjectSetString(m_chart, N(id), OBJPROP_TEXT, text);
     }

   void              MakeButton(const string id, int row, int width, const string caption, color bg)
     {
      string name = N(id);
      if(ObjectFind(m_chart, name) < 0)
         ObjectCreate(m_chart, name, OBJ_BUTTON, 0, 0, 0);
      ObjectSetInteger(m_chart, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(m_chart, name, OBJPROP_XDISTANCE, m_x + 8);
      ObjectSetInteger(m_chart, name, OBJPROP_YDISTANCE, m_y + 8 + row * m_lineH);
      ObjectSetInteger(m_chart, name, OBJPROP_XSIZE, width);
      ObjectSetInteger(m_chart, name, OBJPROP_YSIZE, 22);
      ObjectSetString (m_chart, name, OBJPROP_TEXT, caption);
      ObjectSetInteger(m_chart, name, OBJPROP_BGCOLOR, bg);
      ObjectSetInteger(m_chart, name, OBJPROP_COLOR, clrWhite);
      ObjectSetInteger(m_chart, name, OBJPROP_STATE, false);
      ObjectSetInteger(m_chart, name, OBJPROP_HIDDEN, true);
     }

public:
                     CDashboard() : m_chart(0), m_x(12), m_y(20), m_lineH(16), m_created(false) {}

   //--- Buttonnamen (vom EA in OnChartEvent verglichen)
   string            BtnReset() const { return(N("BTN_RESET")); }
   string            BtnBuy()   const { return(N("BTN_BUY"));   }
   string            BtnSell()  const { return(N("BTN_SELL"));  }
   string            BtnClose() const { return(N("BTN_CLOSE")); }

   void              Init(const SConfig &cfg)
     {
      m_cfg   = cfg;
      m_chart = ChartID();
      m_pfx   = StringFormat("VBE_%I64d_", cfg.magic);
      if(!m_cfg.showDashboard)
         return;

      // Panel-Hintergrund
      string bgName = N("PANEL");
      if(ObjectFind(m_chart, bgName) < 0)
         ObjectCreate(m_chart, bgName, OBJ_RECTANGLE_LABEL, 0, 0, 0);
      ObjectSetInteger(m_chart, bgName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(m_chart, bgName, OBJPROP_XDISTANCE, m_x);
      ObjectSetInteger(m_chart, bgName, OBJPROP_YDISTANCE, m_y);
      ObjectSetInteger(m_chart, bgName, OBJPROP_XSIZE, 300);
      ObjectSetInteger(m_chart, bgName, OBJPROP_YSIZE, 320);
      ObjectSetInteger(m_chart, bgName, OBJPROP_BGCOLOR, C'20,25,35');
      ObjectSetInteger(m_chart, bgName, OBJPROP_BORDER_TYPE, BORDER_FLAT);
      ObjectSetInteger(m_chart, bgName, OBJPROP_COLOR, C'60,70,90');
      ObjectSetInteger(m_chart, bgName, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(m_chart, bgName, OBJPROP_HIDDEN, true);

      MakeLabel("TITLE", 0, clrGold, 11);
      MakeLabel("L_SYMBOL",  2, clrSilver, 9);
      MakeLabel("L_COUNTER", 3, clrWhite,  9);
      MakeLabel("L_NEXTLOT", 4, clrWhite,  9);
      MakeLabel("L_BUYS",    5, clrDeepSkyBlue, 9);
      MakeLabel("L_SELLS",   6, clrOrange, 9);
      MakeLabel("L_LOTS",    7, clrWhite,  9);
      MakeLabel("L_FLOAT",   8, clrWhite,  9);
      MakeLabel("L_TPSL",    9, clrWhite,  9);
      MakeLabel("L_EQUITY", 10, clrWhite,  9);
      MakeLabel("L_BALANCE",11, clrWhite,  9);
      MakeLabel("L_MARGIN", 12, clrWhite,  9);
      MakeLabel("L_DD",     13, clrWhite,  9);

      int btnRow = 15;
      if(m_cfg.showResetButton)
         MakeButton("BTN_RESET", btnRow, 130, "RESET COUNTER", C'150,80,20');
      MakeButton("BTN_CLOSE", btnRow, 130, "CLOSE ALL", C'120,30,30');
      ObjectSetInteger(m_chart, N("BTN_CLOSE"), OBJPROP_XDISTANCE, m_x + 150);

      if(m_cfg.signalSource == SRC_MANUAL)
        {
         MakeButton("BTN_BUY",  btnRow + 2, 130, "MANUAL BUY", C'20,90,40');
         MakeButton("BTN_SELL", btnRow + 2, 130, "MANUAL SELL", C'90,50,20');
         ObjectSetInteger(m_chart, N("BTN_SELL"), OBJPROP_XDISTANCE, m_x + 150);
        }

      SetLabel("TITLE", "  VANTAGE BASKET EA");
      m_created = true;
     }

   void              Update(const SBookSnapshot &snap, int counter, int cycleId,
                            double nextLot, double tpMoney, double slMoney,
                            double peakEquity)
     {
      if(!m_cfg.showDashboard || !m_created)
         return;

      double equity  = AccountInfoDouble(ACCOUNT_EQUITY);
      double balance = AccountInfoDouble(ACCOUNT_BALANCE);
      double margin  = AccountInfoDouble(ACCOUNT_MARGIN);
      double freeM   = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
      double dd      = (peakEquity > 0.0 ? (peakEquity - equity) / peakEquity * 100.0 : 0.0);
      string cur     = AccountInfoString(ACCOUNT_CURRENCY);

      SetLabel("L_SYMBOL",  StringFormat("Symbol : %s   Magic %I64d", m_cfg.symbol, m_cfg.magic));
      SetLabel("L_COUNTER", StringFormat("Counter: %d   (Zyklus %d)", counter, cycleId));
      SetLabel("L_NEXTLOT", StringFormat("Next Lot: %.2f", nextLot));
      SetLabel("L_BUYS",    StringFormat("Buys : %d  (%.2f lots)", snap.buyCount, snap.buyLots));
      SetLabel("L_SELLS",   StringFormat("Sells: %d  (%.2f lots)", snap.sellCount, snap.sellLots));
      SetLabel("L_LOTS",    StringFormat("Total Lots: %.2f", snap.totalLots));

      color fc = (snap.floatingPL >= 0 ? clrLime : clrTomato);
      ObjectSetInteger(m_chart, N("L_FLOAT"), OBJPROP_COLOR, fc);
      SetLabel("L_FLOAT",   StringFormat("Floating P/L: %.2f %s", snap.floatingPL, cur));
      SetLabel("L_TPSL",    StringFormat("Basket TP/SL: %.2f / -%.2f", tpMoney, slMoney));
      SetLabel("L_EQUITY",  StringFormat("Equity : %.2f %s", equity, cur));
      SetLabel("L_BALANCE", StringFormat("Balance: %.2f %s", balance, cur));
      SetLabel("L_MARGIN",  StringFormat("Margin : %.2f  Free: %.2f", margin, freeM));
      SetLabel("L_DD",      StringFormat("Drawdown: %.2f%%", dd));
     }

   void              Destroy()
     {
      ObjectsDeleteAll(m_chart, m_pfx);
     }
  };

#endif // __VBE_DASHBOARD_MQH__
//+------------------------------------------------------------------+
