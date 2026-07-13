"""VBE MT5 webhook bridge.

Fallback signal path: receives TradingView webhook alerts and appends
them to the JSON-Lines signal file the MT5 Expert Advisor polls. This
package never places trades -- all trade logic lives in the EA
(``mql5/Experts/VantageBasketEA.mq5``).
"""
