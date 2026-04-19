import type { NextRequest } from "next/server";
import { requireStaffApiSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { ApiError, fail, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const limited = consumeRateLimit(_request, "admin");
    if (limited) return limited;

    await requireStaffApiSession();
    const { id } = context.params;

    const distributor = await prisma.distributor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, createdAt: true, role: true } },
        orders: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: { items: { include: { product: true } } },
        },
      },
    });
    if (!distributor) throw new ApiError(404, "Not Found");

    return ok(jsonReady({ distributor }));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return fail(404, e.message);
    return handleRouteError(e);
  }
}
