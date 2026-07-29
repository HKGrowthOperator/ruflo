import { formatDate } from '../../lib/format';
import { getSystemStatus } from '../../lib/system-status';
import { AdminNav } from './nav';

export const dynamic = 'force-dynamic';

/** Redaktions-Shell: Systemleiste (echte Daten) + linke Navigation. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const status = await getSystemStatus();
  const agentOk = status.lastRun !== null;
  const problems = status.sourceErrors.length + status.wpErrors.length;

  return (
    <div className="admin-shell">
      <div className="sysbar" role="status">
        <span className={agentOk ? 'sys ok' : 'sys idle'}>
          ● Agent {agentOk ? 'aktiv (Cron 30 Min)' : 'noch kein Lauf'}
        </span>
        <span className="sys">Letzter Lauf: {formatDate(status.lastRun?.finishedAt)}</span>
        <span className="sys">Nächster: ~{formatDate(status.nextRunAt ?? undefined)}</span>
        <span className={status.aiLive ? 'sys ok' : 'sys warn'}>
          KI: {status.aiLive ? 'Claude (live)' : 'Mock – kein API-Key'}
        </span>
        <span className={status.wpConfigured ? 'sys ok' : 'sys idle'}>
          WordPress: {status.wpConfigured ? 'konfiguriert' : 'nicht konfiguriert'}
        </span>
        <span className={problems > 0 ? 'sys warn' : 'sys ok'}>
          {problems > 0 ? `${problems} Problem(e)` : 'keine Fehler'}
        </span>
      </div>
      <div className="admin-body">
        <AdminNav />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
