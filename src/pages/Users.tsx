import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, TableShell, Checkbox, BulkBar, RowDelete, thClass } from '../components/ui'
import { fetchProfiles, deleteRows, updateRow } from '../lib/db'
import { useSelection } from '../lib/useSelection'

const TIERS = ['free', 'plus', 'pro'] as const
const tierColor: Record<string, string> = {
  free: 'text-[var(--color-muted)]',
  plus: 'text-[var(--color-accent)]',
  pro: 'text-[var(--color-secondary)]',
}

export default function Users() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles })
  const [filter, setFilter] = useState<'all' | 'signed' | 'guest'>('all')
  const sel = useSelection<string>()

  const rows = (data ?? []).filter((p) => {
    if (filter === 'signed') return p.auth_method && p.auth_method !== 'anonymous'
    if (filter === 'guest') return !p.auth_method || p.auth_method === 'anonymous'
    return true
  })

  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('profiles', ids),
    onSuccess: () => {
      sel.clear()
      qc.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
  const setTier = useMutation({
    mutationFn: ({ id, tier }: { id: string; tier: string }) => updateRow('profiles', id, { tier }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  })

  const removeOne = (id: string, name: string) => {
    if (confirm(`Delete ${name}? This also removes their photos, jobs and orders.`)) del.mutate([id])
  }
  const removeSelected = () => {
    if (confirm(`Delete ${sel.count} customer(s) and all their data?`)) del.mutate([...sel.selected])
  }

  const allChecked = rows.length > 0 && sel.count === rows.length

  return (
    <div>
      <PageHeader title="Users" subtitle="App customers, their plan and sign-up method." />

      <div className="mb-4 flex gap-2">
        {(['all', 'signed', 'guest'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); sel.clear() }}
            className={
              'rounded-lg px-3.5 py-1.5 text-sm font-medium ' +
              (filter === f
                ? 'bg-[var(--color-ink)] text-white'
                : 'bg-[var(--color-panel)] text-[var(--color-muted)] border border-[var(--color-border)]')
            }
          >
            {f === 'all' ? 'All' : f === 'signed' ? 'Signed-up' : 'Guests'}
          </button>
        ))}
      </div>

      <BulkBar count={sel.count} busy={del.isPending} onClear={sel.clear} onDelete={removeSelected} />

      <TableShell>
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className={thClass + ' w-10'}>
              <Checkbox
                checked={allChecked}
                indeterminate={sel.count > 0}
                onChange={() => sel.toggleAll(rows.map((r) => r.id))}
              />
            </th>
            <th className={thClass}>Name</th>
            <th className={thClass}>Plan</th>
            <th className={thClass}>Sign-up</th>
            <th className={thClass}>Referral</th>
            <th className={thClass}>Joined</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan={7} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>
          )}
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]">
              <td className="px-4 py-3">
                <Checkbox checked={sel.selected.has(p.id)} onChange={() => sel.toggle(p.id)} />
              </td>
              <td className="px-4 py-3 font-medium">{p.display_name || 'Guest'}</td>
              <td className="px-4 py-3">
                <select
                  value={p.tier}
                  onChange={(e) => setTier.mutate({ id: p.id, tier: e.target.value })}
                  className={'rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs font-semibold uppercase ' + (tierColor[p.tier] ?? '')}
                >
                  {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </td>
              <td className="px-4 py-3 text-[var(--color-muted)]">{p.auth_method ?? '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">{p.referral_code ?? '—'}</td>
              <td className="px-4 py-3 text-[var(--color-muted)]">{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
              <td className="px-4 py-3 text-right">
                <RowDelete onClick={() => removeOne(p.id, p.display_name || 'this user')} />
              </td>
            </tr>
          ))}
          {!isLoading && rows.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-6 text-center text-[var(--color-muted)]">No users.</td></tr>
          )}
        </tbody>
      </TableShell>
    </div>
  )
}
