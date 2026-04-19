import Link from "next/link";
import type { DistributorStatus, Prisma } from "@prisma/client";
import { DistributorCreateForm } from "@/components/admin/distributor-create-form";
import { DistributorRowActions } from "@/components/admin/distributor-row-actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Search = { [key: string]: string | string[] | undefined };

function pick(s: Search, k: string) {
  const v = s[k];
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
}

export default async function AdminDistributeursPage({ searchParams }: { searchParams: Search }) {
  const page = Math.max(1, Number.parseInt(pick(searchParams, "page") ?? "1", 10) || 1);
  const region = pick(searchParams, "region")?.trim() || undefined;
  const statusParam = pick(searchParams, "status")?.trim();
  const q = pick(searchParams, "q")?.trim() ?? "";

  const status =
    statusParam && ["PENDING", "ACTIVE", "SUSPENDED"].includes(statusParam)
      ? (statusParam as DistributorStatus)
      : undefined;

  const where: Prisma.DistributorWhereInput = {
    ...(region ? { region: { contains: region, mode: "insensitive" } } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { companyName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { region: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, items, regionRows] = await Promise.all([
    prisma.distributor.count({ where }),
    prisma.distributor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
      include: {
        user: { select: { email: true } },
        _count: { select: { orders: true } },
      },
    }),
    prisma.distributor.findMany({
      distinct: ["region"],
      select: { region: true },
      orderBy: { region: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / 20));
  const buildParams = (pageNum: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (region) p.set("region", region);
    if (status) p.set("status", status);
    if (pageNum > 1) p.set("page", String(pageNum));
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const exportQs = new URLSearchParams();
  if (q) exportQs.set("q", q);
  if (region) exportQs.set("region", region);
  if (status) exportQs.set("status", status);
  const exportHref = `/api/admin/distributeurs/export?${exportQs.toString()}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-white md:text-3xl">Distributeurs</h1>
          <p className="mt-1 text-sm text-sagaha-mist/60">{total} fiche(s) — pagination 20 / page</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={exportHref}
            className="rounded-lg border border-sagaha-accent/35 px-4 py-2 text-sm text-sagaha-mist hover:bg-sagaha-deep"
          >
            Export CSV
          </a>
          <DistributorCreateForm />
        </div>
      </div>

      <form method="get" className="flex flex-col gap-3 rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/40 p-4 md:flex-row md:flex-wrap md:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-sagaha-mist/55">Recherche</label>
          <input
            name="q"
            defaultValue={q}
            placeholder="Société, email, téléphone, région…"
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-sagaha-mist/55">Région</label>
          <select
            name="region"
            defaultValue={region ?? ""}
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
          >
            <option value="">Toutes</option>
            {regionRows.map((r) => (
              <option key={r.region} value={r.region}>
                {r.region}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-sagaha-mist/55">Statut</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
          >
            <option value="">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="ACTIVE">Actif</option>
            <option value="SUSPENDED">Suspendu</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-sagaha-primary px-4 py-2 text-sm font-semibold text-white hover:bg-sagaha-vine"
        >
          Filtrer
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/30 shadow-lux-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sagaha-accent/15 text-xs uppercase tracking-wide text-sagaha-mist/55">
            <tr>
              <th className="px-4 py-3">Société</th>
              <th className="px-4 py-3">Région</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Commandes</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-b border-sagaha-accent/5 last:border-0">
                <td className="px-4 py-3 font-medium text-white">{d.companyName}</td>
                <td className="px-4 py-3 text-sagaha-mist/80">{d.region}</td>
                <td className="px-4 py-3 text-sagaha-mist/80">{d.phone}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-sagaha-accent/25 px-2 py-0.5 text-xs text-sagaha-accent">
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-sagaha-mist">{d._count.orders}</td>
                <td className="px-4 py-3">
                  <DistributorRowActions row={{ id: d.id, companyName: d.companyName, status: d.status }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-sagaha-mist/70">
        <p>
          Page {page} / {totalPages}
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={`/admin/distributeurs${buildParams(page - 1)}`}
              className="rounded-lg border border-sagaha-accent/30 px-3 py-1 hover:bg-sagaha-deep"
            >
              Précédent
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              href={`/admin/distributeurs${buildParams(page + 1)}`}
              className="rounded-lg border border-sagaha-accent/30 px-3 py-1 hover:bg-sagaha-deep"
            >
              Suivant
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
