"use client";

import { useEffect, useState } from "react";

export default function SwClient() {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setOnline(navigator.onLine);
      const on = () => setOnline(true);
      const off = () => setOnline(false);
      window.addEventListener("online", on);
      window.addEventListener("offline", off);
      return () => {
        window.removeEventListener("online", on);
        window.removeEventListener("offline", off);
      };
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          /* swallow */
        });
    }
  }, []);

  return !online ? (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center bg-amber-100 text-amber-900 text-sm py-1">
      Çevrimdışı mod — önbellekten gösteriliyor
    </div>
  ) : (
    <></>
  );
}
