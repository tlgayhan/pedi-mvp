export default function StatusPage() {
  const version = process.env.NEXT_PUBLIC_VERSION || "0.1.0";
  const commit = (process.env.NEXT_PUBLIC_GIT_SHA || "local").slice(0, 7);
  const builtAt = process.env.NEXT_PUBLIC_BUILT_AT || "";
  return (
    <div className="min-h-screen grid place-items-center p-6 sm:p-10">
      <main className="w-full max-w-xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Durum</h1>
          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
            Çalışıyor
          </span>
        </header>

        <div className="text-sm text-foreground/70 space-y-1">
          <p>Sürüm: {version}</p>
          <p>Commit: {commit}</p>
          {builtAt ? <p>Built At: {builtAt}</p> : null}
        </div>

        <ul className="list-disc list-inside text-sm leading-6">
          <li>Bakım Sıvısı (4-2-1): aktif</li>
          <li>Dehidratasyon: aktif</li>
          <li>PEWS: aktif</li>
        </ul>
      </main>
    </div>
  );
}
