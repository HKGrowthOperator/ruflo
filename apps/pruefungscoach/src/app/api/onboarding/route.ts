import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { parseBody, withUser } from '@/lib/api-helpers';
import { daysUntil, planModeForDaysLeft } from '@/lib/domain/modes';

const schema = z.object({
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  examPartFocus: z.enum(['tk', 'san', 'beide']).default('beide'),
  goal: z.enum(['bestehen', 'gut_bestehen', 'sehr_gut']).default('bestehen'),
  minutesWeekday: z.number().int().min(10).max(600),
  minutesWeekend: z.number().int().min(0).max(600),
  learnTime: z.enum(['morgens', 'mittags', 'abends', 'wechselnd']).default('abends'),
  focusBlockMinutes: z.number().int().min(10).max(90).default(25),
  selfAssessment: z.number().int().min(1).max(5),
  lehrjahr: z.number().int().min(1).max(4).default(3),
  adhs: z.boolean().default(false),
  konzentration: z.boolean().default(false),
  pruefungsangst: z.boolean().default(false),
  rechenprobleme: z.boolean().default(false),
  sprache: z.boolean().default(false),
});

export async function POST(req: Request): Promise<NextResponse> {
  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;
  return withUser(async (user) => {
    const db = getDb();
    const mode = planModeForDaysLeft(daysUntil(body.examDate));
    db.prepare(`
      INSERT INTO learner_profiles (user_id, lehrjahr, exam_date, exam_part_focus, goal, minutes_weekday,
        minutes_weekend, learn_time, focus_block_minutes, self_assessment, adhs, konzentration,
        pruefungsangst, rechenprobleme, sprache, mode, onboarded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        lehrjahr = excluded.lehrjahr, exam_date = excluded.exam_date,
        exam_part_focus = excluded.exam_part_focus, goal = excluded.goal,
        minutes_weekday = excluded.minutes_weekday, minutes_weekend = excluded.minutes_weekend,
        learn_time = excluded.learn_time, focus_block_minutes = excluded.focus_block_minutes,
        self_assessment = excluded.self_assessment, adhs = excluded.adhs,
        konzentration = excluded.konzentration, pruefungsangst = excluded.pruefungsangst,
        rechenprobleme = excluded.rechenprobleme, sprache = excluded.sprache,
        mode = excluded.mode, onboarded_at = excluded.onboarded_at
    `).run(
      user.id, body.lehrjahr, body.examDate, body.examPartFocus, body.goal, body.minutesWeekday,
      body.minutesWeekend, body.learnTime, body.focusBlockMinutes, body.selfAssessment,
      body.adhs ? 1 : 0, body.konzentration ? 1 : 0, body.pruefungsangst ? 1 : 0,
      body.rechenprobleme ? 1 : 0, body.sprache ? 1 : 0, mode,
    );
    return { ok: true, mode };
  });
}
