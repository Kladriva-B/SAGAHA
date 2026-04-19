"use client";

import { motion } from "framer-motion";

export function BrandStorySection() {
  return (
    <section id="notre-the" className="scroll-mt-24 border-t border-sagaha-accent/10 bg-sagaha-deep/30 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-2 md:items-center md:gap-16 md:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sagaha-accent">Notre thé</p>
          <h2 className="mt-4 font-display text-3xl font-medium text-white md:text-4xl lg:text-[2.75rem]">
            Une signature camerounaise, une exigence mondiale.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sagaha-mist/85 md:text-lg">
            Du plateau aux ateliers de dégustation, SAGAHA orchestre chaque étape : origine contrôlée, séchage
            lent, respect des arômes naturels. Notre thé signature aux notes d’aubergine et fruits noirs
            (Médimezon) marie profondeur veloutée et fraîcheur végétale — hommage au thé et à la nature.
          </p>
        </motion.div>
        <motion.div
          className="relative rounded-2xl border border-sagaha-accent/15 bg-sagaha-night/80 p-8 shadow-lux-card md:p-10"
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 rounded-2xl bg-lux-grid bg-[length:32px_32px] opacity-20" />
          <ul className="relative space-y-5 text-sagaha-mist/90">
            {[
              "Sélection manuelle des feuilles et bourgeons.",
              "Traçabilité lot par lot jusqu’au distributeur.",
              "Emballages conçus pour préserver fraîcheur et arôme.",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed md:text-base">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-sagaha-accent to-sagaha-gild shadow-[0_0_12px_rgba(212,175,55,0.4)]" />
                {line}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
