import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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
  const initials = (staff.full_name || staff.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')

  return (
    <div className="flex h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="px-5 py-5">
          <div className="text-[17px] font-semibold tracking-tight">Lamha</div>
          <div className="text-xs text-[var(--color-muted)]">Operations</div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-bg)] text-[var(--color-ink)]'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-border)] p-3">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-ink)]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium" title={staff.email}>
                {staff.full_name || staff.email}
              </div>
              <div className="text-[11px] text-[var(--color-muted)]">{ROLE_LABEL[staff.role] ?? staff.role}</div>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="rounded-md px-2 py-1 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              Sign out
            </button>
          </div>
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
