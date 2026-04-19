"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center bg-sagaha-night px-6 text-center text-sagaha-mist">
        <h1 className="font-display text-2xl text-white">Une erreur est survenue</h1>
        <p className="mt-3 max-w-md text-sm text-sagaha-mist/70">
          L’équipe technique a été notifiée. Vous pouvez réessayer.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-lg bg-sagaha-primary px-5 py-2 text-sm font-semibold text-white hover:bg-sagaha-primary/90"
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
