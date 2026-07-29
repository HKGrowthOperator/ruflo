import { type ArticleDraft, nowIso, truncate } from '@tnr/shared';
import type { AiProvider, DraftInput } from './provider';

/**
 * Mock-Provider (Frage 51): läuft ohne API-Key und ohne Kosten.
 * Erstellt einen rein extraktiven Entwurf aus den Quellenmeldungen –
 * kein echtes Tamil-Rewriting, aber der komplette Workflow ist testbar.
 */
export class MockProvider implements AiProvider {
  readonly name = 'mock';

  async generateDraft(input: DraftInput): Promise<ArticleDraft> {
    const deItem = input.items.find((i) => i.language === 'de');
    const lead = deItem ?? input.items[0];
    const headline = lead?.title ?? input.story.workingTitle;

    const bodyParts: string[] = [];
    if (lead?.summary) bodyParts.push(lead.summary);
    bodyParts.push('## Meldungsübersicht');
    for (const item of input.items) {
      bodyParts.push(`${item.sourceName}: ${item.title}${item.summary ? ' — ' + item.summary : ''}`);
    }
    bodyParts.push(
      '## Hinweis',
      '[MOCK-ENTWURF] Dieser Entwurf wurde ohne KI-Provider extraktiv aus den Quellen erstellt ' +
        '(Originalsprache unverändert). ANTHROPIC_API_KEY setzen, um echte deutsche Artikel zu erhalten.'
    );

    const summary = truncate(lead?.summary || headline, 240);
    return {
      headline,
      headlineVariants: input.items.slice(0, 3).map((i) => i.title),
      kicker: input.story.category,
      styleMode: 'NEWS_NEUTRAL',
      tamilConnection: 'Mock-Entwurf – Tamil-Bezug wird vom KI-Provider benannt.',
      dachConnection: '',
      subheadline: input.story.category,
      summary,
      body: bodyParts.join('\n\n'),
      tags: [input.story.category],
      seoTitle: truncate(headline, 60),
      metaDescription: truncate(summary, 160),
      socialText: truncate(`${headline} — ${summary}`, 240),
      language: 'de',
      sources: input.items.map((i) => ({
        itemId: i.id, url: i.url, sourceName: i.sourceName, title: i.title,
      })),
      uncertainNotes: input.items.length < 2 ? ['Nur eine Quelle vorhanden (Mock-Hinweis).'] : [],
      generatedAt: nowIso(),
      generator: this.name,
    };
  }
}
