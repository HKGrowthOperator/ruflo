/**
 * E-Mail-Versand. Nutzt Resend (einfache HTTP-API, keine Extra-Abhängigkeit),
 * wenn RESEND_API_KEY gesetzt ist. Sonst wird die Mail nur in die Server-Logs
 * geschrieben — so funktioniert die App auch ohne E-Mail-Anbieter in der
 * Entwicklung/Testphase.
 */
import { emailEnabled } from './config';

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(mail: Mail): Promise<{ sent: boolean }> {
  if (!emailEnabled()) {
    console.log(`[email:dev] An: ${mail.to} · Betreff: ${mail.subject}\n${mail.text ?? stripHtml(mail.html)}`);
    return { sent: false };
  }
  const from = process.env.EMAIL_FROM || 'Prüfungscoach <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ from, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    console.error('[email] Versand fehlgeschlagen:', res.status, await res.text());
    return { sent: false };
  }
  return { sent: true };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
