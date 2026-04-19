"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TeaLeafArt } from "@/components/public/tea-leaf-art";

const titleWords = ["L'art", "du", "thé", "africain"];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

export function PublicHero() {
  return (
    <section className="relative overflow-hidden bg-sagaha-night pt-24 md:pt-28">
      <div
        className="pointer-events-none absolute inset-0 bg-lux-grid bg-[length:48px_48px] opacity-[0.35]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-sagaha-primary/10 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[480px] w-[480px] rounded-full bg-sagaha-accent/10 blur-[100px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-10 md:grid-cols-2 md:gap-8 md:px-8 lg:gap-16 lg:px-10 lg:pb-28 lg:pt-14">
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-sagaha-accent/30 bg-sagaha-deep/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sagaha-accent"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sagaha-accent shadow-[0_0_10px_#66bb6a]" />
            Premium · Bio · Cameroun
          </motion.div>

          <motion.h1
            className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[3.5rem]"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {titleWords.map((word) => (
              <motion.span key={word} variants={item} className="inline-block pr-[0.2em] last:pr-0">
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md text-base leading-relaxed text-sagaha-mist/85 md:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            Maison camerounaise du thé d’exception — sélections rares, circuits courts et partenaires
            distributeurs sur tout le territoire.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.55 }}
          >
            <a
              href="#produits"
              className="inline-flex items-center justify-center rounded-full bg-sagaha-primary px-8 py-3.5 text-sm font-semibold tracking-wide text-white shadow-lux-glow transition hover:bg-[#388e3c]"
            >
              Découvrir nos thés
            </a>
            <Link
              href="/candidature"
              className="inline-flex items-center justify-center rounded-full border border-sagaha-accent/40 px-8 py-3.5 text-sm font-semibold tracking-wide text-sagaha-mist transition hover:border-sagaha-accent hover:bg-sagaha-deep/50"
            >
              Candidature distributeur
            </Link>
          </motion.div>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-6 md:items-end">
          <div className="relative w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sagaha-accent/20 via-transparent to-sagaha-primary/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-sagaha-accent/20 shadow-lux-card">
              <Image
                src="https://images.unsplash.com/photo-1564890369478-c89afeb9cd89?auto=format&fit=crop&w=1200&q=85"
                alt="Feuilles de thé premium SAGAHA"
                width={900}
                height={1100}
                priority
                sizes="(max-width: 768px) 100vw, 45vw"
                className="h-auto w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sagaha-night/80 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden w-[55%] md:block lg:-left-8">
              <TeaLeafArt />
            </div>
          </div>
          <div className="w-full md:hidden">
            <TeaLeafArt />
          </div>
        </div>
      </div>

      <HeroStats />
    </section>
  );
}

function HeroStats() {
  const stats = [
    { value: "15+", label: "variétés" },
    { value: "200+", label: "distributeurs" },
    { value: "8", label: "régions" },
  ];

  return (
    <div className="relative border-t border-sagaha-accent/10 bg-sagaha-deep/40 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-5 py-10 md:px-8 lg:px-10">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-display text-3xl font-semibold text-white md:text-4xl">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sagaha-mist/70 md:text-sm">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
