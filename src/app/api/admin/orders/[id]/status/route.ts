import type { NextRequest } from "next/server";
import { logAdminAction } from "@/lib/admin-audit";
import { notifyOrderStatusChange } from "@/lib/notify-order-status";
import { requireStaffApiSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { ApiError, fail, failZod, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { adminOrderStatusBodySchema } from "@/lib/validations";

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const limited = consumeRateLimit(request, "admin");
    if (limited) return limited;

    const session = await requireStaffApiSession();
    const { id } = context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Invalid JSON body");
    }
    const parsed = adminOrderStatusBodySchema.safeParse(body);
    if (!parsed.success) return failZod(400, parsed.error);

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Not Found");
    const previousStatus = existing.status;

    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        distributor: { select: { companyName: true, region: true, phone: true } },
        items: { include: { product: true } },
      },
    });

    await logAdminAction(
      session,
      "REST_ORDER_STATUS_UPDATE",
      "Order",
      `id=${id};status=${parsed.data.status}`,
      request,
    );

    await notifyOrderStatusChange(id, previousStatus, parsed.data.status).catch((err) =>
      console.error("[notify] order status:", err),
    );

    return ok(jsonReady({ order }));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return fail(404, e.message);
    return handleRouteError(e);
  }
}
