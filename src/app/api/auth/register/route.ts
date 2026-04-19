import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import {
  getClientIp,
  getCsrfSecretFromCookie,
  sanitizeText,
  verifyCsrfToken,
  writeAuditLog,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  const secret = getCsrfSecretFromCookie(request);
  const token = request.headers.get("x-csrf-token");
  if (!secret || !token || !verifyCsrfToken(secret, token)) {
    return NextResponse.json({ error: "Jeton CSRF invalide." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      Object.values(flat.fieldErrors)
        .flat()
        .find((m) => m) ?? flat.formErrors[0];
    return NextResponse.json(
      { error: first ?? "Données invalides.", issues: flat.fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const ip = getClientIp(request);

  try {
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) {
      await writeAuditLog({
        action: "REGISTER_REJECTED",
        resource: "User",
        details: "email_exists",
        ip,
      });
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: passwordHash,
          role: Role.DISTRIBUTOR,
        },
      });
      await tx.distributor.create({
        data: {
          userId: user.id,
          companyName: sanitizeText(data.companyName, 200),
          region: sanitizeText(data.region, 120),
          phone: sanitizeText(data.phone, 30),
        },
      });
    });
  } catch (e) {
    console.error("[register]", e);
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code?: string }).code) : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }
    return NextResponse.json(
      {
        error:
          "Impossible de joindre la base de données ou d’enregistrer le compte. Vérifiez que PostgreSQL tourne (DATABASE_URL) puis réessayez.",
      },
      { status: 503 },
    );
  }

  await writeAuditLog({
    action: "REGISTER_SUCCESS",
    resource: "User",
    details: sanitizeText(`email=${data.email}`, 500),
    ip,
  });

  return NextResponse.json({ ok: true });
}
