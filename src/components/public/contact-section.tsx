"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-24 bg-sagaha-night py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="grid gap-10 rounded-3xl border border-sagaha-accent/20 bg-gradient-to-br from-sagaha-deep/80 via-sagaha-night to-sagaha-deep/60 p-8 shadow-lux-card md:grid-cols-2 md:gap-12 md:p-12 lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sagaha-accent">Contact</p>
            <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">Parlons de votre prochain blend.</h2>
            <p className="mt-4 text-sagaha-mist/80">
              Commandes professionnelles, partenariats distributeurs ou dégustations privées — notre équipe
              répond sous 48h ouvrées.
            </p>
            <div className="mt-8 space-y-3 text-sm text-sagaha-mist">
              <p>
                <span className="text-sagaha-accent/90">Email</span>
                <br />
                <a href="mailto:contact@sagaha.cm" className="text-white underline-offset-4 hover:underline">
                  contact@sagaha.cm
                </a>
              </p>
              <p>
                <span className="text-sagaha-accent/90">Siège</span>
                <br />
                Douala & Yaoundé — Cameroun
              </p>
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-sagaha-primary px-8 py-4 text-center text-sm font-semibold tracking-wide text-white shadow-lux-glow transition hover:bg-[#388e3c]"
            >
              Ouvrir un dossier distributeur
            </Link>
            <a
              href="mailto:contact@sagaha.cm"
              className="inline-flex items-center justify-center rounded-full border border-sagaha-accent/40 px-8 py-4 text-sm font-semibold text-sagaha-mist transition hover:bg-sagaha-deep/60"
            >
              Écrire à l’équipe commerciale
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
