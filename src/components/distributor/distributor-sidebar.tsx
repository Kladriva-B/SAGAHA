"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/distributeur/tableau-de-bord", label: "Tableau de bord", icon: "◆" },
  { href: "/distributeur/catalogue", label: "Catalogue", icon: "◇" },
  { href: "/distributeur/commandes", label: "Mes commandes", icon: "○" },
  { href: "/distributeur/profil", label: "Mon profil", icon: "▫" },
] as const;

export function DistributorSidebar({ email, companyName }: { email: string; companyName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavInner = (
    <>
      <div className="border-b border-sagaha-accent/15 px-5 py-6">
        <Link href="/" className="font-display text-lg tracking-[0.2em] text-white hover:text-sagaha-accent">
          SAGAHA
        </Link>
        <p className="mt-1 text-xs uppercase tracking-widest text-sagaha-accent/90">Espace distributeur</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-sagaha-primary/25 text-white shadow-lux-glow"
                  : "text-sagaha-mist/80 hover:bg-sagaha-deep/80 hover:text-white"
              }`}
            >
              <span className="text-sagaha-accent/80">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sagaha-accent/10 p-4 text-xs text-sagaha-mist/60">
        <p className="truncate font-medium text-sagaha-mist">{companyName}</p>
        <p className="mt-0.5 truncate text-sagaha-mist/50">{email}</p>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="mt-3 w-full rounded-lg border border-sagaha-accent/25 py-2 text-[11px] font-semibold uppercase tracking-wide text-sagaha-mist hover:bg-sagaha-deep/80"
        >
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-3 z-[70] flex h-10 w-10 items-center justify-center rounded-lg border border-sagaha-accent/25 bg-sagaha-deep text-sagaha-mist lg:hidden"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-lg">☰</span>
      </button>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sagaha-accent/15 bg-sagaha-deep/90 lg:fixed lg:inset-y-0 lg:left-0 lg:flex">
        {NavInner}
      </aside>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-[65] bg-black/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Fermer"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-[66] flex w-72 max-w-[85vw] flex-col border-r border-sagaha-accent/20 bg-sagaha-deep shadow-2xl lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              {NavInner}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
