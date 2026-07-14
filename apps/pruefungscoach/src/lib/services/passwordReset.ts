import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { getDb } from '../db';
import { hashPassword } from '../auth';
import { sendEmail } from '../email';
import { baseUrl, emailEnabled } from '../config';

const TOKEN_TTL_MIN = 60;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface RequestResetResult {
  /** Immer true nach außen (kein Nutzer-Enumeration-Leck). */
  ok: true;
  /** Nur in der Entwicklung ohne E-Mail-Anbieter gesetzt, damit man testen kann. */
  devLink?: string;
}

export async function requestReset(email: string): Promise<RequestResetResult> {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase()) as { id: number } | undefined;
  if (!user) return { ok: true }; // nicht verraten, ob die Adresse existiert

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TOKEN_TTL_MIN * 60_000).toISOString();
  db.prepare('INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    hashToken(token),
    user.id,
    expires,
  );

  const link = `${baseUrl()}/passwort-zuruecksetzen?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Passwort zurücksetzen – Prüfungscoach',
    html: `<p>Du hast angefragt, dein Passwort zurückzusetzen.</p>
      <p><a href="${link}">Neues Passwort festlegen</a></p>
      <p>Der Link ist ${TOKEN_TTL_MIN} Minuten gültig. Wenn du das nicht warst, ignoriere diese E-Mail.</p>`,
    text: `Passwort zurücksetzen: ${link} (gültig ${TOKEN_TTL_MIN} Minuten)`,
  });

  // Ohne E-Mail-Anbieter (Testphase): Link zurückgeben, aber niemals in Produktion.
  if (!emailEnabled() && process.env.NODE_ENV !== 'production') return { ok: true, devLink: link };
  return { ok: true };
}

export interface ConsumeResult {
  ok: boolean;
  error?: string;
}

export function consumeReset(token: string, newPassword: string): ConsumeResult {
  if (newPassword.length < 8) return { ok: false, error: 'Passwort muss mindestens 8 Zeichen haben' };
  const db = getDb();
  const th = hashToken(token);
  const row = db
    .prepare("SELECT token_hash, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?")
    .get(th) as { token_hash: string; user_id: number; expires_at: string; used_at: string | null } | undefined;

  // konstante Zeit für „nicht gefunden" vs. „gefunden"
  const provided = Buffer.from(th);
  const stored = Buffer.from(row?.token_hash ?? th);
  const match = row && provided.length === stored.length && timingSafeEqual(provided, stored);
  if (!row || !match) return { ok: false, error: 'Ungültiger oder abgelaufener Link' };
  if (row.used_at) return { ok: false, error: 'Dieser Link wurde bereits verwendet' };
  if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, error: 'Der Link ist abgelaufen' };

  const tx = db.transaction(() => {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), row.user_id);
    db.prepare("UPDATE password_resets SET used_at = datetime('now') WHERE token_hash = ?").run(th);
    // Alle bestehenden Sitzungen des Nutzers beenden (Sicherheit)
    db.prepare('DELETE FROM auth_sessions WHERE user_id = ?').run(row.user_id);
  });
  tx();
  return { ok: true };
}
