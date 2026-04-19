"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/admin/confirm-modal";

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  minStockAlert: number;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
};

const emptyForm: Omit<ProductRow, "id"> = {
  name: "",
  description: "",
  price: 1000,
  stock: 0,
  minStockAlert: 5,
  category: "",
  imageUrl: null,
  isActive: true,
};

export function ProductsAdmin({ initial }: { initial: ProductRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Omit<ProductRow, "id">>(emptyForm);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok) {
      toast.error(j.error ?? "Upload impossible");
      return null;
    }
    return j.url ?? null;
  }

  async function saveProduct(id: string | "new") {
    setBusy(true);
    const body = { ...form, imageUrl: form.imageUrl ?? "" };
    const url = id === "new" ? "/api/admin/produits" : `/api/admin/produits/${id}`;
    const res = await fetch(url, {
      method: id === "new" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(j.error ?? "Erreur");
      return;
    }
    toast.success(id === "new" ? "Produit créé" : "Produit mis à jour");
    setCreating(false);
    setEditing(null);
    setForm(emptyForm);
    router.refresh();
  }

  async function deleteProduct() {
    if (!deleteId) return;
    setBusy(true);
    const res = await fetch(`/api/admin/produits/${deleteId}`, { method: "DELETE" });
    setBusy(false);
    setDeleteId(null);
    if (!res.ok) {
      toast.error("Suppression impossible (commandes liées ?)");
      return;
    }
    toast.success("Produit supprimé");
    router.refresh();
  }

  function openEdit(p: ProductRow) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      minStockAlert: p.minStockAlert,
      category: p.category,
      imageUrl: p.imageUrl,
      isActive: p.isActive,
    });
  }

  const lowStock = rows.filter((r) => r.stock <= r.minStockAlert);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-white md:text-3xl">Produits</h1>
          <p className="mt-1 text-sm text-sagaha-mist/60">CRUD, stock, activation, image (Vercel Blob si configuré).</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setForm(emptyForm);
          }}
          className="rounded-lg bg-sagaha-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#388e3c]"
        >
          Nouveau produit
        </button>
      </div>

      {lowStock.length > 0 ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <span className="font-semibold">{lowStock.length}</span> référence(s) sous le seuil d’alerte stock.
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/30">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sagaha-accent/15 text-xs uppercase tracking-wide text-sagaha-mist/55">
            <tr>
              <th className="px-3 py-2">Visuel</th>
              <th className="px-3 py-2">Nom</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Prix</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Actif</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-sagaha-accent/5">
                <td className="px-3 py-2">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-sagaha-night">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-2 font-medium text-white">{p.name}</td>
                <td className="px-3 py-2 text-sagaha-mist/75">{p.category}</td>
                <td className="px-3 py-2 tabular-nums">{p.price.toLocaleString("fr-CM")} XAF</td>
                <td className="px-3 py-2">
                  <span className={p.stock <= p.minStockAlert ? "text-amber-300" : "text-sagaha-mist"}>{p.stock}</span>
                  <span className="text-xs text-sagaha-mist/45"> / min {p.minStockAlert}</span>
                </td>
                <td className="px-3 py-2">{p.isActive ? "oui" : "non"}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="mr-2 text-xs text-sagaha-accent hover:underline"
                  >
                    Modifier
                  </button>
                  <button type="button" onClick={() => setDeleteId(p.id)} className="text-xs text-red-300 hover:underline">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-sagaha-accent/25 bg-sagaha-deep p-6 shadow-lux-card">
            <h2 className="font-display text-xl text-white">{creating ? "Nouveau produit" : "Modifier produit"}</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <input
                className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-white"
                placeholder="Nom"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <textarea
                className="min-h-[80px] rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-white"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <input
                className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-white"
                placeholder="Catégorie"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-white"
                  placeholder="Prix XAF"
                  value={form.price || ""}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                />
                <input
                  type="number"
                  className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-white"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                />
              </div>
              <input
                type="number"
                className="rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-white"
                placeholder="Seuil alerte stock"
                value={form.minStockAlert}
                onChange={(e) => setForm((f) => ({ ...f, minStockAlert: Number(e.target.value) }))}
              />
              <label className="flex items-center gap-2 text-xs text-sagaha-mist">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Produit actif (visible catalogue)
              </label>
              <input
                type="file"
                accept="image/*"
                className="text-xs text-sagaha-mist"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadFile(f);
                  if (url) setForm((prev) => ({ ...prev, imageUrl: url }));
                }}
              />
              {form.imageUrl ? (
                <p className="break-all text-xs text-sagaha-accent/90">{form.imageUrl}</p>
              ) : null}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
                className="rounded-lg border border-sagaha-accent/30 px-4 py-2 text-sm text-sagaha-mist"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveProduct(creating ? "new" : editing?.id ?? "new")}
                className="rounded-lg bg-sagaha-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Supprimer ce produit ?"
        description="Irréversible si aucune commande en cours ne référence encore cette ligne. Les commandes historiques peuvent bloquer la suppression."
        confirmLabel="Supprimer"
        variant="danger"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void deleteProduct()}
      />
    </div>
  );
}
