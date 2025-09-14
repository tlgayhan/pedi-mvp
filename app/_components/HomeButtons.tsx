"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function HomeButtons() {
  const favKey = "favorite:calc/drug";
  const [favDrug, setFavDrug] = useState(false);

  useEffect(() => {
    try {
      setFavDrug(localStorage.getItem(favKey) === "1");
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === favKey) setFavDrug(e.newValue === "1");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const items = useMemo(
    () => [
      { href: "/calc/maintenance", label: "Bakım Sıvısı" },
      { href: "/calc/dehydration", label: "Dehidratasyon" },
      { href: "/score/pews", label: "PEWS" },
      { href: "/calc/drug", label: "İlaç Dozu", fav: true },
    ],
    [],
  );

  const ordered = useMemo(() => {
    if (!favDrug) return items;
    const fav = items.find((i) => i.fav);
    const rest = items.filter((i) => !i.fav);
    return fav ? [fav, ...rest] : items;
  }, [favDrug, items]);

  const cls =
    "inline-flex items-center justify-center rounded-lg px-6 py-3 bg-foreground text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] focus-visible:ring-2 focus-visible:ring-offset-2";

  return (
    <div className="grid grid-cols-1 gap-3">
      {ordered.map((it) => (
        <Link key={it.href} href={it.href} className={cls}>
          {it.label}
        </Link>
      ))}
    </div>
  );
}

