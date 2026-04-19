import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { requireStaffApiSession } from "@/lib/api-auth";
import { failZod, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { adminDistributorsQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const limited = consumeRateLimit(request, "admin");
    if (limited) return limited;

    await requireStaffApiSession();

    const qs = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = adminDistributorsQuerySchema.safeParse(qs);
    if (!parsed.success) return failZod(400, parsed.error);

    const { page, pageSize, region, status: statusParam, q } = parsed.data;

    const where: Prisma.DistributorWhereInput = {
      ...(region ? { region: { contains: region, mode: "insensitive" } } : {}),
      ...(statusParam ? { status: statusParam } : {}),
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
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { email: true } },
          _count: { select: { orders: true } },
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return ok(jsonReady({ items }), {
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
