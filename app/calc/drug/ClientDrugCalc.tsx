"use client";

import { useEffect, useMemo, useState } from "react";
import type { DrugsDb, Drug, DrugRoute, DoseRequest } from "@/lib/drugDose";
import { calcDose, OutOfRangeError } from "@/lib/drugDose";
import Disclaimer from "@/app/_components/Disclaimer";

function toNumberOrNull(v: string | undefined): number | null {
  if (!v) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function findDrug(db: DrugsDb, id?: string): Drug | undefined {
  if (!id) return undefined;
  return db.find((d) => d.id.toLowerCase() === id.toLowerCase());
}

function findRoute(drug?: Drug, routeCode?: string): DrugRoute | undefined {
  if (!drug || !routeCode) return undefined;
  return drug.routes.find((r) => r.route.toUpperCase() === routeCode.toUpperCase());
}

function format1(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

function format0(n: number): string {
  return Math.round(n).toString();
}

export default function ClientDrugCalc({ db, initial }: { db: DrugsDb; initial: { drugId?: string; route?: string; kg?: string; conc?: string; doses?: string } }) {
  const favKey = "favorite:calc/drug";
  const [fav, setFav] = useState<boolean>(false);
  useEffect(() => {
    try {
      setFav(localStorage.getItem(favKey) === "1");
    } catch {}
  }, []);

  const toggleFav = () => {
    try {
      const next = !fav;
      setFav(next);
      if (next) localStorage.setItem(favKey, "1");
      else localStorage.removeItem(favKey);
    } catch {}
  };

  const [drugId, setDrugId] = useState<string>(initial.drugId ?? (db[0]?.id ?? ""));
  const drug = useMemo(() => findDrug(db, drugId) ?? db[0], [db, drugId]);

  const [routeCode, setRouteCode] = useState<string>(initial.route ?? (drug?.routes[0]?.route ?? ""));
  const route = useMemo(() => findRoute(drug, routeCode) ?? drug?.routes[0], [drug, routeCode]);

  const [weight, setWeight] = useState<string>(initial.kg ?? "");
  const [conc, setConc] = useState<string>(initial.conc ?? (route && route.concentrationsMgPerMl[0] != null ? String(route.concentrationsMgPerMl[0]) : ""));
  const [doses, setDoses] = useState<string>(initial.doses ?? (route ? String(24 / route.intervalH) : ""));

  // Update dependent defaults when drug/route changes
  useMemo(() => {
    if (!route) return;
    if (!route.concentrationsMgPerMl.includes(Number(conc))) {
      setConc(String(route.concentrationsMgPerMl[0] ?? ""));
    }
    setDoses((prev) => (prev ? prev : String(24 / route.intervalH)));
  }, [route]);

  const parsed = useMemo(() => {
    return {
      weight: toNumberOrNull(weight),
      conc: toNumberOrNull(conc),
      doses: toNumberOrNull(doses),
    };
  }, [weight, conc, doses]);

  const errors = useMemo(() => {
    const errs: { weight?: string; conc?: string } = {};
    if (drug && parsed.weight != null) {
      const { minKg, maxKg } = drug.guardrails;
      if (parsed.weight < minKg || parsed.weight > maxKg) {
        errs.weight = `Ağırlık ${minKg}–${maxKg} kg arasında olmalıdır.`;
      }
    }
    if (parsed.conc != null && parsed.conc <= 0) {
      errs.conc = "Konsantrasyon 0'dan büyük olmalıdır.";
    }
    return errs;
  }, [drug, parsed]);

  const result = useMemo(() => {
    if (!drug || !route) return null;
    if (parsed.weight == null || parsed.conc == null) return null;
    try {
      const req: DoseRequest = {
        drugId: drug.id,
        route: route.route,
        weightKg: parsed.weight,
        concentrationMgPerMl: parsed.conc,
        dosesPerDay: parsed.doses ?? undefined,
      };
      return calcDose(req, [drug]);
    } catch (e: unknown) {
      if (e instanceof OutOfRangeError) return null;
      return null;
    }
  }, [drug, route, parsed]);

  const intervalH = route?.intervalH;
  const warningText = useMemo(() => {
    if (!result) return "";
    if (result.dailyMaxExceeded) return "Günlük maksimum dozu aşar.";
    if (result.maxApplied) return "Tek doz maksimuma yuvarlandı.";
    return "";
  }, [result]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <main className="w-full max-w-md space-y-4">
        <header className="text-center space-y-1 relative">
          <h1 className="text-2xl font-semibold tracking-tight">İlaç Doz Hesaplayıcı</h1>
          <p className="text-xs text-foreground/70">Klinik kullanım öncesi doğrulama gerektirir</p>
          <button
            type="button"
            onClick={toggleFav}
            aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
            className="absolute right-0 top-0 text-lg px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-offset-2"
            title={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            {fav ? "★" : "☆"}
          </button>
        </header>

        <section className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="drug" className="text-sm font-medium">İlaç</label>
            <select
              id="drug"
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
              value={drugId}
              onChange={(e) => {
                setDrugId(e.target.value);
                const nextDrug = findDrug(db, e.target.value);
                if (nextDrug) {
                  setRouteCode(nextDrug.routes[0]?.route ?? "");
                }
              }}
            >
              {db.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="route" className="text-sm font-medium">Uygulama yolu</label>
            <select
              id="route"
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
              value={routeCode}
              onChange={(e) => setRouteCode(e.target.value)}
            >
              {drug?.routes.map((r) => (
                <option key={r.route} value={r.route}>{r.route}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="kg" className="text-sm font-medium">Ağırlık (kg)</label>
            <input
              id="kg"
              type="number"
              inputMode="decimal"
              step={0.5}
              min={drug?.guardrails.minKg}
              max={drug?.guardrails.maxKg}
              placeholder={`${drug?.guardrails.minKg ?? 0.5}–${drug?.guardrails.maxKg ?? 100}`}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
            {errors.weight && <p role="alert" className="text-xs text-red-600">{errors.weight}</p>}
          </div>

          <div className="grid gap-2">
            <label htmlFor="conc" className="text-sm font-medium">Konsantrasyon (mg/mL)</label>
            <select
              id="conc"
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
              value={conc}
              onChange={(e) => setConc(e.target.value)}
            >
              {(route?.concentrationsMgPerMl ?? []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.conc && <p role="alert" className="text-xs text-red-600">{errors.conc}</p>}
          </div>

          <div className="grid gap-2">
            <label htmlFor="doses" className="text-sm font-medium">Günlük doz sayısı</label>
            <input
              id="doses"
              type="number"
              inputMode="decimal"
              step={0.5}
              min={0.5}
              max={24}
              placeholder={route ? String(24 / route.intervalH) : ""}
              value={doses}
              onChange={(e) => setDoses(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>
        </section>

        <section aria-live="polite" className="rounded-lg border border-black/10 dark:border-white/10 px-5 py-5 text-center space-y-1">
          <p className="text-2xl font-semibold">
            {result ? `${format0(result.perDoseMg)} mg` : "—"}
            <span className="text-sm text-foreground/70"> / tek doz</span>
          </p>
          <p className="text-sm text-foreground/80">{result ? `${format1(result.perDoseMl)} mL / tek doz` : ""}</p>
          <p className="text-sm text-foreground/80">{result ? `Günlük toplam: ${format0(result.dailyTotalMg)} mg` : ""}</p>
          {intervalH ? (
            <p className="text-xs text-foreground/60">Önerilen aralık: q{intervalH}h</p>
          ) : null}
          {warningText && (
            <p className={result?.dailyMaxExceeded ? "text-sm text-red-600" : "text-sm text-amber-600"}>{warningText}</p>
          )}
        </section>

        <footer className="text-center">
          <Disclaimer />
        </footer>
      </main>
    </div>
  );
}

