import { publicProducts } from "@/lib/public-content";
import { absoluteUrl } from "@/lib/site";

/** Schema.org — liste de produits (rich results / Google Merchant style simplifié). */
export function ProductCollectionJsonLd() {
  const base = absoluteUrl();
  const items = publicProducts.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: p.name,
      description: `${p.category} — ${p.name} (SAGAHA SARL, Cameroun).`,
      image: p.imageSrc,
      sku: `sagaha-public-${p.id}`,
      brand: { "@type": "Brand", name: "SAGAHA" },
      offers: {
        "@type": "Offer",
        priceCurrency: "XAF",
        price: p.priceXaf,
        availability: "https://schema.org/InStock",
        url: `${base}/#produits`,
        seller: { "@type": "Organization", name: "SAGAHA SARL", url: base },
      },
    },
  }));

  const json = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Thés et infusions SAGAHA",
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
