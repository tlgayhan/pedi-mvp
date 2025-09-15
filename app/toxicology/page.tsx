import { Suspense } from "react";
import ClientTox from "./ClientTox";
import type { ToxDb } from "@/lib/toxicology/engine";

export default async function Page() {
  const mod = await import("@/content/toxicology/toxidromes.json");
  const db = (mod as { default: ToxDb }).default;
  return (
    <Suspense>
      <ClientTox db={db} />
    </Suspense>
  );
}
