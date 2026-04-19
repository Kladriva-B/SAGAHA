"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CameroonMap } from "@/components/public/cameroon-map";
import {
  distributorsByRegion,
  regionMarkers,
  type CameroonRegionId,
} from "@/lib/public-content";

export function DistributorsSection() {
  const [selected, setSelected] = useState<CameroonRegionId | null>("littoral");

  const list = useMemo(() => {
    if (!selected) return distributorsByRegion;
    return distributorsByRegion.filter((d) => d.regionId === selected);
  }, [selected]);

  const marker = regionMarkers.find((r) => r.id === selected);

  return (
    <section
      id="distributeurs"
      className="scroll-mt-24 border-t border-slate-700/40 bg-gradient-to-b from-slate-950 via-slate-950/40 to-sagaha-night py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sagaha-accent/90">Réseau</p>
          <h2 className="mt-3 font-display text-3xl font-medium text-white md:text-4xl">
            Distributeurs actifs par région
          </h2>
          <p className="mt-4 text-slate-400">
            Sélectionnez une région sur la carte du Cameroun pour afficher les partenaires SAGAHA — présence sur tout
            le territoire.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <CameroonMap markers={regionMarkers} selected={selected} onSelect={setSelected} />

          <div className="rounded-2xl border border-slate-600/35 bg-slate-900/50 p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-sagaha-leaf/15 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-700/50 pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Région sélectionnée</p>
                <p className="mt-1 font-display text-2xl text-white">
                  {marker?.label ?? "Toutes les régions"}
                </p>
              </div>
              {marker ? (
                <p className="rounded-full border border-sagaha-accent/35 bg-sagaha-accent/10 px-3 py-1 text-xs font-medium text-sagaha-mist">
                  {marker.activeDistributors}+ points actifs
                </p>
              ) : null}
            </div>
            <ul className="mt-6 max-h-[min(60vh,420px)] space-y-3 overflow-y-auto pr-1">
              {list.map((d, i) => (
                <motion.li
                  key={`${d.name}-${d.city}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between gap-4 rounded-xl border border-transparent bg-slate-800/40 px-4 py-3 transition hover:border-sagaha-primary/25 hover:bg-slate-800/70"
                >
                  <div>
                    <p className="font-medium text-white">{d.name}</p>
                    <p className="text-sm text-slate-400">{d.city}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-slate-500/40 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                    Actif
                  </span>
                </motion.li>
              ))}
            </ul>
            <p className="mt-6 text-center text-xs text-slate-500">
              Données illustratives — synchronisées avec votre base en production.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
