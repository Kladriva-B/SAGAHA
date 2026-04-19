import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DistributeurLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DISTRIBUTOR") {
    redirect("/login?callbackUrl=/distributeur/tableau-de-bord");
  }
  const dist = await prisma.distributor.findUnique({ where: { userId: session.user.id } });
  if (!dist) redirect("/unauthorized");
  return <>{children}</>;
}
