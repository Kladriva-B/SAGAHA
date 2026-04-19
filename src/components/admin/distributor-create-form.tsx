"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DistributorCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    region: "",
    phone: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/distributeurs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(j.error ?? "Création impossible");
      return;
    }
    toast.success("Distributeur créé");
    setOpen(false);
    setForm({ email: "", password: "", companyName: "", region: "", phone: "" });
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg bg-sagaha-primary px-4 py-2 text-sm font-semibold text-white hover:bg-sagaha-vine"
      >
        {open ? "Fermer le formulaire" : "Nouveau distributeur"}
      </button>
      {open ? (
        <form
          onSubmit={onSubmit}
          className="mt-4 grid max-w-xl gap-3 rounded-xl border border-sagaha-accent/20 bg-sagaha-deep/40 p-4"
        >
          <p className="text-xs text-sagaha-mist/60">
            Crée un compte utilisateur rôle DISTRIBUTEUR + fiche distributeur (PENDING).
          </p>
          <input
            required
            type="email"
            placeholder="Email"
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            required
            type="password"
            placeholder="Mot de passe initial"
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <input
            required
            placeholder="Raison sociale"
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
          />
          <input
            required
            placeholder="Région"
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
            value={form.region}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
          />
          <input
            required
            placeholder="Téléphone"
            className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-sm text-white"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-sagaha-accent/90 px-4 py-2 text-sm font-semibold text-sagaha-night hover:bg-sagaha-accent disabled:opacity-50"
          >
            {loading ? "Création…" : "Créer"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
