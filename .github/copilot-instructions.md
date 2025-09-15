# Copilot Instructions — Pediatri Web MVP

## Mission
Small, safe PWA for pediatric calculators (4-2-1, dehydration, free-water) + PEWS + 5 drug dose cards. No diagnosis. Ship fast with tests & offline.

## Tech Guardrails
- Next.js (App Router) + TypeScript + Tailwind
- Pure calc functions under `/lib/**` with unit tests
- Read-only JSON under `/content/**`
- PWA: cache `/content/*.json` + shell; show offline banner
- Accessibility & validation at UI and function boundaries
- No PHI; anonymous metrics only

### Toxicology Safety
- Never provide diagnosis or treatment orders.
- Toxidrome module is educational only: suggest patterns; do not prescribe.
- Always show a red banner: “Acil uyarılar varsa 112’yi arayın / Zehir Danışma Merkezi ile iletişime geçin.”
- No medication dosing in tox module (antidot doses excluded in MVP).
- All outputs must include a disclaimer line.

## Folders
/app/(public), /app/calc/*, /app/score/pews, /app/status, /app/api/status
/content/*.json, /lib/calculators/*.ts, /lib/safety.ts, /tests/*.test.ts

## DoD (per feature)
Pure fn + tests ✓ · UI + validation + safety badge ✓ · Listed on landing + appears in /status ✓ · Works offline ✓

## Style
Type everything, named exports; Tailwind-only; small components; no magic numbers.
