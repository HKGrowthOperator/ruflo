import { NextResponse } from 'next/server';
import { withUser } from '@/lib/api-helpers';
import { buildDiagnosisSet } from '@/lib/services/diagnosis';
import { loadQuestion, toPublicQuestion } from '@/lib/services/questions';

/** Liefert den Diagnose-Fragensatz (ohne Lösungen). */
export async function GET(): Promise<NextResponse> {
  return withUser(async (user) => {
    const ids = buildDiagnosisSet(user.id);
    const questions = ids
      .map((id) => loadQuestion(id))
      .filter((q) => q !== null)
      .map((q) => toPublicQuestion(q));
    return { questions };
  });
}
