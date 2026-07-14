/** Einheitliches Layout für Rechtstexte mit sichtbarem Vorlagen-Hinweis. */
export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <strong>Hinweis:</strong> Dies ist eine Vorlage mit Platzhaltern in eckigen Klammern
        (z.&nbsp;B. <code>[DEIN NAME]</code>). Ersetze alle Platzhalter durch deine echten Daten und lass den Text
        vor dem Verkaufsstart einmal rechtlich prüfen (z.&nbsp;B. über einen Generator wie eRecht24 oder einen
        Anwalt). So wie er hier steht, ist er noch nicht rechtsverbindlich.
      </div>
      <div className="space-y-4 text-sm leading-relaxed text-ink-700 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink-900 [&_a]:text-brand-700 [&_a]:underline">
        {children}
      </div>
    </article>
  );
}
