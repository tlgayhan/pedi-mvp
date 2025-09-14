"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { calcDehydrationPlan, OutOfRangeError } from "@/lib/calculators/dehydration";
import Disclaimer from "@/app/_components/Disclaimer";

type Result = { deficitMl: number; hourlyMl: number } | null;

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center p-6 sm:p-10">Yükleniyor…</div>}>
      <DehydrationInner />
    </Suspense>
  );
}

function DehydrationInner() {
  const [weightKg, setWeightKg] = useState<string>("");
  const [percent, setPercent] = useState<string>("");
  const [hours, setHours] = useState<string>("24");
  const search = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const kgParam = search.get("kg");
    const pctParam = search.get("pct");
    const hParam = search.get("h");

    if (kgParam != null && kgParam !== "") {
      const v = parseFloat(kgParam);
      if (Number.isFinite(v) && v >= 0.5 && v <= 100) setWeightKg(String(v));
    }
    if (pctParam != null && pctParam !== "") {
      const v = parseFloat(pctParam);
      if (Number.isFinite(v) && v >= 0 && v <= 10) setPercent(String(v));
    }
    if (hParam != null && hParam !== "") {
      const v = parseFloat(hParam);
      if (Number.isFinite(v) && Number.isInteger(v) && v >= 1 && v <= 48) setHours(String(v));
    }
  }, [search]);

  const parsed = useMemo(() => {
    const w = parseFloat(weightKg);
    const p = parseFloat(percent);
    const h = parseInt(hours, 10);
    return {
      w: Number.isFinite(w) ? w : NaN,
      p: Number.isFinite(p) ? p : NaN,
      h: Number.isFinite(h) ? h : NaN,
    };
  }, [weightKg, percent, hours]);

  const { result, error } = useMemo((): { result: Result; error: string } => {
    if (!Number.isFinite(parsed.w) || !Number.isFinite(parsed.p) || !Number.isFinite(parsed.h)) {
      return { result: null, error: "" };
    }
    try {
      const r = calcDehydrationPlan(parsed.w, parsed.p, parsed.h);
      return { result: r, error: "" };
    } catch (e) {
      if (e instanceof OutOfRangeError) return { result: null, error: "Girdi aralık dışında." };
      return { result: null, error: "Hesaplama hatası." };
    }
  }, [parsed]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <main className="w-full max-w-md space-y-4">
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dehidratasyon</h1>
          <p className="text-xs text-foreground/70">Defisit + bakım (mL/saat)</p>
        </header>

        <section className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="weight" className="text-sm font-medium">Ağırlık (kg)</label>
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              step={0.5}
              min={0.5}
              max={100}
              placeholder="0.5–100"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          </div>

          <div className="grid gap-2">
            <label htmlFor="percent" className="text-sm font-medium">Dehidratasyon (%)</label>
            <input
              id="percent"
              type="number"
              inputMode="decimal"
              step={0.5}
              min={0}
              max={10}
              placeholder="0–10"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="hours" className="text-sm font-medium">Süre (saat)</label>
            <input
              id="hours"
              type="number"
              inputMode="numeric"
              step={1}
              min={1}
              max={48}
              placeholder="1–48 (varsayılan 24)"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>
        </section>

        <section aria-live="polite" className="rounded-lg border border-black/10 dark:border-white/10 px-5 py-5 text-center space-y-2">
          <p className="text-2xl font-semibold">
            {result ? `${result.hourlyMl} mL/saat` : "—"}
          </p>
          <p className="text-sm text-foreground/70">Defisit: {result ? `${result.deficitMl} mL` : "—"}</p>
        </section>

        <footer className="text-center">
          <Disclaimer />
        </footer>
      </main>
    </div>
  );
}
