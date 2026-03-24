/**
 * Lecture des variables d’environnement côté serveur (routes API, Server Components).
 * Ne pas importer depuis du code client.
 */

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Au moins une clé API explicite (hors fallback dev). */
export function hasConfiguredApiKeys(): boolean {
  const raw =
    process.env.SIKAFLOW_API_KEYS ?? process.env.SIKAFLOW_API_KEY ?? "";
  const keys = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return keys.length > 0;
}

/** Origine autorisée pour CORS sur les réponses JSON de l’API. `*` par défaut. */
export function getCorsAllowOrigin(): string {
  const o = process.env.SIKAFLOW_CORS_ORIGIN?.trim();
  return o && o.length > 0 ? o : "*";
}

/** Persistance API (service role) — aligné sur lib/supabase/admin.ts */
export function isSupabaseConfigured(): boolean {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  return Boolean(url && key);
}
