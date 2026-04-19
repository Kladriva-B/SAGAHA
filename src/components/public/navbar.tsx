"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";

const links = [
  { href: "#produits", label: "Produits" },
  { href: "#notre-the", label: "Notre thé" },
  { href: "#distributeurs", label: "Distributeurs" },
  { href: "#contact", label: "Contact" },
] as const;

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 32);
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled
            ? "border-b border-sagaha-accent/20 bg-sagaha-deep/95 shadow-lg shadow-black/20 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-[0.35em] text-white md:text-2xl"
            onClick={() => setOpen(false)}
          >
            SAGAHA
          </Link>

          <ul className="hidden items-center gap-10 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm font-medium tracking-wide text-sagaha-mist/90 transition hover:text-sagaha-accent"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-6 lg:flex">
            <Link
              href="/login"
              className="text-sm text-sagaha-mist/80 transition hover:text-white"
            >
              Espace pro
            </Link>
            <a
              href="#produits"
              className="rounded-full bg-sagaha-primary px-6 py-2.5 text-sm font-semibold tracking-wide text-white shadow-lux-glow transition hover:bg-sagaha-vine"
            >
              Commander
            </a>
          </div>

          <button
            type="button"
            className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-lg border border-sagaha-accent/25 bg-sagaha-deep/40 text-sagaha-mist lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              {open ? (
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7H20M4 12H20M4 17H20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Fermer le menu"
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-[56] flex w-[min(100%,380px)] flex-col border-l border-sagaha-accent/20 bg-sagaha-night shadow-lux-card lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              <div className="flex items-center justify-between border-b border-sagaha-accent/15 px-5 py-5">
                <span className="font-display text-lg tracking-[0.25em] text-white">MENU</span>
              </div>
              <ul className="flex flex-1 flex-col gap-1 px-4 py-6">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <a
                      href={l.href}
                      className="block rounded-lg px-4 py-3 text-lg text-sagaha-mist/95 transition hover:bg-sagaha-deep hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-auto space-y-3 border-t border-sagaha-accent/15 p-5">
                <Link
                  href="/login"
                  className="block rounded-lg border border-sagaha-accent/30 py-3 text-center text-sm text-sagaha-mist"
                  onClick={() => setOpen(false)}
                >
                  Espace pro
                </Link>
                <a
                  href="#produits"
                  className="block rounded-full bg-sagaha-primary py-3 text-center text-sm font-semibold text-white hover:bg-sagaha-vine"
                  onClick={() => setOpen(false)}
                >
                  Commander
                </a>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
