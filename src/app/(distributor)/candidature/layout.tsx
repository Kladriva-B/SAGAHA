import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidature distributeur",
  description:
    "Déposez votre dossier pour rejoindre le réseau SAGAHA. Validation par l’équipe et confirmation par email.",
  openGraph: {
    title: "Candidature distributeur — SAGAHA",
    description: "Formulaire public pour devenir partenaire distributeur au Cameroun.",
  },
};

export default function CandidatureLayout({ children }: { children: React.ReactNode }) {
  return children;
}
