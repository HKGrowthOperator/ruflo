import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { withPaidUser } from '@/lib/api-helpers';
import { getOrCreateTodayPlan, pickQuestionForItem } from '@/lib/services/plan';
import { loadQuestion, toPublicQuestion } from '@/lib/services/questions';

/**
 * Liefert die nächste Aufgabe der heutigen Session:
 * erstes offenes Plan-Item + passende Frage (ohne Lösungen).
 */
export async function GET(): Promise<NextResponse> {
  return withPaidUser(async (user) => {
    const plan = getOrCreateTodayPlan(user.id);
    if (!plan) throw new Error('Onboarding fehlt');
    const open = plan.items.filter((i) => i.status === 'pending');
    const db = getDb();

    for (const item of open) {
      const pick = pickQuestionForItem(user.id, item.id);
      if (pick) {
        const q = loadQuestion(pick.questionId);
        if (q) {
          return {
            done: false,
            planItemId: item.id,
            kind: item.kind,
            competencyTitle: item.competencyTitle,
            progress: { done: plan.doneCount, total: plan.items.length },
            question: toPublicQuestion(q),
          };
        }
      }
      // keine Frage verfügbar → Item überspringen
      db.prepare(`UPDATE study_plan_items SET status = 'skipped' WHERE id = ?`).run(item.id);
    }
    return { done: true, progress: { done: plan.doneCount, total: plan.items.length } };
  });
}
