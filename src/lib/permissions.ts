/** Mirrors Zad resource + action checks (`list`, `show`, `create`, …). */
export const PERM_ACTIONS = ['list', 'show', 'create', 'edit', 'delete', 'bulk_delete'] as const
export type PermAction = (typeof PERM_ACTIONS)[number]

export const ACTION_LABEL: Record<PermAction, string> = {
  list: 'List',
  show: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  bulk_delete: 'Bulk delete',
}

export const DASHBOARD_RESOURCES = [
  { id: 'overview', label: 'Today' },
  { id: 'payments', label: 'Payments queue' },
  { id: 'editing', label: 'Editing queue' },
  { id: 'print', label: 'Print & delivery' },
  { id: 'orders', label: 'All orders' },
  { id: 'users', label: 'Customers' },
  { id: 'moderation', label: 'Uploads' },
  { id: 'catalogue', label: 'Services & prices' },
  { id: 'discounts', label: 'Discounts' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'reports', label: 'Reports' },
  { id: 'team', label: 'Team accounts' },
  { id: 'settings', label: 'Settings' },
  { id: 'site', label: 'Legal & site pages' },
  { id: 'roles', label: 'Roles' },
  { id: 'role_permissions', label: 'Role permissions' },
] as const

export type PermissionRow = { resource: string; actions: Partial<Record<PermAction, boolean>> }
export type PermissionMap = Record<string, Partial<Record<PermAction, boolean>>>

export function rowsToMap(rows: { resource: string; actions: Record<string, boolean> }[]): PermissionMap {
  const m: PermissionMap = {}
  for (const r of rows) {
    m[r.resource] = r.actions as PermissionMap[string]
  }
  return m
}

export function hasPermission(
  map: PermissionMap,
  isSuper: boolean,
  resource: string,
  action: PermAction,
): boolean {
  if (isSuper) return true
  return !!map[resource]?.[action]
}