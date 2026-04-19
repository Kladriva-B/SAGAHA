import type { ReactNode } from "react";
import Link from "next/link";

const cols = [
  {
    title: "Produits",
    links: [
      { href: "#produits", label: "Catalogue" },
      { href: "#notre-the", label: "Notre savoir-faire" },
      { href: "#distributeurs", label: "Réseau" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { href: "#contact", label: "Contact" },
      { href: "/login", label: "Espace pro" },
      { href: "/register", label: "Devenir distributeur" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "#", label: "Mentions légales" },
      { href: "#", label: "Politique de confidentialité" },
      { href: "#", label: "CGV B2B" },
    ],
  },
] as const;

function SocialIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-sagaha-accent/25 text-sagaha-mist transition hover:border-sagaha-accent hover:text-white"
    >
      {children}
    </a>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-sagaha-accent/15 bg-slate-950 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-display text-2xl font-semibold tracking-[0.35em] text-white">SAGAHA</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sagaha-mist/75">
              L’excellence du thé africain, du Cameroun au monde.
            </p>
            <div className="mt-8 flex gap-3">
              <SocialIcon href="https://linkedin.com" label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M6.5 8.5h-3V21h3V8.5zm-1.5-5C4.1 3.5 3 4.6 3 6s1.1 2.5 2.5 2.5S8 7.4 8 6 6.9 3.5 5 3.5zm15 8.2c0-3.2-2.1-5.7-5.8-5.7-1.7 0-3.4.9-4 2.1V8.5H7V21h4.5v-6.5c0-1.5.3-3 2.3-3 2 0 2 1.9 2 3.3V21H21v-7.8z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5A5.5 5.5 0 1112 17a5.5 5.5 0 010-9.5zm0 2A3.5 3.5 0 1012 15a3.5 3.5 0 000-7zM17.5 6.5h.01v.01H17.5V6.5z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://facebook.com" label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M13 10h3V7h-3V4.6c0-.8.1-1.4.4-1.8.4-.6 1.1-.9 2.1-.9H18V0h-2.5c-2.3 0-3.9.6-4.9 1.8C9.7 2.9 9.2 4.6 9.2 7V7H7v3h2.2V22H13V10z" />
                </svg>
              </SocialIcon>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sagaha-accent">{col.title}</p>
                <ul className="mt-4 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") ? (
                        <Link
                          href={l.href}
                          className="text-sm text-sagaha-mist/75 transition hover:text-white"
                        >
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className="text-sm text-sagaha-mist/75 transition hover:text-white">
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-sagaha-accent/10 pt-8 text-xs text-sagaha-mist/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} SAGAHA SARL — Capital social et immatriculation conformes au droit camerounais.</p>
          <p className="text-sagaha-mist/40">Design &amp; expérience — usage interne / démonstration.</p>
        </div>
      </div>
    </footer>
  );
}
