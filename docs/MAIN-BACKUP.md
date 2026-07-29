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

## 6. Einspiel-Protokoll: Wohin mit den Daten im neuen Account

**Der richtige Ort ist ein Claude-Projekt mit Projekt-Wissen — nicht ein
einzelner Chat.** Ein einzelner Chat hat begrenzten Kontext und vergisst nichts
dauerhaft Hochgeladenes über Chat-Grenzen hinweg. Projekt-Wissen dagegen ist
persistent, wird von JEDEM neuen Chat im Projekt automatisch mitgelesen und
ist genau dafür gebaut, dass sich „das System wieder neu aufbaut".

### Schritt für Schritt

1. **Projekt anlegen:** Im neuen Account ein Projekt erstellen, Name:
   `HKGO Main`.
2. **Projekt-Anweisung setzen** (Custom Instructions des Projekts) — diesen
   Text einfügen:
   > Dies ist der wiederaufgebaute Account von HK Growth Operator
   > (info@hkgrowth-operator.de). Im Projekt-Wissen liegt MAIN-BACKUP.md —
   > das ist die maßgebliche Beschreibung meiner Struktur, Repos, Connectoren,
   > Skills und Marken-Regeln (Logo: H und K lesbar, Baum erkennbar, zentriert,
   > aufrecht; AI niemals in der Krone). Die übrigen Dateien im Projekt-Wissen
   > sind Backups meiner früheren Chats. Richte dich in allen Antworten nach
   > MAIN-BACKUP.md; bei Widersprüchen gilt MAIN-BACKUP.md vor den
   > Chat-Backups. Antworte auf Deutsch.
3. **MAIN-BACKUP.md als erste Datei** ins Projekt-Wissen hochladen.
4. **Chat-Backups einzeln dazu** — als `.md`- oder `.txt`-Dateien direkt ins
   Projekt-Wissen. **Wichtig: kein ZIP** — Projekt-Wissen liest ZIP-Inhalte
   nicht; die Dateien müssen einzeln rein. (Das ZIP von der Festplatte vorher
   auf dem Rechner entpacken.)
5. **Erste Nachricht im Projekt:**
   > Lies MAIN-BACKUP.md und verschaffe dir einen Überblick über alle
   > Chat-Backups im Projekt-Wissen. Bestätige mir kurz, welche Themen du
   > wiederhergestellt hast, und baue ab jetzt auf diesem Stand auf.
6. **Bei sehr viel Material:** thematische Projekte zusätzlich anlegen
   (z. B. `HKGO Content/Higgsfield`, `HKGO Entwicklung`, `HKGO Business`) und
   die jeweiligen Chat-Backups dort einspielen — MAIN-BACKUP.md kommt in
   **jedes** dieser Projekte mit hinein.
7. **Die Code-Repos** gehören NICHT ins Projekt-Wissen — sie werden über die
   Bundles wiederhergestellt und über die GitHub-Integration/Claude Code
   verbunden (Abschnitt 2a).

### Format der Chat-Backups auf der Festplatte

Damit die automatische Integration gut funktioniert, jedes Chat-Backup so
ablegen:

- **Format:** Markdown oder reiner Text (`.md`/`.txt`) — keine Screenshots,
  kein reines PDF, wenn vermeidbar.
- **Dateiname:** `JJJJ-MM-TT_thema.md` (z. B. `2026-07-15_higgsfield-kampagne.md`).
- **Kopfzeilen** (3–5 Zeilen am Dateianfang): Thema, Zeitraum, wichtigste
  Entscheidungen/Ergebnisse. Das hilft Claude, die Datei sofort richtig
  einzuordnen.

### Rangfolge bei Konflikten

**Dieses Main Backup definiert die Struktur.** Die Einzel-Backups liefern die
inhaltlichen Details der jeweiligen Themen. Neuere Chat-Backups schlagen
ältere zum selben Thema.

---

## 7. Totalverlust-Szenario: Dienst-Daten und Account-Neuanlage

Annahme: ALLE Accounts sind weg (Claude, GitHub, Google, Shopify, Supabase,
Webflow, Onepage, Higgsfield, Canva, Figma, Descript, Asana, npm, Cloudflare,
Pinata). Es existiert nur noch die Festplatte. Dann gilt:

### Was die Festplatte abdeckt (Ordner `dienste/` im Backup)

