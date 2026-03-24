import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez un compte Sika FLOW pour accéder au tableau de bord Mobile Money.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mp-bg md:flex-row">
      <div className="relative hidden flex-1 flex-col justify-center border-b border-mp-border bg-mp-bg p-10 md:flex md:border-b-0 md:border-r lg:p-12">
        <div className="relative z-10 max-w-xl space-y-8">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-mp-border bg-mp-surface px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-mp-muted sf-card-shadow">
              Sika FLOW · Mobile Money
            </p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-mp-text lg:text-4xl">
              Rejoignez{" "}
              <span className="rounded-lg bg-[#DFFF00] px-1 text-black">
                Sika FLOW
              </span>
            </h2>
            <p className="max-w-md text-sm font-medium leading-relaxed text-mp-muted">
              Tableau de bord, API et passerelles Android — MTN, Moov, Celtiis. Une
              expérience pensée comme votre maquette : claire, rapide, énergique.
            </p>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-mp)] bg-[#DFFF00] p-6 sf-card-shadow-lg">
            <p className="text-sm font-bold text-black">Avantages</p>
            <ul className="mt-4 space-y-2 text-sm font-medium text-black">
              <li className="flex items-center gap-2">
                <span className="text-lg">✓</span> API complète
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">✓</span> Support prioritaire
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">✓</span> Clés API illimitées
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">✓</span> Analytics en temps réel
              </li>
            </ul>
          </div>
        </div>
        <p className="absolute bottom-8 left-10 text-[10px] font-bold uppercase tracking-widest text-mp-muted lg:left-12">
          © {new Date().getFullYear()} Sika FLOW
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-mp-surface px-6 py-12 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-mp-text">
              Sika FLOW
            </h1>
            <p className="text-base font-medium text-mp-muted">
              Créer un nouveau compte
            </p>
          </header>

          <SignUpForm />

          <footer className="space-y-4 pt-4 text-center">
            <p className="text-sm font-medium text-mp-muted">
              Déjà inscrit ?{" "}
              <Link
                href="/login"
                className="font-bold text-mp-text underline decoration-[#DFFF00] decoration-2 underline-offset-4"
              >
                Se connecter
              </Link>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="text-[10px] font-bold uppercase tracking-widest text-mp-muted hover:text-mp-text"
              >
                Accueil
              </Link>
              <Link
                href="/dashboard/docs"
                className="text-[10px] font-bold uppercase tracking-widest text-mp-muted hover:text-mp-text"
              >
                Documentation
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
