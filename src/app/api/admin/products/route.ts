import type { NextRequest } from "next/server";
import { logAdminAction } from "@/lib/admin-audit";
import { requireAdminApiSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { fail, handleRouteError, ok, failZod } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { productCreateSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const limited = consumeRateLimit(request, "admin");
    if (limited) return limited;

    const session = await requireAdminApiSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Invalid JSON body");
    }
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) return failZod(400, parsed.error);

    const p = parsed.data;
    const item = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        minStockAlert: p.minStockAlert,
        category: p.category,
        imageUrl: p.imageUrl || null,
        isActive: p.isActive,
      },
    });
    await logAdminAction(session, "REST_PRODUCT_CREATE", "Product", `id=${item.id}`, request);
    return ok(jsonReady({ product: item }));
  } catch (e) {
    return handleRouteError(e);
  }
}
