import type { NextRequest } from "next/server";
import { requireDistributorSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { fail, failZod, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { getClientIp, sanitizeText, writeAuditLog } from "@/lib/security";
import { distributorDocumentBodySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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
    const parsed = distributorDocumentBodySchema.safeParse(body);
    if (!parsed.success) return failZod(400, parsed.error);

    const doc = await prisma.distributorDocument.create({
      data: {
        distributorId: distributor.id,
        label: sanitizeText(parsed.data.label, 120),
        fileUrl: parsed.data.fileUrl,
      },
    });

    await writeAuditLog({
      userId: session.user.id,
      action: "DISTRIBUTOR_DOCUMENT_ADD",
      resource: "DistributorDocument",
      details: `id=${doc.id}`,
      ip: getClientIp(request),
    });

    return ok(jsonReady({ document: doc }));
  } catch (e) {
    return handleRouteError(e);
  }
}
