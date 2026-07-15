import Link from 'next/link';
import { getStore } from '@tnr/database';
import { formatDate } from '../../../lib/format';

export const dynamic = 'force-dynamic';

/** Audit-Log (Frage 26): wer hat was wann getan. */
export default async function AuditPage() {
  const store = getStore();
  const entries = await store.listAudit(200);

  return (
    <>
      <h1>Audit-Log <span className="meta">(letzte {entries.length})</span></h1>
      <table>
        <thead>
          <tr>
            <th>Zeit</th>
            <th>Akteur</th>
            <th>Aktion</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="meta">{formatDate(entry.at)}</td>
              <td>{entry.actor}</td>
              <td>
                <span className="mono">{entry.action}</span>
                {entry.storyId && (
                  <> · <Link href={`/admin/stories/${entry.storyId}`}>Story</Link></>
                )}
              </td>
              <td className="meta" style={{ maxWidth: '28rem', overflowWrap: 'anywhere' }}>
                {entry.detail}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
