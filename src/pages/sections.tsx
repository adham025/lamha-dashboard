import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, Panel } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { FormDrawer, type Field, type FormValues } from '../components/FormDrawer'
import { ImageViewer } from '../components/ImageViewer'
import {
  fetchModerationMedia, fetchDiscounts, fetchConfig,
  fetchNotifications, deleteRows, updateRow, insertRow, updateConfig,
  type UploadWithUrl, type Discount, type ConfigRow, type OrderNotification,
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
  const { data, isLoading } = useQuery({ queryKey: ['modmedia'], queryFn: fetchModerationMedia })
  const [editing, setEditing] = useState<UploadWithUrl | null>(null)
  const [viewing, setViewing] = useState<UploadWithUrl | null>(null)

  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('uploads', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modmedia'] }),
  })
  const save = useMutation({
    mutationFn: (v: FormValues) => updateRow('uploads', editing!.id, { moderation: v.moderation }),
    onSuccess: () => { setEditing(null); qc.invalidateQueries({ queryKey: ['modmedia'] }) },
  })

  const rows = (data ?? []).slice().sort((a, b) => {
    const rank = (m: string) => (m === 'flagged' ? 0 : m === 'pending' ? 1 : 2)
    return rank(a.moderation) - rank(b.moderation)
  })

  const columns: Column<UploadWithUrl>[] = [
    {
      header: 'Photo',
      render: (u) => (
        <button onClick={() => setViewing(u)} className="block h-11 w-11 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]">
          {u.url ? <img src={u.url} alt="" className="h-full w-full object-cover" /> : null}
        </button>
      ),
    },
    { header: 'Customer', render: (u) => <span className="font-medium">{u.profiles?.display_name ?? 'Guest'}</span> },
    { header: 'Status', render: (u) => <span className={'font-semibold capitalize ' + (modColor[u.moderation] ?? '')}>{u.moderation}</span> },
    { header: 'Uploaded', render: (u) => <span className="text-[var(--color-muted)]">{new Date(u.created_at).toLocaleDateString('en-GB')}</span> },
  ]
  const FIELDS: Field[] = [{
    name: 'moderation', label: 'Review decision', type: 'select', required: true, colSpan: 2,
    options: ['pending', 'approved', 'flagged', 'rejected'].map((s) => ({ value: s, label: s })),
  }]

  return (
    <div>
      <PageHeader title="Uploads" subtitle="Photos customers have uploaded. Flag or reject anything that breaks the rules before it goes to a studio." />
      <DataTable rows={rows} getId={(u) => u.id} columns={columns} loading={isLoading}
        onView={setViewing} onEdit={setEditing} onDelete={(ids) => del.mutate(ids)} emptyText="Nothing to review." />
      <FormDrawer open={!!editing} onClose={() => setEditing(null)} title="Review upload" fields={FIELDS}
        initial={editing ? { moderation: editing.moderation } : undefined}
        busy={save.isPending} onSubmit={(v) => save.mutate(v)} />
      <ImageViewer
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={`Upload — ${viewing?.profiles?.display_name ?? 'Guest'}`}
        baseName={fileName(viewing?.storage_path ?? 'upload')}
        images={viewing?.url ? [{ label: fileName(viewing.storage_path), url: viewing.url }] : []}
      />
    </div>
  )
}

const kindLabel: Record<string, string> = { fixed: 'Fixed amount', percentage: 'Percentage' }

/** Discount rows store amount/usage_limit/min_order_amount as numbers and
 * expires_at as an ISO timestamp — the form only ever deals in strings, so
 * translate at the edge rather than threading numeric types through FormDrawer. */
function toDiscountPatch(v: FormValues) {
  return {
    code: String(v.code).trim().toUpperCase(),
    kind: v.kind,
    amount: Number(v.amount),
    active: v.active,
    usage_limit: v.usage_limit === '' ? null : Number(v.usage_limit),
    min_order_amount: v.min_order_amount === '' ? null : Number(v.min_order_amount),
    expires_at: v.expires_at === '' ? null : new Date(String(v.expires_at)).toISOString(),
  }
}

