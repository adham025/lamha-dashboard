import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { PageHeader, Panel, StatCard } from '../components/ui'
import { fetchProfiles, fetchAiJobs, fetchOrders, fetchSubscriptionsCount } from '../lib/db'

const EGP = (n: number) => `EGP ${Math.round(n).toLocaleString()}`
const dayKey = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

export default function Overview() {
  const profiles = useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles })
  const jobs = useQuery({ queryKey: ['aiJobs'], queryFn: fetchAiJobs })
  const orders = useQuery({ queryKey: ['orders'], queryFn: fetchOrders })
  const subs = useQuery({ queryKey: ['subsCount'], queryFn: fetchSubscriptionsCount })

  const loading = profiles.isLoading || jobs.isLoading || orders.isLoading

  // Revenue collected on prints = deposit + any COD collected.
  const printsRevenue = (orders.data ?? []).reduce(
    (s, o) => s + Number(o.deposit_amount) + Number(o.cod_collected ?? 0),
    0,
  )

  // Build a 14-day series of generations + revenue.
  const days: string[] = []
  for (let i = 13; i >= 0; i--) days.push(dayKey(new Date(Date.now() - i * 86400_000).toISOString()))
  const genByDay = Object.fromEntries(days.map((d) => [d, 0]))
  const revByDay = Object.fromEntries(days.map((d) => [d, 0]))
  for (const j of jobs.data ?? []) {
    const k = dayKey(j.created_at)
    if (k in genByDay) genByDay[k] += 1
  }
  for (const o of orders.data ?? []) {
    const k = dayKey(o.created_at)
    if (k in revByDay) revByDay[k] += Number(o.deposit_amount) + Number(o.cod_collected ?? 0)
  }
  const series = days.map((d) => ({ d, generations: genByDay[d], revenue: revByDay[d] }))

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Live from your Supabase project — KPIs, generations and print revenue (§8)."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Customers" value={loading ? '—' : String(profiles.data?.length ?? 0)} hint="app users (profiles)" />
        <StatCard label="Generations" value={loading ? '—' : String(jobs.data?.length ?? 0)} hint="ai_jobs all-time" />
        <StatCard label="Print revenue" value={loading ? '—' : EGP(printsRevenue)} hint="deposits + COD" accent />
        <StatCard label="Active subscribers" value={subs.isLoading ? '—' : String(subs.data ?? 0)} hint="Plus + Pro" />
      </div>

      <Panel className="mt-6">
        <div className="mb-4 text-sm font-bold">Generations & print revenue — last 14 days</div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: -12, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d6134f" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#d6134f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gGen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d28d9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece1ea" vertical={false} />
              <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#d6134f" strokeWidth={2} fill="url(#gRev)" />
              <Area type="monotone" dataKey="generations" stroke="#6d28d9" strokeWidth={2} fill="url(#gGen)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-[var(--color-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" /> Print revenue (EGP)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" /> Generations
          </span>
        </div>
      </Panel>
    </div>
  )
}
