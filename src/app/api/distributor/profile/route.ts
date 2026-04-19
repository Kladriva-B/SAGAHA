import type { NextRequest } from "next/server";
import { requireDistributorSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { fail, failZod, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { getClientIp, sanitizeText, writeAuditLog } from "@/lib/security";
import { distributorProfilePatchSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const limited = consumeRateLimit(request, "distributor");
    if (limited) return limited;

    const { session, distributor } = await requireDistributorSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Invalid JSON body");
    }
    const parsed = distributorProfilePatchSchema.safeParse(body);
    if (!parsed.success) return failZod(400, parsed.error);

    const d = parsed.data;
    const updated = await prisma.distributor.update({
      where: { id: distributor.id },
      data: {
        ...(d.companyName !== undefined ? { companyName: sanitizeText(d.companyName, 200) } : {}),
        ...(d.region !== undefined ? { region: sanitizeText(d.region, 120) } : {}),
        ...(d.phone !== undefined ? { phone: sanitizeText(d.phone, 30) } : {}),
        ...(d.address !== undefined ? { address: sanitizeText(d.address, 2000) } : {}),
      },
    });

    await writeAuditLog({
      userId: session.user.id,
      action: "DISTRIBUTOR_PROFILE_UPDATE",
      resource: "Distributor",
      details: `id=${distributor.id}`,
      ip: getClientIp(request),
    });

    return ok(jsonReady({ distributor: updated }));
  } catch (e) {
    return handleRouteError(e);
  }
}
