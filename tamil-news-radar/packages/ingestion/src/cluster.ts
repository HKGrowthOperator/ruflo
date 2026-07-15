import type { RawItem, Story } from '@tnr/shared';
import { titleSimilarity, tokenize } from '@tnr/shared';

/**
 * Ereignis-Clustering (Frage 20): Eine neue Meldung gehört zu einer
 * bestehenden Story, wenn ihr Titel dem Arbeitstitel oder einem der
 * bereits zugeordneten Titel ähnlich genug ist (Jaccard auf Tokens).
 * Bewusst einfach gehalten – pgvector/Embeddings sind der V2-Ausbau.
 */
export interface ClusterCandidate {
  story: Story;
  titleTokens: Set<string>[];
}

export function buildCandidate(story: Story, itemTitles: string[]): ClusterCandidate {
  return {
    story,
    titleTokens: [story.workingTitle, ...itemTitles].map(tokenize),
  };
}

export function findMatchingStory(
  item: RawItem,
  candidates: ClusterCandidate[],
  threshold: number
): Story | null {
  const itemTokens = tokenize(item.title);
  let best: { story: Story; score: number } | null = null;
  for (const candidate of candidates) {
    for (const tokens of candidate.titleTokens) {
      const score = titleSimilarity(itemTokens, tokens);
      if (score >= threshold && (!best || score > best.score)) {
        best = { story: candidate.story, score };
      }
    }
  }
  return best?.story ?? null;
}
