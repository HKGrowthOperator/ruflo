'use client';

import { useState } from 'react';

export function CheckoutButton({ label }: { label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="w-full">
      <button
        className="btn-primary w-full"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const res = await fetch('/api/checkout', { method: 'POST' });
          if (res.ok) {
            const { url } = (await res.json()) as { url: string };
            window.location.href = url;
          } else {
            setBusy(false);
            setError((await res.json() as { error?: string }).error ?? 'Fehler beim Start der Zahlung');
          }
        }}
      >
        {busy ? 'Weiter zu Stripe…' : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
