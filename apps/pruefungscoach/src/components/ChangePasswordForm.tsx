'use client';

import { useState } from 'react';

export function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    setBusy(false);
    if (res.ok) {
      setOk(true);
      setMsg('Passwort geändert.');
      setCurrent('');
      setNext('');
    } else {
      setOk(false);
      setMsg((await res.json() as { error?: string }).error ?? 'Fehler');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label" htmlFor="cur">Aktuelles Passwort</label>
        <input id="cur" type="password" className="input" value={current} onChange={(e) => setCurrent(e.target.value)} required />
      </div>
      <div>
        <label className="label" htmlFor="new">Neues Passwort (min. 8 Zeichen)</label>
        <input id="new" type="password" className="input" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
      </div>
      {msg && <p className={`text-sm ${ok ? 'text-emerald-700' : 'text-red-700'}`}>{msg}</p>}
      <button className="btn-primary" disabled={busy}>{busy ? 'Speichert…' : 'Passwort ändern'}</button>
    </form>
  );
}
