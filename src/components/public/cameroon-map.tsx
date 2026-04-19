"use client";

import { motion } from "framer-motion";
import type { CameroonRegionId, RegionMarker } from "@/lib/public-content";

/** Silhouette stylisée du Cameroun + repères régionaux interactifs. */
export function CameroonMap({
  markers,
  selected,
  onSelect,
}: {
  markers: RegionMarker[];
  selected: CameroonRegionId | null;
  onSelect: (id: CameroonRegionId) => void;
}) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg
        viewBox="0 0 400 460"
        className="h-auto w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
        role="img"
        aria-label="Carte des régions du Cameroun — réseau distributeurs SAGAHA"
      >
        <defs>
          <linearGradient id="camFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1b3a24" />
            <stop offset="100%" stopColor="#0a1f14" />
          </linearGradient>
          <filter id="mapGlow">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#66bb6a" floodOpacity="0.15" />
          </filter>
        </defs>
        <path
          fill="url(#camFill)"
          stroke="rgba(102,187,106,0.35)"
          strokeWidth="1.5"
          filter="url(#mapGlow)"
          d="M128 38c52-14 118-8 156 24 38 32 52 88 44 148-8 60-40 118-88 154-48 36-112 48-168 28-56-20-96-68-108-128-12-60 12-124 56-164 22-20 48-34 108-62z"
        />
        <path
          fill="none"
          stroke="rgba(102,187,106,0.1)"
          strokeWidth="0.75"
          d="M72 180h256M96 260h208M110 340h180"
        />
        {markers.map((m) => {
          const active = selected === m.id;
          const cx = (m.x / 100) * 400;
          const cy = (m.y / 100) * 460;
          const r = active ? 14 : 10;
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
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sagaha-accent"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={active ? "rgba(102,187,106,0.35)" : "rgba(46,125,50,0.45)"}
                  stroke={active ? "#ffffff" : "#66bb6a"}
                  strokeWidth={active ? 2 : 1.2}
                />
              </motion.g>
              <text
                x={cx}
                y={cy - 20}
                textAnchor="middle"
                className="pointer-events-none fill-sagaha-mist/75 text-[8px] font-semibold uppercase tracking-wide sm:text-[9px]"
              >
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
