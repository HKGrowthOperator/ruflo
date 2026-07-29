import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError, withPaidUser } from '@/lib/api-helpers';
import { loadQuestion } from '@/lib/services/questions';

const zLevel = z.coerce.number().int().min(1).max(5);

/**
 * Gestufte Hilfen (§18): 1 Denkimpuls … 5 vollständige Erklärung.
 * Deterministisch aus Frage-Metadaten erzeugt — keine Lösungsverrat-Stufen
 * unterhalb von Stufe 4.
 *
 * Vollzugang erforderlich: Stufe 4/5 enthalten Erwartungshorizont bzw.
 * Musterlösung — ohne Gate wäre das ein Paywall-Bypass für den ganzen
 * Fragenpool. (Die Diagnose nutzt ohnehin keine Hilfen.)
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const parsed = zLevel.safeParse(url.searchParams.get('level'));
  if (!parsed.success) return jsonError('level 1–5 erforderlich');
  const level = parsed.data;

  return withPaidUser(async () => {
    const q = loadQuestion(id);
    if (!q) throw new Error('Frage nicht gefunden');

    const operatorHint: Record<string, string> = {
      nennen: 'Es reichen kurze, eindeutige Fachpunkte — keine Sätze nötig. Achte auf die geforderte Anzahl.',
      beschreiben: 'Gehe Aufbau oder Ablauf in nachvollziehbarer Reihenfolge durch.',
      erklaeren: 'Nenne Funktion, Wirkung und die technische Folge.',
      begruenden: 'Formel: Entscheidung + Anforderung + technische Wirkung.',
      unterscheiden: 'Benenne beide Begriffe und mindestens ein klares Abgrenzungsmerkmal.',
      bestimmen: 'Filtere die Angaben, wähle System/Tabelle, gib den Wert MIT Einheit an.',
      berechnen: 'Formel aufschreiben → Werte einsetzen → rechnen → Ergebnis mit Einheit → Plausibilität prüfen.',
      beurteilen: 'Richtig oder falsch? Fehler benennen, Folge nennen, fachgerechte Alternative angeben.',
    };

    let hint: string;
    switch (level) {
      case 1:
        hint = `Denkimpuls: ${operatorHint[q.operator] ?? 'Lies die Aufgabe noch einmal genau — was fordert der Operator?'}`;
        break;
      case 2: {
        const crit = q.criteria[0];
        hint = crit
          ? `Teilhinweis: Ein Bewertungspunkt betrifft „${crit.text}“. ${operatorHint[q.operator] ?? ''}`
          : `Teilhinweis: Achte auf die Bearbeitungszeit von ${Math.round(q.timeSeconds / 60)} min und den Operator „${q.operator}“.`;
        break;
      }
      case 3: {
        const critList = q.criteria.slice(0, Math.ceil(q.criteria.length / 2)).map((c) => `• ${c.text}`);
        hint = critList.length
          ? `Geführte Lösung – diese Aspekte gehören in die Antwort:\n${critList.join('\n')}`
          : `Geführte Lösung: Grenze zunächst aus, was sicher falsch ist, und begründe deine Wahl.`;
        break;
      }
      case 4: {
        const critList = q.criteria.map((c) => `• ${c.text} (${c.points} P.)`);
        hint = critList.length
          ? `Erwartungshorizont:\n${critList.join('\n')}`
          : `Fast vollständige Hilfe: Die typischen Fehler hier sind: ${q.typicalErrors.join('; ') || 'Operator übersehen, Einheit vergessen.'}`;
        break;
      }
      default:
        hint = `Musterlösung:\n${q.modelAnswer}`;
    }
    return { level, hint };
  });
}
