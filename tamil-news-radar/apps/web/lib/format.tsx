import type { ReactNode } from 'react';

/** Minimaler Markdown-Renderer für Entwurfs-Bodies: "## " + Absätze. */
export function renderBody(body: string): ReactNode[] {
  return body
    .split(/\n{2,}/)
    .map((block, i) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('## ')) return <h2 key={i}>{trimmed.slice(3)}</h2>;
      return <p key={i}>{trimmed}</p>;
    })
    .filter(Boolean) as ReactNode[];
}

export function formatDate(iso?: string): string {
  if (!iso) return '–';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '–';
  return date.toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
