import { NextRequest, NextResponse } from "next/server";
import { adminApiError } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffSession } from "@/lib/admin-staff";
import { notifyOrderStatusChange } from "@/lib/notify-order-status";
import { prisma } from "@/lib/prisma";
import { orderStatusUpdateSchema } from "@/lib/validations";

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireStaffSession();
    const { id } = context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        distributor: { select: { companyName: true, region: true, phone: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ order });
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
    const parsed = orderStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    const previousStatus = order.status;

    const updated = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        distributor: { select: { companyName: true, region: true } },
        items: { include: { product: true } },
      },
    });

    await logAdminAction(
      session,
      "ORDER_STATUS_UPDATE",
      "Order",
      `id=${id};status=${parsed.data.status}`,
      request,
    );

    await notifyOrderStatusChange(id, previousStatus, parsed.data.status).catch((err) =>
      console.error("[notify] order status:", err),
    );

    return NextResponse.json({ order: updated });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
