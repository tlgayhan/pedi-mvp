import { describe, it, expect } from "vitest";
import { calcPEWS, OutOfRangeError } from "@/lib/scores/pews";

describe("PEWS scorer (simplified)", () => {
  it("Case A: all normal → total 0, low", () => {
    const res = calcPEWS({ respRate: 24, oxygen: 0, heartRate: 90, capRefill: 0, behavior: "alert" });
    expect(res).toEqual({ total: 0, tier: "low" });
  });

  it("Case B: moderate abnormalities → med tier", () => {
    // rr=40 → 1, hr=130 → 1, behavior=voice → 1; total≥3
    const res = calcPEWS({ respRate: 40, oxygen: 0, heartRate: 130, capRefill: 0, behavior: "voice" });
    expect(res.tier).toBe("med");
  });

  it("Case C: severe → high tier", () => {
    // rr=70 → 3, hr=180 → 3, oxygen=4, capRefill=4, behavior=unresponsive → 3; total≫5
    const res = calcPEWS({ respRate: 70, oxygen: 4, heartRate: 180, capRefill: 4, behavior: "unresponsive" });
    expect(res.tier).toBe("high");
  });

  it("Case D: invalid input throws", () => {
    // oxygen must be 0|2|4
    expect(() => calcPEWS({ respRate: 20, oxygen: 3 as any, heartRate: 80, capRefill: 0, behavior: "alert" })).toThrow(
      OutOfRangeError,
    );
  });

  describe("Boundary bins", () => {
    it("respRate thresholds lock bins and tiers", () => {
      const rrCases = [
        { rr: 30, score: 0, tier: "low" as const },
        { rr: 31, score: 1, tier: "low" as const },
        { rr: 45, score: 1, tier: "low" as const },
        { rr: 46, score: 2, tier: "low" as const },
        { rr: 60, score: 2, tier: "low" as const },
        { rr: 61, score: 3, tier: "med" as const },
      ];
      for (const c of rrCases) {
        const res = calcPEWS({ respRate: c.rr, oxygen: 0, heartRate: 90, capRefill: 0, behavior: "alert" });
        expect(res.total).toBe(c.score);
        expect(res.tier).toBe(c.tier);
      }
    });

    it("heartRate thresholds lock bins and tiers", () => {
      const hrCases = [
        { hr: 100, score: 0, tier: "low" as const },
        { hr: 101, score: 1, tier: "low" as const },
        { hr: 140, score: 1, tier: "low" as const },
        { hr: 141, score: 2, tier: "low" as const },
        { hr: 170, score: 2, tier: "low" as const },
        { hr: 171, score: 3, tier: "med" as const },
      ];
      for (const c of hrCases) {
        const res = calcPEWS({ respRate: 24, oxygen: 0, heartRate: c.hr, capRefill: 0, behavior: "alert" });
        expect(res.total).toBe(c.score);
        expect(res.tier).toBe(c.tier);
      }
    });
  });
});
