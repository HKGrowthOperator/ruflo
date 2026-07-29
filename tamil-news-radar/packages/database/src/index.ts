import { DevStore } from './dev-store';
import { SupabaseStore } from './supabase-store';
import type { Store } from './store';

export type { Store, StoryFilter } from './store';
export { DevStore } from './dev-store';
export { SupabaseStore } from './supabase-store';

let cached: Store | null = null;

/** Supabase wenn konfiguriert, sonst Dev-Store (JSON-Dateien). */
export function getStore(): Store {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key ? new SupabaseStore(url, key) : new DevStore();
  return cached;
}
