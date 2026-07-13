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
  type LucideIcon,
} from 'lucide-react'

export type StaffRole = 'super_admin' | 'studio' | 'support' | 'print_ops'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Roles allowed to see this section. Omit = all staff. */
  roles?: StaffRole[]
  /** Marked "new" in spec §8. */
  isNew?: boolean
}

/** The admin sections, in the order of spec §8, gated by role. */
export const nav: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/ai-cost', label: 'AI usage & cost', icon: Cpu, isNew: true, roles: ['super_admin', 'studio'] },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/users', label: 'Users', icon: Users, roles: ['super_admin', 'studio', 'support'] },
  { to: '/moderation', label: 'Moderation queue', icon: ShieldAlert, isNew: true, roles: ['super_admin', 'studio', 'support'] },
  { to: '/subscriptions', label: 'Subscriptions & revenue', icon: CreditCard, roles: ['super_admin', 'studio'] },
  { to: '/promotions', label: 'Promotions', icon: Ticket, roles: ['super_admin', 'studio'] },
  { to: '/studios', label: 'Studios & roles', icon: Building2, roles: ['super_admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['super_admin'] },
]

export function canAccess(item: NavItem, role: StaffRole): boolean {
  return !item.roles || item.roles.includes(role)
}
