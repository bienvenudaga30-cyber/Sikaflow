"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        setPending(false);
        return;
      }

      if (password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères");
        setPending(false);
        return;
      }

      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.get("fullName") || "",
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setPending(false);
        return;
      }

      router.push("/auth/sign-up-success");
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
      setPending(false);
    }
  }

  return (
    <>
      {error && (
        <div className="rounded-[var(--radius-mp-inner)] border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label
            htmlFor="signup-fullname"
            className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-mp-muted"
          >
            Nom complet
          </label>
          <input
            id="signup-fullname"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jean Dupont"
            className="h-12 w-full rounded-full border border-mp-border bg-mp-bg px-4 text-sm font-medium text-mp-text placeholder:text-mp-muted/60 outline-none focus:ring-2 focus:ring-[#DFFF00]/60"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-mp-muted"
          >
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="vous@entreprise.com"
            className="h-12 w-full rounded-full border border-mp-border bg-mp-bg px-4 text-sm font-medium text-mp-text placeholder:text-mp-muted/60 outline-none focus:ring-2 focus:ring-[#DFFF00]/60"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-mp-muted"
          >
            Mot de passe
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="••••••••"
            className="h-12 w-full rounded-full border border-mp-border bg-mp-bg px-4 text-sm font-medium text-mp-text outline-none focus:ring-2 focus:ring-[#DFFF00]/60"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm"
            className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-mp-muted"
          >
            Confirmer le mot de passe
          </label>
          <input
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="••••••••"
            className="h-12 w-full rounded-full border border-mp-border bg-mp-bg px-4 text-sm font-medium text-mp-text outline-none focus:ring-2 focus:ring-[#DFFF00]/60"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#DFFF00] px-6 text-sm font-bold text-black transition-colors hover:bg-[#c8e600] disabled:opacity-70"
        >
          {pending ? "Création en cours…" : "Créer un compte"}
        </button>
      </form>
    </>
  );
}
