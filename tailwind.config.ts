import type { Config } from "tailwindcss";

/**
 * PALETTE SAGAHA — LUXE IMPÉRIAL (source unique de vérité pour la marque)
 * ------------------------------------------------------------------------
 * Or royal (accent), bordeaux / pourpre impérial (primary), onyx (night/deep),
 * bronze chaud (gild). Aucun vert : ne pas réintroduire emerald/leaf/sage.
 * Modifier UNIQUEMENT ce fichier (+ repli body dans globals.css si besoin).
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sagaha: {
          night: "#050308",
          deep: "#0f0812",
          primary: "#7f1d2a",
          vine: "#4c101c",
          accent: "#d4af37",
          gild: "#9a6b2c",
          mist: "#f0e6d8",
          snow: "#ffffff",
        },
      },
      backgroundImage: {
        "lux-grid":
          "linear-gradient(to right, rgba(212,175,55,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(127,29,42,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        lux: "48px 48px",
      },
      boxShadow: {
        "lux-glow":
          "0 0 56px -10px rgba(212, 175, 55, 0.28), 0 0 36px -14px rgba(127, 29, 42, 0.38)",
        "lux-card": "0 24px 48px -20px rgba(0, 0, 0, 0.62)",
      },
      keyframes: {
        "lux-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "lux-shimmer": "lux-shimmer 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
