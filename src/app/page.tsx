export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-app flex-col justify-center px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight">RateMama</h1>

      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        Real verdicts from real parents on what is actually worth buying.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-worth px-4 py-5 text-worth-fg">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
            Worth It
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">0</p>
        </div>

        <div className="rounded-2xl bg-notworth px-4 py-5 text-notworth-fg">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
            Not Worth It
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">0</p>
        </div>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Setup in progress. Database and auth are being wired up.
      </p>
    </main>
  )
}
