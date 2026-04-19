import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Mes commandes",
    description: "Historique des commandes, statuts et téléchargement de factures PDF.",
    openGraph: { title: "Mes commandes | SAGAHA" },
  };
}

const statusFr: Record<string, string> = {
  DRAFT: "Brouillon",
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "En livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default async function CommandesPage() {
  const session = await auth();
  const dist = await prisma.distributor.findUnique({ where: { userId: session!.user!.id } });
  if (!dist) return null;

  const orders = await prisma.order.findMany({
    where: { distributorId: dist.id },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white md:text-3xl">Mes commandes</h1>
        <p className="mt-1 text-sm text-sagaha-mist/60">Historique et suivi des statuts.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/35">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sagaha-accent/10 text-xs uppercase tracking-wide text-sagaha-mist/55">
            <tr>
              <th className="px-4 py-3">Réf.</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-sagaha-accent/5 hover:bg-sagaha-night/30">
                <td className="px-4 py-3 font-mono text-xs text-sagaha-mist/70">{o.id.slice(0, 14)}…</td>
                <td className="px-4 py-3 text-sagaha-mist/80">{o.createdAt.toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 tabular-nums text-white">{Number(o.totalAmount).toLocaleString("fr-FR")} XAF</td>
                <td className="px-4 py-3 text-xs font-medium uppercase text-sagaha-accent/90">
                  {statusFr[o.status] ?? o.status}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/distributeur/commandes/${o.id}`}
                      className="text-xs text-sagaha-accent hover:underline"
                    >
                      Détail
                    </Link>
                    <a
                      href={`/api/distributor/orders/${o.id}/invoice`}
                      className="text-xs text-sagaha-mist/70 hover:text-white hover:underline"
                    >
                      Facture PDF
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-sagaha-mist/50">Aucune commande.</p>
        ) : null}
      </div>
    </div>
  );
}
