import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { DistributorCartProvider } from "@/components/distributor/distributor-cart-provider";
import { DistributorSidebar } from "@/components/distributor/distributor-sidebar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Espace distributeur",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DistributeurPortailLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const distributor = await prisma.distributor.findUnique({ where: { userId: session!.user!.id } });
  if (!distributor) redirect("/unauthorized");
  if (distributor.status === "PENDING") redirect("/distributeur/en-attente");
  if (distributor.status === "SUSPENDED") redirect("/distributeur/suspendu");

  return (
    <DistributorCartProvider>
      <div className="min-h-screen bg-sagaha-night text-sagaha-mist">
        <Toaster richColors position="top-right" theme="dark" />
        <div className="flex min-h-screen">
          <DistributorSidebar email={session!.user!.email ?? ""} companyName={distributor.companyName} />
          <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
            <header className="sticky top-0 z-40 border-b border-sagaha-accent/10 bg-sagaha-night/90 px-4 py-4 backdrop-blur lg:px-8">
              <p className="text-xs uppercase tracking-[0.25em] text-sagaha-accent/80">Portail distributeur</p>
            </header>
            <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </div>
        </div>
      </div>
    </DistributorCartProvider>
  );
}
