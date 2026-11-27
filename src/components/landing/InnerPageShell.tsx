import type { ReactNode } from 'react'

/** Zad-style inner page: full-width soft header + readable content column. */
export default function InnerPageShell({
  title,
  meta,
  children,
  footer,
}: {
  title: string
  meta?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <main className="min-h-[60vh] w-full pb-12 md:pb-16">
      <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-accent-soft)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-10">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl lg:text-4xl">{title}</h1>
          {meta ? <div className="mt-2 text-sm text-[var(--color-muted)]">{meta}</div> : null}
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">{children}</div>
      {footer ? <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{footer}</div> : null}
    </main>
  )
}