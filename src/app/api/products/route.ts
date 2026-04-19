import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { failZod, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { publicProductsQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const limited = consumeRateLimit(request, "publicRead");
    if (limited) return limited;

    const qs = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = publicProductsQuerySchema.safeParse(qs);
    if (!parsed.success) return failZod(400, parsed.error);

    const { page, pageSize, category, q } = parsed.data;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
