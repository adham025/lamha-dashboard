import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { PageHeader, Panel } from '../components/ui'
import { supabase } from '../lib/supabase'
import { fetchStaff, type StaffMember } from '../lib/db'
import type { StaffRole } from '../lib/nav'

const ROLES: StaffRole[] = ['super_admin', 'studio', 'support', 'print_ops']
const roleLabel: Record<StaffRole, string> = {
  super_admin: 'Super admin',
  studio: 'Studio',
  support: 'Support',
  print_ops: 'Print ops',
}

export default function Studios() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['staff'], queryFn: fetchStaff })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<StaffRole>('studio')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const create = useMutation({
    mutationFn: async () => {
      // Creating an auth user requires the service_role key, so this goes
      // through the super_admin-gated `create-staff` Edge Function.
      const { data, error } = await supabase.functions.invoke('create-staff', {
        body: { email, password, full_name: fullName, role },
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      setMsg({ ok: true, text: `Created ${email}` })
      setEmail(''); setPassword(''); setFullName(''); setRole('studio')
      qc.invalidateQueries({ queryKey: ['staff'] })
    },
    onError: (e: unknown) => {
      const text = e instanceof Error ? e.message : 'Failed'
      setMsg({
        ok: false,
        text:
          text.includes('Failed to fetch') || text.includes('404')
            ? 'The create-staff Edge Function isn’t deployed yet (see dashboard README).'
            : text,
      })
    },
  })

  const setActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('staff').update({ active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })

  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: StaffRole }) => {
      const { error } = await supabase.from('staff').update({ role }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })

  return (
    <div>
      <PageHeader title="Studios & roles" subtitle="Create operator accounts and manage their roles (§8)." />

      {/* Create form */}
      <Panel className="mb-6">
        <div className="mb-3 text-sm font-bold">Create a studio account</div>
        <div className="grid gap-3 md:grid-cols-2">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@lamha.app"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" placeholder="Temporary password"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]" />
          <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]">
            {ROLES.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
          </select>
        </div>
        {msg && (
          <div className={'mt-3 rounded-xl px-3.5 py-2.5 text-sm ' +
            (msg.ok ? 'bg-emerald-50 text-[var(--color-success)]' : 'bg-[var(--color-accent-soft)] text-[var(--color-danger)]')}>
            {msg.text}
          </div>
        )}
        <button
          onClick={() => { setMsg(null); create.mutate() }}
          disabled={create.isPending || !email || !password}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          <UserPlus size={16} />
          {create.isPending ? 'Creating…' : 'Create account'}
        </button>
      </Panel>

      {/* Staff list */}
      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>}
              {(data ?? []).map((s: StaffMember) => (
                <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3 font-medium">{s.full_name || '—'}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{s.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={s.role}
                      onChange={(e) => changeRole.mutate({ id: s.id, role: e.target.value as StaffRole })}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={'rounded-full px-2 py-0.5 text-xs font-semibold ' +
                      (s.active ? 'bg-emerald-100 text-[var(--color-success)]' : 'bg-[var(--color-bg)] text-[var(--color-muted)]')}>
                      {s.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setActive.mutate({ id: s.id, active: !s.active })}
                      className="text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-danger)]"
                    >
                      {s.active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
