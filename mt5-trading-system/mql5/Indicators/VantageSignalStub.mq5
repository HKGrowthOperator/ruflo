//+------------------------------------------------------------------+
//|                                             VantageSignalStub.mq5 |
//|   Vorlage/Contract fuer den nativen Signal-Indikator (Pine-Port)  |
//|                                                                   |
//|   Der Vantage Basket EA liest bei InpSignalSource =               |
//|   SRC_INTERNAL_INDICATOR zwei Buffer:                             |
//|     Buffer 0 = BUY-Signal  (!= 0 und != EMPTY_VALUE  -> Kauf)     |
//|     Buffer 1 = SELL-Signal (!= 0 und != EMPTY_VALUE  -> Verkauf)  |
//|                                                                   |
//|   Diese Demo nutzt einen EMA-Crossover, damit die Buffer-         |
//|   Belegung und das Repainting-/Bar-Close-Verhalten getestet       |
//|   werden koennen. FUER DEN PRODUKTIVBETRIEB die Crossover-Logik    |
//|   durch die exakte, aus Pine portierte Indikatorlogik ersetzen    |
//|   (siehe docs/LATENCY_ANALYSIS.md, Abschnitt 4 Portierungs-Guide).|
//+------------------------------------------------------------------+
#property copyright "Vantage Basket EA"
#property version   "1.00"
#property strict
#property indicator_chart_window
#property indicator_buffers 4
#property indicator_plots   2

//--- Plot BUY (Pfeil nach oben)
#property indicator_label1  "BUY"
#property indicator_type1   DRAW_ARROW
#property indicator_color1  clrDeepSkyBlue
#property indicator_width1  2
//--- Plot SELL (Pfeil nach unten)
#property indicator_label2  "SELL"
#property indicator_type2   DRAW_ARROW
#property indicator_color2  clrOrange
#property indicator_width2  2

input int  InpFastEMA = 21;   // schneller EMA
input int  InpSlowEMA = 50;   // langsamer EMA

//--- Buffer 0/1 = Signalpegel (vom EA gelesen), 2/3 = EMA-Hilfsbuffer
double BufBuy[];
double BufSell[];
double BufFast[];
double BufSlow[];

int    hFast = INVALID_HANDLE;
int    hSlow = INVALID_HANDLE;

//+------------------------------------------------------------------+
int OnInit()
  {
   SetIndexBuffer(0, BufBuy,  INDICATOR_DATA);
   SetIndexBuffer(1, BufSell, INDICATOR_DATA);
   SetIndexBuffer(2, BufFast, INDICATOR_CALCULATIONS);
   SetIndexBuffer(3, BufSlow, INDICATOR_CALCULATIONS);

   PlotIndexSetInteger(0, PLOT_ARROW, 233); // up arrow
   PlotIndexSetInteger(1, PLOT_ARROW, 234); // down arrow
   PlotIndexSetDouble(0, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(1, PLOT_EMPTY_VALUE, 0.0);

   hFast = iMA(_Symbol, PERIOD_CURRENT, InpFastEMA, 0, MODE_EMA, PRICE_CLOSE);
   hSlow = iMA(_Symbol, PERIOD_CURRENT, InpSlowEMA, 0, MODE_EMA, PRICE_CLOSE);
   if(hFast == INVALID_HANDLE || hSlow == INVALID_HANDLE)
      return(INIT_FAILED);

   IndicatorSetString(INDICATOR_SHORTNAME, "VantageSignal");
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   if(hFast != INVALID_HANDLE) IndicatorRelease(hFast);
   if(hSlow != INVALID_HANDLE) IndicatorRelease(hSlow);
  }

//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
  {
   int need = MathMax(InpFastEMA, InpSlowEMA) + 2;
   if(rates_total < need)
      return(0);

   if(CopyBuffer(hFast, 0, 0, rates_total, BufFast) <= 0) return(prev_calculated);
   if(CopyBuffer(hSlow, 0, 0, rates_total, BufSlow) <= 0) return(prev_calculated);

   int start = (prev_calculated > 1 ? prev_calculated - 1 : 1);
   for(int i = start; i < rates_total; i++)
     {
      BufBuy[i]  = 0.0;
      BufSell[i] = 0.0;
      if(BufFast[i] == 0.0 || BufSlow[i] == 0.0 || BufFast[i-1] == 0.0 || BufSlow[i-1] == 0.0)
         continue;

      // ta.crossover / ta.crossunder Aequivalent
      bool crossUp   = (BufFast[i-1] <= BufSlow[i-1] && BufFast[i] > BufSlow[i]);
      bool crossDown = (BufFast[i-1] >= BufSlow[i-1] && BufFast[i] < BufSlow[i]);

      if(crossUp)  BufBuy[i]  = low[i];   // Pfeil unter der Kerze
      if(crossDown) BufSell[i] = high[i]; // Pfeil ueber der Kerze
     }
   return(rates_total);
  }
//+------------------------------------------------------------------+
