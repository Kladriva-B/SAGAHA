import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusEmail } from "@/lib/email";
import { emitOrderStatusWebhook } from "@/lib/webhook";
export async function notifyOrderStatusChange(
  orderId: string,
  previousStatus: OrderStatus,
  newStatus: OrderStatus,
): Promise<void> {
  if (previousStatus === newStatus) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      distributor: {
        include: { user: { select: { email: true } } },
      },
    },
  });
  if (!order) return;

  const email = order.distributor.user.email;
  if (email && previousStatus !== newStatus) {
    await sendOrderStatusEmail({
      email,
      companyName: order.distributor.companyName,
      orderId: order.id,
      status: newStatus,
      totalAmount: order.totalAmount.toString(),
    });
  }

  await emitOrderStatusWebhook({
    orderId: order.id,
    previousStatus,
    newStatus,
    distributorId: order.distributorId,
    totalAmount: order.totalAmount.toString(),
    updatedAt: order.updatedAt.toISOString(),
  });
}
