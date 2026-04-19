import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { auth } from "@/lib/auth";
import { absoluteUrl } from "@/lib/site";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

function metadataBase(): URL {
  try {
    return new URL(absoluteUrl());
  } catch {
    return new URL("http://localhost:3000");
  }
}

const ogDescription =
  "SAGAHA SARL : chaîne agroalimentaire camerounaise dédiée au thé d’exception pour distributeurs et professionnels.";

export const metadata: Metadata = {
  metadataBase: metadataBase(),
  title: { default: "SAGAHA — Thé camerounais", template: "%s | SAGAHA" },
  description: ogDescription,
  keywords: ["SAGAHA", "thé Cameroun", "distributeur", "thé premium", "SARL"],
  openGraph: {
    type: "website",
    locale: "fr_CM",
    siteName: "SAGAHA SARL",
    title: "SAGAHA — Thé camerounais d’exception",
    description: ogDescription,
    images: [
      {
        url: "https://images.unsplash.com/photo-1564890369478-c89afeb9cd89?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Sélection de thés SAGAHA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAGAHA SARL",
    description: ogDescription,
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="fr" className={`${manrope.variable} ${display.variable}`}>
      <body className="min-h-screen bg-sagaha-night font-sans text-sagaha-mist antialiased">
        <Providers session={session}>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
