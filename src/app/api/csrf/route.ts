import { NextResponse } from "next/server";
import { createCsrfSecret, createCsrfToken } from "@/lib/security";

export async function GET() {
  const secret = createCsrfSecret();
  const token = createCsrfToken(secret);
  const res = NextResponse.json({ token });
  const secureCookie =
    process.env.NODE_ENV === "production" && process.env.DOCKER_LOCAL_HTTP !== "1";
  res.cookies.set("csrf-secret", secret, {
    httpOnly: true,
    sameSite: "strict",
    secure: secureCookie,
    path: "/",
    maxAge: 60 * 60,
  });
  return res;
}
