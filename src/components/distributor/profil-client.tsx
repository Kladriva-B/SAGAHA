"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { darkFormInputClassName } from "@/lib/dark-form-field";

const field = darkFormInputClassName;

type Initial = {
  companyName: string;
  region: string;
  phone: string;
  address: string | null;
  documents: { id: string; label: string; fileUrl: string; createdAt: string }[];
};

export function ProfilClient({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: initial.companyName,
    region: initial.region,
    phone: initial.phone,
    address: initial.address ?? "",
  });
  const [docLabel, setDocLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState(initial.documents);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/distributor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          region: form.region,
          phone: form.phone,
          address: form.address || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(typeof data.error === "string" ? data.error : "Mise à jour impossible");
        return;
      }
      toast.success("Profil mis à jour.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function uploadDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !docLabel.trim()) {
      toast.error("Choisissez un libellé et un fichier.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const up = await fetch("/api/distributor/upload", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok || !upData.success) {
        toast.error(typeof upData.error === "string" ? upData.error : "Upload échoué");
        return;
      }
      const url = upData.data.url as string;
      const res = await fetch("/api/distributor/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: docLabel.trim(), fileUrl: url }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error("Enregistrement du document impossible");
        return;
      }
      const d = data.data.document as { id: string; label: string; fileUrl: string; createdAt: string };
      setDocs((prev) => [d, ...prev]);
      setDocLabel("");
      setFile(null);
      toast.success("Document ajouté.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="space-y-4 rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/35 p-6">
        <h2 className="font-display text-lg text-white">Coordonnées</h2>
        <div>
          <Label className="text-sagaha-mist">Raison sociale</Label>
          <Input
            className={field}
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
          />
        </div>
        <div>
          <Label className="text-sagaha-mist">Région</Label>
          <Input className={field} value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
        </div>
        <div>
          <Label className="text-sagaha-mist">Téléphone</Label>
          <Input className={field} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <Label className="text-sagaha-mist">Adresse (optionnel)</Label>
          <textarea
            className={`min-h-[100px] w-full rounded-md px-3 py-2 text-sm ${field}`}
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </div>
        <Button type="submit" disabled={loading} className="bg-sagaha-primary text-white hover:bg-sagaha-primary/90">
          Enregistrer
        </Button>
      </form>

      <div className="space-y-4 rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/35 p-6">
        <h2 className="font-display text-lg text-white">Documents</h2>
        <p className="text-xs text-sagaha-mist/55">KBIS, contrat signé, etc. (fichier max 6 Mo — stockage Vercel Blob).</p>
        <form onSubmit={uploadDocument} className="space-y-3">
          <div>
            <Label className="text-sagaha-mist">Libellé</Label>
            <Input className={field} value={docLabel} onChange={(e) => setDocLabel(e.target.value)} placeholder="Ex. KBIS 2026" />
          </div>
          <div>
            <Label className="text-sagaha-mist">Fichier</Label>
            <Input type="file" className={field} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="border border-sagaha-accent/40 bg-transparent text-sagaha-mist hover:bg-sagaha-deep/80"
          >
            Uploader
          </Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 rounded border border-sagaha-accent/10 bg-sagaha-night/40 px-3 py-2">
              <span className="text-sagaha-mist">{d.label}</span>
              <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-sagaha-accent hover:underline">
                Voir
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
