import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connexion sécurisée à l’espace SAGAHA (administration ou distributeur).",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {  return <Suspense fallback={<div className="p-8 text-center text-sm text-emerald-900">Chargement…</div>}>{children}</Suspense>;
}
