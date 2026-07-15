import Anthropic from '@anthropic-ai/sdk';
import { type ArticleDraft, nowIso, truncate } from '@tnr/shared';
import {
  type AiProvider, type DraftInput,
  EDITORIAL_SYSTEM_PROMPT, buildDraftUserPrompt,
} from './provider';

export class AnthropicProvider implements AiProvider {
  readonly name: string;
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
    this.name = `anthropic:${model}`;
  }

  async generateDraft(input: DraftInput): Promise<ArticleDraft> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4000,
      system: EDITORIAL_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildDraftUserPrompt(input) }],
    });
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    const parsed = parseDraftJson(text);
    return {
      headline: str(parsed.headline, input.story.workingTitle),
      headlineVariants: strArr(parsed.headlineVariants).slice(0, 3),
      subheadline: str(parsed.subheadline, ''),
      summary: str(parsed.summary, ''),
      body: str(parsed.body, ''),
      tags: strArr(parsed.tags).slice(0, 6),
      seoTitle: str(parsed.seoTitle, str(parsed.headline, input.story.workingTitle)),
      metaDescription: truncate(str(parsed.metaDescription, str(parsed.summary, '')), 160),
      socialText: str(parsed.socialText, ''),
      language: 'ta',
      sources: input.items.map((i) => ({
        itemId: i.id, url: i.url, sourceName: i.sourceName, title: i.title,
      })),
      uncertainNotes: strArr(parsed.uncertainNotes),
      generatedAt: nowIso(),
      generator: this.name,
    };
  }
}

/** JSON aus der Modellantwort holen – tolerant gegenüber ```-Zäunen. */
function parseDraftJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('KI-Antwort enthält kein JSON');
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
}

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()) : [];
}
