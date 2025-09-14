import type { DrugsDb } from "./drugDose";

export async function loadDrugs(): Promise<DrugsDb> {
  const mod = await import("@/content/drugs.json");
  const data = (mod as any).default ?? mod;
  if (!Array.isArray(data)) throw new Error("invalid drugs db");
  return data as DrugsDb;
}
