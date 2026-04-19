import { handlers } from "@/lib/auth";
import { consumeLoginRateLimit } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

const { GET: authGET, POST: authPOST } = handlers;

function isCredentialsPost(req: NextRequest): boolean {
  const path = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  return (
    path.includes("/callback/credentials") ||
    path.includes("/signin/credentials") ||
    (search.length > 0 && search.includes("credentials"))
  );
}

export async function GET(req: NextRequest) {
  return authGET(req);
}

export async function POST(req: NextRequest) {
  if (isCredentialsPost(req)) {
    const rateHeaders = consumeLoginRateLimit(req);
    if (!rateHeaders) {
      return NextResponse.json(
        { error: "Trop de tentatives de connexion. Réessayez dans 15 minutes." },
        { status: 429 },
      );
    }
    const res = await authPOST(req);
    rateHeaders.forEach((value, key) => {
      res.headers.set(key, value);
    });
    return res;
  }
  return authPOST(req);
}
