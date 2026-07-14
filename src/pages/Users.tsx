import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { FormDrawer, type Field, type FormValues } from '../components/FormDrawer'
import { fetchProfiles, deleteRows, updateRow, insertRow, type Profile } from '../lib/db'

const tierColor: Record<string, string> = {
  free: 'text-[var(--color-muted)]',
  plus: 'text-[var(--color-accent)]',
  pro: 'text-[var(--color-secondary)]',
}

const FIELDS: Field[] = [
  { name: 'display_name', label: 'Name', required: true, colSpan: 2, placeholder: 'Customer name' },
  {
    name: 'tier', label: 'Plan', type: 'select', required: true,
    options: [
      { value: 'free', label: 'Free' },
      { value: 'plus', label: 'Plus' },
      { value: 'pro', label: 'Pro' },
    ],
  },
]

export default function Users() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles })
  const [filter, setFilter] = useState<'all' | 'signed' | 'guest'>('all')
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Profile | null>(null)
  const close = () => { setMode(null); setEditing(null) }

  const rows = (data ?? []).filter((p) => {
    if (filter === 'signed') return p.auth_method && p.auth_method !== 'anonymous'
    if (filter === 'guest') return !p.auth_method || p.auth_method === 'anonymous'
    return true
  })

  const del = useMutation({
    mutationFn: (ids: string[]) => deleteRows('profiles', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  })
  const save = useMutation({
    mutationFn: (v: FormValues) =>
      mode === 'add'
        ? insertRow('profiles', { display_name: v.display_name, tier: v.tier, auth_method: 'manual' })
        : updateRow('profiles', editing!.id, { display_name: v.display_name, tier: v.tier }),
    onSuccess: () => { close(); qc.invalidateQueries({ queryKey: ['profiles'] }) },
  })

  const columns: Column<Profile>[] = [
    { header: 'Name', render: (p) => <span className="font-medium">{p.display_name || 'Guest'}</span> },
    { header: 'Plan', render: (p) => <span className={'font-semibold uppercase ' + (tierColor[p.tier] ?? '')}>{p.tier}</span> },
    { header: 'Sign-up', render: (p) => <span className="text-[var(--color-muted)]">{p.auth_method ?? '—'}</span> },
    { header: 'Referral', render: (p) => <span className="font-mono text-xs text-[var(--color-muted)]">{p.referral_code ?? '—'}</span> },
    { header: 'Joined', render: (p) => <span className="text-[var(--color-muted)]">{new Date(p.created_at).toLocaleDateString('en-GB')}</span> },
  ]

  const filters = (['all', 'signed', 'guest'] as const).map((f) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={
        'rounded-lg px-3.5 py-1.5 text-sm font-medium ' +
        (filter === f
          ? 'bg-[var(--color-ink)] text-white'
          : 'bg-[var(--color-panel)] text-[var(--color-muted)] border border-[var(--color-border)]')
      }
    >
      {f === 'all' ? 'All' : f === 'signed' ? 'Signed-up' : 'Guests'}
    </button>
  ))

  return (
    <div>
      <PageHeader title="Users" subtitle="App customers, their plan and sign-up method." />
      <DataTable
        rows={rows}
        getId={(p) => p.id}
        columns={columns}
        loading={isLoading}
        filters={filters}
        addLabel="New customer"
        onAdd={() => setMode('add')}
        onEdit={(p) => { setEditing(p); setMode('edit') }}
        onDelete={(ids) => del.mutate(ids)}
        emptyText="No users."
      />
      <FormDrawer
        open={mode !== null}
        onClose={close}
        title={mode === 'add' ? 'New customer' : 'Edit customer'}
        fields={FIELDS}
        initial={mode === 'edit' && editing ? { display_name: editing.display_name ?? '', tier: editing.tier } : undefined}
        submitLabel={mode === 'add' ? 'Create' : 'Save'}
        busy={save.isPending}
        onSubmit={(v) => save.mutate(v)}
      />
    </div>
  )
}
