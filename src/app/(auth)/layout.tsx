import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compte",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {  return (
    <div className="min-h-screen bg-sagaha-night pb-16 pt-24 selection:bg-sagaha-primary/30 selection:text-white">
      {children}
    </div>
  );
}
