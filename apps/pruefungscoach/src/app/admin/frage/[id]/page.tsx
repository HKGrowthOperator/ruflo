import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { loadQuestion } from '@/lib/services/questions';
import { QuestionEditor } from '@/components/QuestionEditor';

export const dynamic = 'force-dynamic';

export default async function AdminQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');
  const { id } = await params;
  const question = loadQuestion(id);
  if (!question) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Frage bearbeiten</h1>
      <QuestionEditor
        question={{
          id: question.id,
          prompt: question.prompt,
          context: question.context,
          modelAnswer: question.modelAnswer,
          status: question.status,
          difficulty: question.difficulty,
          examRelevance: question.examRelevance,
          points: question.points,
          qtype: question.qtype,
          operator: question.operator,
          sourceRef: question.sourceRef,
          sourceLevel: question.sourceLevel,
          version: question.version,
          criteria: question.criteria.map((c) => ({ id: c.id, text: c.text, points: c.points, required: c.required })),
          choices: question.choices.map((c) => ({ id: c.id, text: c.text, correct: c.correct })),
        }}
      />
    </div>
  );
}
