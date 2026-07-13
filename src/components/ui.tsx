import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { Trash2, X } from 'lucide-react'

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>}
    </div>
  )
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]',
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
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <Panel className="p-5">
      <div className="text-[13px] font-medium text-[var(--color-muted)]">{label}</div>
      <div className="mt-1.5 text-[26px] font-semibold tabular-nums text-[var(--color-ink)]">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-[var(--color-muted)]">{hint}</div>}
    </Panel>
  )
}

/** A framed, scrollable table shell used by every data page. */
export function TableShell({ children }: { children: ReactNode }) {
  return (
    <Panel>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </Panel>
  )
}

export function Checkbox({
  checked,
  onChange,
  indeterminate,
}: {
  checked: boolean
  onChange: () => void
  indeterminate?: boolean
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = !!indeterminate && !checked
      }}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className="h-4 w-4 cursor-pointer rounded border-[var(--color-border)] accent-[var(--color-accent)]"
    />
  )
}

/** Sticky action bar shown when rows are selected. */
export function BulkBar({
  count,
  onDelete,
  onClear,
  busy,
}: {
  count: number
  onDelete: () => void
  onClear: () => void
  busy?: boolean
}) {
  if (count === 0) return null
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2.5">
      <span className="text-sm font-medium">{count} selected</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
        >
          <X size={15} /> Clear
        </button>
        <button
          onClick={onDelete}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-danger)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          <Trash2 size={15} /> {busy ? 'Deleting…' : 'Delete selected'}
        </button>
      </div>
    </div>
  )
}

/** Small ghost delete button for a single row. */
export function RowDelete({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Delete"
      className="rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-danger)]"
    >
      <Trash2 size={16} />
    </button>
  )
}

export const thClass =
  'px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]'
