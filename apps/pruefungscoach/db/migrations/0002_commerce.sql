-- Kommerzielle Schicht: Zugangsberechtigungen (Einmalkauf/Abo) + Passwort-Reset

-- Zugangsberechtigung pro Nutzer.
-- plan: 'free' (Testzugang) | 'paid' (bezahlt)
-- access_until: ISO-Datum, bis wann der bezahlte Zugang gilt (NULL = unbegrenzt)
-- source: 'trial' | 'purchase' | 'admin'
CREATE TABLE IF NOT EXISTS entitlements (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','paid')),
  -- Produktachsen (zukunftssicher für Basis/Premium × Zwischen-/Abschlussprüfung):
  -- tier: 'lite' (Buchwissen/Grundlagen) | 'premium' (zusätzlich echte Altprüfungen + Prüfungsgewichtung)
  -- exam_track: 'zwischen' | 'abschluss'
  tier TEXT NOT NULL DEFAULT 'premium' CHECK (tier IN ('lite','premium')),
  exam_track TEXT NOT NULL DEFAULT 'abschluss' CHECK (exam_track IN ('zwischen','abschluss')),
  access_until TEXT,
  source TEXT NOT NULL DEFAULT 'trial',
  stripe_customer_id TEXT,
  stripe_checkout_session TEXT,
  granted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Verarbeitete Stripe-Events (Idempotenz gegen doppelte Webhooks)
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Passwort-Reset-Tokens (nur der SHA-256-Hash wird gespeichert)
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);

ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
