import Link from "next/link";

const QUICK_KG = 14 as const;

function ButtonLink({ href, label, variant = "primary" }: { href: string; label: string; variant?: "primary" | "secondary" }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] focus-visible:ring-foreground"
      : "border border-black/10 dark:border-white/20 hover:bg-black/[.04] dark:hover:bg-white/[.06] focus-visible:ring-foreground";

  return (
    <Link href={href} aria-label={label} className={`${base} ${styles}`}>
      {label}
    </Link>
  );
}

export default function DemoPage() {
  return (
    <div className="min-h-screen grid place-items-center p-6 sm:p-10">
      <main className="w-full max-w-md mx-auto flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Pediatri Demo</h1>
          <p className="mt-2 text-sm text-foreground/70">Hızlı erişim için hesaplayıcılar</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide text-foreground/70">Hesaplayıcılar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ButtonLink href="/calc/maintenance" label="Bakım Sıvısı" />
            <ButtonLink href="/calc/dehydration" label="Dehidratasyon" />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide text-foreground/70">Skorlar</h2>
          <div className="grid grid-cols-1 gap-3">
            <ButtonLink href="/score/pews" label="PEWS" variant="secondary" />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide text-foreground/70">Hazır Senaryolar</h2>
          <div className="grid grid-cols-1 gap-3">
            <ButtonLink href={`/calc/maintenance?kg=${QUICK_KG}`} label={`Hızlı Senaryo: ${QUICK_KG} kg`} variant="secondary" />
            <ButtonLink
              href="/calc/dehydration?kg=14&pct=5&h=24"
              label="14 kg, %5, 24 saat (Dehidratasyon)"
              variant="secondary"
            />
            <ButtonLink
              href="/score/pews?rr=40&ox=2&hr=120&cr=0&beh=voice"
              label="PEWS orta risk"
              variant="secondary"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide text-foreground/70">Kontrol</h2>
          <div className="grid grid-cols-1 gap-3">
            <ButtonLink href="/self-test" label="Kendi Kendine Test" variant="secondary" />
          </div>
        </section>
      </main>
    </div>
  );
}
