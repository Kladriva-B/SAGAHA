import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardOrdersChart, type OrdersChartPoint } from "@/components/admin/dashboard-orders-chart";

export const dynamic = "force-dynamic";

function startOfMonth(d = new Date()) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildLast30DaysChart(orders: { createdAt: Date }[]): OrdersChartPoint[] {
  const keys: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  const counts = new Map<string, number>();
  for (const k of keys) counts.set(k, 0);
  for (const o of orders) {
    const k = o.createdAt.toISOString().slice(0, 10);
    if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return keys.map((k) => ({
    date: `${k.slice(8, 10)}/${k.slice(5, 7)}`,
    count: counts.get(k) ?? 0,
  }));
}

export default async function AdminDashboardPage() {
  const monthStart = startOfMonth();
  const chartStart = new Date();
  chartStart.setDate(chartStart.getDate() - 30);
  chartStart.setHours(0, 0, 0, 0);

  const [
    distributorTotal,
    pendingDistributors,
    ordersMonthCount,
    revenueAgg,
    deliveredMonth,
    pipelineMonth,
    recentAudits,
    orders30d,
  ] = await Promise.all([
    prisma.distributor.count(),
    prisma.distributor.count({ where: { status: "PENDING" } }),
    prisma.order.count({
      where: { createdAt: { gte: monthStart }, status: { notIn: ["CANCELLED", "DRAFT"] } },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: monthStart },
        status: { notIn: ["CANCELLED", "DRAFT"] },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({
      where: { createdAt: { gte: monthStart }, status: "DELIVERED" },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: monthStart },
        status: { in: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { email: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: chartStart } },
      select: { createdAt: true },
    }),
  ]);

  const ca = Number(revenueAgg._sum.totalAmount ?? 0);
  const deliveryRate =
    pipelineMonth > 0 ? Math.round((1000 * deliveredMonth) / pipelineMonth) / 10 : pipelineMonth === 0 ? 100 : 0;

  const series = buildLast30DaysChart(orders30d);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-white md:text-3xl">Tableau de bord</h1>
        <p className="mt-1 text-sm text-sagaha-mist/65">Vue opérationnelle — données temps réel à chaque chargement.</p>
      </div>

      {pendingDistributors > 0 ? (
        <div className="rounded-xl border border-sagaha-accent/40 bg-sagaha-accent/10 px-4 py-3 text-sm text-sagaha-mist">
          <span className="font-semibold">{pendingDistributors}</span> distributeur(s) en attente d’approbation —{" "}
          <Link href="/admin/distributeurs?status=PENDING" className="underline underline-offset-2">
            Traiter
          </Link>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Distributeurs", value: distributorTotal },
          { label: "Commandes (mois)", value: ordersMonthCount },
          { label: "CA (mois) XAF", value: new Intl.NumberFormat("fr-CM").format(Math.round(ca)) },
          { label: "Taux livraison (mois)", value: `${deliveryRate} %` },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/50 px-5 py-4 shadow-lux-card"
          >
            <p className="text-xs uppercase tracking-widest text-sagaha-mist/55">{c.label}</p>
            <p className="mt-2 font-display text-2xl tabular-nums text-white">{c.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-sagaha-accent/15 bg-sagaha-deep/40 p-6 shadow-lux-card">
        <h2 className="font-display text-lg text-white">Commandes — 30 derniers jours</h2>
        <p className="mt-1 text-xs text-sagaha-mist/55">Volume quotidien</p>
        <div className="mt-6">
          <DashboardOrdersChart data={series} />
        </div>
      </section>

      <section className="rounded-2xl border border-sagaha-accent/15 bg-sagaha-deep/40 p-6 shadow-lux-card">
        <h2 className="font-display text-lg text-white">5 dernières actions (audit)</h2>
        <ul className="mt-4 divide-y divide-sagaha-accent/10">
          {recentAudits.map((log) => (
            <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <p className="font-medium text-sagaha-accent">{log.action}</p>
                <p className="text-xs text-sagaha-mist/55">
                  {log.resource} · {log.user?.email ?? "—"}
                </p>
              </div>
              <time className="text-xs text-sagaha-mist/50" dateTime={log.createdAt.toISOString()}>
                {log.createdAt.toLocaleString("fr-CM")}
              </time>
            </li>
          ))}
        </ul>
        <Link href="/admin/audit" className="mt-4 inline-block text-xs text-sagaha-accent hover:underline">
          Voir tout le journal →
        </Link>
      </section>
    </div>
  );
}
