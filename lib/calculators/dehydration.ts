import { calcMaintenance } from "./maintenance";

export class OutOfRangeError extends Error {}

export function calcDehydrationPlan(
  weightKg: number,
  percent: number,
  hours: number
): { deficitMl: number; hourlyMl: number } {
  if (!Number.isFinite(weightKg) || !Number.isFinite(percent) || !Number.isFinite(hours)) {
    throw new OutOfRangeError("inputs must be finite numbers");
  }

  if (weightKg < 0.5 || weightKg > 100) throw new OutOfRangeError("weightKg out of range");
  if (percent < 0 || percent > 10) throw new OutOfRangeError("percent out of range");
  if (hours < 1 || hours > 48) throw new OutOfRangeError("hours out of range");

  const deficitMlRaw = percent * 10 * weightKg; // mL total deficit
  const hourlyBase = calcMaintenance(weightKg); // mL/hr
  const hourlyWithDeficit = hourlyBase + deficitMlRaw / hours; // mL/hr

  return {
    deficitMl: Math.round(deficitMlRaw),
    hourlyMl: Math.round(hourlyWithDeficit),
  };
}

