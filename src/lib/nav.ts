import {
  LayoutDashboard,
  Wallet,
  Brush,
  Truck,
  Package,
  Users,
  ShieldAlert,
  Ticket,
  Tags,
  BarChart3,
  Building2,
  Settings,
  Bell,
  KeyRound,
  ShieldCheck,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import type { PermAction } from './permissions'

export type StaffRole = string

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Permission resource — needs `list` to show in the sidebar (Zad-style). */
  resource: string
}

export const nav: NavItem[] = [
  { to: '/today', label: 'Today', icon: LayoutDashboard, resource: 'overview' },
  { to: '/payments', label: 'Payments', icon: Wallet, resource: 'payments' },
  { to: '/editing', label: 'Editing', icon: Brush, resource: 'editing' },
  { to: '/print', label: 'Print & delivery', icon: Truck, resource: 'print' },
  { to: '/orders', label: 'All orders', icon: Package, resource: 'orders' },
  { to: '/users', label: 'Customers', icon: Users, resource: 'users' },
  { to: '/moderation', label: 'Uploads', icon: ShieldAlert, resource: 'moderation' },
  { to: '/catalogue', label: 'Services & prices', icon: Tags, resource: 'catalogue' },
  { to: '/discounts', label: 'Discounts', icon: Ticket, resource: 'discounts' },
  { to: '/notifications', label: 'Notifications', icon: Bell, resource: 'notifications' },
  { to: '/reports', label: 'Reports', icon: BarChart3, resource: 'reports' },
  { to: '/studios', label: 'Team', icon: Building2, resource: 'team' },
  { to: '/roles', label: 'Roles', icon: KeyRound, resource: 'roles' },
  { to: '/roles-permissions', label: 'Permissions', icon: ShieldCheck, resource: 'role_permissions' },
  { to: '/settings', label: 'Settings', icon: Settings, resource: 'settings' },
  { to: '/site', label: 'Legal & site', icon: FileText, resource: 'site' },
]

export function canAccess(
  item: NavItem,
  check: (resource: string, action: PermAction) => boolean,
): boolean {
  return check(item.resource, 'list')
}