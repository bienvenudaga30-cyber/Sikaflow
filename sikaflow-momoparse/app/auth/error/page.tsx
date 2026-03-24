import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Erreur d'authentification",
  description: "Une erreur s'est produite lors de l'authentification.",
};

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-mp-bg px-6 py-12">
      <div className="max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-mp-text">
            Erreur d'authentification
          </h1>
          <p className="text-base font-medium text-mp-muted">
            Une erreur s'est produite lors du processus d'authentification.
            Veuillez réessayer ou contacter le support.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full bg-[#DFFF00] px-6 text-sm font-bold text-black transition-colors hover:bg-[#c8e600]"
          >
            Retour à la connexion
          </Link>
          <Link
            href="/"
            className="flex h-12 items-center justify-center rounded-full border border-mp-border bg-mp-bg text-sm font-bold text-mp-text transition-colors hover:border-black/20"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
