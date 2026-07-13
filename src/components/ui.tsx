import type { ReactNode } from 'react'
import { clsx } from 'clsx'

export function PageHeader({
  title,
  subtitle,
  isNew,
}: {
  title: string
  subtitle?: string
  isNew?: boolean
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {isNew && (
          <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-accent)]">
            new
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>}
    </div>
  )
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: boolean
}) {
  return (
    <Panel>
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </div>
      <div
        className={clsx(
          'mt-2 text-3xl font-extrabold tabular-nums',
          accent && 'text-[var(--color-accent)]',
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-[var(--color-muted)]">{hint}</div>}
    </Panel>
  )
}

/** A titled placeholder for §8 sections whose full build comes next. */
export function Placeholder({
  title,
  subtitle,
  isNew,
  points,
  source,
}: {
  title: string
  subtitle: string
  isNew?: boolean
  points: string[]
  source: string
}) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} isNew={isNew} />
      <Panel>
        <div className="text-sm font-semibold text-[var(--color-ink)]">
          Planned for this section ({source})
        </div>
        <ul className="mt-3 space-y-2">
          {points.map((p) => (
            <li key={p} className="flex gap-2 text-sm text-[var(--color-muted)]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Data wiring lands once staff-role RLS policies (or an admin Edge Function) are added —
          this shell is already connected to Supabase and Vercel-ready.
        </p>
      </Panel>
    </div>
  )
}
