import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-env";
import { apiKeysMock } from "@/lib/mock-data";

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsed: string | null;
  active: boolean;
}

function formatLastUsed(date: string | null): string {
  if (!date) return "Jamais";
  
  const lastUsed = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - lastUsed.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "A l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays} jours`;
}

export async function getApiKeys(): Promise<ApiKey[]> {
  if (!isSupabaseAuthConfigured()) {
    return apiKeysMock as ApiKey[];
  }

  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching API keys:", error);
    return [];
  }

  return (data || []).map((key) => ({
    id: key.id,
    name: key.name || "Cle sans nom",
    prefix: key.key_prefix || "sk_...",
    scopes: key.scopes || [],
    lastUsed: formatLastUsed(key.last_used_at),
    active: key.is_active ?? true,
  }));
}
