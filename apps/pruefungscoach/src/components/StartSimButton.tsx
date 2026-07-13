'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function StartSimButton({ kind }: { kind: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn-primary"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await fetch('/api/simulation', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ kind }),
        });
        setBusy(false);
        if (res.ok) {
          const { simId } = (await res.json()) as { simId: number };
          router.push(`/simulation/${simId}`);
        }
      }}
    >
      {busy ? 'Wird erstellt…' : 'Starten'}
    </button>
  );
}
