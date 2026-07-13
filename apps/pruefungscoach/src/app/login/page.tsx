'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(mode === 'login' ? { email, password } : { email, password, displayName }),
    });
    setBusy(false);
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? 'Fehler bei der Anmeldung');
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Prüfungscoach Trockenbau</h1>
      <p className="mb-6 text-sm text-ink-600">
        Dein adaptiver Coach für die schriftliche IHK-Abschlussprüfung.
      </p>
      <form onSubmit={submit} className="card space-y-4">
        <div className="flex gap-1 rounded-xl bg-ink-100 p-1">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                mode === m ? 'bg-white shadow-sm' : 'text-ink-500'
              }`}
            >
              {m === 'login' ? 'Anmelden' : 'Registrieren'}
            </button>
          ))}
        </div>
        {mode === 'register' && (
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">E-Mail</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="password">Passwort {mode === 'register' && <span className="text-ink-400">(min. 8 Zeichen)</span>}</label>
          <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === 'register' ? 8 : 1} />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Einen Moment…' : mode === 'login' ? 'Anmelden' : 'Konto anlegen'}
        </button>
        <p className="text-xs text-ink-500">Demo: azubi@coach.local / azubi1234 · Admin: admin@coach.local / admin1234</p>
      </form>
    </div>
  );
}
