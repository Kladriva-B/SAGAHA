"use client";

import { motion } from "framer-motion";

/** Illustration vectorielle feuille de thé — complément visuel au hero. */
export function TeaLeafArt() {
  return (
    <motion.div
      className="pointer-events-none relative mx-auto w-full max-w-[min(100%,420px)]"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <svg viewBox="0 0 400 420" className="h-auto w-full text-sagaha-accent/90 drop-shadow-[0_0_40px_rgba(102,187,106,0.25)]">
        <defs>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#66bb6a" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#2e7d32" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1b3a24" stopOpacity="0.9" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          fill="url(#leafGrad)"
          filter="url(#softGlow)"
          d="M200 32c-48 38-118 118-118 218 0 72 52 118 118 130 66-12 118-58 118-130 0-100-70-180-118-218z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.35"
          d="M200 70v300"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeOpacity="0.25"
          d="M140 140c24 18 48 28 60 60M260 160c-28 22-52 48-60 88"
        />
      </svg>
    </motion.div>
  );
}
