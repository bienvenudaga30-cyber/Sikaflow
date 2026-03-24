import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-env";

export async function GET() {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { error: "Supabase Auth non configurée sur ce déploiement." },
      { status: 503 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    success: true,
    data: user,
  })
}
