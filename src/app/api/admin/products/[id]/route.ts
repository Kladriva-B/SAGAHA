import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { logAdminAction } from "@/lib/admin-audit";
import { requireAdminApiSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { ApiError, fail, handleRouteError, ok, failZod } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { productUpdateSchema } from "@/lib/validations";

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const limited = consumeRateLimit(request, "admin");
    if (limited) return limited;

    const session = await requireAdminApiSession();
    const { id } = context.params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Invalid JSON body");
    }
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) return failZod(400, parsed.error);

    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) throw new ApiError(404, "Not Found");

    const data = parsed.data;
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.minStockAlert !== undefined ? { minStockAlert: data.minStockAlert } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
    await logAdminAction(session, "REST_PRODUCT_UPDATE", "Product", `id=${id}`, request);
    return ok(jsonReady({ product }));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return fail(404, e.message);
    return handleRouteError(e);
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const limited = consumeRateLimit(request, "admin");
    if (limited) return limited;

    const session = await requireAdminApiSession();
    const { id } = context.params;
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) throw new ApiError(404, "Not Found");
    await prisma.product.delete({ where: { id } });
    await logAdminAction(session, "REST_PRODUCT_DELETE", "Product", `id=${id}`, request);
    return ok(jsonReady({ deleted: true, id }));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return fail(404, e.message);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return fail(409, "Product is referenced by orders");
    }
    return handleRouteError(e);
  }
}
