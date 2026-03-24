/**
 * Détecte si l’auth Supabase (middleware, session, login navigateur) est utilisable.
 * Utilisable côté client, middleware et serveur (variables NEXT_PUBLIC_* injectées au build).
 */
export function isSupabaseAuthConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && anon);
}
