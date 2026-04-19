import { NextResponse } from "next/server";
import { adminApiError } from "@/lib/admin-api";
import { requireStaffSession } from "@/lib/admin-staff";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireStaffSession();
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        action: true,
        resource: true,
        createdAt: true,
        ip: true,
        user: { select: { email: true } },
      },
    });
    return NextResponse.json({ logs });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
