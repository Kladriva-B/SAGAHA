import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription distributeur",
  description: "Création de compte distributeur SAGAHA (validation par l’équipe).",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
