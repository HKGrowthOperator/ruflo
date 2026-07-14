//+------------------------------------------------------------------+
//|                                                 StateManager.mqh  |
//|   Vantage Basket EA - Persistenz & Wiederherstellung (Repository) |
//+------------------------------------------------------------------+
#property strict
#ifndef __VBE_STATEMANAGER_MQH__
#define __VBE_STATEMANAGER_MQH__

#include "Logger.mqh"

//+------------------------------------------------------------------+
//| Persistiert den EA-Zustand mehrschichtig:                        |
//|   1. GlobalVariables (primaer, ueberlebt Reload/Neustart)        |
//|   2. JSON-Backup-Datei (ueberlebt auch GV-Verlust)               |
//| Schluessel sind Magic-scoped -> mehrere Instanzen kollidieren    |
//| nicht.                                                           |
//+------------------------------------------------------------------+
class CStateManager
  {
private:
   long      m_magic;
   string    m_symTag;    // bereinigtes Symbol fuer Schluessel/Dateinamen
   CLogger  *m_log;
   string    m_gvCounter;
   string    m_gvCycle;
   string    m_gvSeq;
   string    m_backupFile;

   //--- Symbol fuer GV-Namen/Dateinamen safe machen (nur alnum, sonst '_')
   string            Sanitize(const string s) const
     {
      string out = "";
      int len = StringLen(s);
      for(int i = 0; i < len; i++)
        {
         ushort c = StringGetCharacter(s, i);
         if((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z'))
            out += ShortToString(c);
         else
            out += "_";
        }
      return(out);
     }

   string            BuildKey(const string suffix) const
     {
      return(StringFormat("VBE_%I64d_%s_%s", m_magic, m_symTag, suffix));
     }

   void              WriteBackup(int counter, int cycleId, ulong lastSeq)
     {
      int h = FileOpen(m_backupFile, FILE_WRITE | FILE_TXT | FILE_ANSI);
      if(h == INVALID_HANDLE)
        {
         if(m_log != NULL)
            m_log.Warn("StateManager: Backup-Datei nicht schreibbar: " + m_backupFile);
         return;
        }
      string json = StringFormat(
                       "{\"magic\":%I64d,\"counter\":%d,\"cycleId\":%d,\"lastSeq\":%I64u,\"ts\":%I64d}",
                       m_magic, counter, cycleId, lastSeq, (long)TimeCurrent());
      FileWriteString(h, json);
      FileClose(h);
     }

   //--- naiver JSON-Feldextraktor (nur fuer unser eigenes Format)
   bool              ReadBackupField(const string json, const string field, double &outVal)
     {
      string needle = "\"" + field + "\":";
      int p = StringFind(json, needle);
      if(p < 0)
         return(false);
      p += StringLen(needle);
      int len = StringLen(json);
      string num = "";
      while(p < len)
        {
         ushort c = StringGetCharacter(json, p);
         if((c >= '0' && c <= '9') || c == '-' || c == '.')
            num += ShortToString(c);
         else if(num != "")
            break;
         p++;
        }
      if(num == "")
         return(false);
      outVal = StringToDouble(num);
      return(true);
     }

   bool              ReadBackup(int &counter, int &cycleId, ulong &lastSeq)
     {
      if(!FileIsExist(m_backupFile))
         return(false);
      int h = FileOpen(m_backupFile, FILE_READ | FILE_TXT | FILE_ANSI);
      if(h == INVALID_HANDLE)
         return(false);
      string json = "";
      while(!FileIsEnding(h))
         json += FileReadString(h);
      FileClose(h);

      double c, cy, sq;
      if(!ReadBackupField(json, "counter", c))
         return(false);
      ReadBackupField(json, "cycleId", cy);
      ReadBackupField(json, "lastSeq", sq);
      counter = (int)c;
      cycleId = (cy < 1 ? 1 : (int)cy);
      lastSeq = (ulong)sq;
      return(true);
     }

public:
                     CStateManager() : m_magic(0), m_symTag(""), m_log(NULL) {}

   void              Init(long magic, const string symbol, CLogger *logger)
     {
      m_magic      = magic;
      m_symTag     = Sanitize(symbol);
      m_log        = logger;
      m_gvCounter  = BuildKey("counter");
      m_gvCycle    = BuildKey("cycle");
      m_gvSeq      = BuildKey("seq");
      m_backupFile = StringFormat("VBE_state_%I64d_%s.json", m_magic, m_symTag);
     }

   //--- Zustand speichern (nach jeder Aenderung aufrufen)
   void              Save(int counter, int cycleId, ulong lastSeq)
     {
      GlobalVariableSet(m_gvCounter, (double)counter);
      GlobalVariableSet(m_gvCycle,   (double)cycleId);
      GlobalVariableSet(m_gvSeq,     (double)lastSeq);
      WriteBackup(counter, cycleId, lastSeq);
     }

   //--- Zustand laden. Rueckgabe: true wenn eine Quelle gefunden wurde. |
   //--- Reihenfolge: GlobalVariable -> Backup-Datei                     |
   bool              Load(int &counter, int &cycleId, ulong &lastSeq)
     {
      if(GlobalVariableCheck(m_gvCounter))
        {
         counter = (int)GlobalVariableGet(m_gvCounter);
         cycleId = (GlobalVariableCheck(m_gvCycle) ? (int)GlobalVariableGet(m_gvCycle) : 1);
         lastSeq = (GlobalVariableCheck(m_gvSeq)   ? (ulong)GlobalVariableGet(m_gvSeq) : 0);
         if(cycleId < 1) cycleId = 1;
         if(m_log != NULL)
            m_log.Event("STATE_RESTORE", StringFormat("Quelle=GlobalVariable counter=%d cycle=%d seq=%I64u",
                        counter, cycleId, lastSeq));
         return(true);
        }

      if(ReadBackup(counter, cycleId, lastSeq))
        {
         // GV aus Backup wiederherstellen
         Save(counter, cycleId, lastSeq);
         if(m_log != NULL)
            m_log.Event("STATE_RESTORE", StringFormat("Quelle=BackupDatei counter=%d cycle=%d seq=%I64u",
                        counter, cycleId, lastSeq));
         return(true);
        }
      return(false);
     }

   //--- kompletten persistenten Zustand loeschen (z. B. bei Bereinigung)
   void              Clear()
     {
      GlobalVariableDel(m_gvCounter);
      GlobalVariableDel(m_gvCycle);
      GlobalVariableDel(m_gvSeq);
      if(FileIsExist(m_backupFile))
         FileDelete(m_backupFile);
     }
  };

#endif // __VBE_STATEMANAGER_MQH__
//+------------------------------------------------------------------+
