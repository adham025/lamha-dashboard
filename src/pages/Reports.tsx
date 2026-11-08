import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { PageHeader, Panel, StatCard } from '../components/ui'
import { supabase } from '../lib/supabase'
import {
  ALL_STATUSES, STATUS_LABEL, SERVICE_LABEL, fetchOrdersFull, one, type OrderFull,
} from '../lib/orders'

const EGP = (n: number) => `${Math.round(n).toLocaleString()} EGP`
const dayKey = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

/** Money the business has actually received for an order: the confirmed
 * deposit plus any cash collected on delivery. */
const DEPOSIT_RECEIVED = new Set(['deposit_paid', 'editing', 'preview_ready', 'revision_requested', 'approved', 'in_production', 'shipped', 'delivered'])
const received = (o: OrderFull) =>
  (DEPOSIT_RECEIVED.has(o.status) ? Number(o.deposit_amount) : 0) + Number(o.cod_collected ?? 0)

async function fetchMilestones() {
  const { data, error } = await supabase
    .from('order_events')
    .select('order_id, kind, created_at')
    .in('kind', ['status_preview_ready', 'status_delivered'])
  if (error) throw error
  return (data ?? []) as { order_id: string; kind: string; created_at: string }[]
}

function avgHours(orders: OrderFull[], events: { order_id: string; kind: string; created_at: string }[], kind: string) {
  const created = new Map(orders.map((o) => [o.id, new Date(o.created_at).getTime()]))
  const first = new Map<string, number>()
  for (const e of events) {
    if (e.kind !== kind) continue
    const t = new Date(e.created_at).getTime()
    if (!first.has(e.order_id) || t < first.get(e.order_id)!) first.set(e.order_id, t)
  }
  const spans = [...first].map(([id, t]) => (t - (created.get(id) ?? t)) / 36e5).filter((h) => h >= 0)
  return spans.length ? spans.reduce((a, b) => a + b, 0) / spans.length : null
}
const fmtHours = (h: number | null) => (h == null ? '—' : h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} days`)

export default function Reports() {
  const orders = useQuery({ queryKey: ['orders', 'all'], queryFn: () => fetchOrdersFull() })
  const events = useQuery({ queryKey: ['milestones'], queryFn: fetchMilestones })
  const all = orders.data ?? []
  const live = all.filter((o) => !['cancelled', 'pending_payment', 'payment_rejected'].includes(o.status))
  const delivered = all.filter((o) => o.status === 'delivered')

  const collected = all.reduce((s, o) => s + received(o), 0)
  const outstanding = all
    .filter((o) => ['approved', 'in_production', 'shipped'].includes(o.status))
    .reduce((s, o) => s + Number(o.balance_due), 0)
  const studioCost = delivered.reduce((s, o) => s + Number(one(o.order_internal)?.studio_cost ?? 0), 0)
  const deliveredRevenue = delivered.reduce((s, o) => s + received(o), 0)
  const revisions = live.reduce((s, o) => s + o.revision_count, 0)

  const byStatus = ALL_STATUSES.map((s) => ({ s: STATUS_LABEL[s], n: all.filter((o) => o.status === s).length })).filter((x) => x.n > 0)

  const bySvc = new Map<string, { photos: number; revenue: number }>()
  for (const o of live) {
    for (const it of o.print_order_items) {
      const k = it.service_id ?? 'other'
      const cur = bySvc.get(k) ?? { photos: 0, revenue: 0 }
      cur.photos += it.quantity
      cur.revenue += Number(it.unit_price) * it.quantity
      bySvc.set(k, cur)
    }
  }

  const days: string[] = []
  for (let i = 13; i >= 0; i--) days.push(dayKey(new Date(Date.now() - i * 86400_000).toISOString()))
  const series = days.map((d) => ({
    d,
    orders: all.filter((o) => dayKey(o.created_at) === d).length,
    revenue: all.filter((o) => dayKey(o.created_at) === d).reduce((s, o) => s + received(o), 0),
  }))

  const loading = orders.isLoading

  return (
    <div>
      <PageHeader title="Reports" subtitle="Money in, what’s still to collect, and how fast orders move. Printing costs aren’t tracked here." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Orders (paid)" value={loading ? '—' : String(live.length)} hint={`${all.length} placed in total`} />
        <StatCard label="Money received" value={loading ? '—' : EGP(collected)} hint="deposits + cash collected" />
        <StatCard label="Cash still to collect" value={loading ? '—' : EGP(outstanding)} hint="approved → out for delivery" />
        <StatCard label="Revision requests" value={loading ? '—' : String(revisions)} hint="across paid orders" />
        <StatCard label="Studio costs" value={loading ? '—' : EGP(studioCost)} hint="delivered orders" />
        <StatCard label="Margin before printing" value={loading ? '—' : EGP(deliveredRevenue - studioCost)} hint="delivered revenue − studio cost" />
        <StatCard label="Order → first preview" value={fmtHours(events.data && orders.data ? avgHours(all, events.data, 'status_preview_ready') : null)} hint="average" />
        <StatCard label="Order → delivered" value={fmtHours(events.data && orders.data ? avgHours(all, events.data, 'status_delivered') : null)} hint="average" />
      </div>

      <Panel className="mt-6 p-5">
        <div className="mb-4 text-sm font-bold">Orders & money received — last 14 days (by order date)</div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ left: -12, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece1ea" vertical={false} />
              <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="orders" fill="#6d28d9" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#d6134f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-[var(--color-muted)]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" /> Orders</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" /> Money received (EGP)</span>
        </div>
      </Panel>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Panel className="p-5">
          <div className="mb-3 text-sm font-bold">Orders by status</div>
          <table className="w-full text-sm">
            <tbody>
              {byStatus.map((x) => (
                <tr key={x.s} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2">{x.s}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{x.n}</td>
                </tr>
              ))}
              {byStatus.length === 0 && <tr><td className="py-2 text-[var(--color-muted)]">No orders yet.</td></tr>}
            </tbody>
          </table>
        </Panel>
        <Panel className="p-5">
          <div className="mb-3 text-sm font-bold">Photos by service (paid orders)</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-muted)]">
                <th className="pb-2 font-medium">Service</th>
                <th className="pb-2 text-right font-medium">Prints</th>
                <th className="pb-2 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {[...bySvc].sort((a, b) => b[1].photos - a[1].photos).map(([k, v]) => (
                <tr key={k} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2">{SERVICE_LABEL[k] ?? k}</td>
                  <td className="py-2 text-right tabular-nums">{v.photos}</td>
                  <td className="py-2 text-right tabular-nums">{EGP(v.revenue)}</td>
                </tr>
              ))}
              {bySvc.size === 0 && <tr><td className="py-2 text-[var(--color-muted)]" colSpan={3}>No paid orders yet.</td></tr>}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  )
}
