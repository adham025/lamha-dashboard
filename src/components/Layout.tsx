import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { clsx } from 'clsx'
import { nav, canAccess } from '../lib/nav'
import type { StaffMember } from '../lib/db'
import { supabase } from '../lib/supabase'

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super admin',
  studio: 'Studio',
  support: 'Support',
  print_ops: 'Print ops',
}

export default function Layout({ staff }: { staff: StaffMember }) {
  const navigate = useNavigate()

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const items = nav.filter((n) => canAccess(n, staff.role))

  return (
    <div className="flex h-full">
      <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent)]" />
          <span className="text-lg font-extrabold tracking-tight">Lamha</span>
          <span className="ml-1 rounded-md bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-muted)]">
            ADMIN
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map(({ to, label, icon: Icon, isNew }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]',
                )
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {isNew && (
                <span className="rounded-full bg-[var(--color-accent-soft)] px-1.5 text-[10px] font-bold text-[var(--color-accent)]">
                  new
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[var(--color-border)] p-3">
          <div className="px-2 pb-2">
            <div className="truncate text-xs font-semibold" title={staff.email}>
              {staff.full_name || staff.email}
            </div>
            <div className="text-[11px] text-[var(--color-accent)]">
              {ROLE_LABEL[staff.role] ?? staff.role}
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-danger)]"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
