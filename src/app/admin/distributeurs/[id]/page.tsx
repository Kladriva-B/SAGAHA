import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DistributorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const d = await prisma.distributor.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, createdAt: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: { include: { product: { select: { name: true } } } } },
      },
    },
  });
  if (!d) notFound();

  return (
    <div className="space-y-8">
      <Link href="/admin/distributeurs" className="text-xs text-sagaha-accent hover:underline">
        ← Retour liste
      </Link>
      <div>
        <h1 className="font-display text-2xl text-white md:text-3xl">{d.companyName}</h1>
        <p className="mt-2 text-sm text-sagaha-mist/70">
          {d.region} · {d.phone} · {d.user.email}
        </p>
        <p className="mt-2 text-xs text-sagaha-mist/50">
          Statut : <span className="text-sagaha-accent">{d.status}</span>
        </p>
      </div>
      <section className="rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/40 p-4">
        <h2 className="font-display text-lg text-white">Dernières commandes</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {d.orders.map((o) => (
            <li key={o.id} className="rounded-lg border border-sagaha-accent/10 bg-sagaha-night/40 p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-sagaha-mist/80">{o.id.slice(0, 8)}…</span>
                <span className="text-xs text-sagaha-accent">{o.status}</span>
              </div>
              <p className="mt-1 text-xs text-sagaha-mist/55">
                {Number(o.totalAmount).toLocaleString("fr-CM")} XAF ·{" "}
                {o.createdAt.toLocaleDateString("fr-CM")}
              </p>
              <ul className="mt-2 list-inside list-disc text-xs text-sagaha-mist/65">
                {o.items.map((it) => (
                  <li key={it.id}>
                    {it.product.name} × {it.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
