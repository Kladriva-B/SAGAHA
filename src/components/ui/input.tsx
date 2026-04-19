import type { InputHTMLAttributes } from "react";

/**
 * Base neutre : couleurs de fond/texte à passer via `className`
 * (ex. `darkFormInputClassName` pour les pages sur fond sombre).
 */
export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:outline-none focus:ring-2 ${className}`}
      {...props}
    />
  );
}
