import { NextResponse } from "next/server";
import { createCsrfSecret, createCsrfToken } from "@/lib/security";

export async function GET() {
  const secret = createCsrfSecret();
  const token = createCsrfToken(secret);
  const res = NextResponse.json({ token });
  res.cookies.set("csrf-secret", secret, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
  return res;
}
