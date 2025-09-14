
export class OutOfRangeError extends Error {}

export type DoseRequest = {
  drugId: string;
  route: string;
  weightKg: number;
  concentrationMgPerMl: number;
  dosesPerDay?: number;
};

export type DoseResult = {
  perDoseMg: number;
  perDoseMl: number;
  maxApplied: boolean;
  dailyTotalMg: number;
  dailyMaxExceeded: boolean;
  warnings: string[];
};

export type DrugRoute = {
  route: string;
  perKgMg: number;
  maxSingleMg: number;
  maxDailyMgPerKg: number;
  maxDailyMgAbs?: number;
  intervalH: number;
  concentrationsMgPerMl: number[];
};

export type Drug = {
  id: string;
  name: string;
  routes: DrugRoute[];
  guardrails: { minKg: number; maxKg: number };
  notes?: string;
};

export type DrugsDb = Drug[];

function roundToStep(n: number, step: number): number {
  return Math.round(n / step) * step;
}

function roundTo1Decimal(n: number): number {
  return Math.round(n * 10) / 10;
}

export function calcDose(req: DoseRequest, db: DrugsDb): DoseResult {
  const warnings: string[] = [];

  const drug = db.find((d) => d.id.toLowerCase() === req.drugId.toLowerCase());
  if (!drug) throw new OutOfRangeError("drug not found");

  const routeReq = req.route.toUpperCase();
  const route = drug.routes.find((r) => r.route.toUpperCase() === routeReq);
  if (!route) throw new OutOfRangeError("route not found");

  const { minKg, maxKg } = drug.guardrails ?? { minKg: 0.5, maxKg: 100 };
  if (!Number.isFinite(req.weightKg) || req.weightKg < minKg || req.weightKg > maxKg) {
    throw new OutOfRangeError("weight out of range");
  }

  if (!Number.isFinite(req.concentrationMgPerMl) || req.concentrationMgPerMl <= 0) {
    throw new OutOfRangeError("concentration must be > 0");
  }

  const perKgMg = route.perKgMg;
  const baseMg = perKgMg * req.weightKg;
  const cappedRaw = Math.min(baseMg, route.maxSingleMg);
  const maxApplied = baseMg >= route.maxSingleMg;
  if (maxApplied) warnings.push("Single dose capped to maxSingle");

  const perDoseMg = roundToStep(cappedRaw, 5);
  const perDoseMl = roundTo1Decimal(perDoseMg / req.concentrationMgPerMl);

  const dosesPerDay = req.dosesPerDay ?? (24 / route.intervalH);
  if (!Number.isFinite(dosesPerDay) || dosesPerDay <= 0) {
    throw new OutOfRangeError("invalid dosesPerDay");
  }
  const dailyTotalMg = Math.round(perDoseMg * dosesPerDay);

  const maxPerKg = route.maxDailyMgPerKg * req.weightKg;
  const exceedPerKg = dailyTotalMg > maxPerKg;
  if (exceedPerKg) warnings.push("Daily total exceeds max per kg");

  const hasAbs = typeof route.maxDailyMgAbs === "number" && route.maxDailyMgAbs > 0;
  const exceedAbs = hasAbs ? dailyTotalMg > (route.maxDailyMgAbs as number) : false;
  if (exceedAbs) warnings.push("Daily total exceeds absolute max");

  const dailyMaxExceeded = exceedPerKg || exceedAbs;

  return {
    perDoseMg,
    perDoseMl,
    maxApplied,
    dailyTotalMg,
    dailyMaxExceeded,
    warnings,
  };
}
