import type { Metadata } from "next";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Découvrez les thés premium SAGAHA, notre réseau de distributeurs au Cameroun et nos engagements qualité.",
  openGraph: {
    title: "SAGAHA — Maison camerounaise du thé",
    description:
      "Thés noirs, verts, tisanes et infusions — sélection d’exception pour professionnels et distributeurs.",
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {  return (
    <div className="min-h-screen bg-sagaha-night text-sagaha-mist selection:bg-sagaha-primary/40 selection:text-white">
      <PublicNavbar />
      {children}
      <PublicFooter />
    </div>
  );
}
