import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { fail, failZod, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { jsonReady } from "@/lib/prisma-serialize";
import { getClientIp, sanitizeText, writeAuditLog } from "@/lib/security";
import { sendDistributorApplicationEmails } from "@/lib/email";
import { candidatureSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const limited = consumeRateLimit(request, "publicWrite");
    if (limited) return limited;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Invalid JSON body");
    }

    const parsed = candidatureSchema.safeParse(body);
    if (!parsed.success) return failZod(400, parsed.error);

    const data = parsed.data;
    const ip = getClientIp(request);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) {
      await writeAuditLog({
        action: "REST_DISTRIBUTOR_APPLY_REJECTED",
        resource: "Distributor",
        details: "email_exists",
        ip,
      });
      return fail(409, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const distributor = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: passwordHash,
          role: Role.DISTRIBUTOR,
        },
      });
      return tx.distributor.create({
        data: {
          userId: user.id,
          companyName: sanitizeText(data.companyName, 200),
          region: sanitizeText(data.region, 120),
          phone: sanitizeText(data.phone, 30),
          applicationNotes: data.notes ? sanitizeText(data.notes, 2000) : null,
          status: "PENDING",
        },
        select: { id: true, companyName: true, region: true, status: true, createdAt: true },
      });
    });

    await sendDistributorApplicationEmails({
      applicantEmail: data.email,
      companyName: distributor.companyName,
      region: distributor.region,
      phone: data.phone,
      notes: data.notes,
    }).catch((err) => console.error("[email] candidature:", err));

    await writeAuditLog({
      action: "REST_DISTRIBUTOR_APPLY_SUCCESS",
      resource: "Distributor",
      details: sanitizeText(`id=${distributor.id};email=${data.email}`, 500),
      ip,
    });

    return ok(jsonReady({ distributor }));
  } catch (e) {
    return handleRouteError(e);
  }
}
