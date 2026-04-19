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
        sagaha: {
          night: "#0a1f14",
          deep: "#1b3a24",
          primary: "#2e7d32",
          accent: "#66bb6a",
          mist: "#c8e6c9",
          snow: "#ffffff",
        },
      },
      backgroundImage: {
        "lux-grid":
          "linear-gradient(to right, rgba(102,187,106,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(102,187,106,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        lux: "48px 48px",
      },
      boxShadow: {
        "lux-glow": "0 0 40px -8px rgba(102, 187, 106, 0.35)",
        "lux-card": "0 24px 48px -20px rgba(0, 0, 0, 0.55)",
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
