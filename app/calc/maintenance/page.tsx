"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { calcMaintenance } from "@/lib/calculators/maintenance";
import Disclaimer from "@/app/_components/Disclaimer";

const MIN_KG = 0.5;
const MAX_KG = 100;

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center p-6 sm:p-10">Yükleniyor…</div>}>
      <MaintenanceInner />
    </Suspense>
  );
}

function MaintenanceInner() {
  const search = useSearchParams();
  const [kgInput, setKgInput] = useState<string>("");

  useEffect(() => {
    const qp = search.get("kg");
    if (qp && !kgInput) {
      const v = parseFloat(qp);
      if (Number.isFinite(v) && v >= MIN_KG && v <= MAX_KG) {
        setKgInput(String(v));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const parsedKg = useMemo(() => {
    const n = parseFloat(kgInput);
    return Number.isFinite(n) ? n : NaN;
  }, [kgInput]);

  const error = useMemo(() => {
    if (kgInput === "") return "";
    if (!Number.isFinite(parsedKg)) return "Geçerli bir sayı giriniz.";
    if (parsedKg < MIN_KG || parsedKg > MAX_KG)
      return `Ağırlık ${MIN_KG}–${MAX_KG} kg arasında olmalıdır.`;
    return "";
  }, [kgInput, parsedKg]);

  const result = useMemo(() => {
    if (kgInput === "" || error) return null;
    try {
      return calcMaintenance(parsedKg);
    } catch {
      return null;
    }
  }, [kgInput, parsedKg, error]);

  const pretty = (n: number) => {
    const s = n.toFixed(2);
    return s.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <main className="w-full max-w-md space-y-4">
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Bakım Sıvısı</h1>
          <p className="text-xs text-foreground/70">4-2-1 kuralına göre mL/saat</p>
        </header>

        <section className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="kg" className="text-sm font-medium">Ağırlık (kg)</label>
            <input
              id="kg"
              type="number"
              inputMode="decimal"
              step={0.5}
              min={MIN_KG}
              max={MAX_KG}
              placeholder={`${MIN_KG}–${MAX_KG}`}
              value={kgInput}
              onChange={(e) => setKgInput(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
            {error && (
              <p role="alert" className="text-xs text-red-600">{error}</p>
            )}
          </div>

          <div
            aria-live="polite"
            className="rounded-lg border border-black/10 dark:border-white/10 px-5 py-5 text-center"
          >
            <p className="text-2xl font-semibold">
              {result != null && !error ? `${pretty(result)} ml/saat` : "—"}
            </p>
          </div>
        </section>

        <footer className="text-center">
          <Disclaimer />
        </footer>
      </main>
    </div>
  );
}
