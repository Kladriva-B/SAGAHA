"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  formatXaf,
  productCategories,
  publicProducts,
  type ProductBadge,
  type PublicProduct,
} from "@/lib/public-content";

export function ProductsSection() {
  const [cat, setCat] = useState<(typeof productCategories)[number]>("Tous");

  const filtered = useMemo(() => {
    if (cat === "Tous") return publicProducts;
    return publicProducts.filter((p) => p.category === cat);
  }, [cat]);

  return (
    <section id="produits" className="scroll-mt-24 bg-sagaha-night py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sagaha-accent">Collection</p>
          <h2 className="mt-3 font-display text-3xl font-medium text-white md:text-4xl">Nos créations</h2>
          <p className="mt-4 text-sagaha-mist/80">
            Prix indicatifs en franc CFA (XAF) — conditions professionnelles sur demande.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 md:gap-3">
          {productCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition md:text-sm ${
                cat === c
                  ? "border-sagaha-accent bg-sagaha-accent/15 text-white shadow-lux-glow"
                  : "border-sagaha-accent/20 text-sagaha-mist/80 hover:border-sagaha-accent/50 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <motion.div layout className="mt-14 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-sagaha-accent/10 bg-sagaha-deep/40 shadow-lux-card transition duration-500 hover:-translate-y-1 hover:border-sagaha-accent/35 hover:shadow-lux-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sagaha-night via-transparent to-transparent opacity-80" />
        {product.badge ? <ProductBadge type={product.badge} /> : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs uppercase tracking-widest text-sagaha-accent/90">{product.category}</p>
        <h3 className="mt-2 font-display text-xl text-white">{product.name}</h3>
        <p className="mt-auto pt-4 font-display text-2xl font-medium text-sagaha-mist">
          {formatXaf(product.priceXaf)}{" "}
          <span className="text-sm font-normal tracking-normal text-sagaha-mist/60">XAF</span>
        </p>
      </div>
    </motion.article>
  );
}

function ProductBadge({ type }: { type: ProductBadge }) {
  const styles: Record<ProductBadge, string> = {
    Bio: "border-sagaha-leaf/50 bg-sagaha-leaf/15 text-emerald-50",
    Nouveau: "border-sagaha-primary/55 bg-sagaha-primary/25 text-white",
    "Best-seller": "border-sagaha-accent/45 bg-sagaha-accent/12 text-sagaha-mist",
  };
  return (
    <span
      className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${styles[type]}`}
    >
      {type}
    </span>
  );
}
