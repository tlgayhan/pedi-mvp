"use client";

import { useMemo, useState } from "react";
import type { ToxDb } from "@/lib/toxicology/engine";
import { suggestToxidromes } from "@/lib/toxicology/engine";
import Disclaimer from "@/app/_components/Disclaimer";

type Props = { db: ToxDb };

const OPTS = {
  skin: [
    { label: "Kuru deri/sıcak", value: "kuru deri/sıcak" },
    { label: "Terleme belirgin", value: "terleme belirgin" },
  ],
  eye: [
    { label: "Miyozis", value: "miyozis" },
    { label: "Midriazis", value: "midriazis" },
  ],
  neuro: [
    { label: "Ajitasyon", value: "ajitasyon" },
    { label: "Deliryum/Ajitasyon", value: "deliryum/ajitasyon" },
    { label: "SSS depresyonu", value: "sss depresyonu" },
  ],
  cardio: [
    { label: "Taşikardi", value: "taşikardi" },
    { label: "Hipertansiyon", value: "hipertansiyon" },
    { label: "Bradikardi", value: "bradikardi" },
    { label: "Hipotansiyon", value: "hipotansiyon" },
    { label: "İleus/idrar retansiyonu", value: "ileus/idrar retansiyonu" },
  ],
} as const;

export default function ClientTox({ db }: Props) {
  const [findings, setFindings] = useState<string[]>([]);
  const [hr, setHr] = useState<string>("");
  const [bpSys, setBpSys] = useState<string>("");
  const [tempC, setTempC] = useState<string>("");

  const [na, setNa] = useState<string>("");
  const [cl, setCl] = useState<string>("");
  const [hco3, setHco3] = useState<string>("");
  const [measuredOsm, setMeasuredOsm] = useState<string>("");

  const [ran, setRan] = useState(false);

  const vitals = useMemo(() => {
    const v: { hr?: number; bpSys?: number; tempC?: number } = {};
    const nHr = parseFloat(hr);
    if (Number.isFinite(nHr)) v.hr = nHr;
    const nBp = parseFloat(bpSys);
    if (Number.isFinite(nBp)) v.bpSys = nBp;
    const nT = parseFloat(tempC);
    if (Number.isFinite(nT)) v.tempC = nT;
    return v;
  }, [hr, bpSys, tempC]);

  const input = useMemo(
    () => ({ findings, vitals, labs: {} as { anionGap?: number; osmolGap?: number } }),
    [findings, vitals],
  );

  const result = useMemo(() => (ran ? suggestToxidromes(input, db) : { suggestions: [], redFlags: [] }), [ran, input, db]);

  const toggle = (v: string) => {
    setFindings((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <main className="w-full max-w-5xl space-y-4">
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Toksidrom Değerlendirici</h1>
          <p className="text-xs text-foreground/70">Eğitsel amaçlı: desen önerir, tanı/tedavi vermez</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-foreground/70">Cilt</h2>
              <div className="mt-2 grid gap-2">
                {OPTS.skin.map((o) => (
                  <label key={o.value} className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={findings.includes(o.value)} onChange={() => toggle(o.value)} />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold tracking-wide text-foreground/70">Göz</h2>
              <div className="mt-2 grid gap-2">
                {OPTS.eye.map((o) => (
                  <label key={o.value} className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={findings.includes(o.value)} onChange={() => toggle(o.value)} />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold tracking-wide text-foreground/70">SSS</h2>
              <div className="mt-2 grid gap-2">
                {OPTS.neuro.map((o) => (
                  <label key={o.value} className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={findings.includes(o.value)} onChange={() => toggle(o.value)} />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold tracking-wide text-foreground/70">Kardiyovasküler/GIS</h2>
              <div className="mt-2 grid gap-2">
                {OPTS.cardio.map((o) => (
                  <label key={o.value} className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={findings.includes(o.value)} onChange={() => toggle(o.value)} />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-foreground/70">Vital Bulgular</h2>
              <div className="mt-2 grid grid-cols-3 gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="HR"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Sistolik BP"
                  value={bpSys}
                  onChange={(e) => setBpSys(e.target.value)}
                  className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Sıcaklık (°C)"
                  value={tempC}
                  onChange={(e) => setTempC(e.target.value)}
                  className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground"
                />
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold tracking-wide text-foreground/70">Opsiyonel Lab</h2>
              <div className="mt-2 grid grid-cols-4 gap-3">
                <input type="number" inputMode="decimal" placeholder="Na" value={na} onChange={(e) => setNa(e.target.value)} className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground" />
                <input type="number" inputMode="decimal" placeholder="Cl" value={cl} onChange={(e) => setCl(e.target.value)} className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground" />
                <input type="number" inputMode="decimal" placeholder="HCO3" value={hco3} onChange={(e) => setHco3(e.target.value)} className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground" />
                <input type="number" inputMode="decimal" placeholder="Osm ölçüm" value={measuredOsm} onChange={(e) => setMeasuredOsm(e.target.value)} className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground" />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setRan(true)}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-foreground text-background text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Değerlendir
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {result.redFlags.length > 0 && (
            <div className="rounded-md bg-red-100 text-red-800 px-4 py-2 text-sm">
              Acil uyarılar var; 112’yi arayın / Zehir Danışma Merkezi ile iletişime geçin.
            </div>
          )}

          <div className="rounded-lg border border-black/10 dark:border-white/10">
            <div className="p-4 border-b border-black/10 dark:border-white/10 text-sm font-medium">Önerilen Toksidromlar</div>
            <ul className="divide-y divide-black/10 dark:divide-white/10">
              {result.suggestions.map((s) => {
                const name = db.toxidromes.find((t) => t.id === s.toxidromeId)?.name || s.toxidromeId;
                return (
                  <li key={s.toxidromeId} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{name}</span>
                      <span className="text-sm text-foreground/70">{s.score}%</span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-foreground/80">
                      <div>
                        <span className="font-medium">Eşleşen:</span> {s.matched.length ? s.matched.join(", ") : "—"}
                      </div>
                      <div>
                        <span className="font-medium">Çelişen:</span> {s.conflicts.length ? s.conflicts.join(", ") : "—"}
                      </div>
                    </div>
                  </li>
                );
              })}
              {result.suggestions.length === 0 && (
                <li className="p-4 text-sm text-foreground/60">Henüz öneri yok. Bulguları seçip Değerlendir’e basın.</li>
              )}
            </ul>
          </div>
        </section>

        <footer className="text-center">
          <Disclaimer />
        </footer>
      </main>
    </div>
  );
}

