"use client";

import { useMemo, useState } from "react";
import { anionGap, osmolalGap } from "@/lib/toxicology/calcs";
import Disclaimer from "@/app/_components/Disclaimer";

function toNum(v: string): number | null {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export default function Page() {
  const [na, setNa] = useState("");
  const [cl, setCl] = useState("");
  const [hco3, setHco3] = useState("");
  const [measuredOsm, setMeasuredOsm] = useState("");
  const [glucose, setGlucose] = useState("");
  const [bun, setBun] = useState("");
  const [ethanol, setEthanol] = useState("");

  const nums = useMemo(() => {
    return {
      na: toNum(na),
      cl: toNum(cl),
      hco3: toNum(hco3),
      measuredOsm: toNum(measuredOsm),
      glucose: toNum(glucose),
      bun: toNum(bun),
      ethanol: toNum(ethanol),
    };
  }, [na, cl, hco3, measuredOsm, glucose, bun, ethanol]);

  const ag = useMemo(() => {
    if (nums.na == null || nums.cl == null || nums.hco3 == null) return null;
    return anionGap(nums.na, nums.cl, nums.hco3);
  }, [nums]);

  const og = useMemo(() => {
    if (nums.measuredOsm == null || nums.na == null) return null;
    return osmolalGap(
      nums.measuredOsm,
      nums.na,
      nums.bun ?? 0,
      nums.glucose ?? 0,
      nums.ethanol ?? undefined,
    );
  }, [nums]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <main className="w-full max-w-md space-y-4">
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Anyon ve Osmolal Gap</h1>
          <p className="text-xs text-foreground/70">Basit hesaplayıcı (eğitsel)</p>
        </header>

        <section className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              inputMode="decimal"
              placeholder="Na"
              value={na}
              onChange={(e) => setNa(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="Cl"
              value={cl}
              onChange={(e) => setCl(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="HCO3"
              value={hco3}
              onChange={(e) => setHco3(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              inputMode="decimal"
              placeholder="Ölçülen Osm"
              value={measuredOsm}
              onChange={(e) => setMeasuredOsm(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="Glukoz (mg/dL) — opsiyonel"
              value={glucose}
              onChange={(e) => setGlucose(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              inputMode="decimal"
              placeholder="BUN (mg/dL) — opsiyonel"
              value={bun}
              onChange={(e) => setBun(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="Etanol (mg/dL) — opsiyonel"
              value={ethanol}
              onChange={(e) => setEthanol(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>
        </section>

        <section aria-live="polite" className="rounded-lg border border-black/10 dark:border-white/10 px-5 py-5 text-center space-y-3">
          <div>
            <p className="text-2xl font-semibold">{ag != null ? ag : "—"}</p>
            <p className="text-xs text-foreground/70">Anyon Gap = Na − (Cl + HCO3)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{og != null ? og : "—"}</p>
            <p className="text-xs text-foreground/70">Osmolal Gap = ölçülen − (2×Na + BUN/2.8 + Glukoz/18 + EtOH/3.7)</p>
          </div>
        </section>

        <footer className="text-center">
          <Disclaimer />
        </footer>
      </main>
    </div>
  );
}

