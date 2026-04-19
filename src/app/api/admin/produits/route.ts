import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { adminApiError } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffSession } from "@/lib/admin-staff";
import { prisma } from "@/lib/prisma";
import { productCreateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await requireStaffSession();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const where: Prisma.ProductWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};
    const items = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const body = await request.json();
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", issues: parsed.error.flatten() }, { status: 400 });
    }
    const p = parsed.data;
    const item = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        minStockAlert: p.minStockAlert,
        category: p.category,
        imageUrl: p.imageUrl || null,
        isActive: p.isActive,
      },
    });
    await logAdminAction(session, "PRODUCT_CREATE", "Product", `id=${item.id};name=${item.name}`, request);
    return NextResponse.json({ item });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
