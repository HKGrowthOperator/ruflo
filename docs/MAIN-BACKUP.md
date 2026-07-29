# MAIN BACKUP — Claude Account Recovery (HK Growth Operator)

> **⚠️ DIESES DOKUMENT ZUERST HOCHLADEN.**
> Dies ist das **Main Backup** für den Claude-Account von HK Growth Operator
> (info@hkgrowth-operator.de). Wenn der Account komplett ausfällt oder gelöscht
> wurde, wird dieses Dokument als **erstes** in den neuen Claude-Account geladen.
> Es enthält die Gesamtstruktur des Setups. Erst danach werden die separaten
> Chat-Backups von der externen Festplatte einzeln nachgeladen.
>
> Stand: 2026-07-29

---

## 1. Zweck und Wiederherstellungs-Reihenfolge

**Dieses Backup ist GitHub-unabhängig.** Es funktioniert auch dann vollständig,
wenn es keinerlei Zugriff mehr auf GitHub gibt (Account weg, Organisation weg,
Verbindung weg). Alle vier Repositories liegen als Offline-Kopien
(`.bundle`-Dateien mit kompletter Git-Historie, allen Branches und Tags) neben
diesem Dokument auf der externen Festplatte im Ordner
`HKGO-MAIN-BACKUP-2026-07-29/repos/`.

1. **Main Backup (dieses Dokument) hochladen** — Claude kennt danach die
   Gesamtstruktur: Repos, Connectoren, Skills, Marken-Regeln, Arbeitsweise.
2. **Repos aus den Offline-Bundles wiederherstellen** (siehe `RESTORE.md` auf
   der Festplatte, Kurzform in Abschnitt 2a). Die Repos enthalten die
   eigentlichen Konfigurationen (CLAUDE.md, Skills, Agents, Hooks). Falls
   GitHub noch/wieder existiert, können die Repos alternativ von dort geklont
   werden — die Bundles sind aber die maßgebliche Sicherung.
3. **Neues Git-Hosting einrichten** (GitHub-Account/Organisation neu anlegen
   oder Alternative wie GitLab/Codeberg) und die wiederhergestellten Repos
   dorthin pushen. Danach die Git-Integration im Claude-Account verbinden.
4. **Connectoren neu verbinden** (Abschnitt 3). Auth-Tokens lassen sich nicht
   sichern — jede Verbindung muss einmal neu autorisiert werden.
5. **Chat-Backups von der Festplatte** einzeln in neue Projekte/Chats laden
   (Abschnitt 6), damit die inhaltlichen Kontexte der großen Chats zurückkommen.

**Was dieses Backup abdeckt:** Struktur, Konfiguration, Regeln, Workflows und
den kompletten Code samt Git-Historie aller vier Repos (offline).
**Was es nicht abdecken kann:** Chat-Verläufe (liegen separat auf der
Festplatte), Login-Daten/Tokens der Connectoren, Abo- und Account-Einstellungen
bei Anthropic, GitHub-Metadaten (Issues, PR-Diskussionen, Actions-Logs,
Repo-Einstellungen). Diese müssen manuell neu eingerichtet werden.

---

## 2. GitHub-Repositories (Organisation: `HKGrowthOperator`)

Alle vier Repos für Claude (GitHub-App / Claude Code) freigeben:

| Repo | Zweck |
|---|---|
| `HKGrowthOperator/ruflo` | Hauptprojekt: Claude Flow v3.x Multi-Agent-Orchestrierung (CLI-Pakete `@claude-flow/cli`, `claude-flow`, `ruflo` auf npm; MCP-Tools, AgentDB-Memory, Hooks, Plugins, IPFS/Pinata-Plugin-Registry) |
| `HKGrowthOperator/claude-code-best-practice` | Referenz-Repo für Claude-Code-Konfiguration: Skills, Subagents, Hooks, Commands, Sound-Hooks, Präsentationen. Bei Best-Practice-Fragen wird **zuerst hier** gesucht |
| `HKGrowthOperator/impeccable` | Frontend-Design-Skill `/impeccable` (23 Commands), CLI `npx impeccable`, Chrome-Extension, Website (Astro auf Cloudflare Pages) |
| `HKGrowthOperator/taste-skill` | Anti-Slop Agent Skills für Premium-Frontends + Image-Generation-Skills (Referenz-Boards), installierbar via `npx skills add` |

