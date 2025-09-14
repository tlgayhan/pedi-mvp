"use client";

import { useMemo, useState } from "react";
import { calcPEWS, OutOfRangeError } from "@/lib/scores/pews";
import type { PewsInputs } from "@/lib/scores/pews";
import Disclaimer from "@/app/_components/Disclaimer";

export default function Page() {
  const [respRate, setRespRate] = useState<string>("");
  const [oxygen, setOxygen] = useState<string>("0");
  const [heartRate, setHeartRate] = useState<string>("");
  const [capRefill, setCapRefill] = useState<string>("0");
  const [behavior, setBehavior] = useState<string>("alert");

  const parsed = useMemo((): {
    rr: number | null;
    hr: number | null;
    ox: 0 | 2 | 4 | null;
    cr: 0 | 2 | 4 | null;
    beh: PewsInputs["behavior"];
  } => {
    const rr = parseFloat(respRate);
    const hr = parseFloat(heartRate);
    const ox = parseInt(oxygen, 10);
    const cr = parseInt(capRefill, 10);
    return {
      rr: Number.isFinite(rr) ? rr : null,
      hr: Number.isFinite(hr) ? hr : null,
      ox: Number.isFinite(ox) && (ox === 0 || ox === 2 || ox === 4) ? (ox as 0 | 2 | 4) : null,
      cr: Number.isFinite(cr) && (cr === 0 || cr === 2 || cr === 4) ? (cr as 0 | 2 | 4) : null,
      beh: (behavior as PewsInputs["behavior"]) ?? "alert",
    };
  }, [respRate, heartRate, oxygen, capRefill, behavior]);

  const { result, error } = useMemo((): { result: { total: number; tier: "low" | "med" | "high" } | null; error: string } => {
    if (
      parsed.rr == null ||
      parsed.hr == null ||
      parsed.ox == null ||
      parsed.cr == null ||
      !parsed.beh
    ) {
      return { result: null, error: "" };
    }
    try {
      const r = calcPEWS({
        respRate: parsed.rr,
        oxygen: parsed.ox,
        heartRate: parsed.hr,
        capRefill: parsed.cr,
        behavior: parsed.beh,
      });
      return { result: r, error: "" };
    } catch (e: unknown) {
      if (e instanceof OutOfRangeError) return { result: null, error: "Girdi aralık dışında." };
      return { result: null, error: "Hesaplama hatası." };
    }
  }, [parsed]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <main className="w-full max-w-md space-y-4">
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">PEWS</h1>
          <p className="text-xs text-foreground/70">Basitleştirilmiş skor (AVPU, O2, RR, HR, CR)</p>
        </header>

        <section className="space-y-4" aria-labelledby="pews-form">
          <h2 id="pews-form" className="sr-only">PEWS formu</h2>

          <div className="grid gap-2">
            <label htmlFor="rr" className="text-sm font-medium">Solunum sayısı (dk)</label>
            <input
              id="rr"
              type="number"
              inputMode="numeric"
              step={1}
              min={10}
              max={120}
              placeholder="10–120"
              value={respRate}
              onChange={(e) => setRespRate(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="ox" className="text-sm font-medium">Oksijen desteği</label>
            <select
              id="ox"
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
              value={oxygen}
              onChange={(e) => setOxygen(e.target.value)}
            >
              <option value="0">Yok (0)</option>
              <option value="2">Düşük akım (2)</option>
              <option value="4">Yüksek/ventilasyon (4)</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="hr" className="text-sm font-medium">Nabız (dk)</label>
            <input
              id="hr"
              type="number"
              inputMode="numeric"
              step={1}
              min={40}
              max={220}
              placeholder="40–220"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="cr" className="text-sm font-medium">Kapiller dolum</label>
            <select
              id="cr"
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
              value={capRefill}
              onChange={(e) => setCapRefill(e.target.value)}
            >
              <option value="0">≤2 sn (0)</option>
              <option value="2">≈3 sn (2)</option>
              <option value="4">≥4 sn (4)</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="beh" className="text-sm font-medium">Davranış (AVPU)</label>
            <select
              id="beh"
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground"
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
            >
              <option value="alert">Uyanık</option>
              <option value="voice">Sesle</option>
              <option value="pain">Ağrıda</option>
              <option value="unresponsive">Yanıtsız</option>
            </select>
          </div>

          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        </section>

        <section aria-live="polite" className="rounded-lg border border-black/10 dark:border-white/10 px-5 py-5 text-center space-y-1">
          <p className="text-2xl font-semibold">{result ? result.total : "—"}</p>
          <p className="text-sm text-foreground/70">
            {result ? (result.tier === "low" ? "düşük" : result.tier === "med" ? "orta" : "yüksek") : "Seviye"}
          </p>
        </section>

        <footer className="text-center">
          <Disclaimer />
        </footer>
      </main>
    </div>
  );
}
