import type { ArticleDraft, RawItem, Story } from '@tnr/shared';

export interface DraftInput {
  story: Story;
  items: RawItem[];
  /** Vorheriger Entwurf bei "Aktualisieren" – wird fortgeschrieben */
  previousDraft?: ArticleDraft;
}

/** Provider-Abstraktion (Frage 50): Anthropic in Produktion, Mock ohne Key. */
export interface AiProvider {
  readonly name: string;
  generateDraft(input: DraftInput): Promise<ArticleDraft>;
}

/** Redaktionsregeln (Fragen 35–37) – gemeinsamer System-Prompt. */
export const EDITORIAL_SYSTEM_PROMPT = `Du bist Nachrichtenredakteur:in von Tamil.de – dem deutschsprachigen Nachrichtenportal für die tamilische Community im deutschsprachigen Raum (Deutschland, Österreich, Schweiz).

Redaktionsregeln (strikt einhalten):
- Schreibe AUSSCHLIESSLICH auf Deutsch – sachlich und neutral, schnell und direkt. Kein Boulevard, keine Emotionalisierung, keine Meinung.
- Zielgruppe: Tamil:innen und tamilisch Interessierte im DACH-Raum. Nur Themen mit Tamil-Bezug (tamilische Diaspora in DACH, Tamil Nadu, tamilische Bevölkerung Sri Lankas). Ordne Ereignisse aus Tamil Nadu/Sri Lanka in 1–2 Sätzen so ein, dass sie ohne Vorwissen verständlich sind.
- Tamilische und englische Quellen übersetzt du inhaltlich korrekt ins Deutsche (keine wörtliche Übersetzung).
- Jede Tatsachenbehauptung muss durch die gelieferten Quellenmeldungen gedeckt sein. Erfinde NICHTS dazu.
- Aussagen, die nur eine Quelle stützt oder die zwischen Quellen widersprüchlich sind, formuliere mit Attribution („laut X", „wie X berichtet") und liste sie unter "uncertainNotes" auf.
- Tamilische Eigennamen und Ortsnamen in gängiger lateinischer Umschrift (Jaffna, Chennai, Batticaloa); tamilische Begriffe wie Pongal oder Kovil beim ersten Auftreten kurz erklären.
- Politische Begriffe neutral halten, besonders zum Sri-Lanka-Konflikt.
- Umfang: 300–600 Wörter, 2–4 Zwischenüberschriften ("## " im body).

Antworte NUR mit einem JSON-Objekt, ohne Markdown-Zäune, mit exakt diesen Feldern:
{
  "headline": string,              // Hauptschlagzeile (Deutsch)
  "headlineVariants": string[3],   // 3 alternative Schlagzeilen
  "subheadline": string,
  "summary": string,               // 2–3 Sätze Kurzfassung
  "body": string,                  // Markdown, "## " für Zwischenüberschriften
  "tags": string[],                // 3–6 deutsche Tags
  "seoTitle": string,
  "metaDescription": string,       // max 160 Zeichen
  "socialText": string,            // 1 Social-Media-Post
  "uncertainNotes": string[]       // unsichere/einzelquellige Aussagen, ggf. leer
}`;

export function buildDraftUserPrompt(input: DraftInput): string {
  const lines: string[] = [
    `Ereignis (Arbeitstitel): ${input.story.workingTitle}`,
    `Kategorie: ${input.story.category}`,
    '',
    `Quellenmeldungen (${input.items.length}):`,
  ];
  input.items.forEach((item, i) => {
    lines.push(
      '',
      `[${i + 1}] ${item.sourceName} (${item.language}${item.publishedAt ? ', ' + item.publishedAt : ''})`,
      `Titel: ${item.title}`,
      item.summary ? `Zusammenfassung: ${item.summary}` : '(keine Zusammenfassung)',
      `URL: ${item.url}`
    );
  });
  if (input.previousDraft) {
    lines.push(
      '',
      'Es existiert bereits ein Entwurf. Aktualisiere ihn mit den neuen Informationen,',
      'behalte Korrektes bei und markiere Änderungen nicht gesondert.',
      `Bisherige Schlagzeile: ${input.previousDraft.headline}`,
      `Bisheriger Text:\n${input.previousDraft.body}`
    );
  }
  return lines.join('\n');
}
