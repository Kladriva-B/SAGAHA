import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { DistributorStatus, Prisma } from "@prisma/client";
import { Role } from "@prisma/client";
import { adminApiError } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffSession } from "@/lib/admin-staff";
import { prisma } from "@/lib/prisma";
import { adminDistributorCreateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await requireStaffSession();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
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

    const [total, items] = await Promise.all([
      prisma.distributor.count({ where }),
      prisma.distributor.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * 20,
        take: 20,
        include: {
          user: { select: { email: true } },
          _count: { select: { orders: true } },
        },
      }),
    ]);

    return NextResponse.json({ total, page, pageSize: 20, items });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const body = await request.json();
    const parsed = adminDistributorCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", issues: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    const exists = await prisma.user.findUnique({ where: { email: d.email } });
    if (exists) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }
    const hash = await bcrypt.hash(d.password, 12);
    const dist = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: d.email,
          password: hash,
          role: Role.DISTRIBUTOR,
        },
      });
      return tx.distributor.create({
        data: {
          userId: user.id,
          companyName: d.companyName,
          region: d.region,
          phone: d.phone,
          status: "PENDING",
        },
        include: { user: { select: { email: true } }, _count: { select: { orders: true } } },
      });
    });

    await logAdminAction(
      session,
      "DISTRIBUTOR_CREATE",
      "Distributor",
      `id=${dist.id};email=${d.email}`,
      request,
    );

    return NextResponse.json({ item: dist });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
