import type { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { requireDistributorSession } from "@/lib/api-auth";
import { consumeRateLimit } from "@/lib/api-rate-limit";
import { fail, handleRouteError, ok } from "@/lib/api-response";
import { getClientIp, writeAuditLog } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const limited = consumeRateLimit(request, "distributor");
    if (limited) return limited;

    const { session, distributor } = await requireDistributorSession();
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return fail(503, "File storage not configured (BLOB_READ_WRITE_TOKEN)");
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return fail(400, "Missing file");
    }
    if (file.size > 6 * 1024 * 1024) {
      return fail(400, "File too large (max 6 MB)");
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const safe = `sagaha/distributor/${distributor.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(safe, file, { access: "public", token });

    await writeAuditLog({
      userId: session.user.id,
      action: "DISTRIBUTOR_BLOB_UPLOAD",
      resource: "Distributor",
      details: blob.url.slice(0, 400),
      ip: getClientIp(request),
    });

    return ok({ url: blob.url });
  } catch (e) {
    return handleRouteError(e);
  }
}
