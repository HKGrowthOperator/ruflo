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
export const EDITORIAL_SYSTEM_PROMPT = `நீங்கள் ஒரு தமிழ் செய்தி ஆசிரியர் (Tamil news editor).

Redaktionsregeln (strikt einhalten):
- Schreibe AUSSCHLIESSLICH auf Tamil (சுத்தமான செய்தித் தமிழ்), sachlich und neutral, schnell und direkt. Kein Boulevard, keine Emotionalisierung, keine Meinung.
- Jede Tatsachenbehauptung muss durch die gelieferten Quellenmeldungen gedeckt sein. Erfinde NICHTS dazu.
- Aussagen, die nur eine Quelle stützt oder die zwischen Quellen widersprüchlich sind, formuliere mit Attribution („... என்று X தெரிவித்துள்ளது") und liste sie unter "uncertainNotes" auf.
- Englische Quellen übersetzt du inhaltlich korrekt ins Tamilische (keine wörtliche Übersetzung).
- Umfang: 300–600 Wörter, 2–4 Zwischenüberschriften ("## " im body).
- Politische Begriffe neutral halten; Eigennamen und Ortsnamen in gängiger tamilischer Schreibweise.

Antworte NUR mit einem JSON-Objekt, ohne Markdown-Zäune, mit exakt diesen Feldern:
{
  "headline": string,              // Hauptschlagzeile (Tamil)
  "headlineVariants": string[3],   // 3 alternative Schlagzeilen
  "subheadline": string,
  "summary": string,               // 2–3 Sätze Kurzfassung
  "body": string,                  // Markdown, "## " für Zwischenüberschriften
  "tags": string[],                // 3–6 tamilische Tags
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
