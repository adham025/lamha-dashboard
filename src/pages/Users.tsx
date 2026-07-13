import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader, Panel } from '../components/ui'
import { fetchProfiles } from '../lib/db'

const tierColor: Record<string, string> = {
  free: 'bg-[var(--color-bg)] text-[var(--color-muted)]',
  plus: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  pro: 'bg-violet-100 text-[var(--color-secondary)]',
}

export default function Users() {
  const { data, isLoading } = useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles })
  const [filter, setFilter] = useState<'all' | 'signed' | 'guest'>('all')

  const rows = (data ?? []).filter((p) => {
    if (filter === 'signed') return p.auth_method && p.auth_method !== 'anonymous'
    if (filter === 'guest') return !p.auth_method || p.auth_method === 'anonymous'
    return true
  })

  return (
    <div>
      <PageHeader title="Users" subtitle="App customers — tier, sign-up method, referral code (§8)." />

      <div className="mb-4 flex gap-2">
        {(['all', 'signed', 'guest'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              'rounded-full px-3.5 py-1.5 text-xs font-semibold ' +
              (filter === f
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-panel)] text-[var(--color-muted)] border border-[var(--color-border)]')
            }
          >
            {f === 'all' ? 'All' : f === 'signed' ? 'Signed-up' : 'Guests'}
          </button>
        ))}
      </div>

      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Tier</th>
                <th className="px-4 py-3 font-semibold">Sign-up</th>
                <th className="px-4 py-3 font-semibold">Referral</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3 font-medium">{p.display_name || 'Guest'}</td>
                  <td className="px-4 py-3">
                    <span className={'rounded-full px-2 py-0.5 text-xs font-bold uppercase ' + (tierColor[p.tier] ?? '')}>
                      {p.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{p.auth_method ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">{p.referral_code ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {new Date(p.created_at).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">No users.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
