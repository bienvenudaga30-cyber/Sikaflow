import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inscription confirmée",
  description: "Vérifiez votre email pour confirmer votre compte Sika FLOW.",
};

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-mp-bg px-6 py-12">
      <div className="max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DFFF00]">
          <svg
            className="h-8 w-8 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-mp-text">
            Inscription confirmée !
          </h1>
          <p className="text-base font-medium text-mp-muted">
            Un email de confirmation a été envoyé à votre adresse. Veuillez
            vérifier votre boîte de réception et cliquer sur le lien pour
            finaliser votre inscription.
          </p>
        </div>

        <div className="rounded-[var(--radius-mp-inner)] border border-mp-border bg-mp-bg p-4 text-sm font-medium text-mp-muted">
          Vous ne voyez pas l'email ? Vérifiez votre dossier spam ou vos
          filtres.
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
