import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { requireDistributorSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { ApiError, fail, failZod, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { sendAdminNewOrderEmail } from "@/lib/email";
import { getClientIp, sanitizeText, writeAuditLog } from "@/lib/security";
import { orderCreateSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const limited = consumeRateLimit(request, "distributor");
    if (limited) return limited;

    const { session, distributor } = await requireDistributorSession();
    if (distributor.status !== "ACTIVE") {
      throw new ApiError(403, "Distributor account is not active");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Invalid JSON body");
    }

    const parsed = orderCreateSchema.safeParse(body);
    if (!parsed.success) return failZod(400, parsed.error);

    const merged = new Map<string, number>();
    for (const line of parsed.data.items) {
      merged.set(line.productId, (merged.get(line.productId) ?? 0) + line.quantity);
    }
    const lines = Array.from(merged.entries()).map(([productId, quantity]) => ({ productId, quantity }));

    const ip = getClientIp(request);

    const order = await prisma.$transaction(async (tx) => {
      let total = new Prisma.Decimal(0);
      const lineData: { productId: string; quantity: number; unitPrice: Prisma.Decimal }[] = [];

      for (const line of lines) {
        const product = await tx.product.findUnique({ where: { id: line.productId } });
        if (!product?.isActive) {
          throw new ApiError(400, `Invalid or inactive product: ${line.productId}`);
        }
        if (product.stock < line.quantity) {
          throw new ApiError(400, `Insufficient stock for product: ${product.name}`);
        }
        const lineTotal = product.price.mul(line.quantity);
        total = total.add(lineTotal);
        lineData.push({
          productId: product.id,
          quantity: line.quantity,
          unitPrice: product.price,
        });
      }

      const created = await tx.order.create({
        data: {
          distributorId: distributor.id,
          status: "PENDING",
          totalAmount: total,
          items: {
            create: lineData.map((l) => ({
              productId: l.productId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
            })),
          },
        },
        include: {
          items: { include: { product: { select: { id: true, name: true, price: true } } } },
          distributor: { select: { id: true, companyName: true, region: true } },
        },
      });

      for (const line of lines) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stock: { decrement: line.quantity } },
        });
      }

      return created;
    });

    await writeAuditLog({
      userId: session.user.id,
      action: "REST_ORDER_CREATE",
      resource: "Order",
      details: sanitizeText(`orderId=${order.id};total=${order.totalAmount.toString()}`, 800),
      ip,
    });

    await sendAdminNewOrderEmail({
      orderId: order.id,
      companyName: order.distributor.companyName,
      region: order.distributor.region,
      totalAmount: order.totalAmount.toString(),
    }).catch((err) => console.error("[email] nouvelle commande:", err));

    return ok(jsonReady({ order }));
  } catch (e) {
    return handleRouteError(e);
  }
}
