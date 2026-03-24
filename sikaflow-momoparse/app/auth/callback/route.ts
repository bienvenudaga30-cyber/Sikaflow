import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-env";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const target = new URL(request.url);

  if (!isSupabaseAuthConfigured()) {
    return NextResponse.redirect(new URL("/login", target.origin));
  }

  const { searchParams } = target;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/dashboard", target.origin));
}
