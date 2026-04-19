import type { Session } from "next-auth";
import type { Role } from "@prisma/client";
import type { Distributor } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";

/**
 * Session JWT NextAuth (App Router v5). Équivalent usage de `getServerSession(authOptions)` en v4.
 */
export async function getServerSession(): Promise<Session | null> {
  return auth();
}

export function checkRole(session: Session | null, roles: readonly Role[]): boolean {
  const role = session?.user?.role;
  return !!role && roles.includes(role);
}

export async function requireSession(): Promise<Session & { user: NonNullable<Session["user"]> }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError(401, "Unauthorized");
  }
  return session as Session & { user: NonNullable<Session["user"]> };
}

export async function requireRoles(roles: readonly Role[]): Promise<Session & { user: NonNullable<Session["user"]> }> {
  const session = await requireSession();
  if (!checkRole(session, roles)) {
    throw new ApiError(403, "Forbidden");
  }
  return session;
}

export async function requireAdminApiSession(): Promise<Session & { user: NonNullable<Session["user"]> }> {
  return requireRoles(["ADMIN"]);
}

export async function requireStaffApiSession(): Promise<Session & { user: NonNullable<Session["user"]> }> {
  return requireRoles(["ADMIN", "MANAGER"]);
}

export type DistributorContext = {
  session: Session & { user: NonNullable<Session["user"]> };
  distributor: Distributor;
};

export async function requireDistributorSession(): Promise<DistributorContext> {
  const session = await requireRoles(["DISTRIBUTOR"]);
  const distributor = await prisma.distributor.findUnique({
    where: { userId: session.user.id },
  });
  if (!distributor) {
    throw new ApiError(403, "Distributor profile required");
  }
  return { session, distributor };
}
