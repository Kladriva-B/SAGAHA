"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  admin: "Admin",
  distributeurs: "Distributeurs",
  produits: "Produits",
  commandes: "Commandes",
  audit: "Audit",
  securite: "Sécurité",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const crumbs: { href: string; label: string }[] = [];
  let acc = "";
  for (const p of parts) {
    acc += `/${p}`;
    crumbs.push({ href: acc, label: labels[p] ?? p });
  }

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Fil d’Ariane" className="text-xs text-sagaha-mist/55">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1.5">
            {i > 0 ? <span className="text-sagaha-accent/40">/</span> : null}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-sagaha-mist">{c.label}</span>
            ) : (
              <Link href={c.href} className="transition hover:text-sagaha-accent">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
