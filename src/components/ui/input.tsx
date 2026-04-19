import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border border-emerald-900/20 bg-white px-3 py-2 text-sm text-emerald-950 shadow-sm outline-none ring-emerald-700/30 focus:ring-2 ${className}`}
      {...props}
    />
  );
}
