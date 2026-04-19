import { NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import { adminApiError } from "@/lib/admin-api";
import { requireStaffSession } from "@/lib/admin-staff";

export async function POST() {
  try {
    const session = await requireStaffSession();
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: "SAGAHA",
      label: session.user.email ?? "user",
      secret,
    });
    return NextResponse.json({ secret, otpauthUrl });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
