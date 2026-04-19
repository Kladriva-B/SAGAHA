"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type KanbanOrder = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  distributor: { companyName: string; region: string };
  items: { id: string; quantity: number; product: { name: string } }[];
};

type KanbanColumnKey = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "OTHER";
type KanbanBoardColumn = Exclude<KanbanColumnKey, "OTHER">;

const COLS: { status: KanbanBoardColumn; title: string }[] = [
  { status: "PENDING", title: "En attente" },
  { status: "CONFIRMED", title: "Confirmée" },
  { status: "SHIPPED", title: "En livraison" },
  { status: "DELIVERED", title: "Livrée" },
];

export function OrdersKanban({ initial }: { initial: KanbanOrder[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);

  useEffect(() => {
    setOrders(initial);
  }, [initial]);

  const grouped = useMemo(() => {
    const g: Record<KanbanColumnKey, KanbanOrder[]> = {
      PENDING: [],
      CONFIRMED: [],
      SHIPPED: [],
      DELIVERED: [],
      OTHER: [],
    };
    for (const o of orders) {
      switch (o.status) {
        case "PENDING":
          g.PENDING.push(o);
          break;
        case "CONFIRMED":
          g.CONFIRMED.push(o);
          break;
        case "SHIPPED":
          g.SHIPPED.push(o);
          break;
        case "DELIVERED":
          g.DELIVERED.push(o);
          break;
        default:
          g.OTHER.push(o);
      }
    }
    return g;
  }, [orders]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/commandes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Mise à jour impossible");
      return;
    }
    toast.success("Statut mis à jour.");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-white md:text-3xl">Commandes</h1>
        <p className="mt-1 text-sm text-sagaha-mist/60">Vue kanban — sélectionnez un nouveau statut puis validez.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {COLS.map((col) => (
          <div key={col.status} className="rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/35 p-3">
            <h2 className="border-b border-sagaha-accent/10 pb-2 text-sm font-semibold uppercase tracking-wide text-sagaha-accent">
              {col.title}
            </h2>
            <ul className="mt-3 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              {grouped[col.status]?.map((o) => (
                <OrderCard key={o.id} order={o} onApply={updateStatus} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {grouped.OTHER.length > 0 ? (
        <section className="rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/35 p-4">
          <h2 className="text-sm font-semibold text-sagaha-accent">Autres statuts (brouillon / annulé)</h2>
          <ul className="mt-2 space-y-2 text-xs text-sagaha-mist/75">
            {grouped.OTHER.map((o) => (
              <li key={o.id}>
                {o.id.slice(0, 8)} — {o.status}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function OrderCard({ order, onApply }: { order: KanbanOrder; onApply: (id: string, s: string) => Promise<void> }) {
  const [sel, setSel] = useState(order.status);
  return (
    <li className="rounded-lg border border-sagaha-accent/10 bg-sagaha-night/50 p-3 text-xs">
      <p className="font-mono text-[10px] text-sagaha-mist/50">{order.id.slice(0, 10)}…</p>
      <p className="mt-1 font-medium text-white">{order.distributor.companyName}</p>
      <p className="text-sagaha-mist/55">{order.distributor.region}</p>
      <p className="mt-1 tabular-nums text-sagaha-mist">{order.totalAmount.toLocaleString("fr-CM")} XAF</p>
      <ul className="mt-2 space-y-0.5 text-sagaha-mist/65">
        {order.items.slice(0, 4).map((it) => (
          <li key={it.id}>
            {it.product.name} × {it.quantity}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-col gap-2">
        <select
          className="w-full rounded border border-sagaha-accent/25 bg-sagaha-deep px-2 py-1 text-xs text-white"
          value={sel}
          onChange={(e) => setSel(e.target.value)}
        >
          {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={sel === order.status}
          onClick={() => void onApply(order.id, sel)}
          className="rounded bg-sagaha-primary px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
        >
          Mettre à jour
        </button>
      </div>
    </li>
  );
}
