import Link from "next/link";

function Button({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg px-6 py-3 bg-foreground text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen grid place-items-center p-8 sm:p-12">
      <main className="w-full max-w-md mx-auto space-y-8 text-center">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Pediatri Hesaplayıcı</h1>
          <p className="text-sm text-foreground/70">Hızlı ve sade klinik hesaplayıcılar</p>
        </header>

        <div className="grid grid-cols-1 gap-3">
          <Button href="/calc/maintenance">Bakım Sıvısı</Button>
          <Button href="/calc/dehydration">Dehidratasyon</Button>
          <Button href="/score/pews">PEWS</Button>
        </div>

        <footer className="pt-2">
          <p className="text-xs text-foreground/60">Uyarı: Bu araç klinik karar desteği değildir.</p>
        </footer>
      </main>
    </div>
  );
}
