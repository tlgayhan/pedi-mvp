import fs from "node:fs/promises";
import path from "node:path";
import type { DrugsDb } from "./drugDose";

export async function loadDrugs(): Promise<DrugsDb> {
  const file = path.resolve(process.cwd(), "content", "drugs.json");
  const buf = await fs.readFile(file, "utf8");
  const data = JSON.parse(buf) as unknown;
  if (!Array.isArray(data)) throw new Error("invalid drugs db");
  return data as DrugsDb;
}

