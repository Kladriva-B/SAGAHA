import type { Metadata } from "next";
import { CatalogueClient } from "@/components/distributor/catalogue-client";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Catalogue",
    description: "Commandez les produits SAGAHA en ligne avec panier et validation.",
    openGraph: { title: "Catalogue distributeur | SAGAHA" },
  };
}

export default function CataloguePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white md:text-3xl">Catalogue produits</h1>
        <p className="mt-1 text-sm text-sagaha-mist/60">
          Ajoutez des références au panier puis validez : la commande est créée en statut « en attente » jusqu’à
          validation SAGAHA.
        </p>
      </div>
      <CatalogueClient />
    </div>
  );
}
