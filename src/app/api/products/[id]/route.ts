import type { NextRequest } from "next/server";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { ApiError, fail, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const limited = consumeRateLimit(_request, "publicRead");
    if (limited) return limited;

    const { id } = context.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || !product.isActive) {
      throw new ApiError(404, "Not Found");
    }
    return ok(jsonReady({ product }));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return fail(404, e.message);
    }
    return handleRouteError(e);
  }
}
