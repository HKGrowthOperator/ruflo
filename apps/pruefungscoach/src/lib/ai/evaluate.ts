/**
 * Bewertung freier Antworten (Masterbrief §12, §24 Bewertungsagent).
 *
 * KI ordnet ausschließlich Kriterien zu und erkennt Fehlvorstellungen —
 * die Punkte summiert deterministischer Code (gradeFreeTextFromHits).
 * Ohne ANTHROPIC_API_KEY greift der deterministische Kriterien-Matcher.
 */
import { z } from 'zod';
import { gradeFreeTextDeterministic, gradeFreeTextFromHits, type GradeOutcome } from '../domain/scoring';
import { ERROR_CODES, type AnswerCriterion, type ErrorCode, type Question } from '../domain/types';

const zAiVerdict = z.object({
  met_criteria: z.array(z.string()),
  misconceptions: z.array(z.enum(ERROR_CODES)).default([]),
  short_feedback: z.string().default(''),
});

export interface FreeTextEvaluation {
  outcome: GradeOutcome;
  evalSource: 'ai' | 'deterministic';
  aiFeedback: string | null;
}

export async function evaluateFreeText(
  question: Pick<Question, 'points' | 'prompt' | 'modelAnswer' | 'operator'>,
  criteria: AnswerCriterion[],
  answer: string,
): Promise<FreeTextEvaluation> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && answer.trim().length > 0) {
    try {
      const ai = await callAnthropicEvaluator(apiKey, question, criteria, answer);
      const validIds = new Set(criteria.map((c) => c.id));
      const met = new Set(ai.met_criteria.filter((id) => validIds.has(id)));
      const outcome = gradeFreeTextFromHits({ points: question.points }, criteria, met, ai.misconceptions);
      return { outcome, evalSource: 'ai', aiFeedback: ai.short_feedback || null };
    } catch (err) {
      console.error('[ai-eval] Fallback auf deterministischen Matcher:', (err as Error).message);
    }
  }
  const outcome = gradeFreeTextDeterministic({ points: question.points }, criteria, answer);
  return { outcome, evalSource: 'deterministic', aiFeedback: null };
}

async function callAnthropicEvaluator(
  apiKey: string,
  question: Pick<Question, 'points' | 'prompt' | 'modelAnswer' | 'operator'>,
  criteria: AnswerCriterion[],
  answer: string,
): Promise<z.infer<typeof zAiVerdict>> {
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
  const criteriaList = criteria
    .map((c) => `- id "${c.id}" (${c.points} P., ${c.required ? 'Pflicht' : 'optional'}): ${c.text}. Akzeptierte Begriffe: ${[...c.keywords, ...c.synonyms].join(', ')}`)
    .join('\n');

  const system = `Du bist Bewertungsagent eines IHK-Prüfungscoaches (Trockenbau). Du ordnest die Antwort eines Auszubildenden den Kriterien des Erwartungshorizonts zu.
REGELN:
- Ein Kriterium gilt als erfüllt, wenn es inhaltlich sinngemäß getroffen ist — auch umgangssprachlich formuliert.
- KEINE Punkte für fachlich falsche oder erfundene Aussagen.
- Fehlvorstellungen als Fehlercodes melden: F1 Begriff unbekannt, F2 Begriffe verwechselt, F3 Funktion nicht verstanden, F6 Regel übergeneralisiert, F11 Fachsprache schwach, F16 kritisches Sicherheits-/Fachfehlkonzept.
- short_feedback: max. 2 Sätze, direkt und fachlich (Stil: "Der Kern stimmt. Für volle Punkte fehlt noch …"). Kein Lob-Kitsch.
Antworte NUR mit JSON: {"met_criteria": ["K1", …], "misconceptions": ["F2", …], "short_feedback": "…"}`;

  const userMsg = `AUFGABE (Operator: ${question.operator}): ${question.prompt}

ERWARTUNGSHORIZONT:
${criteriaList}

MUSTERLÖSUNG (nur zur Orientierung): ${question.modelAnswer}

ANTWORT DES AZUBIS:
"""${answer.slice(0, 4000)}"""`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system,
      messages: [{ role: 'user', content: userMsg }],
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  const text = data.content.find((b) => b.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Keine JSON-Antwort vom Bewertungsagenten');
  return zAiVerdict.parse(JSON.parse(jsonMatch[0]));
}

/** Erkennung von Fehlvorstellungen für error_events (aus Kriterien, die verfehlt wurden). */
export function misconceptionsFromMissedCriteria(criteria: AnswerCriterion[], metIds: string[]): ErrorCode[] {
  const met = new Set(metIds);
  const codes: ErrorCode[] = [];
  for (const c of criteria) {
    if (!met.has(c.id)) codes.push(...c.misconceptionCodes);
  }
  return [...new Set(codes)];
}
