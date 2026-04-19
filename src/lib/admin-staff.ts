import type { Session } from "next-auth";
import { auth } from "@/lib/auth";

export type StaffRole = "ADMIN" | "MANAGER";

export function isStaffRole(role: string | undefined): role is StaffRole {
  return role === "ADMIN" || role === "MANAGER";
}

export async function requireStaffSession(): Promise<Session & { user: NonNullable<Session["user"]> }> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }
  if (!isStaffRole(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
  return session as Session & { user: NonNullable<Session["user"]> };
}
