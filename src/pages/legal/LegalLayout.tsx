import type { ReactNode } from 'react'

/** Public, unauthenticated page shell for legal docs (privacy/terms/refund) —
 * opened straight from the mobile app's Profile screen, so no dashboard chrome,
 * no auth check, just a clean readable page matching the brand. */
export function LegalLayout({
  title,
  effectiveDate,
  children,
}: {
  title: string
  effectiveDate?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="mx-auto flex max-w-2xl items-center gap-2.5 px-5 py-4">
          <span className="text-lg font-extrabold tracking-tight text-[var(--color-accent)]">لمحة</span>
          <span className="text-lg font-extrabold tracking-tight text-[var(--color-ink)]">Lamha</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">{title}</h1>
        {effectiveDate && (
          <p className="mt-1.5 text-sm text-[var(--color-muted)]">Effective date: {effectiveDate}</p>
        )}
        <div className="legal-content mt-8 text-[15px] leading-relaxed text-[var(--color-ink)]">
          {children}
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] px-5 py-6 text-center text-xs text-[var(--color-muted)]">
        © {new Date().getFullYear()} Lamha. Questions? WhatsApp{' '}
        <a href="https://wa.me/201060270197" className="text-[var(--color-accent)] hover:underline">
          +20 106 027 0197
        </a>
        .
      </footer>
    </div>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-8 mb-2.5 text-lg font-bold text-[var(--color-ink)] first:mt-0">{children}</h2>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-3.5 text-[var(--color-ink)]/90">{children}</p>
}

export function Ul({ children }: { children: ReactNode }) {
  return <ul className="mb-3.5 list-disc space-y-1.5 pl-5">{children}</ul>
}

export function Muted({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
      {children}
    </div>
  )
}
