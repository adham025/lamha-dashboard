import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader, Panel } from '../components/ui'
import { fetchOrders } from '../lib/db'

const statusColor: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-700',
  deposit_paid: 'bg-sky-100 text-sky-700',
  in_production: 'bg-violet-100 text-[var(--color-secondary)]',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-[var(--color-success)]',
  refused: 'bg-rose-100 text-[var(--color-danger)]',
  cancelled: 'bg-[var(--color-bg)] text-[var(--color-muted)]',
}
const EGP = (n: number) => Math.round(n).toLocaleString()

export default function Orders() {
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders })
  const [express, setExpress] = useState<'all' | 'standard' | 'express'>('all')
  const rows = (data ?? []).filter((o) => express === 'all' || o.delivery_type === express)

  return (
    <div>
      <PageHeader title="Orders" subtitle="Print queue — deposit → production → COD (§4.8, §6, §8)." />

      <div className="mb-4 flex gap-2">
        {(['all', 'standard', 'express'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setExpress(f)}
            className={
              'rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ' +
              (express === f
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-panel)] text-[var(--color-muted)] border border-[var(--color-border)]')
            }
          >
            {f}
          </button>
        ))}
      </div>

      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Delivery</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Deposit</th>
                <th className="px-4 py-3 font-semibold">COD</th>
                <th className="px-4 py-3 font-semibold">Tracking</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>
              )}
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className={'rounded-full px-2 py-0.5 text-xs font-semibold ' + (statusColor[o.status] ?? '')}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-[var(--color-muted)]">
                    {o.delivery_type} · {EGP(o.delivery_fee)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{EGP(o.product_total)}</td>
                  <td className="px-4 py-3 tabular-nums">{EGP(o.deposit_amount)}</td>
                  <td className="px-4 py-3 tabular-nums text-[var(--color-muted)]">
                    {o.cod_collected != null ? EGP(o.cod_collected) : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">
                    {o.courier_tracking ?? '—'}
                  </td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-[var(--color-muted)]">No orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
