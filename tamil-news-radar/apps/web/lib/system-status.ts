import { getStore } from '@tnr/database';
import { getWordPressConfig } from '@tnr/editorial';
import type { AuditEntry, RadarRunReport, Source, Story, StoryStatus } from '@tnr/shared';

/** Realer Systemzustand – ausschließlich aus Store/Audit/Env abgeleitet, nichts simuliert. */
export interface SystemStatus {
  lastRun: RadarRunReport | null;
  /** Erwarteter nächster Cron-Lauf (letzter Lauf + 30 Min) */
  nextRunAt: string | null;
  runHistory: RadarRunReport[];
  sourceErrors: Source[];
  enabledSources: number;
  totalSources: number;
  /** true = Anthropic-Key gesetzt, false = Mock-Provider (extraktiv) */
  aiLive: boolean;
  wpConfigured: boolean;
  wpErrors: AuditEntry[];
  tokens: { input: number; output: number; drafts: number };
  queue: Partial<Record<StoryStatus, number>>;
  stories: Story[];
  audit: AuditEntry[];
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const store = getStore();
  const [sources, stories, audit] = await Promise.all([
    store.listSources(),
    store.listStories({ limit: 300 }),
    store.listAudit(300),
  ]);

  const runHistory: RadarRunReport[] = [];
  for (const entry of audit) {
    if (entry.action !== 'radar.run' || !entry.detail) continue;
    try { runHistory.push(JSON.parse(entry.detail) as RadarRunReport); } catch { /* altformat */ }
    if (runHistory.length >= 20) break;
  }
  const lastRun = runHistory[0] ?? null;
  const nextRunAt = lastRun
    ? new Date(new Date(lastRun.finishedAt).getTime() + 30 * 60_000).toISOString()
    : null;

  const tokens = { input: 0, output: 0, drafts: 0 };
  for (const story of stories) {
    if (story.draft?.usage) {
      tokens.input += story.draft.usage.inputTokens;
      tokens.output += story.draft.usage.outputTokens;
      tokens.drafts++;
    }
  }

  const queue: Partial<Record<StoryStatus, number>> = {};
  for (const story of stories) queue[story.status] = (queue[story.status] ?? 0) + 1;

  return {
    lastRun,
    nextRunAt,
    runHistory,
    sourceErrors: sources.filter((s) => s.enabled && s.lastFetchStatus === 'error'),
    enabledSources: sources.filter((s) => s.enabled).length,
    totalSources: sources.length,
    aiLive: Boolean(process.env.ANTHROPIC_API_KEY),
    wpConfigured: getWordPressConfig() !== null,
    wpErrors: audit.filter((a) => a.action === 'wordpress.error').slice(0, 10),
    tokens,
    queue,
    stories,
    audit,
  };
}

/** Grobe Kostenschätzung (Sonnet-Klasse) für die Anzeige im Systemstatus. */
export function estimateCostEur(tokens: { input: number; output: number }): number {
  const usd = (tokens.input / 1_000_000) * 3 + (tokens.output / 1_000_000) * 15;
  return Math.round(usd * 0.92 * 100) / 100;
}
