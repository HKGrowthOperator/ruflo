import type { Store } from '@tnr/database';
import { type Story, type StoryStatus, newId, nowIso } from '@tnr/shared';

/**
 * Statusmaschine (Frage 23/24): Veröffentlichung nur über den Pfad
 * in_review → approved → published. Vollautomatik existiert bewusst nicht.
 */
export const TRANSITIONS: Record<string, { from: StoryStatus[]; to: StoryStatus }> = {
  submit_review:    { from: ['drafted', 'changes_requested', 'updated'], to: 'in_review' },
  request_changes:  { from: ['in_review'], to: 'changes_requested' },
  approve:          { from: ['in_review'], to: 'approved' },
  unapprove:        { from: ['approved', 'scheduled'], to: 'in_review' },
  publish:          { from: ['approved'], to: 'published' },
  archive:          { from: ['detected', 'researching', 'drafted', 'in_review', 'changes_requested', 'approved', 'published', 'updated'], to: 'archived' },
  unarchive:        { from: ['archived'], to: 'drafted' },
};

export type TransitionAction = keyof typeof TRANSITIONS;

export function canTransition(story: Story, action: TransitionAction): boolean {
  return TRANSITIONS[action]?.from.includes(story.status) ?? false;
}

export async function applyTransition(
  store: Store,
  story: Story,
  action: TransitionAction,
  actor: string,
  note?: string
): Promise<Story> {
  const rule = TRANSITIONS[action];
  if (!rule) throw new Error(`Unbekannte Aktion "${action}"`);
  if (!rule.from.includes(story.status)) {
    throw new Error(`Aktion "${action}" ist im Status "${story.status}" nicht erlaubt`);
  }
  if (action === 'publish' && !story.draft) {
    throw new Error('Veröffentlichen ohne Entwurf ist nicht möglich');
  }

  const patch: Partial<Story> = { status: rule.to, updatedAt: nowIso() };
  if (note !== undefined) patch.reviewNote = note;
  if (action === 'publish') patch.publishedAt = nowIso();
  await store.updateStory(story.id, patch);
  await store.addAudit({
    id: newId('aud'),
    at: nowIso(),
    actor,
    action: `story.${action}`,
    storyId: story.id,
    detail: note || `${story.status} → ${rule.to}`,
  });
  return { ...story, ...patch };
}
