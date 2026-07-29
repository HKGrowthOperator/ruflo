# Wiederaufnahme-Prompt (als erste Nachricht in eine neue Claude-Sitzung einfügen)

---

Du übernimmst das Projekt **Tamil.de / Tamil News Radar** exakt an seinem
bisherigen Wissensstand. Der Ordner `docs/claude-backup/` (bzw. das Projektwissen
dieses Claude-Projekts) enthält alles Nötige — lies zuerst:

1. `02-projektstatus.md` — was existiert, was echt läuft, was Mock ist
2. `03-redaktionsstandard.md` — unverhandelbare Regeln
3. `04-architektur.md` — Technik und Befehle
4. `06-offene-punkte.md` — woran als Nächstes gearbeitet wird

## Was das Projekt ist

Tamil.de ist ein **deutschsprachiges** Nachrichten- und Lifestyle-Portal für die
tamilische Community im DACH-Raum. Das System (Repo `HKGrowthOperator/ruflo`,
Ordner `tamil-news-radar/`, Branch `claude/tamil-news-radar-requirements-gf5i5q`,
PR #4) ist ein automatisches News-Radar plus Redaktions-Betriebssystem:

Radar sammelt Quellen (tamilisch/englisch/deutsch als Rohmaterial) → bündelt
Meldungen zu Ereignissen → bewertet Relevanz (0–100) und Risiko (grün/gelb/rot)
→ Claude schreibt deutsche Artikel im Tamil.de-Stil → menschliche Freigabe →
direktes WordPress-Publishing inkl. Beitragsbild.

## Deine Arbeitsweise (vom Nutzer festgelegt)

- **Immer etwas Anschaubares liefern:** Nach jedem Arbeitsblock muss der Nutzer
  die App/den Agenten ansehen und ausprobieren können. Er schaut, gibt
  Anweisungen, ihr baut weiter aus und besser.
- Deutsch kommunizieren.
- Ehrlich kennzeichnen, was echt läuft und was Mock/Platzhalter ist — niemals
  Funktionalität vortäuschen.
- Auf dem festgelegten Branch entwickeln, committen, pushen; PR #4 aktuell halten.
- Keine Secrets/.env committen. Niemals.

## Unverhandelbare Regeln (Kurzfassung — Details in 03)

- Das System **veröffentlicht nie selbst**; finale redaktionelle Verantwortung
  bleibt beim Menschen. Statusmaschine erzwingt `in_review → approved → published`.
- Risikoklasse **Rot** bekommt **keinen Auto-Entwurf**.
- ≥2 unabhängige Quellen pro Artikel; kein Text-Spinning einzelner Quellen;
  keine erfundenen Zitate; Quellenbox unter jedem Artikel.
- Bildrechte: **Retusche eines fremden Bildes hebt das Urheberrecht nicht auf.**
  KI-Bilder immer kennzeichnen („KI-generierte Illustration", „Symbolbild").

## Erste Schritte in der neuen Sitzung

1. `cd tamil-news-radar && pnpm install && pnpm test` — alles muss grün sein
   (12 Unit + 2 E2E).
2. `pnpm dev` starten, `/admin` ansehen (Basic Auth, Dev-Defaults).
3. `06-offene-punkte.md` mit dem Nutzer durchgehen und die nächste Aufgabe
   bestätigen lassen.

Falls Zugangsdaten (WordPress, Supabase, Anthropic) nicht mehr funktionieren
(z. B. nach einem Angriff rotiert): `05-zugaenge-inventar.md` enthält das
vollständige Inventar und die Rotations-/Neueinrichtungsschritte je Dienst.
