import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { hasPermission, rowsToMap, type PermAction, type PermissionMap } from '../lib/permissions'
import type { StaffMember } from '../lib/db'

type Ctx = {
  isSuper: boolean
  roleName: string
  map: PermissionMap
  can: (resource: string, action: PermAction) => boolean
  loading: boolean
}

const StaffPermissionsContext = createContext<Ctx | null>(null)

const LEGACY_SUPER = new Set(['super_admin'])

async function loadRoleMeta(roleId: string) {
  try {
    const { data: role, error: e1 } = await supabase.from('staff_roles').select('name, is_super').eq('id', roleId).single()
    if (e1) throw e1
    const { data: perms, error: e2 } = await supabase
      .from('staff_role_permissions')
      .select('resource, actions')
      .eq('role_id', roleId)
    if (e2) throw e2
    return {
      isSuper: role.is_super as boolean,
      roleName: role.name as string,
      map: rowsToMap((perms ?? []) as { resource: string; actions: Record<string, boolean> }[]),
    }
  } catch {
    return {
      isSuper: LEGACY_SUPER.has(roleId),
      roleName: roleId,
      map: {} as PermissionMap,
    }
  }
}

export function StaffPermissionsProvider({
  staff,
  children,
}: {
  staff: StaffMember
  children: ReactNode
}) {
  const q = useQuery({
    queryKey: ['my-permissions', staff.role],
    queryFn: () => loadRoleMeta(staff.role),
    staleTime: 60_000,
  })

  const value = useMemo<Ctx>(() => {
    const isSuper = q.data?.isSuper ?? staff.role === 'super_admin'
    const map = q.data?.map ?? {}
  const roleName = q.data?.roleName ?? staff.role
    return {
      isSuper,
      roleName,
      map,
      loading: q.isLoading,
      can: (resource, action) => hasPermission(map, isSuper, resource, action),
    }
  }, [q.data, q.isLoading, staff.role])

  return <StaffPermissionsContext.Provider value={value}>{children}</StaffPermissionsContext.Provider>
}

export function useStaffPermissions() {
  const ctx = useContext(StaffPermissionsContext)
  if (!ctx) throw new Error('StaffPermissionsProvider missing')
  return ctx
}