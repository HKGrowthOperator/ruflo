/** Zentrale Feature-Flags aus Umgebungsvariablen (serverseitig). */

export function paymentsEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Öffentliche Basis-URL (für Stripe-Redirects, Reset-Links). */
export function baseUrl(): string {
  return (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3100').replace(/\/$/, '');
}

/** Preis in Euro für die Anzeige (nur Darstellung; verbindlich ist Stripe). */
export function displayPriceEuro(): string {
  return process.env.PRICE_DISPLAY_EUR || '39';
}
