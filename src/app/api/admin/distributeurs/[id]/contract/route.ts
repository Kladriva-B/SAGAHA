import { NextRequest, NextResponse } from "next/server";
import { adminApiError } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffSession } from "@/lib/admin-staff";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await requireStaffSession();
    const { id } = context.params;
    const d = await prisma.distributor.findUnique({
      where: { id },
      select: { contractUrl: true, companyName: true },
    });
    if (!d) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    if (!d.contractUrl) {
      return NextResponse.json({ error: "Aucun contrat enregistré pour ce distributeur." }, { status: 404 });
    }
    await logAdminAction(session, "DISTRIBUTOR_CONTRACT_DOWNLOAD", "Distributor", `id=${id}`, request);
    return NextResponse.redirect(d.contractUrl);
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
