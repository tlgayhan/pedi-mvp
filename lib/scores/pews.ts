/** Error thrown when an input is outside allowed PEWS bounds. */
export class OutOfRangeError extends Error {}

export type Tier = "low" | "med" | "high";

export type BehaviorLevel = "alert" | "voice" | "pain" | "unresponsive";

/**
 * Inputs for simplified PEWS scorer.
 * - respRate: breaths/min, must be within [10, 120]
 * - oxygen: supplemental O2 level {0,2,4}
 * - heartRate: beats/min, must be within [40, 220]
 * - capRefill: capillary refill seconds mapped to {0,2,4}
 * - behavior: AVPU behavior level
 */
export type PewsInputs = {
  respRate: number;
  oxygen: 0 | 2 | 4;
  heartRate: number;
  capRefill: 0 | 2 | 4;
  behavior: BehaviorLevel;
};

function scoreRespRate(rr: number): number {
  // Guard to sane pediatric bounds (conservative)
  if (!Number.isFinite(rr) || rr < 10 || rr > 120) throw new OutOfRangeError("respRate out of range");
  if (rr <= 30) return 0;
  if (rr <= 45) return 1;
  if (rr <= 60) return 2;
  return 3;
}

function scoreHeartRate(hr: number): number {
  // Guard to sane pediatric bounds (conservative)
  if (!Number.isFinite(hr) || hr < 40 || hr > 220) throw new OutOfRangeError("heartRate out of range");
  if (hr <= 100) return 0;
  if (hr <= 140) return 1;
  if (hr <= 170) return 2;
  return 3;
}

function scoreBehavior(b: BehaviorLevel): number {
  switch (b) {
    case "alert":
      return 0;
    case "voice":
      return 1;
    case "pain":
      return 2;
    case "unresponsive":
      return 3;
    default:
      throw new OutOfRangeError("behavior invalid");
  }
}

function score024(label: string, v: number): 0 | 2 | 4 {
  if (v === 0 || v === 2 || v === 4) return v;
  throw new OutOfRangeError(`${label} invalid`);
}

/**
 * Calculates a simplified PEWS score using integer bins.
 * Pure function — no I/O or side effects.
 * Throws OutOfRangeError if any input is invalid.
 */
export function calcPEWS(inputs: PewsInputs): { total: number; tier: Tier } {
  const oxygen = score024("oxygen", inputs.oxygen);
  const capRefill = score024("capRefill", inputs.capRefill);
  const rr = scoreRespRate(inputs.respRate);
  const hr = scoreHeartRate(inputs.heartRate);
  const beh = scoreBehavior(inputs.behavior);

  const total = rr + oxygen + hr + capRefill + beh;

  let tier: Tier = "low";
  if (total >= 5) tier = "high";
  else if (total >= 3) tier = "med";
  else tier = "low";

  return { total, tier };
}
