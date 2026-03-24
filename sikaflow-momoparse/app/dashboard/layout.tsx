import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/momoparse/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-env";

export const metadata: Metadata = {
  description: "Espace Sika FLOW — analytics Mobile Money, API et appareils.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (isSupabaseAuthConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}
