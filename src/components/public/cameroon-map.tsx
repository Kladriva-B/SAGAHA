"use client";

import { motion } from "framer-motion";
import type { CameroonRegionId, RegionMarker } from "@/lib/public-content";

/**
 * Carte stylisée du Cameroun (silhouette pays) + repères régionaux.
 * Palette aubergine / champagne / vert thé (luxe & nature).
 */
export function CameroonMap({
  markers,
  selected,
  onSelect,
}: {
  markers: RegionMarker[];
  selected: CameroonRegionId | null;
  onSelect: (id: CameroonRegionId) => void;
}) {
  const vbW = 320;
  const vbH = 380;

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="rounded-3xl border border-slate-600/35 bg-gradient-to-b from-[#14101c] via-[#0e0a14] to-slate-950/95 p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)] ring-1 ring-sagaha-primary/20">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="h-auto w-full"
          role="img"
          aria-label="Carte des régions du Cameroun — réseau distributeurs SAGAHA"
        >
          <defs>
            <linearGradient id="camLand" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1f1528" />
              <stop offset="45%" stopColor="#16101f" />
              <stop offset="100%" stopColor="#0a060e" />
            </linearGradient>
            <linearGradient id="camShore" x1="0%" y1="100%" x2="80%" y2="0%">
              <stop offset="0%" stopColor="#d4b87d" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#6d9f7a" stopOpacity="0.08" />
            </linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Ombre portée pays */}
          <path
            fill="#020617"
            opacity="0.55"
            filter="url(#softShadow)"
            transform="translate(4, 10)"
            d={CAMEROON_OUTLINE}
          />

          {/* Silhouette Cameroun */}
          <path
            fill="url(#camLand)"
            stroke="url(#camShore)"
            strokeWidth="1.25"
            d={CAMEROON_OUTLINE}
          />
          <path fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="0.75" d={CAMEROON_OUTLINE} />

          {/* Repères régionaux */}
          {markers.map((m) => {
            const active = selected === m.id;
            const cx = (m.x / 100) * vbW;
            const cy = (m.y / 100) * vbH;
            return (
              <g key={m.id}>
                <motion.g
                  role="button"
                  tabIndex={0}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                  onClick={() => onSelect(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(m.id);
                    }
                  }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sagaha-leaf/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {/* Halo sélection */}
                  {active ? (
                    <>
                      <circle cx={cx} cy={cy} r={26} fill="none" stroke="rgba(109,159,122,0.28)" strokeWidth="1" />
                      <circle cx={cx} cy={cy} r={22} fill="none" stroke="rgba(212,184,125,0.55)" strokeWidth="1.5" />
                    </>
                  ) : null}
                  {/* Pin */}
                  <path
                    d={`M ${cx} ${cy - 14} 
                        c 6 0 11 5 11 11 
                        c 0 8 -11 22 -11 26 
                        c 0 -4 -11 -18 -11 -26 
                        c 0 -6 5 -11 11 -11 z`}
                    fill={active ? "#d4b87d" : "#64748b"}
                    stroke={active ? "#f5ead4" : "#94a3b8"}
                    strokeWidth={active ? 1.4 : 1}
                    opacity={active ? 1 : 0.92}
                  />
                  <circle cx={cx} cy={cy - 8} r={3.2} fill={active ? "#6d9f7a" : "#1e293b"} />
                </motion.g>
                <text
                  x={cx}
                  y={cy - 30}
                  textAnchor="middle"
                  className="pointer-events-none fill-slate-300/90 text-[8px] font-semibold uppercase tracking-[0.12em] sm:text-[9px]"
                >
                  {m.label}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Repères indicatifs — frontières stylisées. Cliquez une région pour filtrer la liste.
        </p>
      </div>
    </div>
  );
}

/** Silhouette simplifiée (triangle pays + côte atlantique + saillie nord-est), proche de la lecture cartographique habituelle. */
const CAMEROON_OUTLINE =
  "M 118 28 " +
  "C 148 22 188 32 212 58 " +
  "C 232 82 242 118 236 158 " +
  "C 230 198 208 232 176 258 " +
  "C 148 282 108 292 78 284 " +
  "C 48 276 28 252 22 218 " +
  "C 16 188 26 158 44 138 " +
  "C 32 118 24 92 34 68 " +
  "C 44 44 72 32 98 30 " +
  "C 102 18 108 12 118 28 Z";
