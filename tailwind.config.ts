import type { Config } from "tailwindcss";

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
        /** Luxe aubergine / champagne — verts réservés à l’identité nature & thé (sagaha.leaf) */
        sagaha: {
          night: "#08050d",
          deep: "#161022",
          primary: "#955280",
          vine: "#6b3d5f",
          accent: "#d4b87d",
          mist: "#ebe4ef",
          leaf: "#6d9f7a",
          snow: "#ffffff",
        },
      },
      backgroundImage: {
        "lux-grid":
          "linear-gradient(to right, rgba(212,184,125,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(109,159,122,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        lux: "48px 48px",
      },
      boxShadow: {
        "lux-glow":
          "0 0 52px -10px rgba(149, 82, 128, 0.42), 0 0 28px -14px rgba(212, 184, 125, 0.18)",
        "lux-card": "0 24px 48px -20px rgba(0, 0, 0, 0.58)",
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
