"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlanBadge } from "@/components/momoparse/badge";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-env";

export function DashboardHeader({ plan = "PRO" }: { plan?: "PRO" | "FREE" }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    if (isSupabaseAuthConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        /* ignore */
      }
    }
    router.push("/login");
  }

  return (
    <header className="sf-card-shadow shrink-0 border-b border-mp-border bg-mp-surface px-4 py-4 md:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-mp-muted">Sika FLOW</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-mp-text md:text-3xl">
              Vos analytics
            </h1>
            <PlanBadge plan={plan} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/dashboard/transactions"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-mp-border bg-mp-bg text-mp-text transition-colors hover:bg-neutral-100"
            aria-label="Rechercher"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 items-center gap-2 rounded-full border border-mp-border bg-mp-bg pl-1 pr-3 transition-colors hover:bg-neutral-100"
              aria-expanded={open}
              aria-haspopup="menu"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs font-bold text-[#DFFF00]">
                SF
              </span>
              <svg className="h-4 w-4 text-mp-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                  aria-label="Fermer le menu"
                  onClick={() => setOpen(false)}
                />
                <div
                  role="menu"
                  className="sf-card-shadow absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-[var(--radius-mp-inner)] border border-mp-border bg-mp-surface py-1"
                >
                  <Link
                    href="/"
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm text-mp-text hover:bg-mp-bg"
                    onClick={() => setOpen(false)}
                  >
                    Site vitrine
                  </Link>
                  <Link
                    href="/dashboard/api-keys"
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm text-mp-text hover:bg-mp-bg"
                    onClick={() => setOpen(false)}
                  >
                    Clés API
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2.5 text-left text-sm text-mp-text hover:bg-mp-bg"
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                  >
                    Deconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
