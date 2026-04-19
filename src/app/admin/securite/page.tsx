import { auth } from "@/lib/auth";
import { TwoFactorPanel } from "@/components/admin/two-factor-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSecuritePage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white md:text-3xl">Sécurité</h1>
        <p className="mt-1 text-sm text-sagaha-mist/60">
          Session admin : expiration après 30 minutes (jeton). Toute action sensible est journalisée.
        </p>
      </div>
      <TwoFactorPanel enabled={user?.totpEnabled ?? false} />
    </div>
  );
}
