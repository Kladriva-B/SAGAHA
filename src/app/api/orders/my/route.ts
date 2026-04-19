import type { NextRequest } from "next/server";
import { requireDistributorSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { failZod, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { myOrdersQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const limited = consumeRateLimit(request, "distributor");
    if (limited) return limited;

    const { distributor } = await requireDistributorSession();

    const qs = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = myOrdersQuerySchema.safeParse(qs);
    if (!parsed.success) return failZod(400, parsed.error);

    const { page, pageSize } = parsed.data;
    const where = { distributorId: distributor.id };

    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: { include: { product: { select: { id: true, name: true, price: true, imageUrl: true } } } },
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
