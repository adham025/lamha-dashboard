import { useState, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { OrderDrawer } from '../components/OrderDrawer'
import type { StaffRole } from '../lib/nav'
import { deleteRows } from '../lib/db'
import {
  ALL_STATUSES, STATUS_LABEL, STATUS_TONE, SERVICE_LABEL, customerName, fetchOrdersFull, one, shortId,
  type OrderFull,
} from '../lib/orders'

const EGP = (n: number) => Math.round(n).toLocaleString()
const ago = (iso: string) => {
  const h = (Date.now() - new Date(iso).getTime()) / 36e5
  return h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} d`
}

const chip = (status: string) => (
  <span className={'rounded-full px-2 py-0.5 text-xs font-semibold ' + (STATUS_TONE[status] ?? '')}>
    {STATUS_LABEL[status] ?? status}
  </span>
)

const code = (o: OrderFull) => <span className="font-mono text-xs">{shortId(o.id)}</span>
const customer = (o: OrderFull) => <span className="font-medium">{customerName(o)}</span>
const services = (o: OrderFull) => (
  <span className="text-[var(--color-muted)]">
    {[...new Set(o.print_order_items.map((i) => SERVICE_LABEL[i.service_id ?? ''] ?? 'Photo'))].join(', ')}
    {' · '}{o.print_order_items.length} {o.print_order_items.length === 1 ? 'photo' : 'photos'}
  </span>
)
const waiting = (o: OrderFull) => <span className="text-[var(--color-muted)]">{ago(o.created_at)}</span>

type QueueConfig = {
  title: string
  subtitle: string
  statuses: string[]
  empty: string
  columns: Column<OrderFull>[]
}

const QUEUES: Record<'payments' | 'editing' | 'print', QueueConfig> = {
  payments: {
    title: 'Payments to review',
    subtitle: 'Check each InstaPay screenshot against your transfers, then approve or reject.',
    statuses: ['payment_review'],
    empty: 'No payments waiting for review. 🎉',
    columns: [
      { header: 'Order', render: code },
      { header: 'Customer', render: customer },
      { header: 'Deposit', render: (o) => <span className="font-semibold tabular-nums">{EGP(o.deposit_amount)} EGP</span> },
      { header: 'Reference', render: (o) => <span className="font-mono text-xs">{o.payment_reference ?? '—'}</span> },
      { header: 'Waiting', render: (o) => <span className="text-[var(--color-muted)]">{o.payment_submitted_at ? ago(o.payment_submitted_at) : '—'}</span> },
    ],
  },
  editing: {
    title: 'Editing',
    subtitle: 'Paid orders to take to a studio, edits in progress and customer change requests.',
    statuses: ['deposit_paid', 'editing', 'revision_requested'],
    empty: 'Nothing to edit right now.',
    columns: [
      { header: 'Order', render: code },
      { header: 'Customer', render: customer },
      { header: 'What', render: services },
      { header: 'Status', render: (o) => chip(o.status) },
      { header: 'Studio', render: (o) => <span className="text-[var(--color-muted)]">{one(o.order_internal)?.studio_name ?? '—'}</span> },
      { header: 'Age', render: waiting },
    ],
  },
  print: {
    title: 'Print & delivery',
    subtitle: 'Approved orders to print, and orders out for delivery — record the cash you collect.',
    statuses: ['approved', 'in_production', 'shipped'],
    empty: 'Nothing to print or deliver.',
    columns: [
      { header: 'Order', render: code },
      { header: 'Customer', render: customer },
      { header: 'What', render: services },
      { header: 'Status', render: (o) => chip(o.status) },
      { header: 'Area', render: (o) => <span className="text-[var(--color-muted)]">{one(o.addresses)?.governorate ?? '—'}</span> },
      { header: 'Cash due', render: (o) => <span className="font-semibold tabular-nums">{EGP(o.balance_due)} EGP</span> },
    ],
  },
}

function Queue({ cfg, role, extraFilters, onDelete }: { cfg: QueueConfig; role: StaffRole; extraFilters?: ReactNode; onDelete?: (ids: string[]) => void }) {
  const [open, setOpen] = useState<string | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['orders', cfg.statuses.join(',')],
    queryFn: () => fetchOrdersFull(cfg.statuses),
    refetchInterval: 20_000,
  })
  return (
    <div>
      <PageHeader title={cfg.title} subtitle={cfg.subtitle} />
      <DataTable
        rows={data ?? []}
        getId={(o) => o.id}
        columns={cfg.columns}
        loading={isLoading}
        filters={extraFilters}
        onView={(o) => setOpen(o.id)}
        onDelete={onDelete}
        emptyText={cfg.empty}
      />
      <OrderDrawer orderId={open} role={role} onClose={() => setOpen(null)} />
    </div>
  )
}

export const Payments = ({ role }: { role: StaffRole }) => <Queue cfg={QUEUES.payments} role={role} />
export const Editing = ({ role }: { role: StaffRole }) => <Queue cfg={QUEUES.editing} role={role} />
export const PrintDelivery = ({ role }: { role: StaffRole }) => <Queue cfg={QUEUES.print} role={role} />

/** Every order, any status — the place to look something up. */
export function AllOrders({ role }: { role: StaffRole }) {
  const qc = useQueryClient()
  const [open, setOpen] = useState<string | null>(null)
  const [status, setStatus] = useState('all')
  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => fetchOrdersFull(),
    refetchInterval: 30_000,
  })
  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('print_orders', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
  const rows = (data ?? [])
    .filter((o) => status === 'all' || o.status === status)
    .slice()
    .reverse()

  const columns: Column<OrderFull>[] = [
    { header: 'Order', render: code },
    { header: 'Customer', render: customer },
    { header: 'What', render: services },
    { header: 'Status', render: (o) => chip(o.status) },
    { header: 'Total', render: (o) => <span className="tabular-nums">{EGP(o.product_total)}</span> },
    { header: 'Placed', render: (o) => <span className="text-[var(--color-muted)]">{new Date(o.created_at).toLocaleDateString('en-GB')}</span> },
  ]

  return (
    <div>
      <PageHeader title="All orders" subtitle="Every order in any status." />
      <DataTable
        rows={rows}
        getId={(o) => o.id}
        columns={columns}
        loading={isLoading}
        filters={
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-sm"
          >
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        }
        onView={(o) => setOpen(o.id)}
        onDelete={role === 'super_admin' ? (ids) => del.mutate(ids) : undefined}
        emptyText="No orders."
      />
      <OrderDrawer orderId={open} role={role} onClose={() => setOpen(null)} />
    </div>
  )
}
