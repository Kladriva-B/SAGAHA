import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Commande ${params.id.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function CommandeDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const dist = await prisma.distributor.findUnique({ where: { userId: session!.user!.id } });
  if (!dist) redirect("/unauthorized");

  const order = await prisma.order.findFirst({
    where: { id: params.id, distributorId: dist.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/distributeur/commandes" className="text-xs text-sagaha-accent hover:underline">
        ← Retour aux commandes
      </Link>
      <div>
        <h1 className="font-display text-2xl text-white">Commande</h1>
        <p className="mt-1 font-mono text-xs text-sagaha-mist/50">{order.id}</p>
        <p className="mt-2 text-sm text-sagaha-mist/70">
          Statut : <span className="text-sagaha-accent">{order.status}</span> —{" "}
          {order.createdAt.toLocaleString("fr-FR")}
        </p>
      </div>

      <div className="rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/35 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-sagaha-accent">Articles</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between gap-4 border-b border-sagaha-accent/5 py-2 last:border-0">
              <span className="text-sagaha-mist">{it.product.name}</span>
              <span className="tabular-nums text-white">
                × {it.quantity} — {(Number(it.unitPrice) * it.quantity).toLocaleString("fr-FR")} XAF
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-lg font-semibold text-white">
          Total : {Number(order.totalAmount).toLocaleString("fr-FR")} XAF
        </p>
      </div>

      <a
        href={`/api/distributor/orders/${order.id}/invoice`}
        className="inline-flex rounded-lg border border-sagaha-accent/30 px-4 py-2 text-sm font-medium text-sagaha-mist hover:bg-sagaha-deep/80"
      >
        Télécharger la facture PDF
      </a>
    </div>
  );
}
