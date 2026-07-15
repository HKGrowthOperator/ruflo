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
    const taItem = input.items.find((i) => i.language === 'ta');
    const lead = taItem ?? input.items[0];
    const headline = lead?.title ?? input.story.workingTitle;

    const bodyParts: string[] = [];
    if (lead?.summary) bodyParts.push(lead.summary);
    bodyParts.push('## செய்தி விவரங்கள்');
    for (const item of input.items) {
      bodyParts.push(`${item.sourceName}: ${item.title}${item.summary ? ' — ' + item.summary : ''}`);
    }
    bodyParts.push(
      '## குறிப்பு',
      '[MOCK-ENTWURF] Dieser Entwurf wurde ohne KI-Provider extraktiv erstellt. ' +
        'ANTHROPIC_API_KEY setzen, um echte tamilische Artikelentwürfe zu erhalten.'
    );

    const summary = truncate(lead?.summary || headline, 240);
    return {
      headline,
      headlineVariants: input.items.slice(0, 3).map((i) => i.title),
      subheadline: input.story.category,
      summary,
      body: bodyParts.join('\n\n'),
      tags: [input.story.category],
      seoTitle: truncate(headline, 60),
      metaDescription: truncate(summary, 160),
      socialText: truncate(`${headline} — ${summary}`, 240),
      language: 'ta',
      sources: input.items.map((i) => ({
        itemId: i.id, url: i.url, sourceName: i.sourceName, title: i.title,
      })),
      uncertainNotes: input.items.length < 2 ? ['Nur eine Quelle vorhanden (Mock-Hinweis).'] : [],
      generatedAt: nowIso(),
      generator: this.name,
    };
  }
}