export function Discounts() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['discounts'], queryFn: fetchDiscounts })
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Discount | null>(null)
  const close = () => { setMode(null); setEditing(null) }

  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('discounts', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discounts'] }),
  })
  const save = useMutation({
    mutationFn: (v: FormValues) =>
      mode === 'add'
        ? insertRow('discounts', toDiscountPatch(v))
        : updateRow('discounts', editing!.id, toDiscountPatch(v)),
    onSuccess: () => { close(); qc.invalidateQueries({ queryKey: ['discounts'] }) },
  })

  const columns: Column<Discount>[] = [
    { header: 'Code', render: (d) => <span className="font-mono">{d.code}</span> },
    {
      header: 'Discount',
      render: (d) => (
        <span className="font-semibold">
          {d.kind === 'percentage' ? `${d.amount}%` : `${d.amount} EGP`}
        </span>
      ),
    },
    {
      header: 'Usage',
      render: (d) => <span className="text-[var(--color-muted)]">{d.times_used}{d.usage_limit !== null ? ` / ${d.usage_limit}` : ''}</span>,
    },
    { header: 'Min. order', render: (d) => <span className="text-[var(--color-muted)]">{d.min_order_amount !== null ? `${d.min_order_amount} EGP` : '—'}</span> },
    { header: 'Expires', render: (d) => <span className="text-[var(--color-muted)]">{d.expires_at ? new Date(d.expires_at).toLocaleDateString('en-GB') : 'Never'}</span> },
    { header: 'Active', render: (d) => <span className={'font-medium ' + (d.active ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>{d.active ? 'Yes' : 'Off'}</span> },
  ]
  const FIELDS: Field[] = [
    { name: 'code', label: 'Code', required: true, colSpan: 2, placeholder: 'e.g. WELCOME10' },
    {
      name: 'kind', label: 'Type', type: 'select', required: true,
      options: Object.entries(kindLabel).map(([value, label]) => ({ value, label })),
    },
    { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: 'EGP, or % if percentage' },
    { name: 'usage_limit', label: 'Usage limit', type: 'number', placeholder: 'Blank = unlimited' },
    { name: 'min_order_amount', label: 'Minimum order (EGP)', type: 'number', placeholder: 'Blank = no minimum' },
    { name: 'expires_at', label: 'Expires (YYYY-MM-DD)', placeholder: 'Blank = never' },
    { name: 'active', label: 'Active', type: 'switch' },
  ]

  return (
    <div>
      <PageHeader title="Discounts" subtitle="Fixed-amount or percentage codes customers enter at checkout." />
      <DataTable rows={data ?? []} getId={(d) => d.id} columns={columns} loading={isLoading}
        addLabel="New discount" onAdd={() => setMode('add')}
        onEdit={(d) => { setEditing(d); setMode('edit') }} onDelete={(ids) => del.mutate(ids)} emptyText="No discount codes yet." />
      <FormDrawer open={mode !== null} onClose={close}
        title={mode === 'add' ? 'New discount' : 'Edit discount'}
        fields={FIELDS}
        initial={mode === 'edit' && editing ? {
          code: editing.code,
          kind: editing.kind,
          amount: String(editing.amount),
          usage_limit: editing.usage_limit === null ? '' : String(editing.usage_limit),
          min_order_amount: editing.min_order_amount === null ? '' : String(editing.min_order_amount),
          expires_at: editing.expires_at ? editing.expires_at.slice(0, 10) : '',
          active: editing.active,
        } : mode === 'add' ? { active: true } : undefined}
        submitLabel={mode === 'add' ? 'Create' : 'Save'}
        busy={save.isPending} onSubmit={(v) => save.mutate(v)} />
    </div>
  )
}

const notifTypeLabel: Record<string, string> = {
  order_confirmed: 'Payment confirmed',
  payment_rejected: 'Payment rejected',
  preview_ready: 'Preview ready',
  order_printing: 'Printing',
  order_shipped: 'Out for delivery',
  order_delivered: 'Delivered',
}
const notifTypeColor: Record<string, string> = {
  order_confirmed: 'bg-sky-100 text-sky-700',
  payment_rejected: 'bg-rose-100 text-[var(--color-danger)]',
  preview_ready: 'bg-indigo-100 text-indigo-700',
  order_printing: 'bg-cyan-100 text-cyan-700',
  order_shipped: 'bg-violet-100 text-[var(--color-secondary)]',
  order_delivered: 'bg-emerald-100 text-[var(--color-success)]',
}

export function Notifications() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications })
  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('notifications', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const columns: Column<OrderNotification>[] = [
    { header: 'Customer', render: (n) => <span className="font-medium">{n.profiles?.display_name ?? 'Guest'}</span> },
    {
      header: 'Notification',
      render: (n) => (
        <span className={'rounded-full px-2 py-0.5 text-xs font-semibold ' + (notifTypeColor[n.type] ?? 'bg-[var(--color-bg)] text-[var(--color-muted)]')}>
          {notifTypeLabel[n.type] ?? n.type}
        </span>
      ),
    },
    { header: 'Order', render: (n) => <span className="font-mono text-xs text-[var(--color-muted)]">{n.order_id?.slice(0, 8) ?? '—'}</span> },
    { header: 'Seen', render: (n) => <span className={n.read ? 'text-[var(--color-muted)]' : 'font-semibold text-[var(--color-accent)]'}>{n.read ? 'Read' : 'Unread'}</span> },
    { header: 'Sent', render: (n) => <span className="text-[var(--color-muted)]">{new Date(n.created_at).toLocaleString('en-GB')}</span> },
  ]

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Alerts sent to customers automatically whenever an order reaches a new stage." />
      <DataTable rows={data ?? []} getId={(n) => n.id} columns={columns} loading={isLoading}
        onDelete={(ids) => del.mutate(ids)} emptyText="No notifications sent yet." />
    </div>
  )
}