| Dienst | Gesichert auf der Festplatte | Bei Neuanlage |
|---|---|---|
| GitHub | Komplette Repos als Bundles (`repos/`) | Neue Org `HKGrowthOperator` anlegen, Repos pushen (RESTORE.md) |
| npm | Paket-Metadaten + fertige Tarballs v3.32.26 (`dienste/npm/`) | Neuen npm-Account anlegen; Paketnamen ggf. neu registrieren; aus Repo oder Tarballs neu publishen |
| Pinata/IPFS | Plugin-Registry-JSON + CID (`dienste/pinata-registry/`) | Neuer Pinata-Account, registry.json neu pinnen, neue CID in `discovery.ts` eintragen |
| Shopify | Produkt-/Kollektions-/Shop-Export (`dienste/shopify/`) | Neuen Shop anlegen, Daten per Import/Claude wieder einspielen |
| Supabase | Schemata, Edge-Function-Code, Daten-Dumps kleiner Tabellen (`dienste/supabase/`) | Neues Projekt, Schema + Daten wieder einspielen |
| Onepage | Site-/Page-Struktur + Vibe-Section-Quellcode (`dienste/onepage/`) | Neue Site anlegen, Sections aus Code wieder aufbauen |
| Webflow | Inventar/Struktur (`dienste/webflow/`) | Site nach Inventar neu aufbauen |
| Asana | Projekte + Tasks als JSON (`dienste/asana/`) | Neu anlegen (per Claude aus JSON) |
| Google Calendar | Termin-Export (`dienste/google-calendar/`) | Termine neu anlegen |
| Google Drive | Datei-INVENTAR (`dienste/google-drive/`) | Inhalte nur via manuellem Takeout-Backup (siehe unten) |
| Higgsfield | Inventar: Websites, Voices, Characters, Generierungen (`dienste/higgsfield/`) | Assets nur wiederherstellbar, wenn Medien manuell gesichert wurden |
| Canva / Figma / Descript | Inventare (`dienste/...`) | Designs/Projekte nach Inventar neu aufbauen |

### Was NUR manuell sicherbar ist — regelmäßig selbst auf die Festplatte laden

- **Google Drive-Inhalte**: Google Takeout (https://takeout.google.com) → Export auf die Festplatte
- **Higgsfield-Medien**: generierte Videos/Bilder herunterladen; **Quell-Audios der Custom Voices und Quell-Bilder der Characters** unbedingt lokal aufheben — ohne sie sind Voices/Characters bei Account-Verlust unwiederbringlich
- **Canva-Designs**: als PDF/PNG/SVG exportieren
- **Descript-Projekte**: Timeline-Export (EDL/FCPXML) + veröffentlichte Videos herunterladen
- **Shopify-Theme und Produktbilder**: Theme-Export + Bilder-Download
- **Domains**: Domains liegen beim Registrar, nicht in diesem Backup — Registrar-Zugang und Domain-Liste in `secrets/` notieren; Auth-Codes für Domain-Umzug bereithalten
- **E-Mail-Postfach** info@hkgrowth-operator.de: eigenes Backup (IMAP-Export), denn ALLE Account-Wiederherstellungen laufen über diese Adresse — sie ist der wichtigste Single Point of Failure. Empfehlung: Zugang zum Mail-Hosting getrennt sichern (in `secrets/`), 2FA-Wiederherstellungscodes auf Papier/Festplatte

### Reihenfolge der Account-Neuanlage

1. **E-Mail-Postfach** wieder betriebsbereit machen (alles hängt daran)
2. **Claude-Account** → Projekt `HKGO Main` + Einspiel-Protokoll (Abschnitt 6)
3. **GitHub** → Repos aus Bundles pushen (Abschnitt 2a)
4. **npm + Pinata** → Pakete/Registry wieder veröffentlichen
5. **Betriebs-Dienste** nach Bedarf: Shopify, Supabase, Onepage/Webflow (+ Domains umziehen), Higgsfield, Asana, Google
6. Jeden neuen Zugang sofort in `secrets/` auf der Festplatte nachtragen

## 8. Checkliste für den Wiederaufbau

- [ ] Neuen Claude-Account mit info@hkgrowth-operator.de einrichten
- [ ] Dieses Main Backup hochladen
- [ ] GitHub verbinden, alle 4 Repos (Abschnitt 2) freigeben
- [ ] Alle Connectoren aus Abschnitt 3 neu autorisieren
- [ ] Skills `higgsfield-prompt-engineer` und `logo-consistency-guard` wieder anlegen (Abschnitt 4)
- [ ] Secrets/API-Keys neu hinterlegen (Abschnitt 5)
- [ ] Chat-Backups von der Festplatte nachladen (Abschnitt 6)
- [ ] Dienst-Daten aus `dienste/` wieder einspielen (Reihenfolge: Abschnitt 7)
- [ ] Domains beim Registrar prüfen/umziehen und neu verbinden
- [ ] Testlauf: eine Higgsfield-Generierung inkl. Logo-Check, ein Claude-Code-Task auf ruflo
