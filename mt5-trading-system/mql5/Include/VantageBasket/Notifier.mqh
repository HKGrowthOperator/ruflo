//+------------------------------------------------------------------+
//|                                                     Notifier.mqh  |
//|   Vantage Basket EA - Benachrichtigungen (Push/E-Mail/Telegram)   |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_NOTIFIER_MQH__
#define __VBE_NOTIFIER_MQH__

#include "Config.mqh"
#include "Logger.mqh"

//+------------------------------------------------------------------+
//| Alle Kanaele sind optional. Fehler beim Versand blockieren       |
//| niemals die Handelslogik (nur Warnung im Log).                   |
//+------------------------------------------------------------------+
class CNotifier
  {
private:
   SConfig    m_cfg;
   CLogger   *m_log;

   void              SendTelegram(const string text)
     {
      if(!m_cfg.enableTelegram)
         return;
      if(m_cfg.telegramToken == "" || m_cfg.telegramChatId == "")
        { if(m_log != NULL) m_log.Warn("Notifier: Telegram-Token/ChatId fehlt"); return; }

      string url = "https://api.telegram.org/bot" + m_cfg.telegramToken + "/sendMessage";
      // application/x-www-form-urlencoded
      string payload = "chat_id=" + m_cfg.telegramChatId + "&text=" + UrlEncode(text);

      uchar post[], result[];
      string headers = "Content-Type: application/x-www-form-urlencoded\r\n";
      StringToCharArray(payload, post, 0, StringLen(payload), CP_UTF8);
      // trailing \0 entfernen
      int postLen = ArraySize(post);
      if(postLen > 0 && post[postLen - 1] == 0) ArrayResize(post, postLen - 1);

      string resHeaders;
      ResetLastError();
      int code = WebRequest("POST", url, headers, 5000, post, result, resHeaders);
      if(code == -1 && m_log != NULL)
         m_log.Warn(StringFormat("Notifier: Telegram WebRequest fehlgeschlagen (Err=%d). URL in Terminal-Optionen erlauben?", GetLastError()));
     }

   //--- minimal URL-Encoding fuer den Telegram-Text
   string            UrlEncode(const string s)
     {
      string out = "";
      int len = StringLen(s);
      for(int i = 0; i < len; i++)
        {
         ushort c = StringGetCharacter(s, i);
         if((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
            (c >= '0' && c <= '9') || c == '-' || c == '_' || c == '.' || c == '~')
            out += ShortToString(c);
         else if(c == ' ')
            out += "%20";
         else
            out += StringFormat("%%%02X", c);
        }
      return(out);
     }

public:
                     CNotifier() : m_log(NULL) {}

   void              Init(const SConfig &cfg, CLogger *logger)
     {
      m_cfg = cfg;
      m_log = logger;
     }

   //--- zentrale Versandmethode
   void              Notify(const string title, const string msg)
     {
      string full = title + ": " + msg;

      if(m_cfg.enablePushNotify)
        {
         if(!SendNotification(full) && m_log != NULL)
            m_log.Warn("Notifier: Push fehlgeschlagen (MetaQuotes-ID gesetzt?)");
        }
      if(m_cfg.enableEmailNotify)
        {
         if(!SendMail(title, msg) && m_log != NULL)
            m_log.Warn("Notifier: E-Mail fehlgeschlagen (SMTP in Optionen konfiguriert?)");
        }
      if(m_cfg.enableTelegram)
         SendTelegram(full);
     }
  };

#endif // __VBE_NOTIFIER_MQH__
//+------------------------------------------------------------------+
