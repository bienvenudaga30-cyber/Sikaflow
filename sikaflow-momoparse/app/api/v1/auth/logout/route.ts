import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-env";

export async function POST() {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { error: "Supabase Auth non configurée sur ce déploiement." },
      { status: 503 }
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })
}
