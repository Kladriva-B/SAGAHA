"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const field =
  "border-sagaha-accent/25 bg-sagaha-deep/50 text-white placeholder:text-sagaha-mist/35 focus:border-sagaha-accent/50 focus:ring-sagaha-accent/25";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      totp: totp.trim() || undefined,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("Identifiants incorrects ou compte indisponible.");
      return;
    }
    if (res?.url) {
      window.location.href = res.url;
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-6">
      <div>
        <h1 className="font-display text-3xl text-white">Connexion</h1>
        <p className="mt-2 text-sm text-sagaha-mist/75">Espace sécurisé SAGAHA.</p>
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
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className={field}
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-sagaha-mist">
            Mot de passe
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className={field}
          />
        </div>
        <div>
          <Label htmlFor="totp" className="text-sagaha-mist">
            Code 2FA (si activé)
          </Label>
          <Input
            id="totp"
            name="totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6 chiffres"
            value={totp}
            onChange={(ev) => setTotp(ev.target.value.replace(/\D/g, "").slice(0, 6))}
            className={field}
          />
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
      <p className="text-center text-sm text-sagaha-mist/70">
        Candidature sans compte existant ?{" "}
        <Link href="/candidature" className="font-medium text-sagaha-accent underline-offset-4 hover:underline">
          Formulaire public
        </Link>
      </p>
      <p className="text-center text-sm text-sagaha-mist/70">
        Inscription classique (CSRF) :{" "}
        <Link href="/register" className="font-medium text-sagaha-accent underline-offset-4 hover:underline">
          /register
        </Link>
        {" · "}
        <Link
          href="/login?callbackUrl=/distributeur/tableau-de-bord"
          className="font-medium text-sagaha-accent underline-offset-4 hover:underline"
        >
          Raccourci distributeur
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
