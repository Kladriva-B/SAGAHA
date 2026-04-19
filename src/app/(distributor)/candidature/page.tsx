"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const field =
  "border-sagaha-accent/25 bg-sagaha-deep/50 text-white placeholder:text-sagaha-mist/35 focus:border-sagaha-accent/50 focus:ring-sagaha-accent/25";

export default function CandidaturePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    region: "",
    phone: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/distributors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const err =
          typeof data.error === "string"
            ? data.error
            : data.error?.message ?? "Envoi impossible.";
        toast.error(err);
        return;
      }
      toast.success("Candidature envoyée. Vérifiez votre boîte mail.");
      router.push("/login?callbackUrl=/distributeur/en-attente");
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <div className="mb-8">
        <Link href="/" className="text-xs text-sagaha-accent hover:underline">
          ← Accueil
        </Link>
        <h1 className="mt-4 font-display text-3xl text-white">Candidature distributeur</h1>
        <p className="mt-2 text-sm text-sagaha-mist/75">
          Créez votre compte et déposez votre dossier. Après validation par SAGAHA, vous recevrez un email et pourrez
          commander en ligne.
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-sagaha-accent/20 bg-sagaha-deep/40 p-6 shadow-lux-card"
      >
        <div>
          <Label htmlFor="email" className="text-sagaha-mist">
            Email professionnel
          </Label>
          <Input
            id="email"
            type="email"
            required
            className={field}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-sagaha-mist">
            Mot de passe (10+ car., maj, min, chiffre)
          </Label>
          <Input
            id="password"
            type="password"
            required
            className={field}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="company" className="text-sagaha-mist">
            Raison sociale
          </Label>
          <Input
            id="company"
            required
            className={field}
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="region" className="text-sagaha-mist">
            Région
          </Label>
          <Input
            id="region"
            required
            className={field}
            value={form.region}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-sagaha-mist">
            Téléphone
          </Label>
          <Input
            id="phone"
            required
            className={field}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="notes" className="text-sagaha-mist">
            Message / précisions (optionnel)
          </Label>
          <textarea
            id="notes"
            className={`min-h-[100px] w-full rounded-md px-3 py-2 text-sm ${field}`}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-sagaha-primary hover:bg-sagaha-primary/90">
          {loading ? "Envoi…" : "Envoyer ma candidature"}
        </Button>
        <p className="text-center text-xs text-sagaha-mist/50">
          Déjà un compte ? <Link href="/login" className="text-sagaha-accent hover:underline">Connexion</Link>
        </p>
      </form>
    </main>
  );
}
