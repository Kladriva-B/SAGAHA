import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { failZod, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { publicDistributorsQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const limited = consumeRateLimit(request, "publicRead");
    if (limited) return limited;

    const qs = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = publicDistributorsQuerySchema.safeParse(qs);
    if (!parsed.success) return failZod(400, parsed.error);

    const { page, pageSize, region, q } = parsed.data;
    const where: Prisma.DistributorWhereInput = {
      status: "ACTIVE",
      ...(region ? { region: { contains: region, mode: "insensitive" } } : {}),
      ...(q
        ? {
            OR: [
              { companyName: { contains: q, mode: "insensitive" } },
              { region: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.distributor.count({ where }),
      prisma.distributor.findMany({
        where,
        select: {
          id: true,
          companyName: true,
          region: true,
          createdAt: true,
        },
        orderBy: { companyName: "asc" },
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
