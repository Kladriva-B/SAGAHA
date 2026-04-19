import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminApiError } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffSession } from "@/lib/admin-staff";
import { sendDistributorApprovedEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  action: z.enum(["approve", "suspend", "activate"]),
});

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireStaffSession();
    const { id } = context.params;
    const item = await prisma.distributor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, createdAt: true } },
        orders: { take: 10, orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } },
      },
    });
    if (!item) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await requireStaffSession();
    const { id } = context.params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    const dist = await prisma.distributor.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    if (!dist) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    const prevStatus = dist.status;

    let status = dist.status;
    if (parsed.data.action === "approve") status = "ACTIVE";
    if (parsed.data.action === "suspend") status = "SUSPENDED";
    if (parsed.data.action === "activate") status = "ACTIVE";

    const updated = await prisma.distributor.update({
      where: { id },
      data: { status },
      include: { user: { select: { email: true } }, _count: { select: { orders: true } } },
    });

    await logAdminAction(
      session,
      `DISTRIBUTOR_${parsed.data.action.toUpperCase()}`,
      "Distributor",
      `id=${id};status=${status}`,
      request,
    );

    if (status === "ACTIVE" && prevStatus !== "ACTIVE") {
      await sendDistributorApprovedEmail({
        email: dist.user.email,
        companyName: updated.companyName,
      }).catch((err) => console.error("[email] approbation distributeur:", err));
    }

    return NextResponse.json({ item: updated });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
