import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import type { DistributorStatus } from "@prisma/client";
import { adminApiError } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffSession } from "@/lib/admin-staff";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region")?.trim() || undefined;
    const statusParam = searchParams.get("status")?.trim();
    const q = searchParams.get("q")?.trim() ?? "";

    const status =
      statusParam && ["PENDING", "ACTIVE", "SUSPENDED"].includes(statusParam)
        ? (statusParam as DistributorStatus)
        : undefined;

    const where: Prisma.DistributorWhereInput = {
      ...(region ? { region: { contains: region, mode: "insensitive" } } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { companyName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { region: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const rows = await prisma.distributor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5000,
      include: { user: { select: { email: true } }, _count: { select: { orders: true } } },
    });

    const header = ["companyName", "region", "phone", "status", "email", "ordersCount"].join(";");
    const lines = rows.map((r) =>
      [
        escapeCsv(r.companyName),
        escapeCsv(r.region),
        escapeCsv(r.phone),
        r.status,
        escapeCsv(r.user.email),
        r._count.orders,
      ].join(";"),
    );
    const csv = [header, ...lines].join("\n");

    await logAdminAction(session, "DISTRIBUTORS_EXPORT_CSV", "Distributor", `rows=${rows.length}`, request);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sagaha-distributeurs.csv"`,
      },
    });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function escapeCsv(s: string) {
  if (s.includes(";") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
