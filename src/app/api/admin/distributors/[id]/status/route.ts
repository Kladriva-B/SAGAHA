import type { NextRequest } from "next/server";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffApiSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { ApiError, fail, failZod, handleRouteError, ok } from "@/lib/api-response";
import { sendDistributorApprovedEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { distributorStatusUpdateBodySchema } from "@/lib/validations";

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
    const parsed = distributorStatusUpdateBodySchema.safeParse(body);
    if (!parsed.success) return failZod(400, parsed.error);

    const dist = await prisma.distributor.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    if (!dist) throw new ApiError(404, "Not Found");
    const prevStatus = dist.status;

    const updated = await prisma.distributor.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { user: { select: { email: true } }, _count: { select: { orders: true } } },
    });

    await logAdminAction(
      session,
      "REST_DISTRIBUTOR_STATUS_UPDATE",
      "Distributor",
      `id=${id};status=${parsed.data.status}`,
      request,
    );

    if (parsed.data.status === "ACTIVE" && prevStatus !== "ACTIVE") {
      await sendDistributorApprovedEmail({
        email: dist.user.email,
        companyName: updated.companyName,
      }).catch((err) => console.error("[email] approbation distributeur:", err));
    }

    return ok(jsonReady({ distributor: updated }));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return fail(404, e.message);
    return handleRouteError(e);
  }
}
