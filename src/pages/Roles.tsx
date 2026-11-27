import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { FormDrawer, type Field, type FormValues } from '../components/FormDrawer'
import { deleteRows, insertRow, updateRow } from '../lib/db'
import { supabase } from '../lib/supabase'
import { useStaffPermissions } from '../context/StaffPermissions'

type StaffRoleRow = {
  id: string
  name: string
  description: string
  is_super: boolean
  is_system: boolean
  sort: number
}

const fetchRoles = async () => {
  const { data, error } = await supabase.from('staff_roles').select('*').order('sort')
  if (error) throw error
  return (data ?? []) as StaffRoleRow[]
}

export default function Roles() {
  const { can } = useStaffPermissions()
  const qc = useQueryClient()
  const roles = useQuery({ queryKey: ['staff_roles'], queryFn: fetchRoles })
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<StaffRoleRow | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!can('roles', 'list')) {
    return <div className="p-6 text-sm text-[var(--color-muted)]">You do not have permission to view roles.</div>
  }

  const close = () => {
    setMode(null)
    setEditing(null)
    setError(null)
  }

  const save = useMutation({
    mutationFn: async (v: FormValues) => {
      const body = {
        name: String(v.name).trim(),
        description: String(v.description ?? '').trim(),
        sort: Number(v.sort) || 0,
        is_super: !!v.is_super,
      }
      if (mode === 'add') {
        const id = String(v.id)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '')
        if (!id) throw new Error('Enter a short key (letters, numbers, underscore)')
        return insertRow('staff_roles', { id, is_system: false, ...body })
      }
      return updateRow('staff_roles', editing!.id, body)
    },
    onSuccess: () => {
      close()
      qc.invalidateQueries({ queryKey: ['staff_roles'] })
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : 'Failed'),
  })

  const del = useMutation({
    mutationFn: async (ids: string[]) => {
      const blocked = (roles.data ?? []).filter((r) => ids.includes(r.id) && r.is_system)
      if (blocked.length) throw new Error('Built-in roles cannot be deleted — turn off team accounts instead.')
      return deleteRows('staff_roles', ids)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff_roles'] }),
    onError: (e: unknown) => alert(e instanceof Error ? e.message : 'Delete failed'),
  })

  const cols: Column<StaffRoleRow>[] = [
    { header: 'Role', render: (r) => <span className="font-medium">{r.name}</span> },
    { header: 'Key', render: (r) => <span className="font-mono text-xs text-[var(--color-muted)]">{r.id}</span> },
    {
      header: 'Type',
      render: (r) => (
        <span className="text-sm text-[var(--color-muted)]">
          {r.is_super ? 'Super' : r.is_system ? 'System' : 'Custom'}
        </span>
      ),
    },
    { header: 'Order', render: (r) => <span className="tabular-nums">{r.sort}</span> },
  ]

  const fields: Field[] = [
    ...(mode === 'add'
      ? [{ name: 'id', label: 'Key (slug)', required: true, placeholder: 'e.g. night_shift' } as Field]
      : []),
    { name: 'name', label: 'Display name', required: true, colSpan: 2 },
    { name: 'description', label: 'Description', colSpan: 2 },
    { name: 'sort', label: 'Sort order', type: 'number' },
    ...(mode === 'add' || (editing && !editing.is_system)
      ? [{ name: 'is_super', label: 'Super role (all permissions)', type: 'switch' } as Field]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Roles"
        subtitle="Create job roles for your team. Assign permissions on the Role permissions page — same idea as Zad."
      />
      <DataTable
        rows={roles.data ?? []}
        getId={(r) => r.id}
        columns={cols}
        loading={roles.isLoading}
        addLabel={can('roles', 'create') ? 'New role' : undefined}
        onAdd={can('roles', 'create') ? () => { setError(null); setMode('add') } : undefined}
        onEdit={can('roles', 'edit') ? (r) => { setError(null); setEditing(r); setMode('edit') } : undefined}
        onDelete={can('roles', 'delete') ? (ids) => del.mutate(ids) : undefined}
        emptyText="No roles yet."
      />
      <FormDrawer
        open={mode !== null}
        onClose={close}
        title={mode === 'add' ? 'New role' : `Edit — ${editing?.name ?? ''}`}
        fields={fields}
        initial={
          mode === 'edit' && editing
            ? {
                name: editing.name,
                description: editing.description,
                sort: String(editing.sort),
                is_super: editing.is_super,
              }
            : mode === 'add'
              ? { is_super: false, sort: '10' }
              : undefined
        }
        submitLabel={mode === 'add' ? 'Create' : 'Save'}
        busy={save.isPending}
        error={error}
        onSubmit={(v) => {
          setError(null)
          save.mutate(v)
        }}
      />
    </div>
  )
}