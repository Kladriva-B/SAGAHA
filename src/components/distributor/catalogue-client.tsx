"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDistributorCart } from "@/components/distributor/distributor-cart-provider";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  category: string;
  imageUrl: string | null;
};

export function CatalogueClient() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const cart = useDistributorCart();

  useEffect(() => {
    void fetch("/api/products?pageSize=48")
      .then((r) => r.json())
      .then((body: { success?: boolean; data?: { items?: ProductRow[] } }) => {
        if (body.success && body.data?.items) setItems(body.data.items);
      })
      .catch(() => toast.error("Impossible de charger le catalogue"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-sagaha-mist/60">Chargement du catalogue…</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => {
          const price = Number(p.price);
          return (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-xl border border-sagaha-accent/15 bg-sagaha-deep/35 shadow-lux-card"
            >
              <div className="relative aspect-[4/3] bg-sagaha-night/60">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-sagaha-mist/40">Sans visuel</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs uppercase tracking-wide text-sagaha-accent/80">{p.category}</p>
                <h3 className="mt-1 font-display text-lg text-white">{p.name}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-sagaha-mist/65">{p.description}</p>
                <p className="mt-3 text-sm text-sagaha-mist/50">Stock : {p.stock}</p>
                <p className="mt-1 tabular-nums text-white">{price.toLocaleString("fr-FR")} XAF</p>
                <Button
                  type="button"
                  className="mt-4 bg-sagaha-primary text-white hover:bg-sagaha-primary/90"
                  disabled={p.stock < 1}
                  onClick={() => {
                    cart.addProduct({ id: p.id, name: p.name, price, imageUrl: p.imageUrl });
                    toast.success("Ajouté au panier");
                  }}
                >
                  Ajouter au panier
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="h-fit rounded-xl border border-sagaha-accent/20 bg-sagaha-deep/50 p-4 lg:sticky lg:top-24">
        <h2 className="font-display text-lg text-white">Panier</h2>
        {cart.lines.length === 0 ? (
          <p className="mt-3 text-sm text-sagaha-mist/55">Votre panier est vide.</p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {cart.lines.map((l) => (
              <li key={l.productId} className="rounded-lg border border-sagaha-accent/10 bg-sagaha-night/40 p-2">
                <p className="font-medium text-white">{l.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-sagaha-mist/60">Qté</label>
                  <input
                    type="number"
                    min={1}
                    className="w-16 rounded border border-sagaha-accent/25 bg-sagaha-deep px-2 py-1 text-xs text-white"
                    value={l.quantity}
                    onChange={(e) => cart.setQuantity(l.productId, Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="ml-auto text-xs text-red-300 hover:underline"
                    onClick={() => cart.removeLine(l.productId)}
                  >
                    Retirer
                  </button>
                </div>
                <p className="mt-1 text-xs text-sagaha-mist/60">
                  {(l.unitPrice * l.quantity).toLocaleString("fr-FR")} XAF
                </p>
              </li>
            ))}
          </ul>
        )}
        {cart.lines.length > 0 ? (
          <div className="mt-4 border-t border-sagaha-accent/10 pt-4">
            <p className="text-sm text-sagaha-mist">
              Total :{" "}
              <span className="font-semibold text-white">{cart.totalAmount.toLocaleString("fr-FR")} XAF</span>
            </p>
            <CheckoutButton />
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function CheckoutButton() {
  const cart = useDistributorCart();
  const [busy, setBusy] = useState(false);

  async function checkout() {
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string | { message?: string } };
      if (!res.ok || !data.success) {
        const msg =
          typeof data.error === "string" ? data.error : data.error?.message ?? "Commande refusée";
        toast.error(msg);
        return;
      }
      toast.success("Commande enregistrée (PENDING). L’équipe va la confirmer.");
      cart.clear();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      className="mt-3 w-full bg-sagaha-primary text-white hover:bg-sagaha-primary/90"
      disabled={busy}
      onClick={() => void checkout()}
    >
      {busy ? "Envoi…" : "Valider la commande"}
    </Button>
  );
}
