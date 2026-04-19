import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sagaha-night px-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sagaha-accent">403</p>
      <h1 className="mt-4 font-display text-3xl text-white md:text-4xl">Accès refusé</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-sagaha-mist/80">
        Votre rôle ne permet pas d’accéder à cette section. Contactez un administrateur SAGAHA si vous pensez
        qu’il s’agit d’une erreur.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex rounded-full border border-sagaha-accent/40 px-8 py-3 text-sm font-semibold text-sagaha-mist transition hover:bg-sagaha-deep/60 hover:text-white"
      >
        Retour à l’accueil
      </Link>
    </main>
  );
}