**Wichtig:** Jedes Repo trägt seine eigene `CLAUDE.md` (bei ruflo zusätzlich
`CLAUDE.local.md`) mit den verbindlichen Projektregeln. Nach dem Klonen gelten
diese automatisch — sie müssen nicht aus diesem Dokument rekonstruiert werden.
Dieses Dokument liegt in `ruflo/docs/MAIN-BACKUP.md` und ist damit selbst
git-gesichert (und zusätzlich als eigenständige Datei auf der Festplatte).

### 2a. Offline-Wiederherstellung der Repos (ohne GitHub)

Auf der Festplatte liegen im Backup-Ordner unter `repos/` vier Dateien:
`ruflo.bundle`, `claude-code-best-practice.bundle`, `impeccable.bundle`,
`taste-skill.bundle`. Jede enthält das **komplette** Repository — alle Commits,
alle Branches, alle Tags. Wiederherstellung auf einem beliebigen Rechner mit
Git (kein Internet nötig):

```bash
git clone ruflo.bundle ruflo
git clone claude-code-best-practice.bundle claude-code-best-practice
git clone impeccable.bundle impeccable
git clone taste-skill.bundle taste-skill
```

Danach optional auf neues Hosting pushen:

```bash
cd ruflo
git remote set-url origin <neue-git-url>
git push --all origin && git push --tags origin
```

Integrität prüfen (vor dem Restore empfohlen): `git bundle verify <datei>.bundle`
sowie Abgleich mit `SHA256SUMS.txt` im Backup-Ordner
(`sha256sum -c SHA256SUMS.txt`).

### Kernregeln aus den CLAUDE.md-Dateien (Kurzfassung)

- **ruflo:** Nichts in den Root-Ordner speichern (`/src`, `/tests`, `/docs`,
  `/config`, `/scripts`, `/examples`); Dateien unter 500 Zeilen; alle
  zusammengehörigen Operationen in EINER Nachricht bündeln (Concurrency-Regel);
  Swarms hierarchisch mit max. 6–8 Agents; beim npm-Publish immer alle drei
  Pakete (`@claude-flow/cli`, `claude-flow`, `ruflo`) und alle Dist-Tags
  (`latest`, `alpha`, `v3alpha`) aktualisieren; niemals Secrets/.env committen.
- **claude-code-best-practice:** CLAUDE.md unter 200 Zeilen halten; separate
  Commits pro Datei; Command → Agent → Skill-Architektur (Weather-Beispiel).
- **impeccable:** Ein Skill `/impeccable` mit 23 Commands; Prose-Validator
  (Denylist gegen KI-Floskeln, keine Em-Dashes); drei unabhängig versionierte
  Komponenten (CLI, Skill, Extension) mit eigenen Release-Tags.
- **taste-skill:** Skills liegen in `skills/`, Installation über
  `npx skills add`.

---

## 3. Connectoren / MCP-Server (neu autorisieren)

Diese Dienste waren mit dem Account verbunden und müssen im neuen Account
über die Connector-Einstellungen neu verbunden werden:

- **GitHub** (Organisation HKGrowthOperator, siehe Abschnitt 2)
- **Google Drive**
- **Google Calendar**
- **Asana**
- **Canva**
- **Figma**
- **Descript**
- **Shopify**
- **Supabase**
- **Webflow**
- **Onepage**
- **Higgsfield** (KI-Bild/Video/Audio-Generierung — zentral für Content-Produktion)

---

## 4. Eigene Skills und Marken-Regeln (HK Growth Operator)

Zwei eigene Skills gehören fest zum Setup und müssen im neuen Account wieder
eingerichtet werden (als Skills/Projekt-Anweisungen):

