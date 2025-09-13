export default function AboutPage() {
  const version = process.env.NEXT_PUBLIC_VERSION || "0.1.0";
  const commit = (process.env.NEXT_PUBLIC_GIT_SHA || "local").slice(0, 7);

  return (
    <div className="min-h-screen grid place-items-center p-6 sm:p-10">
      <main className="w-full max-w-xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Hakkında</h1>
          <p className="text-sm text-foreground/70">Pediatri Web MVP</p>
        </header>

        <section className="rounded-lg border border-black/10 dark:border-white/10 p-4 sm:p-5 space-y-3">
          <h2 className="text-base font-semibold">Uyarı ve Sorumluluk Reddi</h2>
          <ul className="list-disc list-inside text-sm leading-6 text-foreground/90">
            <li>Bu araç klinik karar desteği değildir.</li>
            <li>Kullanıcı girdileri doğrulanmalıdır; sonuçlar klinik muhakemenin yerini tutmaz.</li>
          </ul>
        </section>

        <section className="rounded-lg border border-black/10 dark:border-white/10 p-4 sm:p-5 space-y-2">
          <h2 className="text-base font-semibold">Doğrulama ve Gözden Geçirme</h2>
          <p className="text-sm text-foreground/70">(Yer tutucu) — doğrulama notları ve gözden geçirenler burada listelenecek.</p>
        </section>

        <section className="rounded-lg border border-black/10 dark:border-white/10 p-4 sm:p-5 space-y-2">
          <h2 className="text-base font-semibold">PEWS Notu</h2>
          <p className="text-sm text-foreground/80">
            PEWS skorlama aralıkları MVP için basitleştirilmiştir. Klinik kullanım öncesi doğrulama gerektirir.
          </p>
          <p className="text-xs text-foreground/60">Kaynaklar: (yer tutucu)</p>
        </section>

        <p className="text-xs text-foreground/60 text-center">Sürüm {version} — {commit}</p>
      </main>
    </div>
  );
}
