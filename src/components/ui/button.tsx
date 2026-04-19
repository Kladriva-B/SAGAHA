import type { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-sagaha-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-sagaha-primary/90 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
