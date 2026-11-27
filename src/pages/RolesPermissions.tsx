import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, Panel } from '../components/ui'
import { supabase } from '../lib/supabase'
import {
  ACTION_LABEL,
  DASHBOARD_RESOURCES,
  PERM_ACTIONS,
  type PermAction,
  type PermissionMap,
} from '../lib/permissions'
import { useStaffPermissions } from '../context/StaffPermissions'

type RoleRow = { id: string; name: string; is_super: boolean }

const fetchRoles = async () => {
  const { data, error } = await supabase.from('staff_roles').select('id, name, is_super').order('sort')
  if (error) throw error
  return (data ?? []) as RoleRow[]
}

async function fetchPermRows(roleId: string) {
  const { data, error } = await supabase
    .from('staff_role_permissions')
    .select('resource, actions')
    .eq('role_id', roleId)
  if (error) throw error
  const map: PermissionMap = {}
  for (const row of data ?? []) {
    map[row.resource as string] = row.actions as PermissionMap[string]
  }
  return map
}

export default function RolesPermissions() {
  const { can } = useStaffPermissions()
  const qc = useQueryClient()
  const roles = useQuery({ queryKey: ['staff_roles'], queryFn: fetchRoles })
  const [roleId, setRoleId] = useState('')
  const [draft, setDraft] = useState<PermissionMap>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!roleId && roles.data?.length) setRoleId(roles.data[0].id)
  }, [roles.data, roleId])

  const perms = useQuery({
    queryKey: ['role_permissions', roleId],
    queryFn: () => fetchPermRows(roleId),
    enabled: !!roleId,
  })

  useEffect(() => {
    if (perms.data) setDraft(structuredClone(perms.data))
  }, [perms.data, roleId])

  const save = useMutation({
    mutationFn: async () => {
      if (!roleId) return
      const rows = DASHBOARD_RESOURCES.map((res) => ({
        role_id: roleId,
        resource: res.id,
        actions: draft[res.id] ?? {},
      }))
      const { error: delErr } = await supabase.from('staff_role_permissions').delete().eq('role_id', roleId)
      if (delErr) throw delErr
      const { error: insErr } = await supabase.from('staff_role_permissions').insert(rows)
      if (insErr) throw insErr
    },
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      qc.invalidateQueries({ queryKey: ['role_permissions', roleId] })
      qc.invalidateQueries({ queryKey: ['my-permissions'] })
    },
  })

  if (!can('role_permissions', 'list')) {
    return <div className="p-6 text-sm text-[var(--color-muted)]">You do not have permission to view role permissions.</div>
  }

  const selected = roles.data?.find((r) => r.id === roleId)
  const toggle = (resource: string, action: PermAction, on: boolean) => {
    setDraft((prev) => ({
      ...prev,
      [resource]: { ...prev[resource], [action]: on },
    }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role permissions"
        subtitle="Tick what each role can do per screen — list, view, create, edit, delete. Super roles always have everything."
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-[var(--color-muted)]">Role</label>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
        >
          {(roles.data ?? []).map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.id})
            </option>
          ))}
        </select>
        {selected?.is_super && (
          <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)]">
            Super — all permissions
          </span>
        )}
        {can('role_permissions', 'edit') && (
          <button
            type="button"
            disabled={save.isPending || selected?.is_super}
            onClick={() => save.mutate()}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {save.isPending ? 'Saving…' : saved ? 'Saved' : 'Save permissions'}
          </button>
        )}
      </div>

      <Panel className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Resource</th>
              {PERM_ACTIONS.map((a) => (
                <th key={a} className="px-3 py-3 text-center font-semibold">
                  {ACTION_LABEL[a]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DASHBOARD_RESOURCES.map((res) => (
              <tr key={res.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2.5 font-medium">{res.label}</td>
                {PERM_ACTIONS.map((action) => {
                  const checked = !!draft[res.id]?.[action]
                  return (
                    <td key={action} className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        disabled={!can('role_permissions', 'edit') || selected?.is_super}
                        checked={checked}
                        onChange={(e) => toggle(res.id, action, e.target.checked)}
                        className="h-4 w-4 accent-[var(--color-accent)]"
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}