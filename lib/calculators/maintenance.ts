export class OutOfRangeError extends Error {}

export function calcMaintenance(kg: number): number {
  if (!Number.isFinite(kg)) throw new Error("kg must be a finite number");
  if (kg < 0.5 || kg > 100) throw new OutOfRangeError("kg out of range");

  const first10 = Math.min(kg, 10) * 4;
  const second10 = Math.min(Math.max(kg - 10, 0), 10) * 2;
  const rest = Math.max(kg - 20, 0) * 1;
  return Math.round((first10 + second10 + rest) * 100) / 100; // mL/hr
}
