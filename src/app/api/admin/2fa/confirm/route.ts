import { NextRequest, NextResponse } from "next/server";
import { verifySync } from "otplib";
import { adminApiError } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffSession } from "@/lib/admin-staff";
import { prisma } from "@/lib/prisma";
import { totpConfirmSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const body = await request.json();
    const parsed = totpConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Code ou secret invalide" }, { status: 400 });
    }
    const ok = verifySync({ secret: parsed.data.secret, token: parsed.data.code }).valid;
    if (!ok) {
      return NextResponse.json({ error: "Code incorrect" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: { totpSecret: parsed.data.secret, totpEnabled: true },
    });
    await logAdminAction(session, "TOTP_ENABLE", "User", session.user.id, request);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
