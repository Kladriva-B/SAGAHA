import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { adminApiError } from "@/lib/admin-api";
import { requireStaffSession } from "@/lib/admin-staff";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireStaffSession();
    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get("distributorId")?.trim() || undefined;
    const region = searchParams.get("region")?.trim() || undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Prisma.OrderWhereInput = {
      ...(distributorId ? { distributorId } : {}),
      ...(region
        ? {
            distributor: {
              region: { contains: region, mode: "insensitive" },
            },
          }
        : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        distributor: { select: { id: true, companyName: true, region: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ orders });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
