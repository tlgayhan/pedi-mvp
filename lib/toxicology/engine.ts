// Simplified toxidrome suggestion engine — pure and deterministic
// No I/O; callers pass the DB loaded from content/toxicology/toxidromes.json

export type TFinding = string;

export type Input = {
  findings: TFinding[];
  vitals?: { hr?: number; bpSys?: number; tempC?: number };
  labs?: { anionGap?: number; osmolGap?: number };
};

export type Suggestion = {
  toxidromeId: string;
  score: number; // 0..100
  matched: string[];
  conflicts: string[];
};

export type Toxidrome = {
  id: string;
  name: string;
  keyFindings: string[];
  negFindings: string[];
  labsHelpful?: string[];
  notes?: string;
};

export type ToxDb = {
  toxidromes: Toxidrome[];
  redFlags: string[];
};

function normLower(s: string): string {
  return s.trim().toLowerCase();
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function vitalBonuses(id: string, vitals: NonNullable<Input["vitals"]>): number {
  let bonus = 0;
  const hr = vitals.hr;
  const temp = vitals.tempC;

  // Minimal heuristics — small nudges only
  if (hr != null) {
    if (hr >= 120 && (id === "sympathomimetic" || id === "anticholinergic")) bonus += 0.5;
    if (hr <= 60 && id === "opioid") bonus += 0.5;
  }
  if (temp != null) {
    if (temp >= 38.5 && (id === "sympathomimetic" || id === "serotonin")) bonus += 0.5;
  }

  return bonus;
}

export function suggestToxidromes(input: Input, db: ToxDb): { suggestions: Suggestion[]; redFlags: string[] } {
  const findingsSet = new Set((input.findings || []).map(normLower));

  const suggestions: Suggestion[] = db.toxidromes.map((tox) => {
    const key = tox.keyFindings || [];
    const neg = tox.negFindings || [];

    const matched: string[] = [];
    const conflicts: string[] = [];

    for (const f of key) {
      if (findingsSet.has(normLower(f))) matched.push(f);
    }
    for (const f of neg) {
      if (findingsSet.has(normLower(f))) conflicts.push(f);
    }

    const base = matched.length - conflicts.length;
    const vitBonus = input.vitals ? vitalBonuses(tox.id, input.vitals) : 0;

    // Normalize: approximate max as number of keyFindings; avoid division by zero
    const denom = Math.max(1, key.length);
    const normalized = clamp(((base + vitBonus) / denom) * 100, 0, 100);

    return {
      toxidromeId: tox.id,
      score: Math.round(normalized),
      matched,
      conflicts,
    };
  });

  // Filter and sort
  const filtered = suggestions
    .filter((s) => s.score >= 20)
    .sort((a, b) => b.score - a.score || a.toxidromeId.localeCompare(b.toxidromeId));

  // Red flags: user-selected items matching db redFlags (case-insensitive)
  const redFlags: string[] = [];
  const redSet = new Set(db.redFlags.map(normLower));
  for (const f of findingsSet) {
    if (redSet.has(f)) redFlags.push(input.findings.find((x) => normLower(x) === f) as string);
  }

  // Vital-based red flags
  if (input.vitals?.tempC != null && input.vitals.tempC >= 40) {
    const msg = db.redFlags.find((r) => normLower(r).includes("hipertermi")) || "Hipertermi > 40°C";
    if (!redFlags.includes(msg)) redFlags.push(msg);
  }
  if (input.vitals?.bpSys != null && input.vitals.bpSys <= 80) {
    const msg = db.redFlags.find((r) => normLower(r).includes("hipotansiyon")) || "Persistan hipotansiyon";
    if (!redFlags.includes(msg)) redFlags.push(msg);
  }

  return { suggestions: filtered, redFlags };
}

