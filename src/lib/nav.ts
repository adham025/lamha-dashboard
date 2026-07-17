import {
  LayoutDashboard,
  Cpu,
  Package,
  Users,
  ShieldAlert,
  CreditCard,
  Ticket,
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
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/ai-cost', label: 'AI usage & cost', icon: Cpu, roles: ['super_admin', 'studio'] },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/users', label: 'Users', icon: Users, roles: ['super_admin', 'studio', 'support'] },
  { to: '/moderation', label: 'Moderation', icon: ShieldAlert, roles: ['super_admin', 'studio', 'support'] },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard, roles: ['super_admin', 'studio'] },
  { to: '/discounts', label: 'Discounts', icon: Ticket, roles: ['super_admin', 'studio'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['super_admin', 'studio', 'support'] },
  { to: '/studios', label: 'Studios & roles', icon: Building2, roles: ['super_admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['super_admin'] },
]

export function canAccess(item: NavItem, role: StaffRole): boolean {
  return !item.roles || item.roles.includes(role)
}
