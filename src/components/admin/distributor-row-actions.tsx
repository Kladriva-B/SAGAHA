"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/admin/confirm-modal";

type Row = {
  id: string;
  companyName: string;
  status: string;
};

export function DistributorRowActions({ row }: { row: Row }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<"suspend" | null>(null);

  async function patch(action: "approve" | "suspend" | "activate") {
    setBusy(true);
    const res = await fetch(`/api/admin/distributeurs/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error("Action impossible");
      return;
    }
    toast.success("Distributeur mis à jour");
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2">
        {row.status === "PENDING" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void patch("approve")}
            className="rounded-lg bg-sagaha-primary px-2 py-1 text-xs font-semibold text-white hover:bg-[#388e3c] disabled:opacity-50"
          >
            Approuver
          </button>
        ) : null}
        {row.status !== "SUSPENDED" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => setModal("suspend")}
            className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-200 hover:bg-red-950/40 disabled:opacity-50"
          >
            Suspendre
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void patch("activate")}
            className="rounded-lg border border-sagaha-accent/40 px-2 py-1 text-xs text-sagaha-mist hover:bg-sagaha-deep disabled:opacity-50"
          >
            Réactiver
          </button>
        )}
        <Link
          href={`/admin/distributeurs/${row.id}`}
          className="rounded-lg border border-sagaha-accent/30 px-2 py-1 text-xs text-sagaha-mist hover:bg-sagaha-deep"
        >
          Détails
        </Link>
        <a
          href={`/api/admin/distributeurs/${row.id}/contract`}
          className="rounded-lg border border-sagaha-accent/30 px-2 py-1 text-xs text-sagaha-mist hover:bg-sagaha-deep"
        >
          Contrat
        </a>
      </div>
      <ConfirmModal
        open={modal === "suspend"}
        title="Suspendre ce distributeur ?"
        description="Le compte ne pourra plus passer de commandes tant qu’il n’est pas réactivé. Cette action est journalisée."
        confirmLabel="Suspendre"
        variant="danger"
        onCancel={() => setModal(null)}
        onConfirm={() => {
          setModal(null);
          void patch("suspend");
        }}
      />
    </>
  );
}
