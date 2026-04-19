import { NextResponse } from "next/server";

export function adminApiError(e: unknown): NextResponse | null {
  if (e instanceof Error) {
    if (e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Accès réservé au personnel SAGAHA" }, { status: 403 });
    }
  }
  return null;
}
