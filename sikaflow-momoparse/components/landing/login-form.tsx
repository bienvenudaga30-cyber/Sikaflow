"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
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

      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setPending(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
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
            htmlFor="login-email"
            className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-mp-muted"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="vous@entreprise.com"
            className="h-12 w-full rounded-full border border-mp-border bg-mp-bg px-4 text-sm font-medium text-mp-text placeholder:text-mp-muted/60 outline-none focus:ring-2 focus:ring-[#DFFF00]/60"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-mp-muted"
            >
              Mot de passe
            </label>
            <span className="text-[10px] font-bold uppercase tracking-widest text-mp-muted">
              Mot de passe oublié — bientôt
            </span>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={4}
            placeholder="••••••••"
            className="h-12 w-full rounded-full border border-mp-border bg-mp-bg px-4 text-sm font-medium text-mp-text outline-none focus:ring-2 focus:ring-[#DFFF00]/60"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#DFFF00] px-6 text-sm font-bold text-black transition-colors hover:bg-[#c8e600] disabled:opacity-70"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-mp-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-mp-surface px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-mp-muted">
            Ou
          </span>
        </div>
      </div>

      <button
        type="button"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-mp-border bg-mp-bg text-sm font-bold text-mp-text transition-colors hover:border-black/20"
        onClick={() => router.push("/auth/sign-up")}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Créer un compte
      </button>

      <p className="rounded-[var(--radius-mp-inner)] border border-mp-border bg-mp-bg px-3 py-2 text-center text-[11px] font-medium text-mp-muted">
        Utilisez vos identifiants Supabase pour vous connecter à votre espace.
      </p>
    </>
  );
}
