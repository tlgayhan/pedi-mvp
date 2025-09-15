// Pure toxicology calculation helpers (no I/O)

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Anion gap = Na - (Cl + HCO3)
export function anionGap(na: number, cl: number, hco3: number): number {
  const ag = na - (cl + hco3);
  return round1(ag);
}

// Calculated osm = 2*Na + BUN/2.8 + Glucose/18 (+ EtOH/3.7 if provided)
// Osmolal gap = measured - calculated
export function osmolalGap(
  measuredOsm: number,
  na: number,
  bun: number,
  glucose: number,
  ethanol?: number,
): number {
  const calc = 2 * na + bun / 2.8 + glucose / 18 + (ethanol ? ethanol / 3.7 : 0);
  return round1(measuredOsm - calc);
}

export function lactateFlag(lac: number): "high" | "normal" {
  // Conservative: >= 2.0 mmol/L considered high
  return lac >= 2 ? "high" : "normal";
}

