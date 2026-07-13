import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, TableShell, Checkbox, BulkBar, RowDelete, thClass } from '../components/ui'
import { fetchOrders, deleteRows, updateRow } from '../lib/db'
import { useSelection } from '../lib/useSelection'

const STATUSES = [
  'pending_payment', 'deposit_paid', 'in_production',
  'shipped', 'delivered', 'refused', 'cancelled',
] as const
const EGP = (n: number) => Math.round(n).toLocaleString()

export default function Orders() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders })
  const [express, setExpress] = useState<'all' | 'standard' | 'express'>('all')
  const sel = useSelection<string>()

  const rows = (data ?? []).filter((o) => express === 'all' || o.delivery_type === express)

  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('print_orders', ids),
    onSuccess: () => { sel.clear(); qc.invalidateQueries({ queryKey: ['orders'] }) },
  })
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateRow('print_orders', id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })

  const removeSelected = () => {
    if (confirm(`Delete ${sel.count} order(s)?`)) del.mutate([...sel.selected])
  }
  const allChecked = rows.length > 0 && sel.count === rows.length

  return (
    <div>
      <PageHeader title="Orders" subtitle="Print queue — deposit, production, delivery and COD." />

      <div className="mb-4 flex gap-2">
        {(['all', 'standard', 'express'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setExpress(f); sel.clear() }}
            className={
              'rounded-lg px-3.5 py-1.5 text-sm font-medium capitalize ' +
              (express === f
                ? 'bg-[var(--color-ink)] text-white'
                : 'bg-[var(--color-panel)] text-[var(--color-muted)] border border-[var(--color-border)]')
            }
          >
            {f}
          </button>
        ))}
      </div>

      <BulkBar count={sel.count} busy={del.isPending} onClear={sel.clear} onDelete={removeSelected} />

      <TableShell>
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className={thClass + ' w-10'}>
              <Checkbox
                checked={allChecked}
                indeterminate={sel.count > 0}
                onChange={() => sel.toggleAll(rows.map((r) => r.id))}
              />
            </th>
            <th className={thClass}>Order</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Delivery</th>
            <th className={thClass}>Product</th>
            <th className={thClass}>Deposit</th>
            <th className={thClass}>COD</th>
            <th className={thClass}>Tracking</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan={9} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>
          )}
          {rows.map((o) => (
            <tr key={o.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]">
              <td className="px-4 py-3">
                <Checkbox checked={sel.selected.has(o.id)} onChange={() => sel.toggle(o.id)} />
              </td>
              <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
              <td className="px-4 py-3">
                <select
                  value={o.status}
                  onChange={(e) => setStatus.mutate({ id: o.id, status: e.target.value })}
                  className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </td>
              <td className="px-4 py-3 capitalize text-[var(--color-muted)]">{o.delivery_type} · {EGP(o.delivery_fee)}</td>
              <td className="px-4 py-3 tabular-nums">{EGP(o.product_total)}</td>
              <td className="px-4 py-3 tabular-nums">{EGP(o.deposit_amount)}</td>
              <td className="px-4 py-3 tabular-nums text-[var(--color-muted)]">{o.cod_collected != null ? EGP(o.cod_collected) : '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">{o.courier_tracking ?? '—'}</td>
              <td className="px-4 py-3 text-right">
                <RowDelete onClick={() => { if (confirm('Delete this order?')) del.mutate([o.id]) }} />
              </td>
            </tr>
          ))}
          {!isLoading && rows.length === 0 && (
            <tr><td colSpan={9} className="px-4 py-6 text-center text-[var(--color-muted)]">No orders.</td></tr>
          )}
        </tbody>
      </TableShell>
    </div>
  )
}
