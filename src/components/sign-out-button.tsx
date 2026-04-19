"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton({ variant = "default" }: { variant?: "default" | "admin" }) {
  const cls =
    variant === "admin"
      ? "border border-sagaha-accent/30 bg-sagaha-deep/60 text-sagaha-mist hover:bg-sagaha-primary/30"
      : "bg-slate-800/90";
  return (
    <Button type="button" className={cls} onClick={() => void signOut({ callbackUrl: "/" })}>
      Déconnexion
    </Button>
  );
}
