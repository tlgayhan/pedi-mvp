import { describe, it, expect } from "vitest";
import { calcDehydrationPlan, OutOfRangeError } from "@/lib/calculators/dehydration";

describe("calcDehydrationPlan", () => {
  const cases = [
    {
      name: "A: 14 kg, 5%, 24h",
      weightKg: 14,
      percent: 5,
      hours: 24,
      expected: { deficitMl: 700, hourlyMl: 77 },
    },
    {
      name: "B: 10 kg, 3%, 24h",
      weightKg: 10,
      percent: 3,
      hours: 24,
      expected: { deficitMl: 300, hourlyMl: 53 },
    },
  ] as const;

  for (const c of cases) {
    it(c.name, () => {
      const res = calcDehydrationPlan(c.weightKg, c.percent, c.hours);
      expect(res).toEqual(c.expected);
    });
  }

  it("C: out-of-range percent=12 throws OutOfRangeError", () => {
    expect(() => calcDehydrationPlan(10, 12, 24)).toThrow(OutOfRangeError);
  });
});
