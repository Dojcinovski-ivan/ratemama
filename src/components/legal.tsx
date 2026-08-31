export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <div className="mt-2 space-y-3 text-base leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-base leading-relaxed text-neutral-700">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-worth" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  )
}
