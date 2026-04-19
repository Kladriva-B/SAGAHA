"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function TwoFactorPanel({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  async function startSetup() {
    setLoading(true);
    const res = await fetch("/api/admin/2fa/setup", { method: "POST" });
    const j = (await res.json().catch(() => ({}))) as { secret?: string; otpauthUrl?: string };
    setLoading(false);
    if (!res.ok) {
      toast.error("Impossible de générer le secret");
      return;
    }
    setSecret(j.secret ?? null);
    setOtpauthUrl(j.otpauthUrl ?? null);
    toast.message("Ajoutez l’entrée dans votre application TOTP (Google Authenticator, etc.)");
  }

  async function confirm() {
    if (!secret) return;
    setLoading(true);
    const res = await fetch("/api/admin/2fa/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, code }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Code incorrect");
      return;
    }
    toast.success("2FA activée");
    setSecret(null);
    setOtpauthUrl(null);
    setCode("");
    router.refresh();
  }

  async function disable() {
    setLoading(true);
    const res = await fetch("/api/admin/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Mot de passe incorrect");
      return;
    }
    toast.success("2FA désactivée");
    setPwd("");
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-6 rounded-2xl border border-sagaha-accent/15 bg-sagaha-deep/40 p-6 shadow-lux-card">
      <div>
        <h2 className="font-display text-xl text-white">Authentification à deux facteurs (TOTP)</h2>
        <p className="mt-2 text-sm text-sagaha-mist/70">
          Optionnelle — renforce la sécurité des comptes ADMIN / MANAGER. À la connexion, un code à 6 chiffres
          sera demandé si le 2FA est actif.
        </p>
      </div>
      <p className="text-sm">
        Statut :{" "}
        <span className={enabled ? "font-semibold text-sagaha-accent" : "text-sagaha-mist/70"}>
          {enabled ? "Activé" : "Désactivé"}
        </span>
      </p>

      {!enabled ? (
        <div className="space-y-4">
          {!secret ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void startSetup()}
              className="rounded-lg bg-sagaha-primary px-4 py-2 text-sm font-semibold text-white hover:bg-sagaha-vine disabled:opacity-50"
            >
              Générer une clé TOTP
            </button>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-sagaha-mist/80">
                Scannez ou saisissez la clé dans votre application d’authentification, puis entrez le code à 6
                chiffres pour confirmer.
              </p>
              <p className="break-all rounded-lg border border-sagaha-accent/20 bg-sagaha-night/60 p-2 font-mono text-xs text-sagaha-accent">
                {secret}
              </p>
              {otpauthUrl ? (
                <p className="break-all text-xs text-sagaha-mist/55">
                  otpauth URI (pour import manuel) :<br />
                  <span className="text-sagaha-mist/70">{otpauthUrl}</span>
                </p>
              ) : null}
              <input
                className="w-full rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-white"
                placeholder="Code 6 chiffres"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="button"
                disabled={loading || code.length !== 6}
                onClick={() => void confirm()}
                className="rounded-lg bg-sagaha-accent px-4 py-2 text-sm font-semibold text-sagaha-night hover:bg-sagaha-accent/90 disabled:opacity-50"
              >
                Activer le 2FA
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-sagaha-mist/75">
            Pour désactiver le 2FA, confirmez avec votre mot de passe SAGAHA.
          </p>
          <input
            type="password"
            className="w-full rounded-lg border border-sagaha-accent/25 bg-sagaha-night/60 px-3 py-2 text-white"
            placeholder="Mot de passe"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
          <button
            type="button"
            disabled={loading || !pwd}
            onClick={() => void disable()}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-950/30 disabled:opacity-50"
          >
            Désactiver le 2FA
          </button>
        </div>
      )}
    </div>
  );
}
