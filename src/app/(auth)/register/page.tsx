"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const field =
  "border-sagaha-accent/25 bg-sagaha-deep/50 text-white placeholder:text-sagaha-mist/35 focus:border-sagaha-accent/50 focus:ring-sagaha-accent/25";

export default function RegisterPage() {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    region: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/csrf")
      .then((r) => r.json())
      .then((d: { token?: string }) => setCsrfToken(d.token ?? null))
      .catch(() => setCsrfToken(null));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!csrfToken) {
      setError("Protection CSRF indisponible. Rechargez la page.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Inscription impossible.");
      return;
    }
    router.push("/login?registered=1");
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-6">
      <div>
        <h1 className="font-display text-3xl text-white">Inscription distributeur</h1>
        <p className="mt-2 text-sm text-sagaha-mist/75">
          Création d’un compte et dossier distributeur (statut « en attente »).
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-sagaha-accent/20 bg-sagaha-deep/40 p-6 shadow-lux-card backdrop-blur-sm"
      >
        <div>
          <Label htmlFor="email" className="text-sagaha-mist">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(ev) => setForm((f) => ({ ...f, email: ev.target.value }))}
            className={field}
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-sagaha-mist">
            Mot de passe
          </Label>
          <Input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(ev) => setForm((f) => ({ ...f, password: ev.target.value }))}
            className={field}
          />
          <p className="mt-1 text-xs text-sagaha-mist/55">
            10 caractères minimum, majuscule, minuscule et chiffre.
          </p>
        </div>
        <div>
          <Label htmlFor="company" className="text-sagaha-mist">
            Raison sociale
          </Label>
          <Input
            id="company"
            required
            value={form.companyName}
            onChange={(ev) => setForm((f) => ({ ...f, companyName: ev.target.value }))}
            className={field}
          />
        </div>
        <div>
          <Label htmlFor="region" className="text-sagaha-mist">
            Région
          </Label>
          <Input
            id="region"
            required
            value={form.region}
            onChange={(ev) => setForm((f) => ({ ...f, region: ev.target.value }))}
            className={field}
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-sagaha-mist">
            Téléphone
          </Label>
          <Input
            id="phone"
            required
            value={form.phone}
            onChange={(ev) => setForm((f) => ({ ...f, phone: ev.target.value }))}
            className={field}
          />
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button type="submit" disabled={loading || !csrfToken} className="w-full">
          {loading ? "Envoi…" : "Créer mon compte"}
        </Button>
      </form>
      <p className="text-center text-sm text-sagaha-mist/70">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-sagaha-accent underline-offset-4 hover:underline">
          Connexion
        </Link>
      </p>
      <p className="text-center">
        <Link href="/" className="text-xs text-sagaha-mist/50 hover:text-sagaha-mist">
          ← Retour au site
        </Link>
      </p>
    </main>
  );
}
