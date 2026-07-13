import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, Panel, TableShell, RowDelete, thClass } from '../components/ui'
import {
  fetchUploads, fetchSubscriptions, fetchReferrals, fetchConfig,
  deleteRows, updateRow, updateConfig, type ConfigRow,
} from '../lib/db'

const modColor: Record<string, string> = {
  approved: 'text-[var(--color-success)]',
  flagged: 'text-[var(--color-warn)]',
  rejected: 'text-[var(--color-danger)]',
  pending: 'text-[var(--color-muted)]',
}
const fileName = (path: string) => path.split('/').pop() ?? path

export function Moderation() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['uploads'], queryFn: fetchUploads })
  const setMod = useMutation({
    mutationFn: ({ id, moderation }: { id: string; moderation: string }) =>
      updateRow('uploads', id, { moderation }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['uploads'] }),
  })
  const del = useMutation({
    mutationFn: (id: string) => deleteRows('uploads', [id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['uploads'] }),
  })

  const rows = (data ?? []).slice().sort((a, b) => {
    const rank = (m: string) => (m === 'flagged' ? 0 : m === 'pending' ? 1 : 2)
    return rank(a.moderation) - rank(b.moderation)
  })

  return (
    <div>
      <PageHeader title="Moderation" subtitle="Review flagged uploads before any print ships." />
      <TableShell>
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className={thClass}>Customer</th>
            <th className={thClass}>File</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Uploaded</th>
            <th className={thClass}>Review</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={6} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>}
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]">
              <td className="px-4 py-3 font-medium">{u.profiles?.display_name ?? 'Guest'}</td>
              <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">{fileName(u.storage_path)}</td>
              <td className={'px-4 py-3 text-sm font-semibold capitalize ' + (modColor[u.moderation] ?? '')}>{u.moderation}</td>
              <td className="px-4 py-3 text-[var(--color-muted)]">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => setMod.mutate({ id: u.id, moderation: 'approved' })}
                    className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium hover:bg-[var(--color-bg)]">Approve</button>
                  <button onClick={() => setMod.mutate({ id: u.id, moderation: 'rejected' })}
                    className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-bg)]">Reject</button>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <RowDelete onClick={() => { if (confirm('Delete this upload?')) del.mutate(u.id) }} />
              </td>
            </tr>
          ))}
          {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-[var(--color-muted)]">Nothing to review.</td></tr>}
        </tbody>
      </TableShell>
    </div>
  )
}

export function Subscriptions() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['subs'], queryFn: fetchSubscriptions })
  const del = useMutation({
    mutationFn: (id: string) => deleteRows('subscriptions', [id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subs'] }),
  })

  return (
    <div>
      <PageHeader title="Subscriptions" subtitle="Active and churned subscribers." />
      <TableShell>
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className={thClass}>Subscriber</th>
            <th className={thClass}>Tier</th>
            <th className={thClass}>State</th>
            <th className={thClass}>Renews</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>}
          {(data ?? []).map((s) => (
            <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]">
              <td className="px-4 py-3 font-medium">{s.profiles?.display_name ?? 'Guest'}</td>
              <td className="px-4 py-3 font-semibold uppercase">{s.tier}</td>
              <td className="px-4 py-3">
                <span className={'text-sm font-medium ' + (s.active ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>
                  {s.active ? 'Active' : 'Churned'}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--color-muted)]">{s.renews_at ? new Date(s.renews_at).toLocaleDateString('en-GB') : '—'}</td>
              <td className="px-4 py-3 text-right">
                <RowDelete onClick={() => { if (confirm('Delete this subscription?')) del.mutate(s.id) }} />
              </td>
            </tr>
          ))}
          {!isLoading && (data ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">No subscribers yet.</td></tr>}
        </tbody>
      </TableShell>
    </div>
  )
}

export function Promotions() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['referrals'], queryFn: fetchReferrals })
  const del = useMutation({
    mutationFn: (id: string) => deleteRows('referrals', [id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  })

  return (
    <div>
      <PageHeader title="Promotions" subtitle="Referral codes and their reward state." />
      <TableShell>
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className={thClass}>Code</th>
            <th className={thClass}>Rewarded</th>
            <th className={thClass}>Created</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>}
          {(data ?? []).map((r) => (
            <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]">
              <td className="px-4 py-3 font-mono text-sm">{r.code}</td>
              <td className="px-4 py-3">
                <span className={'text-sm font-medium ' + (r.rewarded ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>
                  {r.rewarded ? 'Yes' : 'Pending'}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--color-muted)]">{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
              <td className="px-4 py-3 text-right">
                <RowDelete onClick={() => { if (confirm('Delete this referral code?')) del.mutate(r.id) }} />
              </td>
            </tr>
          ))}
          {!isLoading && (data ?? []).length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-[var(--color-muted)]">No referral codes yet.</td></tr>}
        </tbody>
      </TableShell>
    </div>
  )
}

function ConfigField({ row, onSave }: { row: ConfigRow; onSave: (key: string, value: string) => void }) {
  const [v, setV] = useState(row.value)
  const [saved, setSaved] = useState(false)
  useEffect(() => setV(row.value), [row.value])

  const commit = () => {
    if (v !== row.value) {
      onSave(row.key, v)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <label className="text-sm text-[var(--color-muted)]">{row.label}</label>
      <div className="flex items-center gap-2">
        {saved && <span className="text-xs text-[var(--color-success)]">Saved</span>}
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-40 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-right text-sm outline-none focus:border-[var(--color-accent)]"
        />
      </div>
    </div>
  )
}

export function Settings() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['config'], queryFn: fetchConfig })
  const save = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => updateConfig(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }),
  })

  const groups = (data ?? []).reduce<Record<string, ConfigRow[]>>((acc, row) => {
    ;(acc[row.grp] ??= []).push(row)
    return acc
  }, {})

  return (
    <div>
      <PageHeader title="Settings" subtitle="Live configuration — changes save straight to the database." />
      {isLoading && <Panel className="p-5 text-sm text-[var(--color-muted)]">Loading…</Panel>}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(groups).map(([grp, rows]) => (
          <Panel key={grp} className="p-5">
            <div className="mb-1 text-sm font-semibold">{grp}</div>
            <div className="divide-y divide-[var(--color-border)]">
              {rows.map((row) => (
                <ConfigField key={row.key} row={row} onSave={(key, value) => save.mutate({ key, value })} />
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
