import type { ReactNode } from 'react'

/** Inner-page hero band (Laundrify / Zad style). */
export default function PageHero({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  children?: ReactNode
}) {
  return (
    <section className="mx-5 mt-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-12 text-center md:mx-auto md:mt-12 md:max-w-5xl md:px-12">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-extrabold text-[var(--color-ink)]">{title}</h1>
      {subtitle ? <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-muted)]">{subtitle}</p> : null}
      {children}
    </section>
  )
}