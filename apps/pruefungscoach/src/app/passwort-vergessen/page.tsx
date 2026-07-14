'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/auth/request-reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    if (res.ok) {
      const data = (await res.json()) as { devLink?: string };
      setDevLink(data.devLink ?? null);
      setDone(true);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Passwort vergessen</h1>
      <p className="mb-6 text-sm text-ink-600">Wir senden dir einen Link zum Zurücksetzen an deine E-Mail-Adresse.</p>
      {done ? (
        <div className="card space-y-3 text-sm">
          <p>Wenn ein Konto zu dieser Adresse existiert, ist eine E-Mail mit dem Link unterwegs.</p>
          {devLink && (
            <p className="break-all rounded-lg bg-ink-100 p-2 text-xs">
              Testmodus (kein E-Mail-Anbieter konfiguriert): <a className="text-brand-700 underline" href={devLink}>{devLink}</a>
            </p>
          )}
          <Link href="/login" className="btn-secondary inline-flex">Zurück zur Anmeldung</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="label" htmlFor="email">E-Mail</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Senden…' : 'Link anfordern'}</button>
          <Link href="/login" className="block text-center text-sm text-ink-500 hover:text-ink-800">Zurück zur Anmeldung</Link>
        </form>
      )}
    </div>
  );
}
