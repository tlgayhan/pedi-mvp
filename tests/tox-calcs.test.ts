import { describe, it, expect } from "vitest";
import { anionGap, osmolalGap, lactateFlag, round1 } from "@/lib/toxicology/calcs";

describe("toxicology calcs", () => {
  it("anion gap typical", () => {
    // 140 - (105 + 24) = 11
    expect(anionGap(140, 105, 24)).toBe(11);
  });

  it("osmolal gap without ethanol", () => {
    // calc = 2*140 + 14/2.8 + 90/18 = 280 + 5 + 5 = 290; measured 300 -> gap 10
    expect(osmolalGap(300, 140, 14, 90)).toBe(10);
  });

  it("osmolal gap with ethanol", () => {
    // add EtOH 100 mg/dL -> +27.0; calc ~317 -> gap ~13
    expect(osmolalGap(330, 140, 14, 90, 100)).toBe(13);
  });

  it("lactate flag", () => {
    expect(lactateFlag(1.8)).toBe("normal");
    expect(lactateFlag(2.2)).toBe("high");
  });
});