function ConfigField({
  row,
  value,
  onChange,
}: {
  row: ConfigRow
  value: string
  onChange: (key: string, value: string) => void
}) {
  const isBool = row.value === 'true' || row.value === 'false'
  return (
    <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
      <label className="text-sm text-[var(--color-muted)]">{row.label}</label>
      {isBool ? (
        <select
          value={value}
          onChange={(e) => onChange(row.key, e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent)] sm:w-40"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(row.key, e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent)] sm:w-52 sm:text-right"
        />
      )}
    </div>
  )
}

export function Settings() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['config'], queryFn: fetchConfig })
  const [draft, setDraft] = useState<Record<string, string> | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!data) return
    setDraft(Object.fromEntries(data.map((r) => [r.key, r.value])))
  }, [data])

  const save = useMutation({
    mutationFn: async (next: Record<string, string>) => {
      const server = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
      const changes = Object.keys(next).filter((k) => next[k] !== server[k])
      await Promise.all(changes.map((key) => updateConfig(key, next[key]!)))
    },
    onSuccess: () => {
      setSaveError(null)
      void qc.invalidateQueries({ queryKey: ['config'] })
      void qc.invalidateQueries({ queryKey: ['public-config'] })
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2500)
    },
    onError: (e: unknown) => {
      setSaveError(e instanceof Error ? e.message : 'Save failed — try again or check your permissions.')
    },
  })

  const groups = (data ?? []).reduce<Record<string, ConfigRow[]>>((acc, row) => {
    ;(acc[row.grp] ??= []).push(row)
    return acc
  }, {})

  const server = data ? Object.fromEntries(data.map((r) => [r.key, r.value])) : {}
  const dirty = draft != null && Object.keys(draft).some((k) => draft[k] !== server[k])

  const setValue = (key: string, value: string) => {
    setSaveError(null)
    setDraft((d) => (d ? { ...d, [key]: value } : d))
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Edit values below, then press Save. Support email and WhatsApp update the public site immediately."
        action={
          <button
            type="button"
            disabled={!dirty || save.isPending || draft == null}
            onClick={() => draft && save.mutate(draft)}
            className="rounded-xl bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            {save.isPending ? 'Saving…' : savedFlash ? 'Saved' : 'Save changes'}
          </button>
        }
      />
      {saveError && (
        <Panel className="mb-4 border border-[var(--color-danger)] bg-[var(--color-danger)]/10 p-4 text-sm text-[var(--color-danger)]">
          {saveError}
        </Panel>
      )}
      {isLoading && <Panel className="p-5 text-sm text-[var(--color-muted)]">Loading…</Panel>}
      {draft && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(groups).map(([grp, rows]) => (
              <Panel key={grp} className="p-5">
                <div className="mb-1 text-sm font-semibold">{grp}</div>
                <div className="divide-y divide-[var(--color-border)]">
                  {rows.map((row) => (
                    <ConfigField
                      key={row.key}
                      row={row}
                      value={draft[row.key] ?? row.value}
                      onChange={setValue}
                    />
                  ))}
                </div>
              </Panel>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            {dirty && (
              <span className="text-sm text-[var(--color-muted)]">Unsaved changes</span>
            )}
            <button
              type="button"
              disabled={!dirty || save.isPending}
              onClick={() => save.mutate(draft)}
              className="rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40"
            >
              {save.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
