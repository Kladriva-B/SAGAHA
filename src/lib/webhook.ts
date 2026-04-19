/**
 * Webhook optionnel (intégrations externes). Ne bloque pas le flux métier en cas d’échec.
 */
export async function emitOrderStatusWebhook(payload: {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  distributorId: string;
  totalAmount: string;
  updatedAt: string;
}): Promise<void> {
  const url = process.env.ORDER_STATUS_WEBHOOK_URL?.trim();
  if (!url) return;

  try {
    const secret = process.env.ORDER_STATUS_WEBHOOK_SECRET;
    const body = JSON.stringify({
      type: "order.status_changed",
      ...payload,
    });
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (secret) {
      headers["X-Sagaha-Signature"] = secret;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    await fetch(url, { method: "POST", headers, body, signal: ctrl.signal });
    clearTimeout(t);
  } catch (e) {
    console.warn("[webhook] order status:", e);
  }
}
