import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { requireStaffApiSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { failZod, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { adminOrdersQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const limited = consumeRateLimit(request, "admin");
    if (limited) return limited;

    await requireStaffApiSession();

    const qs = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = adminOrdersQuerySchema.safeParse(qs);
    if (!parsed.success) return failZod(400, parsed.error);

    const { page, pageSize, distributorId, region, from, to } = parsed.data;

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

    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          distributor: { select: { id: true, companyName: true, region: true, phone: true } },
          items: { include: { product: { select: { id: true, name: true, price: true } } } },
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
