import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-env";

export function createClient() {
  if (!isSupabaseAuthConfigured()) {
    throw new Error(
      "Supabase Auth non configuré : définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
    );
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  return createBrowserClient(url, anon);
}
