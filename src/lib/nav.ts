import {
  LayoutDashboard,
  Cpu,
  Package,
  Users,
  ShieldAlert,
  CreditCard,
  Ticket,
  UserCog,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Marked "new" in spec §8 — sections Hafla never had. */
  isNew?: boolean
}

/** The admin sections, in the order of spec §8. */
export const nav: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/ai-cost', label: 'AI usage & cost', icon: Cpu, isNew: true },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/moderation', label: 'Moderation queue', icon: ShieldAlert, isNew: true },
  { to: '/subscriptions', label: 'Subscriptions & revenue', icon: CreditCard },
  { to: '/promotions', label: 'Promotions', icon: Ticket },
  { to: '/staff', label: 'Staff & roles', icon: UserCog },
  { to: '/settings', label: 'Settings', icon: Settings },
]
