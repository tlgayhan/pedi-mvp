import { describe, it, expect } from "vitest";
import { calcDose, OutOfRangeError } from "@/lib/drugDose";
import db from "@/content/drugs.json";

describe("calcDose", () => {
  const table = [
    {
      name: "A: Paracetamol PO, 14 kg, 24 mg/mL",
      req: {
        drugId: "paracetamol",
        route: "PO",
        weightKg: 14,
        concentrationMgPerMl: 24,
      },
      expect: {
        perDoseMg: 140,
        perDoseMl: 5.8,
        dailyTotalMg: 560,
        maxApplied: false,
        dailyMaxExceeded: false,
      },
    },
    {
      name: "B: Ibuprofen PO, 10 kg, 40 mg/mL",
      req: {
        drugId: "ibuprofen",
        route: "PO",
        weightKg: 10,
        concentrationMgPerMl: 40,
      },
      expect: {
        perDoseMg: 100,
        perDoseMl: 2.5,
        dailyTotalMg: 400,
        maxApplied: false,
        dailyMaxExceeded: false,
      },
    },
    {
      name: "C: Paracetamol PO, 50 kg (cap at maxSingle)",
      req: {
        drugId: "paracetamol",
        route: "PO",
        weightKg: 50,
        concentrationMgPerMl: 24,
      },
      expect: {
        perDoseMg: 500,
        perDoseMl: 20.8,
        dailyTotalMg: 2000,
        maxApplied: true,
        dailyMaxExceeded: false,
      },
    },
  ] as const;

  for (const t of table) {
    it(t.name, () => {
      const res = calcDose(t.req, db as any);
      expect(res.perDoseMg).toBe(t.expect.perDoseMg);
      expect(res.perDoseMl).toBe(t.expect.perDoseMl);
      expect(res.dailyTotalMg).toBe(t.expect.dailyTotalMg);
      expect(res.maxApplied).toBe(t.expect.maxApplied);
      expect(res.dailyMaxExceeded).toBe(t.expect.dailyMaxExceeded);
    });
  }

  it("D: out-of-range weight throws", () => {
    expect(() =>
      calcDose(
        {
          drugId: "paracetamol",
          route: "PO",
          weightKg: 0.2,
          concentrationMgPerMl: 24,
        },
        db as any,
      ),
    ).toThrow(OutOfRangeError);
  });
});

