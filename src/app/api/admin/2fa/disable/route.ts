import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminApiError } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffSession } from "@/lib/admin-staff";
import { prisma } from "@/lib/prisma";
import { totpDisableSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const body = await request.json();
    const parsed = totpDisableSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    const ok = await bcrypt.compare(parsed.data.password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: false, totpSecret: null },
    });
    await logAdminAction(session, "TOTP_DISABLE", "User", user.id, request);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
