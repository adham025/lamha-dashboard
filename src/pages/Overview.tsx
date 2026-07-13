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

// Illustrative data — replace with live queries once staff-role RLS or an admin
// Edge Function is in place (§8 / §12 economics feed the real numbers).
const revenue = [
  { d: 'Mon', subs: 1200, prints: 4200 },
  { d: 'Tue', subs: 1400, prints: 3800 },
  { d: 'Wed', subs: 1100, prints: 5200 },
  { d: 'Thu', subs: 1800, prints: 6100 },
  { d: 'Fri', subs: 2100, prints: 7400 },
  { d: 'Sat', subs: 2600, prints: 9100 },
  { d: 'Sun', subs: 2300, prints: 8300 },
]

export default function Overview() {
  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="The KPI cockpit — DAU, generations, revenue and ad income at a glance (§8)."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Daily active users" value="—" hint="wire to analytics (§13.7)" />
        <StatCard label="Generations today" value="—" hint="from ai_jobs (§10)" />
        <StatCard label="Revenue (30d)" value="—" hint="subs + prints" accent />
        <StatCard label="Ad revenue (30d)" value="—" hint="AdMob (§7)" />
      </div>

      <Panel className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-bold">Revenue — subscriptions vs prints</div>
          <div className="flex gap-4 text-xs text-[var(--color-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" /> Subscriptions
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" /> Prints
            </span>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue} margin={{ left: -12, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="gPrints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d6134f" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#d6134f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSubs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d28d9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece1ea" vertical={false} />
              <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="prints"
                stroke="#d6134f"
                strokeWidth={2}
                fill="url(#gPrints)"
              />
              <Area
                type="monotone"
                dataKey="subs"
                stroke="#6d28d9"
                strokeWidth={2}
                fill="url(#gSubs)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Prints carry the business (~5× subscriptions at every scale, §12) — sample data shown
          until live queries are wired.
        </p>
      </Panel>
    </div>
  )
}
