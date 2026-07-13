import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { FormDrawer, type Field, type FormValues } from '../components/FormDrawer'
import { supabase } from '../lib/supabase'
import { fetchStaff, type StaffMember } from '../lib/db'
import type { StaffRole } from '../lib/nav'

const roleLabel: Record<StaffRole, string> = {
  super_admin: 'Super admin', studio: 'Studio', support: 'Support', print_ops: 'Print ops',
}
const roleOptions = (Object.keys(roleLabel) as StaffRole[]).map((r) => ({ value: r, label: roleLabel[r] }))

const ADD_FIELDS: Field[] = [
  { name: 'full_name', label: 'Full name', required: true, colSpan: 2 },
  { name: 'email', label: 'Email', required: true },
  { name: 'password', label: 'Temporary password', type: 'password', required: true },
  { name: 'role', label: 'Role', type: 'select', required: true, colSpan: 2, options: roleOptions },
]
const EDIT_FIELDS: Field[] = [
  { name: 'full_name', label: 'Full name', colSpan: 2 },
  { name: 'role', label: 'Role', type: 'select', required: true, colSpan: 2, options: roleOptions },
  { name: 'active', label: 'Active', type: 'switch' },
]

export default function Studios() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['staff'], queryFn: fetchStaff })
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [error, setError] = useState<string | null>(null)

  const close = () => { setMode(null); setEditing(null); setError(null) }

  const save = useMutation({
    mutationFn: async (v: FormValues) => {
      if (mode === 'add') {
        const { error } = await supabase.functions.invoke('create-staff', {
          body: { email: v.email, password: v.password, full_name: v.full_name, role: v.role },
        })
        if (error) throw error
      } else {
        const { error } = await supabase.from('staff')
          .update({ full_name: v.full_name, role: v.role, active: v.active })
          .eq('id', editing!.id)
        if (error) throw error
      }
    },
    onSuccess: () => { close(); qc.invalidateQueries({ queryKey: ['staff'] }) },
    onError: (e: unknown) => {
      const t = e instanceof Error ? e.message : 'Failed'
      setError(
        t.includes('Failed to fetch') || t.includes('404')
          ? 'The create-staff function isn’t deployed yet (see dashboard README).'
          : t,
      )
    },
  })
  const del = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('staff').delete().in('id', ids)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })

  const columns: Column<StaffMember>[] = [
    { header: 'Name', render: (s) => <span className="font-medium">{s.full_name || '—'}</span> },
    { header: 'Email', render: (s) => <span className="text-[var(--color-muted)]">{s.email}</span> },
    { header: 'Role', render: (s) => <span className="font-medium">{roleLabel[s.role]}</span> },
    { header: 'Status', render: (s) => <span className={'text-sm font-medium ' + (s.active ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>{s.active ? 'Active' : 'Disabled'}</span> },
  ]

  return (
    <div>
      <PageHeader title="Studios & roles" subtitle="Create operator accounts and manage their roles." />
      <DataTable
        rows={data ?? []}
        getId={(s) => s.id}
        columns={columns}
        loading={isLoading}
        addLabel="New account"
        onAdd={() => { setError(null); setMode('add') }}
        onEdit={(s) => { setError(null); setEditing(s); setMode('edit') }}
        onDelete={(ids) => del.mutate(ids)}
        emptyText="No staff yet."
      />
      <FormDrawer
        open={mode !== null}
        onClose={close}
        title={mode === 'add' ? 'New studio account' : 'Edit account'}
        fields={mode === 'add' ? ADD_FIELDS : EDIT_FIELDS}
        initial={mode === 'edit' && editing
          ? { full_name: editing.full_name ?? '', role: editing.role, active: editing.active }
          : undefined}
        submitLabel={mode === 'add' ? 'Create account' : 'Save'}
        busy={save.isPending}
        error={error}
        onSubmit={(v) => { setError(null); save.mutate(v) }}
      />
    </div>
  )
}
