import { loadDrugs } from "@/lib/loadDrugs";
import { Suspense } from "react";
import ClientDrugCalc from "./ClientDrugCalc";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: PageProps) {
  const db = await loadDrugs();

  const sp = searchParams || {};
  const initial = {
    drugId: typeof sp.drug === "string" ? sp.drug : undefined,
    route: typeof sp.route === "string" ? sp.route : undefined,
    kg: typeof sp.kg === "string" ? sp.kg : undefined,
    conc: typeof sp.conc === "string" ? sp.conc : undefined,
    doses: typeof sp.doses === "string" ? sp.doses : undefined,
  };

  return (
    <Suspense>
      <ClientDrugCalc db={db} initial={initial} />
    </Suspense>
  );
}
