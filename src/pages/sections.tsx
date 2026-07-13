import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, Panel } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { FormDrawer, type Field, type FormValues } from '../components/FormDrawer'
import {
  fetchUploads, fetchSubscriptions, fetchReferrals, fetchConfig,
  deleteRows, updateRow, updateConfig,
  type Upload, type Subscription, type Referral, type ConfigRow,
} from '../lib/db'

const fileName = (path: string) => path.split('/').pop() ?? path
const modColor: Record<string, string> = {
  approved: 'text-[var(--color-success)]',
  flagged: 'text-[var(--color-warn)]',
  rejected: 'text-[var(--color-danger)]',
  pending: 'text-[var(--color-muted)]',
}

export function Moderation() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['uploads'], queryFn: fetchUploads })
  const [editing, setEditing] = useState<Upload | null>(null)

  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('uploads', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['uploads'] }),
  })
  const save = useMutation({
    mutationFn: (v: FormValues) => updateRow('uploads', editing!.id, { moderation: v.moderation }),
    onSuccess: () => { setEditing(null); qc.invalidateQueries({ queryKey: ['uploads'] }) },
  })

  const rows = (data ?? []).slice().sort((a, b) => {
    const rank = (m: string) => (m === 'flagged' ? 0 : m === 'pending' ? 1 : 2)
    return rank(a.moderation) - rank(b.moderation)
  })

  const columns: Column<Upload>[] = [
    { header: 'Customer', render: (u) => <span className="font-medium">{u.profiles?.display_name ?? 'Guest'}</span> },
    { header: 'File', render: (u) => <span className="font-mono text-xs text-[var(--color-muted)]">{fileName(u.storage_path)}</span> },
    { header: 'Status', render: (u) => <span className={'font-semibold capitalize ' + (modColor[u.moderation] ?? '')}>{u.moderation}</span> },
    { header: 'Uploaded', render: (u) => <span className="text-[var(--color-muted)]">{new Date(u.created_at).toLocaleDateString('en-GB')}</span> },
  ]
  const FIELDS: Field[] = [{
    name: 'moderation', label: 'Review decision', type: 'select', required: true, colSpan: 2,
    options: ['pending', 'approved', 'flagged', 'rejected'].map((s) => ({ value: s, label: s })),
  }]

  return (
    <div>
      <PageHeader title="Moderation" subtitle="Review flagged uploads before any print ships." />
      <DataTable rows={rows} getId={(u) => u.id} columns={columns} loading={isLoading}
        onEdit={setEditing} onDelete={(ids) => del.mutate(ids)} emptyText="Nothing to review." />
      <FormDrawer open={!!editing} onClose={() => setEditing(null)} title="Review upload" fields={FIELDS}
        initial={editing ? { moderation: editing.moderation } : undefined}
        busy={save.isPending} onSubmit={(v) => save.mutate(v)} />
    </div>
  )
}

export function Subscriptions() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['subs'], queryFn: fetchSubscriptions })
  const [editing, setEditing] = useState<Subscription | null>(null)

  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('subscriptions', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subs'] }),
  })
  const save = useMutation({
    mutationFn: (v: FormValues) => updateRow('subscriptions', editing!.id, { tier: v.tier, active: v.active }),
    onSuccess: () => { setEditing(null); qc.invalidateQueries({ queryKey: ['subs'] }) },
  })

  const columns: Column<Subscription>[] = [
    { header: 'Subscriber', render: (s) => <span className="font-medium">{s.profiles?.display_name ?? 'Guest'}</span> },
    { header: 'Tier', render: (s) => <span className="font-semibold uppercase">{s.tier}</span> },
    { header: 'State', render: (s) => <span className={'font-medium ' + (s.active ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>{s.active ? 'Active' : 'Churned'}</span> },
    { header: 'Renews', render: (s) => <span className="text-[var(--color-muted)]">{s.renews_at ? new Date(s.renews_at).toLocaleDateString('en-GB') : '—'}</span> },
  ]
  const FIELDS: Field[] = [
    { name: 'tier', label: 'Tier', type: 'select', required: true, options: [{ value: 'plus', label: 'Plus' }, { value: 'pro', label: 'Pro' }, { value: 'free', label: 'Free' }] },
    { name: 'active', label: 'Active', type: 'switch' },
  ]

  return (
    <div>
      <PageHeader title="Subscriptions" subtitle="Active and churned subscribers." />
      <DataTable rows={data ?? []} getId={(s) => s.id} columns={columns} loading={isLoading}
        onEdit={setEditing} onDelete={(ids) => del.mutate(ids)} emptyText="No subscribers yet." />
      <FormDrawer open={!!editing} onClose={() => setEditing(null)} title="Edit subscription" fields={FIELDS}
        initial={editing ? { tier: editing.tier, active: editing.active } : undefined}
        busy={save.isPending} onSubmit={(v) => save.mutate(v)} />
    </div>
  )
}

export function Promotions() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['referrals'], queryFn: fetchReferrals })
  const [editing, setEditing] = useState<Referral | null>(null)

  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('referrals', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  })
  const save = useMutation({
    mutationFn: (v: FormValues) => updateRow('referrals', editing!.id, { code: v.code, rewarded: v.rewarded }),
    onSuccess: () => { setEditing(null); qc.invalidateQueries({ queryKey: ['referrals'] }) },
  })

  const columns: Column<Referral>[] = [
    { header: 'Code', render: (r) => <span className="font-mono">{r.code}</span> },
    { header: 'Rewarded', render: (r) => <span className={'font-medium ' + (r.rewarded ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>{r.rewarded ? 'Yes' : 'Pending'}</span> },
    { header: 'Created', render: (r) => <span className="text-[var(--color-muted)]">{new Date(r.created_at).toLocaleDateString('en-GB')}</span> },
  ]
  const FIELDS: Field[] = [
    { name: 'code', label: 'Code', required: true, colSpan: 2 },
    { name: 'rewarded', label: 'Rewarded', type: 'switch' },
  ]

  return (
    <div>
      <PageHeader title="Promotions" subtitle="Referral codes and their reward state." />
      <DataTable rows={data ?? []} getId={(r) => r.id} columns={columns} loading={isLoading}
        onEdit={setEditing} onDelete={(ids) => del.mutate(ids)} emptyText="No referral codes yet." />
      <FormDrawer open={!!editing} onClose={() => setEditing(null)} title="Edit referral code" fields={FIELDS}
        initial={editing ? { code: editing.code, rewarded: editing.rewarded } : undefined}
        busy={save.isPending} onSubmit={(v) => save.mutate(v)} />
    </div>
  )
}

function ConfigField({ row, onSave }: { row: ConfigRow; onSave: (key: string, value: string) => void }) {
  const [v, setV] = useState(row.value)
  const [saved, setSaved] = useState(false)
  useEffect(() => setV(row.value), [row.value])
  const commit = () => {
    if (v !== row.value) { onSave(row.key, v); setSaved(true); setTimeout(() => setSaved(false), 1500) }
  }
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <label className="text-sm text-[var(--color-muted)]">{row.label}</label>
      <div className="flex items-center gap-2">
        {saved && <span className="text-xs text-[var(--color-success)]">Saved</span>}
        <input value={v} onChange={(e) => setV(e.target.value)} onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-40 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-right text-sm outline-none focus:border-[var(--color-accent)]" />
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
