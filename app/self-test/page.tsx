"use client";

import { useMemo } from "react";
import { calcMaintenance } from "@/lib/calculators/maintenance";
import { calcDehydrationPlan } from "@/lib/calculators/dehydration";
import { calcPEWS } from "@/lib/scores/pews";
import type { PewsInputs } from "@/lib/scores/pews";

type MaintCase =
  | { kind: "maint"; name: string; kg: number; expected: number }
  | { kind: "maint"; name: string; kg: number; expectError: true };

type DehydCase =
  | {
      kind: "dehyd";
      name: string;
      kg: number;
      pct: number;
      h: number;
      expected: { deficitMl: number; hourlyMl: number };
    }
  | { kind: "dehyd"; name: string; kg: number; pct: number; h: number; expectError: true };

type PewsCase =
  | {
      kind: "pews";
      name: string;
      input: PewsInputs;
      expectedTier: "low" | "med" | "high";
      expectedTotal?: number;
    }
  | {
      kind: "pews";
      name: string;
      input: Omit<PewsInputs, "oxygen"> & { oxygen: number };
      expectError: true;
    };

type TestCase = MaintCase | DehydCase | PewsCase;

function runTest(tc: TestCase) {
  try {
    if (tc.kind === "maint") {
      const result = calcMaintenance(tc.kg);
      if ("expectError" in tc) {
        return { pass: false, message: `Expected error, got ${result}` };
      }
      const pass = Object.is(result, tc.expected);
      return { pass, message: `got ${result}, expected ${tc.expected}` };
    } else if (tc.kind === "dehyd") {
      const result = calcDehydrationPlan(tc.kg, tc.pct, tc.h);
      if ("expectError" in tc) {
        return { pass: false, message: `Expected error, got ${JSON.stringify(result)}` };
      }
      const pass =
        result.deficitMl === tc.expected.deficitMl && result.hourlyMl === tc.expected.hourlyMl;
      return {
        pass,
        message: `got {${result.deficitMl}, ${result.hourlyMl}}, expected {${tc.expected.deficitMl}, ${tc.expected.hourlyMl}}`,
      };
    } else {
      const result = calcPEWS(tc.input as unknown as PewsInputs);
      if ("expectError" in tc) {
        return { pass: false, message: `Expected error, got ${JSON.stringify(result)}` };
      }
      const tierOk = result.tier === tc.expectedTier;
      const totalOk = tc.expectedTotal == null ? true : result.total === tc.expectedTotal;
      const pass = tierOk && totalOk;
      return {
        pass,
        message: `got total ${result.total}, tier ${result.tier}; expected ${tc.expectedTotal ?? "?"}/${tc.expectedTier}`,
      };
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "error";
    if ("expectError" in tc) return { pass: true, message: `threw: ${msg}` };
    return { pass: false, message: `threw: ${msg}` };
  }
}

export default function SelfTestPage() {
  const tests = useMemo(
    () =>
      [
        // Maintenance
        { kind: "maint", name: "Bakım 3 → 12", kg: 3, expected: 12 },
        { kind: "maint", name: "Bakım 10 → 40", kg: 10, expected: 40 },
        { kind: "maint", name: "Bakım 20 → 60", kg: 20, expected: 60 },
        { kind: "maint", name: "Bakım 35 → 75", kg: 35, expected: 75 },
        { kind: "maint", name: "Bakım out-of-range", kg: -1, expectError: true },
        // Dehydration
        {
          kind: "dehyd",
          name: "Dehid 14kg,%5,24s → 700/77",
          kg: 14,
          pct: 5,
          h: 24,
          expected: { deficitMl: 700, hourlyMl: 77 },
        },
        {
          kind: "dehyd",
          name: "Dehid 10kg,%3,24s → 300/53",
          kg: 10,
          pct: 3,
          h: 24,
          expected: { deficitMl: 300, hourlyMl: 53 },
        },
        { kind: "dehyd", name: "Dehid out-of-range %12", kg: 10, pct: 12, h: 24, expectError: true },
        // PEWS checks (new API)
        {
          kind: "pews",
          name: "PEWS düşük: tüm normal",
          input: { respRate: 28, oxygen: 0, heartRate: 90, capRefill: 0, behavior: "alert" },
          expectedTotal: 0,
          expectedTier: "low",
        },
        {
          kind: "pews",
          name: "PEWS orta: rr40, ox2, hr120, cr0, voice",
          input: { respRate: 40, oxygen: 2, heartRate: 120, capRefill: 0, behavior: "voice" },
          expectedTier: "med",
        },
        {
          kind: "pews",
          name: "PEWS yüksek: rr65, ox4, hr180, cr4, pain",
          input: { respRate: 65, oxygen: 4, heartRate: 180, capRefill: 4, behavior: "pain" },
          expectedTier: "high",
        },
        {
          kind: "pews",
          name: "PEWS invalid oxygen=3 → throw",
          input: { respRate: 20, oxygen: 3, heartRate: 80, capRefill: 0, behavior: "alert" },
          expectError: true,
        },
      ] as const satisfies ReadonlyArray<TestCase>,
    [],
  );

  const results = useMemo(() => tests.map(runTest), [tests]);
  const allPass = results.every((r) => r.pass);

  return (
    <div className="min-h-screen grid place-items-center p-6 sm:p-10">
      <main className="w-full max-w-xl space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Self Test: Calculators</h1>
          <div
            className={`mx-auto w-3 h-3 rounded-full ${allPass ? "bg-green-500" : "bg-red-500"}`}
            aria-label={allPass ? "All tests passed" : "Some tests failed"}
            title={allPass ? "All tests passed" : "Some tests failed"}
          />
          <p className="text-sm text-foreground/70">{allPass ? "All PASS" : "FAIL detected"}</p>
        </header>

        <ul className="divide-y divide-black/10 dark:divide-white/10 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
          {tests.map((t, i) => {
            const r = results[i];
            return (
              <li key={i} className="flex items-center justify-between p-4">
                <span className="font-medium">{t.name}</span>
                <span className={r.pass ? "text-green-600" : "text-red-600"}>{r.pass ? "PASS" : "FAIL"}</span>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
