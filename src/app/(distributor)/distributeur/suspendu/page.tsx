import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuspenduPage() {
  const session = await auth();
  const dist = await prisma.distributor.findUnique({ where: { userId: session!.user!.id } });
  if (!dist) redirect("/unauthorized");
  if (dist.status !== "SUSPENDED") redirect("/distributeur/tableau-de-bord");

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-red-500/25 bg-sagaha-deep/50 p-8 shadow-lux-card">
        <h1 className="font-display text-2xl text-white">Compte suspendu</h1>
        <p className="mt-3 text-sm leading-relaxed text-sagaha-mist/75">
          L’accès à l’espace distributeur pour <span className="text-sagaha-accent">{dist.companyName}</span> est
          suspendu. Contactez le support SAGAHA pour plus d’informations.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-lg border border-sagaha-accent/30 px-4 py-2 text-sm text-sagaha-mist hover:bg-sagaha-deep/80"
        >
          Retour au site
        </Link>
      </div>
    </main>
  );
}
