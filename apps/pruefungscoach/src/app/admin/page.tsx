/** Admin (§23): Quellen, Kompetenzen, Fragen mit Status und Qualitätsmetriken. */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { MAIN_AREA_LABELS, type MainArea } from '@/lib/domain/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ bereich?: string }> }) {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/');
  const { bereich } = await searchParams;

  const db = getDb();
  const sources = db.prepare('SELECT * FROM sources ORDER BY hierarchy_level').all() as {
    id: string; title: string; kind: string; hierarchy_level: number; status: string;
  }[];
  const compCount = (db.prepare('SELECT COUNT(*) n FROM competencies').get() as { n: number }).n;
  const qStats = db
    .prepare(`SELECT status, COUNT(*) n FROM questions GROUP BY status`)
    .all() as { status: string; n: number }[];

  const questions = db
    .prepare(
      `SELECT q.id, q.qtype, q.operator, q.difficulty, q.points, q.status, q.prompt, q.source_level,
              c.main_area
       FROM questions q
       JOIN question_competencies qc ON qc.question_id = q.id AND qc.is_primary = 1
       JOIN competencies c ON c.id = qc.competency_id
       ${bereich ? 'WHERE c.main_area = ?' : ''}
       ORDER BY q.id LIMIT 500`,
    )
    .all(...(bereich ? [bereich] : [])) as {
    id: string; qtype: string; operator: string; difficulty: number; points: number;
    status: string; prompt: string; source_level: number; main_area: MainArea;
  }[];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Admin</h1>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-ink-500">Kompetenzen</p>
          <p className="text-2xl font-bold">{compCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink-500">Fragen</p>
          <p className="text-2xl font-bold">{qStats.reduce((s, x) => s + x.n, 0)}</p>
          <p className="text-xs text-ink-500">{qStats.map((s) => `${s.status}: ${s.n}`).join(' · ')}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink-500">Quellen</p>
          <p className="text-2xl font-bold">{sources.length}</p>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold text-ink-700">Quellen (Hierarchie §27)</h2>
        <ul className="space-y-1.5 text-sm">
          {sources.map((s) => (
            <li key={s.id} className="flex justify-between">
              <span>
                <span className="badge mr-2 bg-ink-100 text-ink-700">Stufe {s.hierarchy_level}</span>
                {s.title}
              </span>
              <span className="text-ink-500">{s.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <h2 className="mr-2 text-sm font-semibold text-ink-700">Fragen</h2>
          <Link href="/admin" className={`badge border ${!bereich ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}>alle</Link>
          {Object.entries(MAIN_AREA_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/admin?bereich=${key}`}
              className={`badge border ${bereich === key ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-xs text-ink-500">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Frage</th>
                <th className="py-2 pr-3">Typ</th>
                <th className="py-2 pr-3">P.</th>
                <th className="py-2 pr-3">Quelle</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {questions.map((q) => (
                <tr key={q.id}>
                  <td className="py-2 pr-3 font-mono text-xs">
                    <Link href={`/admin/frage/${q.id}`} className="text-brand-700 hover:underline">{q.id}</Link>
                  </td>
                  <td className="max-w-md truncate py-2 pr-3">{q.prompt}</td>
                  <td className="py-2 pr-3 text-xs">{q.qtype}</td>
                  <td className="py-2 pr-3">{q.points}</td>
                  <td className="py-2 pr-3 text-xs">L{q.source_level}</td>
                  <td className="py-2 text-xs">{q.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
