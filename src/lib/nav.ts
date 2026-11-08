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
  type LucideIcon,
} from 'lucide-react'

export type StaffRole = 'super_admin' | 'studio' | 'support' | 'print_ops'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Roles allowed to see this section. Omit = all staff. */
  roles?: StaffRole[]
}

export const nav: NavItem[] = [
  { to: '/', label: 'Today', icon: LayoutDashboard },
  { to: '/payments', label: 'Payments', icon: Wallet, roles: ['super_admin', 'support'] },
  { to: '/editing', label: 'Editing', icon: Brush, roles: ['super_admin', 'studio'] },
  { to: '/print', label: 'Print & delivery', icon: Truck, roles: ['super_admin', 'print_ops'] },
  { to: '/orders', label: 'All orders', icon: Package },
  { to: '/users', label: 'Customers', icon: Users, roles: ['super_admin', 'studio', 'support'] },
  { to: '/moderation', label: 'Uploads', icon: ShieldAlert, roles: ['super_admin', 'studio', 'support'] },
  { to: '/catalogue', label: 'Services & prices', icon: Tags, roles: ['super_admin'] },
  { to: '/discounts', label: 'Discounts', icon: Ticket, roles: ['super_admin', 'support'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['super_admin', 'support'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['super_admin'] },
  { to: '/studios', label: 'Team', icon: Building2, roles: ['super_admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['super_admin'] },
]

export function canAccess(item: NavItem, role: StaffRole): boolean {
  return !item.roles || item.roles.includes(role)
}
