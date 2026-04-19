import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tableau de bord",
    description: "Statistiques personnelles, commandes récentes et solde compte distributeur SAGAHA.",
    openGraph: { title: "Tableau de bord distributeur | SAGAHA" },
  };
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function TableauDeBordPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/distributeur/tableau-de-bord");
  const dist = await prisma.distributor.findUnique({
    where: { userId: session.user.id },
    include: {
      _count: { select: { orders: true } },
    },
  });
  if (!dist) redirect("/unauthorized");

  const [monthAgg, recent, deliveredCount, pendingCount] = await Promise.all([
    prisma.order.aggregate({
      where: {
        distributorId: dist.id,
        createdAt: { gte: startOfMonth() },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.findMany({
      where: { distributorId: dist.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: { take: 3, include: { product: { select: { name: true } } } } },
    }),
    prisma.order.count({ where: { distributorId: dist.id, status: "DELIVERED" } }),
    prisma.order.count({ where: { distributorId: dist.id, status: "PENDING" } }),
  ]);

  const caMois = monthAgg._sum.totalAmount?.toString() ?? "0";
  const solde = dist.accountBalance.toString();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-white md:text-3xl">Tableau de bord</h1>
        <p className="mt-1 text-sm text-sagaha-mist/60">Vue d’ensemble de votre activité chez SAGAHA.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Commandes (total)" value={String(dist._count.orders)} />
        <StatCard label="CA du mois (XAF)" value={Number(caMois).toLocaleString("fr-FR")} />
        <StatCard label="Solde compte (XAF)" value={Number(solde).toLocaleString("fr-FR")} hint="Provision / crédit" />
        <StatCard label="En attente / Livrées" value={`${pendingCount} / ${deliveredCount}`} />
      </div>

      <section className="rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/35 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sagaha-accent">Commandes récentes</h2>
          <Link href="/distributeur/commandes" className="text-xs text-sagaha-mist/70 hover:text-white">
            Voir tout →
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {recent.length === 0 ? (
            <li className="text-sm text-sagaha-mist/50">Aucune commande pour le moment.</li>
          ) : (
            recent.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sagaha-accent/10 bg-sagaha-night/40 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-mono text-xs text-sagaha-mist/50">{o.id.slice(0, 12)}…</p>
                  <p className="text-sagaha-mist/80">
                    {o.items.map((i) => i.product.name).join(", ")}
                    {o.items.length >= 3 ? "…" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums text-white">{Number(o.totalAmount).toLocaleString("fr-FR")} XAF</p>
                  <p className="text-xs uppercase text-sagaha-accent/90">{o.status}</p>
                </div>
                <Link
                  href={`/distributeur/commandes/${o.id}`}
                  className="w-full text-right text-xs text-sagaha-accent hover:underline sm:w-auto"
                >
                  Détail
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/distributeur/catalogue"
          className="rounded-lg bg-sagaha-primary px-4 py-2 text-sm font-semibold text-white shadow-lux-glow hover:bg-sagaha-primary/90"
        >
          Passer une commande
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/40 p-4 shadow-lux-card">
      <p className="text-xs uppercase tracking-wide text-sagaha-mist/55">{label}</p>
      <p className="mt-2 font-display text-2xl text-white">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-sagaha-mist/45">{hint}</p> : null}
    </div>
  );
}
