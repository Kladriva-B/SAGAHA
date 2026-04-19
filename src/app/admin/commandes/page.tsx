import type { Prisma } from "@prisma/client";
import { OrdersKanban, type KanbanOrder } from "@/components/admin/orders-kanban";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Search = { [key: string]: string | string[] | undefined };

function pick(s: Search, k: string) {
  const v = s[k];
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
}

export default async function AdminCommandesPage({ searchParams }: { searchParams: Search }) {
  const distributorId = pick(searchParams, "distributorId")?.trim() || undefined;
  const region = pick(searchParams, "region")?.trim() || undefined;
  const from = pick(searchParams, "from");
  const to = pick(searchParams, "to");

  const where: Prisma.OrderWhereInput = {
    ...(distributorId ? { distributorId } : {}),
    ...(region
      ? {
          distributor: {
            region: { contains: region, mode: "insensitive" },
          },
        }
      : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const distributors = await prisma.distributor.findMany({
    select: { id: true, companyName: true },
    orderBy: { companyName: "asc" },
    take: 200,
  });

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      distributor: { select: { companyName: true, region: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  const initial: KanbanOrder[] = orders.map((o) => ({
    id: o.id,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    createdAt: o.createdAt.toISOString(),
    distributor: o.distributor,
    items: o.items.map((it) => ({
      id: it.id,
      quantity: it.quantity,
      product: { name: it.product.name },
    })),
  }));

  return (
    <div className="space-y-6">
      <form
        method="get"
        className="flex flex-col gap-3 rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/40 p-4 lg:flex-row lg:flex-wrap lg:items-end"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-sagaha-mist/55">Distributeur</label>
          <select
            name="distributorId"
            defaultValue={distributorId ?? ""}
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
          >
            <option value="">Tous</option>
            {distributors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.companyName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-sagaha-mist/55">Région (texte)</label>
          <input
            name="region"
            defaultValue={region ?? ""}
            placeholder="ex. Littoral"
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-sagaha-mist/55">Du</label>
          <input
            name="from"
            type="date"
            defaultValue={from ?? ""}
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-sagaha-mist/55">Au</label>
          <input
            name="to"
            type="date"
            defaultValue={to ?? ""}
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-sagaha-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#388e3c]"
        >
          Filtrer
        </button>
      </form>
      <OrdersKanban initial={initial} />
    </div>
  );
}
