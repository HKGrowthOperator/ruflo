# Roadmap & Produktvision

## Die Tier-Vision des Nutzers (O-Ton sinngemäß, 2026-07-14)

Zwei Achsen, vier Produkte. Der Wert steckt in den DATEN:

| | **Basis/Lite** (günstig) | **Premium** („das Krasse", darf teuer sein) |
|---|---|---|
| **Zwischenprüfung** | Buchwissen/Grundlagen | + auf Zwischenprüfungen abgestimmt |
| **Abschlussprüfung** | Buchwissen/Grundlagen | + Auswertung echter Altprüfungen, exakte Prüfungsgewichtung |

- Basis zieht aus dem **Fachbuch** (Quellenstufe 3–5) — gut für Grundlagen und
  Zwischenprüfung, „auch geil für Basics".
- Premium zieht zusätzlich aus **echten Altprüfungen** (Quellenstufe 1) und
  gewichtet nach dem, was laut Prüfung wirklich zählt.
- Technisch vorbereitet: Jede Frage trägt `source_level` + `exam_relevance`;
  `entitlements` hat bereits `tier` (lite/premium) und `exam_track`
  (zwischen/abschluss). Der Tier-Split ist im Kern ein **Filter auf den
  Fragenpool** + zwei Stripe-Preise.

## Nächste Schritte (priorisiert)

1. **Live gehen (Free-Live)** — Nutzer hat Option A gewählt: per
   `SCHNELLSTART.md` auf Render deployen, echte Azubis testen lassen.
   Status: Anleitung fertig, Deploy durch den Nutzer ausstehend.
2. **Rechtstexte füllen** (Platzhalter in /impressum /datenschutz /agb) — vor
   Bezahlstart Pflicht.
3. **Bezahlung scharf schalten** — Stripe-Konto + 3 Env-Werte (DEPLOYMENT.md).
4. **Tier-Filter bauen** — Fragenpool nach `source_level` filtern (lite:
   Stufe ≥3; premium: alles), zwei Stripe-Preise, Preisseite mit 2 Karten.
5. **Zwischenprüfungs-/Grundstufen-Content** — Material vom Nutzer besorgen!
   Lücken laut IHK-Recherche (`docs/ihk-struktur-recherche.md`):
   - Grundstufe/Grundbildung Bau fehlt komplett (neuer Bereich `grundstufe`)
   - Sonderkonstruktionen dünn (9 Kompetenzen), Sanieren vertiefen (30 %!)
   - Ab 1.8.2026 neue AusbauBAusbV (gestreckte Gesellenprüfung) → Zwischen-
     prüfungsprodukt wird strategisch wichtiger
6. **Skalierung bei Erfolg:** Postgres-Migration, Redis-Rate-Limit,
   E-Mail-Verifikation, echte Zeichnungen/Bilder für Planaufgaben,
   `knowledge_objects` (Mikrolektionen) befüllen.

## Was der Nutzer entscheiden muss (offene Geschäftsfragen)

- Preise je Tier (im Gespräch war 39 € als Beispiel-Einmalkauf für Vollzugang)
- Einmalkauf vs. Abo (aktuell implementiert: Einmalkauf bis Prüfung + Puffer)
- Impressums-/Firmendaten, Domain-Name
- Wann Stripe live geht (Free-Live-Testphase zuerst — bereits so gebaut)