### 4.1 `higgsfield-prompt-engineer`
Schreibt fertige Higgsfield-Video-/Bild-Prompts im **HK Growth Operator
House Style**. Einsatz: Wenn ein Szenenplan existiert und konkrete
Copy-Paste-Prompts gebraucht werden — mit Startbild, Motion, Look, Kamera,
Dauer, Modell/Settings und Negativ-Prompt.

### 4.2 `logo-consistency-guard`
Quality-Gate für **jede** HK-Growth-Operator-Generierung. Prüft vor dem
Behalten eines generierten Clips/Bildes:

- Logo intakt: **H und K lesbar**, **Baum erkennbar**, **zentriert**, **aufrecht**
- Keine Marken-Restriktion verletzt — insbesondere: **„AI niemals in der Krone"**

Diese Marken-Regeln gelten unabhängig vom Skill immer für alle Generierungen.

### 4.3 Weitere aktive Skills/Workflows
- `/morning` — Morning Brief als gestylter HTML-Artifact (werktags einrichtbar)
- `internal-comms` — Formate für interne Kommunikation
- Skills aus den Repos (impeccable, taste-skill, ruflo-Skills) kommen
  automatisch über die Repos zurück.

---

## 5. Arbeitsumgebung und Konventionen

- **Sprache:** Der Operator schreibt Deutsch; Antworten auf Deutsch.
- **E-Mail / Identität:** info@hkgrowth-operator.de
- **Claude Code (Remote/Web):** Sessions arbeiten auf Feature-Branches nach dem
  Muster `claude/<thema>-<suffix>`; Entwicklung nie direkt auf `main`;
  nach Push wird ein Draft-PR erstellt.
- **npm-Pakete im Besitz:** `@claude-flow/cli`, `claude-flow`, `ruflo`
  (Publishing-Regeln in `ruflo/CLAUDE.md`).
- **Plugin-Registry:** IPFS via Pinata; Credentials liegen ausschließlich in
  lokalen `.env`-Dateien (nie im Git — im neuen Setup neu hinterlegen:
  `PINATA_API_KEY`, `PINATA_API_SECRET`, `PINATA_API_JWT`).
- **Weitere neu zu hinterlegende Secrets:** `ANTHROPIC_API_KEY`,
  `OPENAI_API_KEY`, `GOOGLE_API_KEY` (für ruflo/claude-flow-Provider),
  npm-Publish-Rechte für die drei Pakete.

---

## 6. Chat-Backups auf der externen Festplatte

Aus allen großen aktuellen Chats wurden separate Backups gezogen und auf einer
externen Festplatte gesichert. Wiederherstellung:

1. Zuerst dieses **Main Backup** hochladen (macht Claude die Struktur bekannt).
2. Danach die einzelnen Chat-Backups von der Festplatte jeweils in einen neuen
   Chat bzw. das passende Projekt hochladen und Claude bitten, den Kontext des
   jeweiligen Chats daraus zu übernehmen.
3. Bei Konflikten gilt: **Dieses Main Backup definiert die Struktur**, die
   Einzel-Backups liefern die inhaltlichen Details der jeweiligen Themen.

---

## 7. Checkliste für den Wiederaufbau

- [ ] Neuen Claude-Account mit info@hkgrowth-operator.de einrichten
- [ ] Dieses Main Backup hochladen
- [ ] GitHub verbinden, alle 4 Repos (Abschnitt 2) freigeben
- [ ] Alle Connectoren aus Abschnitt 3 neu autorisieren
- [ ] Skills `higgsfield-prompt-engineer` und `logo-consistency-guard` wieder anlegen (Abschnitt 4)
- [ ] Secrets/API-Keys neu hinterlegen (Abschnitt 5)
- [ ] Chat-Backups von der Festplatte nachladen (Abschnitt 6)
- [ ] Testlauf: eine Higgsfield-Generierung inkl. Logo-Check, ein Claude-Code-Task auf ruflo
