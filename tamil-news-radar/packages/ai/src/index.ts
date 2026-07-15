import { AnthropicProvider } from './anthropic';
import { MockProvider } from './mock';
import type { AiProvider } from './provider';

export type { AiProvider, DraftInput } from './provider';
export { AnthropicProvider } from './anthropic';
export { MockProvider } from './mock';

let cached: AiProvider | null = null;

/** Anthropic wenn ANTHROPIC_API_KEY gesetzt ist, sonst Mock. */
export function getAiProvider(): AiProvider {
  if (cached) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  cached = key ? new AnthropicProvider(key) : new MockProvider();
  return cached;
}
