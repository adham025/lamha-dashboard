import type { ReactNode } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Panel, Checkbox, BulkBar, RowDelete, thClass } from './ui'
import { useSelection } from '../lib/useSelection'

export type Column<T> = {
  header: string
  render: (row: T) => ReactNode
  className?: string
}

export function DataTable<T>({
  rows,
  getId,
  columns,
  loading,
  filters,
  addLabel,
  onAdd,
  onEdit,
  onDelete,
  emptyText = 'Nothing here yet.',
}: {
  rows: T[]
  getId: (row: T) => string
  columns: Column<T>[]
  loading?: boolean
  filters?: ReactNode
  addLabel?: string
  onAdd?: () => void
  onEdit?: (row: T) => void
  onDelete?: (ids: string[]) => void
  emptyText?: string
}) {
  const sel = useSelection<string>()
  const selectable = !!onDelete
  const hasActions = !!onEdit || !!onDelete
  const allChecked = rows.length > 0 && sel.count === rows.length
  const span = columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)

  const removeSelected = () => {
    if (onDelete && confirm(`Delete ${sel.count} item(s)?`)) {
      onDelete([...sel.selected])
      sel.clear()
    }
  }

  return (
    <div>
      {(filters || onAdd) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">{filters}</div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <Plus size={16} /> {addLabel ?? 'Add'}
            </button>
          )}
        </div>
      )}

      {selectable && (
        <BulkBar count={sel.count} onClear={sel.clear} onDelete={removeSelected} />
      )}

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {selectable && (
                  <th className={thClass + ' w-10'}>
                    <Checkbox
                      checked={allChecked}
                      indeterminate={sel.count > 0}
                      onChange={() => sel.toggleAll(rows.map(getId))}
                    />
                  </th>
                )}
                {columns.map((c, i) => (
                  <th key={i} className={thClass + ' ' + (c.className ?? '')}>
                    {c.header}
                  </th>
                ))}
                {hasActions && <th className={thClass + ' text-right'}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={span} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>
              )}
              {!loading && rows.map((row) => {
                const id = getId(row)
                return (
                  <tr key={id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]">
                    {selectable && (
                      <td className="px-4 py-3">
                        <Checkbox checked={sel.selected.has(id)} onChange={() => sel.toggle(id)} />
                      </td>
                    )}
                    {columns.map((c, i) => (
                      <td key={i} className={'px-4 py-3 ' + (c.className ?? '')}>{c.render(row)}</td>
                    ))}
                    {hasActions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              title="Edit"
                              className="rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <RowDelete onClick={() => { if (confirm('Delete this item?')) onDelete([id]) }} />
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={span} className="px-4 py-6 text-center text-[var(--color-muted)]">{emptyText}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
