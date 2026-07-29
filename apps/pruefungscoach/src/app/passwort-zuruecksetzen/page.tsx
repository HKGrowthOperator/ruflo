'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    setBusy(false);
    if (res.ok) setDone(true);
    else setError((await res.json() as { error?: string }).error ?? 'Fehler');
  }

  if (!token) {
    return <p className="card text-sm text-red-700">Ungültiger Link — kein Token gefunden.</p>;
  }
  if (done) {
    return (
      <div className="card space-y-3 text-sm">
        <p className="text-emerald-700">Passwort geändert. Du kannst dich jetzt anmelden.</p>
        <button className="btn-primary" onClick={() => router.push('/login')}>Zur Anmeldung</button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <label className="label" htmlFor="pw">Neues Passwort (min. 8 Zeichen)</label>
        <input id="pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Speichert…' : 'Passwort festlegen'}</button>
      <Link href="/login" className="block text-center text-sm text-ink-500 hover:text-ink-800">Zur Anmeldung</Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Neues Passwort festlegen</h1>
      <Suspense fallback={<p className="text-sm text-ink-500">Lädt…</p>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
