import { NextRequest, NextResponse } from "next/server";
import { adminApiError } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffSession } from "@/lib/admin-staff";
import { prisma } from "@/lib/prisma";
import { productUpdateSchema } from "@/lib/validations";

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireStaffSession();
    const { id } = context.params;
    const item = await prisma.product.findUnique({ where: { id } });
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
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", issues: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    const item = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.minStockAlert !== undefined ? { minStockAlert: data.minStockAlert } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
    await logAdminAction(session, "PRODUCT_UPDATE", "Product", `id=${id}`, request);
    return NextResponse.json({ item });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await requireStaffSession();
    const { id } = context.params;
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    await prisma.product.delete({ where: { id } });
    await logAdminAction(session, "PRODUCT_DELETE", "Product", `id=${id}`, request);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Impossible de supprimer (commandes liées ?)" }, { status: 400 });
  }
}
