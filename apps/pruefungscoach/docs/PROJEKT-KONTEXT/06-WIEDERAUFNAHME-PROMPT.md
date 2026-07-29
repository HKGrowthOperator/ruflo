# Wiederaufnahme-Prompt

Kopiere den folgenden Text als erste Nachricht in einen neuen Claude-Chat
(mit Zugriff auf das Repository `HKGrowthOperator/ruflo`):

---

Ich arbeite am Projekt **„Prüfungscoach Trockenbau"** weiter — einer fertigen,
adaptiven Lern- und Prüfungs-Web-App (PWA) für die IHK-Abschlussprüfung
Trockenbaumonteur. Das Projekt wurde bereits vollständig gebaut und der gesamte
Kontext liegt strukturiert vor. Bitte arbeite dich ZUERST ein, bevor du etwas
änderst:

1. Lies `apps/pruefungscoach/docs/PROJEKT-KONTEXT/01-PROJEKTSTAND.md`
   (Was gebaut ist, Architektur, bewusste Entscheidungen, bekannte Grenzen).
2. Lies `05-ROADMAP.md` (Produktvision Basis/Premium × Zwischen-/Abschluss-
   prüfung und die priorisierten nächsten Schritte) und `03-QUELLEN.md`
   (Datenquellen).
3. Der ursprüngliche Bau-Auftrag steht in `02-MASTERBRIEF.md` — er ist
   umgesetzt; er gilt weiter als Qualitätsmaßstab (deterministische Logik,
   keine erfundenen Systemwerte, Active Recall statt Chatbot).
4. Verifiziere den Stand selbst: `cd apps/pruefungscoach && npm install &&
   npm run db:reset && npm test && npm run build` (erwartet: ~85 Tests grün,
   Build grün).

Wichtige Grundregeln des Projekts:
- Punkte/Mastery/Prioritäten/Intervalle berechnet IMMER deterministischer Code;
  KI ordnet nur freie Antworten Kriterien zu (Zod-validiert, mit Fallback).
- Keine erfundenen Fachwerte: Zahlen nur aus den Quellen in `seed/sources/`.
- Ohne Stripe-Env läuft alles kostenlos (Free-Live); Demo-Logins existieren nur
  ohne `ADMIN_PASSWORD`.
- Branch-Konvention und offener PR: siehe `01-PROJEKTSTAND.md`.

Mein aktuelles Ziel: [HIER EINSETZEN — z. B. „Render-Deploy abschließen",
„Tier-Filter Basis/Premium bauen", „Zwischenprüfungs-Inhalte ergänzen, Material
liegt bei" oder was gerade ansteht].

---

**Tipp:** Wenn der neue Chat keinen Repo-Zugriff hat, lade zusätzlich diesen
kompletten PROJEKT-KONTEXT-Ordner hoch — er enthält alles Wissen; der Code
selbst muss dann über GitHub geklont werden.
