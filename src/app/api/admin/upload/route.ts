import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { adminApiError } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { requireStaffSession } from "@/lib/admin-staff";

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffSession();
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error:
            "Stockage blob non configuré. Définissez BLOB_READ_WRITE_TOKEN (Vercel Blob) ou collez une URL d’image.",
        },
        { status: 503 },
      );
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 4 Mo)" }, { status: 400 });
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const safe = `sagaha/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(safe, file, { access: "public", token });
    await logAdminAction(session, "BLOB_UPLOAD", "Media", blob.url, request);
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    const r = adminApiError(e);
    if (r) return r;
    console.error(e);
    return NextResponse.json({ error: "Échec de l’upload" }, { status: 500 });
  }
}
