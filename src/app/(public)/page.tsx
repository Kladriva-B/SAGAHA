import { BrandStorySection } from "@/components/public/brand-story";
import { ContactSection } from "@/components/public/contact-section";
import { DistributorsSection } from "@/components/public/distributors-section";
import { PublicHero } from "@/components/public/hero";
import { ProductsSection } from "@/components/public/products-section";
import { ProductCollectionJsonLd } from "@/components/seo/product-collection-json-ld";

export default function HomePage() {
  return (
    <>
      <ProductCollectionJsonLd />
      <PublicHero />      <BrandStorySection />
      <ProductsSection />
      <DistributorsSection />
      <ContactSection />
    </>
  );
}
