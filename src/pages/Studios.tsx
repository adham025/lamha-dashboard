import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { FormDrawer, type Field, type FormValues } from '../components/FormDrawer'
import { supabase } from '../lib/supabase'
import { fetchStaff, type StaffMember } from '../lib/db'
import { useStaffPermissions } from '../context/StaffPermissions'

type RoleOpt = { id: string; name: string }

const fetchRoleOptions = async () => {
  const { data, error } = await supabase.from('staff_roles').select('id, name').order('sort')
  if (error) throw error
  return (data ?? []) as RoleOpt[]
}

export default function Studios() {
  const { can } = useStaffPermissions()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['staff'], queryFn: fetchStaff })
  const roles = useQuery({ queryKey: ['staff_roles'], queryFn: fetchRoleOptions })
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [error, setError] = useState<string | null>(null)

  const roleOptions = (roles.data ?? []).map((r) => ({ value: r.id, label: r.name }))
  const roleLabel = Object.fromEntries((roles.data ?? []).map((r) => [r.id, r.name]))

  const close = () => { setMode(null); setEditing(null); setError(null) }

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

  const save = useMutation({
    mutationFn: async (v: FormValues) => {
      if (mode === 'add') {
        const { data: fnData, error } = await supabase.functions.invoke('create-staff', {
          body: { email: v.email, password: v.password, full_name: v.full_name, role: v.role },
        })
        if (error) throw error
        if (fnData?.error) throw new Error(fnData.error)
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
    { header: 'Role', render: (s) => <span className="font-medium">{roleLabel[s.role] ?? s.role}</span> },
    { header: 'Status', render: (s) => <span className={'text-sm font-medium ' + (s.active ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>{s.active ? 'Active' : 'Disabled'}</span> },
  ]

  if (!can('team', 'list')) {
    return <div className="p-6 text-sm text-[var(--color-muted)]">You do not have permission to manage team accounts.</div>
  }

  return (
    <div>
      <PageHeader title="Team" subtitle="Dashboard logins. Pick a role — permissions are configured under Roles and Role permissions." />
      <DataTable
        rows={data ?? []}
        getId={(s) => s.id}
        columns={columns}
        loading={isLoading}
        addLabel={can('team', 'create') ? 'New account' : undefined}
        onAdd={can('team', 'create') ? () => { setError(null); setMode('add') } : undefined}
        onEdit={can('team', 'edit') ? (s) => { setError(null); setEditing(s); setMode('edit') } : undefined}
        onDelete={can('team', 'delete') ? (ids) => del.mutate(ids) : undefined}
        emptyText="No staff yet."
      />
      <FormDrawer
        open={mode !== null}
        onClose={close}
        title={mode === 'add' ? 'New team login' : 'Edit account'}
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