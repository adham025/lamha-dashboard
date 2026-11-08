import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PageHeader, Panel, StatCard } from '../components/ui'
import { fetchOrdersFull } from '../lib/orders'
import { canAccess, nav, type StaffRole } from '../lib/nav'

const EGP = (n: number) => `EGP ${Math.round(n).toLocaleString()}`

/** What needs doing right now, as a to-do list of the queues. */
export default function Overview({ role }: { role: StaffRole }) {
  const orders = useQuery({ queryKey: ['orders', 'all'], queryFn: () => fetchOrdersFull(), refetchInterval: 30_000 })
  const all = orders.data ?? []
  const count = (...statuses: string[]) => all.filter((o) => statuses.includes(o.status)).length
  const loading = orders.isLoading

  const todos = [
    { to: '/payments', label: 'Payments to review', n: count('payment_review'), hint: 'screenshots waiting for a yes / no' },
    { to: '/editing', label: 'To take to the studio', n: count('deposit_paid'), hint: 'paid, not yet sent' },
    { to: '/editing', label: 'Change requests', n: count('revision_requested'), hint: 'customers asked for edits' },
    { to: '/print', label: 'Ready to print', n: count('approved'), hint: 'approved by the customer' },
    { to: '/print', label: 'Out for delivery', n: count('in_production', 'shipped'), hint: 'printing or on the road' },
  ].filter((t) => {
    const item = nav.find((n) => n.to === t.to)
    return item ? canAccess(item, role) : true
  })

  const inEditing = count('editing')
  const waitingCustomer = count('preview_ready')
  const owed = all
    .filter((o) => ['approved', 'in_production', 'shipped'].includes(o.status))
    .reduce((s, o) => s + Number(o.balance_due), 0)

  return (
    <div>
      <PageHeader title="Today" subtitle="What needs doing right now." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {todos.map((t) => (
          <Link key={t.label} to={t.to} className="block">
            <StatCard label={t.label} value={loading ? '—' : String(t.n)} hint={t.hint} />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="At the studio" value={loading ? '—' : String(inEditing)} hint="being edited" />
        <StatCard label="Waiting for customers" value={loading ? '—' : String(waitingCustomer)} hint="preview sent, no answer yet" />
        <StatCard label="Cash to collect" value={loading ? '—' : EGP(owed)} hint="balances on approved orders" />
      </div>

      {!loading && all.length === 0 && (
        <Panel className="mt-6 p-5 text-sm text-[var(--color-muted)]">No orders yet. They’ll show up here as customers place them.</Panel>
      )}
    </div>
  )
}
