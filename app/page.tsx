import HomeButtons from "@/app/_components/HomeButtons";

export default function Home() {
  return (
    <div className="min-h-screen grid place-items-center p-8 sm:p-12">
      <main className="w-full max-w-md mx-auto space-y-8 text-center">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Pediatri Hesaplayıcı</h1>
          <p className="text-sm text-foreground/70">Hızlı ve sade klinik hesaplayıcılar</p>
        </header>

        <HomeButtons />

        <footer className="pt-2">
          <p className="text-xs text-foreground/60">Uyarı: Bu araç klinik karar desteği değildir.</p>
        </footer>
      </main>
    </div>
  );
}
