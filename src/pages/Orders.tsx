import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { PageHeader } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { FormDrawer, type Field, type FormValues } from '../components/FormDrawer'
import { ImageViewer } from '../components/ImageViewer'
import {
  fetchOrders, fetchProfiles, fetchOrderImages, deleteRows, updateRow, insertRow,
  syncKashierStatus, type PrintOrder,
} from '../lib/db'

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
const paymentColor: Record<string, string> = {
  captured: 'bg-emerald-100 text-[var(--color-success)]',
  paid: 'bg-emerald-100 text-[var(--color-success)]',
  pending: 'bg-amber-100 text-amber-700',
  created: 'bg-amber-100 text-amber-700',
  failed: 'bg-rose-100 text-[var(--color-danger)]',
  declined: 'bg-rose-100 text-[var(--color-danger)]',
}
const STATUS_OPTS = ['pending_payment', 'deposit_paid', 'in_production', 'shipped', 'delivered', 'refused', 'cancelled']
  .map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))
const DELIVERY_OPTS = [{ value: 'standard', label: 'Standard' }, { value: 'express', label: 'Express' }]

export default function Orders() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders })
  const { data: profiles } = useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles })
  const [express, setExpress] = useState<'all' | 'standard' | 'express'>('all')
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<PrintOrder | null>(null)
  const [viewOrder, setViewOrder] = useState<PrintOrder | null>(null)
  const close = () => { setMode(null); setEditing(null) }

  const orderImages = useQuery({
    queryKey: ['orderImages', viewOrder?.id],
    queryFn: () => fetchOrderImages(viewOrder!.id),
    enabled: !!viewOrder,
  })

  const rows = (data ?? []).filter((o) => express === 'all' || o.delivery_type === express)
  const customerOpts = (profiles ?? []).map((p) => ({ value: p.id, label: p.display_name || 'Guest' }))

  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('print_orders', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
  const sync = useMutation({
    mutationFn: (orderId: string) => syncKashierStatus(orderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
  const save = useMutation({
    mutationFn: (v: FormValues) => {
      if (mode === 'add') {
        const total = Number(v.product_total) || 0
        const deposit = Math.round(total / 2)
        return insertRow('print_orders', {
          profile_id: v.customer,
          product_total: total,
          deposit_amount: deposit,
          balance_due: total - deposit,
          delivery_type: v.delivery_type,
          delivery_fee: Number(v.delivery_fee) || 0,
          status: v.status,
          kashier_status: v.status === 'pending_payment' ? 'pending' : 'paid',
        })
      }
      return updateRow('print_orders', editing!.id, {
        status: v.status,
        delivery_type: v.delivery_type,
        courier_tracking: v.courier_tracking || null,
        cod_collected: v.cod_collected === '' ? null : Number(v.cod_collected),
      })
    },
    onSuccess: () => { close(); qc.invalidateQueries({ queryKey: ['orders'] }) },
  })

  const columns: Column<PrintOrder>[] = [
    { header: 'Customer', render: (o) => <span className="font-medium">{o.profiles?.display_name ?? 'Guest'}</span> },
    { header: 'Order', render: (o) => <span className="font-mono text-xs text-[var(--color-muted)]">{o.id.slice(0, 8)}</span> },
    { header: 'Status', render: (o) => <span className={'font-semibold capitalize ' + (statusColor[o.status] ?? '')}>{o.status.replace(/_/g, ' ')}</span> },
    {
      header: 'Payment',
      render: (o) => {
        const syncing = sync.isPending && sync.variables === o.id
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={
                'rounded-full px-2 py-0.5 text-xs font-semibold capitalize ' +
                (paymentColor[o.kashier_status ?? ''] ?? 'bg-[var(--color-bg)] text-[var(--color-muted)]')
              }
            >
              {o.kashier_status ?? 'unknown'}
            </span>
            <button
              onClick={() => sync.mutate(o.id)}
              disabled={syncing}
              title="Re-check payment with Kashier"
              className="rounded-md p-1 text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)] disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            </button>
          </div>
        )
      },
    },
    { header: 'Delivery', render: (o) => <span className="capitalize text-[var(--color-muted)]">{o.delivery_type} · {EGP(o.delivery_fee)}</span> },
    {
      header: 'Discount',
      render: (o) => o.discount_code
        ? <span className="font-mono text-xs text-[var(--color-success)]">{o.discount_code} (-{EGP(o.discount_amount)})</span>
        : <span className="text-[var(--color-muted)]">—</span>,
    },
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

  const ADD_FIELDS: Field[] = [
    { name: 'customer', label: 'Customer', type: 'select', required: true, colSpan: 2, options: customerOpts },
    { name: 'product_total', label: 'Product total (EGP)', type: 'number', required: true },
    { name: 'delivery_type', label: 'Delivery', type: 'select', required: true, options: DELIVERY_OPTS },
    { name: 'delivery_fee', label: 'Delivery fee (EGP)', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTS },
  ]
  const EDIT_FIELDS: Field[] = [
    { name: 'status', label: 'Status', type: 'select', required: true, colSpan: 2, options: STATUS_OPTS },
    { name: 'delivery_type', label: 'Delivery', type: 'select', required: true, options: DELIVERY_OPTS },
    { name: 'courier_tracking', label: 'Courier tracking', placeholder: 'e.g. BOSTA-123456' },
    { name: 'cod_collected', label: 'COD collected (EGP)', type: 'number', colSpan: 2 },
  ]

  return (
    <div>
      <PageHeader title="Orders" subtitle="Print queue — deposit, production, delivery and COD." />
      <DataTable
        rows={rows}
        getId={(o) => o.id}
        columns={columns}
        loading={isLoading}
        filters={filters}
        addLabel="New order"
        onAdd={() => setMode('add')}
        onView={setViewOrder}
        onEdit={(o) => { setEditing(o); setMode('edit') }}
        onDelete={(ids) => del.mutate(ids)}
        emptyText="No orders."
      />
      <ImageViewer
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={`Order ${viewOrder?.id.slice(0, 8) ?? ''} — ${viewOrder?.profiles?.display_name ?? 'Guest'}`}
        baseName={`order-${viewOrder?.id.slice(0, 8) ?? ''}`}
        images={orderImages.data ?? []}
        loading={orderImages.isLoading}
      />
      <FormDrawer
        open={mode !== null}
        onClose={close}
        title={mode === 'add' ? 'New order' : 'Edit order'}
        fields={mode === 'add' ? ADD_FIELDS : EDIT_FIELDS}
        initial={mode === 'edit' && editing ? {
          status: editing.status,
          delivery_type: editing.delivery_type,
          courier_tracking: editing.courier_tracking ?? '',
          cod_collected: editing.cod_collected != null ? String(editing.cod_collected) : '',
        } : undefined}
        submitLabel={mode === 'add' ? 'Create' : 'Save'}
        busy={save.isPending}
        onSubmit={(v) => save.mutate(v)}
      />
    </div>
  )
}
