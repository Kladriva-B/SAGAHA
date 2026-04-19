import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfilClient } from "@/components/distributor/profil-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Mon profil",
    description: "Coordonnées distributeur et documents (KBIS, contrats).",
    openGraph: { title: "Profil distributeur | SAGAHA" },
  };
}

export default async function ProfilPage() {
  const session = await auth();
  const dist = await prisma.distributor.findUnique({
    where: { userId: session!.user!.id },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });
  if (!dist) return null;

  const initial = {
    companyName: dist.companyName,
    region: dist.region,
    phone: dist.phone,
    address: dist.address,
    documents: dist.documents.map((d) => ({
      id: d.id,
      label: d.label,
      fileUrl: d.fileUrl,
      createdAt: d.createdAt.toISOString(),
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white md:text-3xl">Mon profil</h1>
        <p className="mt-1 text-sm text-sagaha-mist/60">Mettez à jour vos informations et joignez vos pièces.</p>
      </div>
      <ProfilClient initial={initial} />
    </div>
  );
}
