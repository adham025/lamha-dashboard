import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { FormDrawer, type Field, type FormValues } from '../components/FormDrawer'
import { fetchOrders, deleteRows, updateRow, type PrintOrder } from '../lib/db'

const EGP = (n: number) => Math.round(n).toLocaleString()
const statusColor: Record<string, string> = {
  pending_payment: 'text-amber-600',
  deposit_paid: 'text-sky-600',
  in_production: 'text-[var(--color-secondary)]',
  shipped: 'text-indigo-600',
  delivered: 'text-[var(--color-success)]',
  refused: 'text-[var(--color-danger)]',
  cancelled: 'text-[var(--color-muted)]',
}

const FIELDS: Field[] = [
  {
    name: 'status', label: 'Status', type: 'select', required: true, colSpan: 2,
    options: ['pending_payment', 'deposit_paid', 'in_production', 'shipped', 'delivered', 'refused', 'cancelled']
      .map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
  },
  {
    name: 'delivery_type', label: 'Delivery', type: 'select', required: true,
    options: [{ value: 'standard', label: 'Standard' }, { value: 'express', label: 'Express' }],
  },
  { name: 'courier_tracking', label: 'Courier tracking', placeholder: 'e.g. BOSTA-123456' },
  { name: 'cod_collected', label: 'COD collected (EGP)', type: 'number', colSpan: 2 },
]

export default function Orders() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders })
  const [express, setExpress] = useState<'all' | 'standard' | 'express'>('all')
  const [editing, setEditing] = useState<PrintOrder | null>(null)

  const rows = (data ?? []).filter((o) => express === 'all' || o.delivery_type === express)

  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('print_orders', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
  const save = useMutation({
    mutationFn: (v: FormValues) =>
      updateRow('print_orders', editing!.id, {
        status: v.status,
        delivery_type: v.delivery_type,
        courier_tracking: v.courier_tracking || null,
        cod_collected: v.cod_collected === '' ? null : Number(v.cod_collected),
      }),
    onSuccess: () => { setEditing(null); qc.invalidateQueries({ queryKey: ['orders'] }) },
  })

  const columns: Column<PrintOrder>[] = [
    { header: 'Customer', render: (o) => <span className="font-medium">{o.profiles?.display_name ?? 'Guest'}</span> },
    { header: 'Order', render: (o) => <span className="font-mono text-xs text-[var(--color-muted)]">{o.id.slice(0, 8)}</span> },
    { header: 'Status', render: (o) => <span className={'font-semibold capitalize ' + (statusColor[o.status] ?? '')}>{o.status.replace(/_/g, ' ')}</span> },
    { header: 'Delivery', render: (o) => <span className="capitalize text-[var(--color-muted)]">{o.delivery_type} · {EGP(o.delivery_fee)}</span> },
    { header: 'Product', render: (o) => <span className="tabular-nums">{EGP(o.product_total)}</span> },
    { header: 'Deposit', render: (o) => <span className="tabular-nums">{EGP(o.deposit_amount)}</span> },
    { header: 'COD', render: (o) => <span className="tabular-nums text-[var(--color-muted)]">{o.cod_collected != null ? EGP(o.cod_collected) : '—'}</span> },
    { header: 'Tracking', render: (o) => <span className="font-mono text-xs text-[var(--color-muted)]">{o.courier_tracking ?? '—'}</span> },
  ]

  const filters = (['all', 'standard', 'express'] as const).map((f) => (
    <button
      key={f}
      onClick={() => setExpress(f)}
      className={
        'rounded-lg px-3.5 py-1.5 text-sm font-medium capitalize ' +
        (express === f
          ? 'bg-[var(--color-ink)] text-white'
          : 'bg-[var(--color-panel)] text-[var(--color-muted)] border border-[var(--color-border)]')
      }
    >
      {f}
    </button>
  ))

  return (
    <div>
      <PageHeader title="Orders" subtitle="Print queue — deposit, production, delivery and COD." />
      <DataTable
        rows={rows}
        getId={(o) => o.id}
        columns={columns}
        loading={isLoading}
        filters={filters}
        onEdit={setEditing}
        onDelete={(ids) => del.mutate(ids)}
        emptyText="No orders."
      />
      <FormDrawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit order"
        fields={FIELDS}
        initial={editing ? {
          status: editing.status,
          delivery_type: editing.delivery_type,
          courier_tracking: editing.courier_tracking ?? '',
          cod_collected: editing.cod_collected != null ? String(editing.cod_collected) : '',
        } : undefined}
        busy={save.isPending}
        onSubmit={(v) => save.mutate(v)}
      />
    </div>
  )
}
