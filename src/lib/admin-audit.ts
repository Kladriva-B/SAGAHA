import type { Session } from "next-auth";
import { getClientIp, sanitizeText, writeAuditLog } from "@/lib/security";

export async function logAdminAction(
  session: Session,
  action: string,
  resource: string,
  details?: string | null,
  request?: Request | null,
): Promise<void> {
  await writeAuditLog({
    userId: session.user?.id ?? null,
    action: sanitizeText(action, 120),
    resource: sanitizeText(resource, 120),
    details: details ? sanitizeText(details, 4000) : undefined,
    ip: request ? getClientIp(request) : null,
  });
}
