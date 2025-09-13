import { describe, it, expect } from "vitest";
import { calcMaintenance } from "@/lib/calculators/maintenance";

describe("calcMaintenance", () => {
  it("3 kg → 12 mL/h", () => {
    expect(calcMaintenance(3)).toBe(12);
  });

  it("10 kg → 40 mL/h", () => {
    expect(calcMaintenance(10)).toBe(40);
  });

  it("20 kg → 60 mL/h", () => {
    expect(calcMaintenance(20)).toBe(60);
  });

  it("35 kg → 75 mL/h", () => {
    expect(calcMaintenance(35)).toBe(75);
  });

  it("out-of-range low (0.1 kg) throws", () => {
    expect(() => calcMaintenance(0.1)).toThrowError();
  });

  it("out-of-range high (100.5 kg) throws", () => {
    expect(() => calcMaintenance(100.5)).toThrowError();
  });
});

