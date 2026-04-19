import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
    include: { user: { select: { email: true } } },
  });

  return (
    <section className="space-y-4">
      <h1 className="font-display text-2xl text-white md:text-3xl">Journal d’audit</h1>
      <p className="text-sm text-sagaha-mist/60">150 dernières entrées — actions sensibles tracées.</p>
      <div className="overflow-x-auto rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/35 shadow-lux-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sagaha-accent/15 text-xs uppercase tracking-wide text-sagaha-mist/55">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Ressource</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Détails</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-sagaha-accent/5 last:border-0">
                <td className="whitespace-nowrap px-4 py-2 text-xs text-sagaha-mist/70">
                  {log.createdAt.toLocaleString("fr-CM")}
                </td>
                <td className="px-4 py-2 font-medium text-sagaha-accent">{log.action}</td>
                <td className="px-4 py-2 text-sagaha-mist/80">{log.resource}</td>
                <td className="px-4 py-2 text-sagaha-mist/80">{log.user?.email ?? "—"}</td>
                <td className="px-4 py-2 text-xs text-sagaha-mist/55">{log.ip ?? "—"}</td>
                <td className="max-w-xs truncate px-4 py-2 text-xs text-sagaha-mist/55">{log.details ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
