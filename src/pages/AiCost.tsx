import { useQuery } from '@tanstack/react-query'
import { PageHeader, Panel, StatCard } from '../components/ui'
import { fetchAiJobs } from '../lib/db'

const USD = (n: number) => `$${n.toFixed(3)}`

export default function AiCost() {
  const { data, isLoading } = useQuery({ queryKey: ['aiJobs'], queryFn: fetchAiJobs })
  const jobs = data ?? []

  const totalCost = jobs.reduce((s, j) => s + Number(j.cost_usd), 0)
  const failed = jobs.filter((j) => j.status === 'failed').length

  // Aggregate by model.
  const byModel = new Map<string, { provider: string; runs: number; cost: number }>()
  for (const j of jobs) {
    const key = j.model ?? 'unknown'
    const cur = byModel.get(key) ?? { provider: j.provider ?? '—', runs: 0, cost: 0 }
    cur.runs += 1
    cur.cost += Number(j.cost_usd)
    byModel.set(key, cur)
  }
  const rows = [...byModel.entries()].sort((a, b) => b[1].cost - a[1].cost)

  return (
    <div>
      <PageHeader
        title="AI usage & cost"
        subtitle="Spend by model/provider — the dashboard that protects your margin (§8, §5)."
        isNew
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total AI spend" value={isLoading ? '—' : USD(totalCost)} hint="all ai_jobs" accent />
        <StatCard label="Total runs" value={isLoading ? '—' : String(jobs.length)} />
        <StatCard label="Failed" value={isLoading ? '—' : String(failed)} hint="never charged a credit (§13.1)" />
        <StatCard
          label="Avg / run"
          value={isLoading || jobs.length === 0 ? '—' : USD(totalCost / jobs.length)}
        />
      </div>

      <Panel className="mt-6 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-4 py-3 font-semibold">Model</th>
                <th className="px-4 py-3 font-semibold">Provider</th>
                <th className="px-4 py-3 font-semibold">Runs</th>
                <th className="px-4 py-3 font-semibold">Total cost</th>
                <th className="px-4 py-3 font-semibold">Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([model, v]) => (
                <tr key={model} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{model}</td>
                  <td className="px-4 py-3 capitalize text-[var(--color-muted)]">{v.provider}</td>
                  <td className="px-4 py-3 tabular-nums">{v.runs}</td>
                  <td className="px-4 py-3 tabular-nums">{USD(v.cost)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--color-bg)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-accent)]"
                          style={{ width: `${totalCost ? (v.cost / totalCost) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-[var(--color-muted)]">
                        {totalCost ? Math.round((v.cost / totalCost) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">No jobs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
